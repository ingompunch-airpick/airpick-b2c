/**
 * B2C 짧은 경로(/long1 등) 방문 — 일별 sources 카운트.
 * 예약 acquisitionSource 와 별개. 본사 유입 탭에서 읽음.
 */
import { doc, increment, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { sourceFromPath } from '../utils/acquisition';

const SOURCE_RE = /^[a-z0-9_-]{1,40}$/;

function kstTodayKey(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function sessionKey(source: string, day: string): string {
  return `b2c.shortpath.${source}.${day}`;
}

/** 경로 유입 1회(같은 경로·같은 날·같은 탭 세션은 1번). */
export async function recordB2cShortPathVisit(pathname: string): Promise<void> {
  const source = sourceFromPath(pathname || '/');
  if (!source || !SOURCE_RE.test(source)) return;

  const day = kstTodayKey();
  const sk = sessionKey(source, day);
  try {
    if (sessionStorage.getItem(sk)) return;
    sessionStorage.setItem(sk, '1');
  } catch {
    /* private mode 등 — 카운트는 시도 */
  }

  const ref = doc(db, 'b2cShortPathStats', 'airpick', 'days', day);
  const updatedAt = new Date().toISOString();
  try {
    await setDoc(ref, { pageViews: increment(1), updatedAt }, { merge: true });
    await updateDoc(ref, { [`sources.${source}`]: increment(1) });
  } catch {
    /* rules 미배포 등이면 무시 */
  }
}
