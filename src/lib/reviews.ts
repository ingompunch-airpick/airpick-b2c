import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
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
    authorMask: String(data.authorMask || '익명'),
    createdAt: String(data.createdAt || ''),
  };
}

function buildSnapshot(reviews: CompanyReview[], recentMax: number): CompanyReviewSnapshot {
  const sorted = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const count = sorted.length;
  const averageRating =
    count > 0
      ? Math.round((sorted.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : null;

  return {
    recent: sorted.slice(0, recentMax),
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

/** 업체 후기 집계 + 최근 목록 — reviews 컬렉션 기준 (company.reviews_count 미사용) */
export async function fetchCompanyReviewSnapshot(
  companyId: string,
  recentMax = 5
): Promise<CompanyReviewSnapshot> {
  await ensureAnonymousAuth();

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

const REVIEW_API_PATH = '/api/reservation-review';

/** 출고 완료 예약 → 입점 업체 후기 작성 (Cloud Function) */
export async function submitCompanyReview(
  reservationId: string,
  password: string,
  rating: number,
  body?: string
): Promise<void> {
  const pw = password.trim();
  if (!/^\d{4}$/.test(pw)) {
    throw new Error('예약 비밀번호 4자리를 확인해 주세요.');
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('별점을 선택해 주세요.');
  }

  const res = await fetch(REVIEW_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: reservationId,
      password: pw,
      rating,
      body: body?.trim() ? body.trim().slice(0, 200) : undefined,
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
    default:
      throw new Error('후기 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

export function isReservationReviewable(status: string): boolean {
  return status === 'checked_out' || status === 'completed_out';
}
