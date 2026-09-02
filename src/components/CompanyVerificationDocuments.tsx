import { Building2, ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import type { Company } from '../types';
import { CANONICAL_INSURANCE_PRODUCT_NAME, INSURANCE_DISCLAIMER } from '../utils/insurance';
import { displayInsuranceLabel } from '../utils/trust';
import {
  companyHasVerificationDocuments,
  hasBusinessRegistrationDocument,
  hasInsuranceCertificate,
  hasParkingContractDocument,
} from '../utils/verificationDocuments';
import { cn } from '../utils/cn';

function DocumentRow({
  icon: Icon,
  title,
  detail,
  href,
  linkLabel,
}: {
  icon: typeof ShieldCheck;
  title: string;
  detail?: string;
  href?: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-xl bg-white/80 px-3.5 py-3 ring-1 ring-sky-border/50">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
          <Icon size={16} className="text-emerald-600" strokeWidth={2.25} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">{title}</p>
          {detail ? (
            <p className="mt-0.5 text-[11px] font-semibold text-muted">{detail}</p>
          ) : null}
        </div>
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-bold text-brand ring-1 ring-sky-border/70 transition-colors hover:bg-sky-soft"
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
  if (!companyHasVerificationDocuments(company)) return null;

  const businessUrl = company.verificationDocuments?.businessRegistrationUrl?.trim();
  const contractUrl = company.verificationDocuments?.parkingContractUrl?.trim();
  const insuranceLabel = displayInsuranceLabel(company);
  const certificateUrl = company.insurance?.certificateUrl?.trim();

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl bg-sky-bg p-3.5 ring-1 ring-sky-border/60',
        className
      )}
      aria-label="에어픽 입점 확인"
    >
      <p className="text-xs font-bold text-brand">에어픽 입점 확인</p>
      <p className="mt-0.5 text-[11px] font-semibold text-muted">
        사업자·주차장 계약·보험 서류를 에어픽이 확인했습니다.
      </p>

      <div className="mt-3 space-y-2">
        {hasBusinessRegistrationDocument(company) && businessUrl ? (
          <DocumentRow
            icon={Building2}
            title="사업자등록증"
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

        {hasInsuranceCertificate(company) && insuranceLabel ? (
          <DocumentRow
            icon={ShieldCheck}
            title="보험 가입 확인"
            detail={insuranceLabel}
            href={certificateUrl}
            linkLabel="보험증권 보기"
          />
        ) : null}
      </div>

      {hasInsuranceCertificate(company) ? (
        <p className="mt-2.5 rounded-lg bg-white/80 px-3 py-2 text-[10px] font-medium leading-relaxed text-muted ring-1 ring-sky-border/50">
          사고 발생 시{' '}
          <span className="font-bold text-ink">{CANONICAL_INSURANCE_PRODUCT_NAME}</span> 보장 적용 ·{' '}
          {INSURANCE_DISCLAIMER}
        </p>
      ) : null}
    </section>
  );
}
