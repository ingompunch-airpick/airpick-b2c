import { Building2, Cctv, ExternalLink, FileText, MapPin, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Company } from '../types';
import { displayCoverageLimitText, INSURANCE_DISCLAIMER } from '../utils/insurance';
import { displayInsuranceLabel } from '../utils/trust';
import {
  companyHasVerificationDocuments,
  hasBusinessRegistrationDocument,
  hasInsuranceCertificate,
  hasParkingContractDocument,
} from '../utils/verificationDocuments';
import { cn } from '../utils/cn';
import { formatDotDate } from '../utils/verification';

function DocumentRow({
  icon: Icon,
  title,
  detail,
  extra,
  checkedOn,
  tone = 'ok',
  href,
  linkLabel,
}: {
  icon: typeof ShieldCheck;
  title: string;
  detail?: string;
  extra?: string;
  /** 본사 확인일 YYYY-MM-DD — 있으면 「에어픽 확인 · 날짜」 */
  checkedOn?: string;
  tone?: 'ok' | 'wait';
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="rounded-xl bg-white/80 px-3.5 py-3 ring-1 ring-sky-border/50">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            tone === 'ok' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
          )}
        >
          <Icon
            size={16}
            className={tone === 'ok' ? 'text-emerald-600' : 'text-amber-600'}
            strokeWidth={2.25}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">{title}</p>
          {checkedOn ? (
            <p className="mt-0.5 text-[13px] font-bold text-emerald-700">
              에어픽 확인 · {formatDotDate(checkedOn)}
            </p>
          ) : null}
          {detail ? (
            <p className="mt-0.5 text-[13px] font-semibold text-muted">{detail}</p>
          ) : null}
          {extra ? (
            <p className="mt-1 text-[13px] font-semibold leading-snug text-ink">{extra}</p>
          ) : null}
        </div>
      </div>
      {href && linkLabel ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-[13px] font-bold text-brand ring-1 ring-sky-border/70 transition-colors hover:bg-sky-soft"
        >
          <ExternalLink size={14} strokeWidth={2.25} />
          {linkLabel}
        </a>
      ) : null}
    </div>
  );
}

/** 업체 상세 — B2B 업로드 입점 확인 서류 (사업자·주차장 계약·보험) */
export default function CompanyVerificationDocuments({
  company,
  className,
}: {
  company: Company;
  className?: string;
}) {
  const view = company.verificationView;
  const hasRecords = !!view?.hasRecords;
  const insuranceExpired = !!view?.insuranceExpired;
  if (!companyHasVerificationDocuments(company) && !insuranceExpired && !hasRecords) return null;

  const businessUrl = company.verificationDocuments?.businessRegistrationUrl?.trim();
  const contractUrl = company.verificationDocuments?.parkingContractUrl?.trim();
  const insuranceLabel = displayInsuranceLabel(company);
  const productName = company.insurance?.productName?.trim();
  const certificateUrl = company.insurance?.certificateUrl?.trim();
  const coverageLimitText = displayCoverageLimitText(company);
  const periodStart = view?.insurancePeriodStart;
  const periodEnd = view?.insurancePeriodEnd;
  const periodText =
    periodStart || periodEnd
      ? `보험기간 ${formatDotDate(periodStart) || '—'} ~ ${formatDotDate(periodEnd) || '—'}`
      : undefined;
  const insuranceExtra = [coverageLimitText, periodText].filter(Boolean).join(' · ') || undefined;

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl bg-sky-bg p-3.5 ring-1 ring-sky-border/60',
        className
      )}
      aria-label="에어픽 입점 확인"
    >
      <p className="text-[13px] font-bold text-brand">에어픽 입점 확인</p>
      <p className="mt-0.5 text-[13px] font-semibold text-muted">
        {hasRecords
          ? '에어픽이 직접 확인한 항목과 확인한 날짜예요.'
          : '입점할 때 에어픽이 사업자·보험 서류를 확인했어요.'}
      </p>

      <div className="mt-3 space-y-2">
        {hasBusinessRegistrationDocument(company) && businessUrl ? (
          <DocumentRow
            icon={Building2}
            title="사업자등록증"
            checkedOn={view?.business}
            href={businessUrl}
            linkLabel="사업자등록증 보기"
          />
        ) : null}

        {hasParkingContractDocument(company) && contractUrl ? (
          <DocumentRow
            icon={FileText}
            title="주차장 계약서"
            href={contractUrl}
            linkLabel="주차장 계약서 보기"
          />
        ) : null}

        {insuranceExpired ? (
          <DocumentRow
            icon={ShieldAlert}
            tone="wait"
            title="보험 갱신 확인 중"
            detail={
              periodEnd
                ? `등록된 보험기간이 ${formatDotDate(periodEnd)}에 끝났어요. 새 증권을 확인하고 있어요.`
                : '새 증권을 확인하고 있어요.'
            }
            extra="예약 전에 업체에 보험 갱신 여부를 물어보세요."
          />
        ) : hasInsuranceCertificate(company) && insuranceLabel ? (
          <DocumentRow
            icon={ShieldCheck}
            title="보험 가입 확인"
            detail={insuranceLabel}
            extra={insuranceExtra}
            checkedOn={view?.insurance?.verifiedOn}
            href={certificateUrl}
            linkLabel="보험증권 보기"
          />
        ) : null}

        {view?.parking ? (
          <DocumentRow
            icon={MapPin}
            title="주차장 확인"
            detail="등록된 주차장 주소와 현장을 확인했어요."
            checkedOn={view.parking}
          />
        ) : null}

        {view?.cctv ? (
          <DocumentRow
            icon={Cctv}
            title="CCTV 운영 확인"
            detail="주차장 CCTV가 운영되는 것을 확인했어요."
            checkedOn={view.cctv}
          />
        ) : null}
      </div>

      {!insuranceExpired && hasInsuranceCertificate(company) ? (
        <p className="mt-2.5 rounded-lg bg-white/80 px-3 py-2 text-[13px] font-medium leading-relaxed text-muted ring-1 ring-sky-border/50">
          사고 발생 시{' '}
          <span className="font-bold text-ink">
            {productName || insuranceLabel || '가입 보험'}
          </span>{' '}
          보장 적용 · {INSURANCE_DISCLAIMER}
        </p>
      ) : null}
    </section>
  );
}
