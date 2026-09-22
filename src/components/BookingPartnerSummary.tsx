import { useState } from 'react';
import { Building2, Check, ChevronDown, Phone, ShieldCheck } from 'lucide-react';
import CompanyVerificationDocuments from './CompanyVerificationDocuments';
import type { Company } from '../types';
import { displayCompanyName } from '../utils/display';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';
import {
  formatCoverageLimitWon,
  formatInsuranceSummary,
  INSURANCE_DISCLAIMER,
} from '../utils/insurance';
import {
  companyHasVerificationDocuments,
  hasBusinessRegistrationDocument,
  hasInsuranceCertificate,
  hasParkingContractDocument,
} from '../utils/verificationDocuments';
import { cn } from '../utils/cn';
import { getCancelCutoffHours } from '../utils/reservationCancel';

/** 예약 직전 — 업체 신원·검증·보험·취소 안내 */
export default function BookingPartnerSummary({ company }: { company: Company }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const name = displayCompanyName(company.name);
  const cutoffHours = getCancelCutoffHours(company);
  const insurance = company.insurance?.enrolled ? company.insurance : undefined;
  const insuranceSummary = insurance ? formatInsuranceSummary(insurance) : undefined;
  const hasDocs = companyHasVerificationDocuments(company);
  const tel = buildTelHref(company.phone);

  const checks = [
    {
      ok: hasBusinessRegistrationDocument(company) || !!company.representative,
      label: '사업자 확인',
    },
    {
      ok: hasInsuranceCertificate(company) || !!insurance?.enrolled,
      label: '보험 가입 확인',
    },
    {
      ok: hasParkingContractDocument(company) || !!(company.indoorParkingAddress || company.outdoorParkingAddress),
      label: '주차장 확인',
    },
  ];

  return (
    <section className="rounded-2xl bg-sky-bg p-4 ring-1 ring-sky-border/70">
      <div className="flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10">
          <Building2 size={18} className="text-brand" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">{name}</p>
          {company.representative ? (
            <p className="mt-0.5 text-[11px] font-semibold text-muted">
              대표 {company.representative}
            </p>
          ) : null}
          {tel && company.phone ? (
            <a
              href={tel}
              className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-brand"
            >
              <Phone size={12} strokeWidth={2.25} />
              {formatPhoneDisplay(company.phone)}
            </a>
          ) : null}
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {checks.map((c) =>
          c.ok ? (
            <li
              key={c.label}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink ring-1 ring-sky-border/70"
            >
              <Check size={12} className="text-emerald-600" strokeWidth={3} />
              {c.label}
            </li>
          ) : null
        )}
      </ul>

      {insuranceSummary ? (
        <div className="mt-3 rounded-xl bg-white/80 px-3 py-2.5 ring-1 ring-sky-border/50">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-brand" strokeWidth={2.25} />
            <p className="text-[12px] font-bold text-ink">보험 가입 확인</p>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-muted">{insuranceSummary}</p>
          {insurance?.coverageLimitWon ? (
            <p className="mt-0.5 text-[11px] font-semibold text-muted">
              보장한도 {formatCoverageLimitWon(insurance.coverageLimitWon)}
            </p>
          ) : null}
          <p className="mt-1 text-[10px] font-medium leading-relaxed text-muted-light">
            {INSURANCE_DISCLAIMER}
          </p>
        </div>
      ) : null}

      <p className="mt-3 text-[11px] font-semibold leading-relaxed text-muted">
        현장결제 · 입고 {cutoffHours}시간 전까지 앱에서 무료 취소 가능
      </p>

      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        className="mt-2 inline-flex items-center gap-0.5 text-[12px] font-bold text-brand"
      >
        업체 정보 · 서류 보기
        <ChevronDown
          size={14}
          className={cn('transition-transform', detailsOpen && 'rotate-180')}
        />
      </button>

      {detailsOpen ? (
        <div className="mt-3 space-y-2 border-t border-sky-border/60 pt-3">
          <dl className="space-y-1.5 text-[11px]">
            <div className="flex justify-between gap-3">
              <dt className="font-semibold text-muted">상호</dt>
              <dd className="font-bold text-ink text-right">{name}</dd>
            </div>
            {company.representative ? (
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-muted">대표</dt>
                <dd className="font-bold text-ink text-right">{company.representative}</dd>
              </div>
            ) : null}
            {company.phone ? (
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-muted">연락처</dt>
                <dd className="font-bold text-ink text-right">
                  {formatPhoneDisplay(company.phone)}
                </dd>
              </div>
            ) : null}
            {(company.indoorParkingAddress || company.outdoorParkingAddress) && (
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 font-semibold text-muted">주차장</dt>
                <dd className="font-bold text-ink text-right">
                  {company.indoorParkingAddress || company.outdoorParkingAddress}
                </dd>
              </div>
            )}
          </dl>
          {hasDocs ? <CompanyVerificationDocuments company={company} /> : null}
        </div>
      ) : null}
    </section>
  );
}
