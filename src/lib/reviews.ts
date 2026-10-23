import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { CompanyReview } from '../types';
import { ensureAnonymousAuth } from './reservations';

export interface CompanyReviewSnapshot {
  recent: CompanyReview[];
  count: number;
  averageRating: number | null;
}

function normalizeReview(id: string, data: Record<string, unknown>): CompanyReview | null {
  const rating = Number(data.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return null;

  return {
    id,
    companyId: String(data.companyId || ''),
    rating,
    body: data.body ? String(data.body) : undefined,
    photoUrls: Array.isArray(data.photoUrls)
      ? (data.photoUrls as unknown[]).map((u) => String(u || '').trim()).filter(Boolean)
      : undefined,
    authorMask: String(data.authorMask || '익명'),
    carMask: data.carMask ? String(data.carMask) : undefined,
    createdAt: String(data.createdAt || ''),
  };
}

function buildSnapshot(reviews: CompanyReview[], recentMax?: number): CompanyReviewSnapshot {
  const sorted = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const count = sorted.length;
  const averageRating =
    count > 0
      ? Math.round((sorted.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : null;

  const recent =
    recentMax === undefined
      ? sorted
      : recentMax <= 0
        ? []
        : sorted.slice(0, recentMax);

  return {
    recent,
    count,
    averageRating,
  };
}

const emptySnapshot = (): CompanyReviewSnapshot => ({
  recent: [],
  count: 0,
  averageRating: null,
});

async function fetchPublishedReviewsForCompany(companyId: string): Promise<CompanyReview[]> {
  const snap = await getDocs(
    query(
      collection(db, 'reviews'),
      where('companyId', '==', companyId),
      where('status', '==', 'published')
    )
  );

  return snap.docs
    .map((d) => normalizeReview(d.id, d.data() as Record<string, unknown>))
    .filter((r): r is CompanyReview => r != null);
}

/** 요약 문서에 담긴 최근 후기 수. 이보다 많이 보여줄 때만 후기 목록을 읽는다. */
const SUMMARY_RECENT_MAX = 6;

/** reviewSummaries/{업체} — 서버가 후기 등록·숨김 때 건수·평균·최근 6건을 맞춘다. */
async function fetchReviewSummary(
  companyId: string,
  recentMax: number
): Promise<CompanyReviewSnapshot | null> {
  try {
    const snap = await getDoc(doc(db, 'reviewSummaries', companyId));
    if (!snap.exists()) return null;
    const data = snap.data() as Record<string, unknown>;
    if (typeof data.count !== 'number' || !Array.isArray(data.recent)) return null;
    const recent = data.recent
      .map((row) => {
        if (!row || typeof row !== 'object') return null;
        const fields = row as Record<string, unknown>;
        return normalizeReview(String(fields.id || ''), { ...fields, companyId });
      })
      .filter((r): r is CompanyReview => r != null)
      .slice(0, Math.max(0, recentMax));
    return {
      recent,
      count: data.count,
      averageRating: typeof data.averageRating === 'number' ? data.averageRating : null,
    };
  } catch {
    return null;
  }
}

/** 업체 후기 집계 + 최근 목록 — reviews 컬렉션 기준 (company.reviews_count 미사용)
 *  @param recentMax 표시할 최근 건수. 생략·undefined면 published 전체.
 */
export async function fetchCompanyReviewSnapshot(
  companyId: string,
  recentMax?: number
): Promise<CompanyReviewSnapshot> {
  await ensureAnonymousAuth();

  if (recentMax !== undefined && recentMax <= SUMMARY_RECENT_MAX) {
    const summary = await fetchReviewSummary(companyId, recentMax);
    if (summary) return summary;
  }

  try {
    const reviews = await fetchPublishedReviewsForCompany(companyId);
    return buildSnapshot(reviews, recentMax);
  } catch (err) {
    console.warn('fetchCompanyReviewSnapshot failed:', err);
    return emptySnapshot();
  }
}

/** 비교 목록용 — 입점 업체 id 별 후기 집계 */
export async function fetchReviewSnapshotsByCompanyIds(
  companyIds: string[]
): Promise<Record<string, CompanyReviewSnapshot>> {
  await ensureAnonymousAuth();

  const uniqueIds = [...new Set(companyIds.filter(Boolean))];
  const result = Object.fromEntries(uniqueIds.map((id) => [id, emptySnapshot()]));
  if (uniqueIds.length === 0) return result;

  try {
    await Promise.all(
      uniqueIds.map(async (companyId) => {
        const summary = await fetchReviewSummary(companyId, 0);
        if (summary) {
          result[companyId] = summary;
          return;
        }
        const reviews = await fetchPublishedReviewsForCompany(companyId);
        result[companyId] = buildSnapshot(reviews, 0);
      })
    );
  } catch (err) {
    console.warn('fetchReviewSnapshotsByCompanyIds failed:', err);
  }

  return result;
}

export function formatReviewDate(iso: string): string {
  if (!iso) return '';
  const d = iso.slice(0, 10);
  if (d.length < 10) return d;
  return d.replace(/-/g, '.');
}

/** 당분간 공개 UI·JSON-LD에서 후기 날짜 숨김 (작업 티 방지). 관리자 화면은 유지. */
export const SHOW_PUBLIC_REVIEW_DATES = false;

const REVIEW_API_PATH = '/api/reservation-review';

/** 출고 완료 예약 → 입점 업체 후기 작성 (Cloud Function) */
export async function submitCompanyReview(
  reservationId: string,
  password: string,
  rating: number,
  body?: string,
  photoDataUrls?: string[],
  asMember = false
): Promise<void> {
  const pw = password.trim();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (asMember) {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) throw new Error('카카오 로그인 후 후기를 남겨 주세요.');
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  } else if (!/^\d{4}$/.test(pw)) {
    throw new Error('예약 비밀번호 4자리를 확인해 주세요.');
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('별점을 선택해 주세요.');
  }

  const photos = (photoDataUrls ?? []).filter((u) => u.startsWith('data:image/')).slice(0, 3);

  const res = await fetch(REVIEW_API_PATH, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: reservationId,
      ...(asMember ? {} : { password: pw }),
      rating,
      body: body?.trim() ? body.trim().slice(0, 200) : undefined,
      ...(photos.length ? { photos } : {}),
    }),
  });
  if (res.ok) return;

  let error = '';
  try {
    error = ((await res.json()) as { error?: string }).error ?? '';
  } catch {
    error = '';
  }
  switch (error) {
    case 'invalid_password':
      throw new Error('예약 비밀번호가 일치하지 않습니다.');
    case 'already_reviewed':
      throw new Error('이미 후기를 작성한 예약입니다.');
    case 'not_reviewable':
      throw new Error('출고가 완료된 예약만 후기를 작성할 수 있습니다.');
    case 'not_partner':
      throw new Error('에어픽 입점 업체 예약만 후기를 작성할 수 있습니다.');
    case 'not_found':
      throw new Error('예약을 찾을 수 없습니다.');
    case 'invalid_rating':
      throw new Error('별점을 선택해 주세요.');
    case 'photo_upload_failed':
      throw new Error('사진 업로드에 실패했습니다. 사진을 빼고 다시 시도해 주세요.');
    default:
      throw new Error('후기 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

export function isReservationReviewable(status: string): boolean {
  return status === 'checked_out' || status === 'completed_out';
}
