import { X } from 'lucide-react';
import { useState } from 'react';
import type { BookingSearch, Company } from '../types';
import { displayCompanyName } from '../utils/display';
import { submitReservation, type BookingForm } from '../lib/reservations';

export default function BookingModal({
  company,
  search,
  price,
  onClose,
  onSuccess,
}: {
  company: Company;
  search: BookingSearch;
  price: number;
  onClose: () => void;
  onSuccess: (reservationId: string) => void;
}) {
  const [form, setForm] = useState<BookingForm>({
    userName: '',
    phone: '',
    carModel: '',
    carNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userName || !form.phone || !form.carModel || !form.carNumber) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const id = await submitReservation(company.id, company.name, search, form, price);
      onSuccess(id);
    } catch (err) {
      console.error(err);
      setError('예약 저장에 실패했습니다. Firebase 익명 로그인 설정을 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-sky-deep/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-sky-soft p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-brand">에어픽 예약</p>
            <h2 className="text-lg font-bold text-ink">{displayCompanyName(company.name)}</h2>
            <p className="text-sm font-bold text-muted tabular-nums">{price.toLocaleString()}원</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-sky-tint">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {(['userName', 'phone', 'carModel', 'carNumber'] as const).map((key) => {
            const labels = {
              userName: '이름',
              phone: '연락처',
              carModel: '차량 모델',
              carNumber: '차량번호',
            };
            return (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-bold text-muted">{labels[key]}</span>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-xl border border-sky-border bg-sky-bg px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand"
                />
              </label>
            );
          })}

          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? '접수 중…' : '예약 접수하기'}
          </button>
          <p className="text-center text-[10px] text-muted-light">
            접수 후 B2B 기사 앱 입고예정에 표시됩니다 · 현장 결제
          </p>
        </form>
      </div>
    </div>
  );
}
