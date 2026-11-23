/**
 * B2C 짧은 경로(/long1 등)·?src=·referrer 분류 방문 — 일별 sources 카운트.
 * 예약 acquisitionSource 와 같은 키. 본사 유입 탭에서 읽음.
 */
import { doc, increment, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { campaignFromLocation, type AcquisitionCaptureOpts } from '../utils/acquisition';

const SOURCE_RE = /^[a-z0-9_-]{1,40}$/;
const QUERY_KEY_RE = /^[a-zA-Z0-9가-힣_\- .]{1,80}$/;

function kstTodayKey(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function sessionKey(source: string, day: string): string {
  return `b2c.shortpath.${source}.${day}`;
}

function nQuerySessionKey(query: string, day: string): string {
  return `b2c.nquery.${query}.${day}`;
}

function sanitizeNQuery(raw: string): string | null {
  const q = raw.trim().slice(0, 80);
  if (!q || !QUERY_KEY_RE.test(q)) return null;
  return q;
}

/** 경로·src·referrer 유입 1회(같은 소스·같은 날·같은 탭 세션은 1번). */
export async function recordB2cShortPathVisit(
  pathname: string,
  search = '',
  opts?: Pick<AcquisitionCaptureOpts, 'allowOrganic'>
): Promise<void> {
  const hit = campaignFromLocation(pathname || '/', search, {
    allowOrganic: opts?.allowOrganic,
  });
  const source = hit?.source;
  if (!source || !SOURCE_RE.test(source)) return;

  const day = kstTodayKey();
  const sk = sessionKey(source, day);
  let countVisit = true;
  try {
    if (sessionStorage.getItem(sk)) countVisit = false;
    else sessionStorage.setItem(sk, '1');
  } catch {
    /* private mode 등 — 카운트는 시도 */
  }

  const ref = doc(db, 'b2cShortPathStats', 'airpick', 'days', day);
  const updatedAt = new Date().toISOString();
  try {
    if (countVisit) {
      await setDoc(ref, { pageViews: increment(1), updatedAt }, { merge: true });
      await updateDoc(ref, { [`sources.${source}`]: increment(1) });
    } else {
      await setDoc(ref, { updatedAt }, { merge: true });
    }

    const nQuery = hit?.naver?.n_query ? sanitizeNQuery(hit.naver.n_query) : null;
    const isPowerLink = Boolean(hit?.naver?.n_campaign_type);
    if (nQuery && isPowerLink) {
      const qk = nQuerySessionKey(nQuery, day);
      let countQuery = true;
      try {
        if (sessionStorage.getItem(qk)) countQuery = false;
        else sessionStorage.setItem(qk, '1');
      } catch {
        /* ignore */
      }
      if (countQuery) {
        // Firestore map key에 . 이 있으면 경로가 갈라지므로 치환
        const mapKey = nQuery.replace(/\./g, '_');
        await updateDoc(ref, { [`nQueries.${mapKey}`]: increment(1) });
      }
    }
  } catch {
    /* rules 미배포 등이면 무시 */
  }
}
