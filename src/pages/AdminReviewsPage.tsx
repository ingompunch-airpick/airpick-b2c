import { EyeOff, Loader2, Star, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

type AdminReview = {
  id: string;
  companyId: string;
  companyName: string;
  reservationId: string;
  rating: number;
  body?: string;
  authorMask: string;
  carMask?: string;
  status: string;
  createdAt: string;
};

const SECRET_KEY = 'airpick_review_admin_secret';
const LIST_API = '/api/admin/reviews';
const MODERATE_API = '/api/admin/review-moderate';

export default function AdminReviewsPage() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem(SECRET_KEY) ?? '');
  const [unlocked, setUnlocked] = useState(() => Boolean(sessionStorage.getItem(SECRET_KEY)));
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (adminSecret: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(LIST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: adminSecret }),
      });
      if (res.status === 403) {
        setError('관리자 키가 올바르지 않습니다.');
        setUnlocked(false);
        sessionStorage.removeItem(SECRET_KEY);
        setReviews([]);
        return;
      }
      if (!res.ok) {
        setError('후기 목록을 불러오지 못했습니다.');
        return;
      }
      const json = (await res.json()) as { reviews?: AdminReview[] };
      setReviews(json.reviews ?? []);
      setUnlocked(true);
      sessionStorage.setItem(SECRET_KEY, adminSecret);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUnlock = () => {
    const trimmed = secret.trim();
    if (!trimmed) {
      setError('관리자 키를 입력해 주세요.');
      return;
    }
    void load(trimmed);
  };

  const moderate = async (id: string, action: 'hide' | 'delete') => {
    const adminSecret = sessionStorage.getItem(SECRET_KEY);
    if (!adminSecret) return;
    const label = action === 'hide' ? '숨기면 앱·평점에서 제외됩니다. 계속할까요?' : '후기를 완전히 삭제할까요?';
    if (!window.confirm(label)) return;

    setBusyId(id);
    setError('');
    try {
      const res = await fetch(MODERATE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: adminSecret, id, action }),
      });
      if (!res.ok) {
        setError(action === 'hide' ? '숨기기에 실패했습니다.' : '삭제에 실패했습니다.');
        return;
      }
      if (action === 'delete') {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'hidden' } : r))
        );
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-dvh bg-sky-bg text-ink">
      <div className="mx-auto max-w-lg px-4 py-6 pb-16">
        <p className="text-xs font-bold text-brand">본사 전용</p>
        <h1 className="mt-1 text-xl font-bold">후기 관리</h1>
        <p className="mt-1 text-sm text-muted">숨김·삭제만 가능합니다. 고객·업체는 수정할 수 없습니다.</p>

        {!unlocked ? (
          <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-sky-border/70">
            <label className="block text-xs font-bold text-muted">관리자 키</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUnlock();
              }}
              className="mt-2 w-full rounded-2xl border border-sky-border bg-sky-bg px-3.5 py-3 text-sm outline-none focus:border-brand"
              placeholder="REVIEW_ADMIN_SECRET"
              autoComplete="off"
            />
            {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
            <button
              type="button"
              onClick={handleUnlock}
              disabled={loading}
              className="mt-4 w-full rounded-2xl bg-brand py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {loading ? '확인 중…' : '들어가기'}
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-muted">최근 {reviews.length}건</p>
              <button
                type="button"
                onClick={() => void load(sessionStorage.getItem(SECRET_KEY) ?? '')}
                className="text-xs font-bold text-brand"
              >
                새로고침
              </button>
            </div>
            {error && (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
                {error}
              </p>
            )}
            {loading && (
              <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
                <Loader2 size={16} className="animate-spin" /> 불러오는 중…
              </p>
            )}
            {!loading && reviews.length === 0 && (
              <p className="rounded-2xl bg-sky-soft px-4 py-8 text-center text-sm text-muted">
                등록된 후기가 없습니다.
              </p>
            )}
            {reviews.map((review) => {
              const hidden = review.status === 'hidden';
              return (
                <article
                  key={review.id}
                  className="rounded-3xl bg-white p-4 ring-1 ring-sky-border/70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {review.companyName || review.companyId}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-muted">
                        {review.authorMask}
                        {review.carMask ? ` · ${review.carMask}` : ''} · {review.createdAt.slice(0, 10)} ·{' '}
                        {review.id}
                      </p>
                    </div>
                    <span
                      className={
                        hidden
                          ? 'rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600'
                          : 'rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700'
                      }
                    >
                      {hidden ? '숨김' : '공개'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-sky-tint'
                        }
                      />
                    ))}
                  </div>
                  {review.body && (
                    <p className="mt-2 text-sm leading-relaxed text-ink">{review.body}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    {!hidden && (
                      <button
                        type="button"
                        disabled={busyId === review.id}
                        onClick={() => void moderate(review.id, 'hide')}
                        className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-sky-bg py-2.5 text-xs font-bold text-muted ring-1 ring-sky-border/70 disabled:opacity-50"
                      >
                        <EyeOff size={14} />
                        숨기기
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => void moderate(review.id, 'delete')}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-rose-50 py-2.5 text-xs font-bold text-rose-600 ring-1 ring-rose-100 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      삭제
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
