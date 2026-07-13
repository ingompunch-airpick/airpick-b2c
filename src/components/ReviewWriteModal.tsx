import { Star, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

export default function ReviewWriteModal({
  companyName,
  initialPassword = '',
  onClose,
  onSubmit,
}: {
  companyName: string;
  initialPassword?: string;
  onClose: () => void;
  onSubmit: (password: string, rating: number, body: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [password, setPassword] = useState(initialPassword);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating < 1) {
      setError('별점을 선택해 주세요.');
      return;
    }
    if (!/^\d{4}$/.test(password)) {
      setError('예약 비밀번호 4자리를 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(password, rating, body);
    } catch (err) {
      setError(err instanceof Error ? err.message : '후기 등록에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="닫기" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-sky-bg p-5 shadow-xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-brand">업체 후기</p>
            <h2 className="mt-1 text-lg font-bold text-ink">{companyName}</h2>
            <p className="mt-1 text-xs font-medium text-muted">출고 완료 예약에 대한 후기입니다</p>
            <p className="mt-1 text-[11px] font-medium text-muted-light">
              공개 시 이름·차량번호는 일부만 표시됩니다 (예: 김*수 · 31소34**)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-sky-soft"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold text-muted">별점</p>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => {
              const value = i + 1;
              const active = value <= rating;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="rounded-lg p-1.5 transition-colors hover:bg-sky-soft"
                  aria-label={`${value}점`}
                >
                  <Star
                    size={28}
                    className={cn(active ? 'fill-amber-400 text-amber-400' : 'text-sky-tint')}
                    strokeWidth={2}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-bold text-muted">한 줄 후기 (선택)</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 200))}
            rows={3}
            placeholder="이용 경험을 짧게 남겨 주세요"
            className="mt-1.5 w-full resize-none rounded-2xl border border-sky-border bg-white px-3.5 py-3 text-sm text-ink outline-none focus:border-brand"
          />
          <span className="mt-1 block text-right text-[10px] font-medium text-muted-light">
            {body.length}/200
          </span>
        </label>

        <label className="mt-2 block">
          <span className="text-xs font-bold text-muted">예약 비밀번호 4자리</span>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            className="mt-1.5 w-full rounded-2xl border border-sky-border bg-white px-3.5 py-3 text-sm font-semibold tracking-widest text-ink outline-none focus:border-brand"
          />
        </label>

        {error && <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p>}

        <button
          type="button"
          disabled={loading}
          onClick={() => void handleSubmit()}
          className="mt-4 w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {loading ? '등록 중…' : '후기 등록'}
        </button>
      </div>
    </div>
  );
}
