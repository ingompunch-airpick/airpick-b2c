import { useEffect, useState } from 'react';
import { Building2, Check, ChevronDown, ExternalLink, Phone } from 'lucide-react';
import type { Company } from '../types';
import { displayCompanyName } from '../utils/display';
import { companyThumbnailUrl } from '../utils/imageUrl';
import { getCompanyParkingLot } from '../utils/parkingLocation';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';
import {
  formatCoverageLimitWon,
  formatInsuranceSummary,
  INSURANCE_DISCLAIMER,
} from '../utils/insurance';
import {
  hasBusinessRegistrationDocument,
  hasInsuranceCertificate,
  hasParkingContractDocument,
} from '../utils/verificationDocuments';
import { cn } from '../utils/cn';

function DocLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-flex items-center gap-1 text-[13px] font-bold text-brand"
    >
      <ExternalLink size={12} strokeWidth={2.25} />
      {children}
    </a>
  );
}

/** 예약 직전 — 업체 신원·검증·보험·취소 안내 */
export default function BookingPartnerSummary({
  company,
  isIndoor,
}: {
  company: Company;
  isIndoor: boolean;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoUrl = companyThumbnailUrl(getCompanyParkingLot(company, isIndoor).photos?.[0], 160);
  useEffect(() => {
    setPhotoFailed(false);
  }, [photoUrl]);
  const name = displayCompanyName(company.name);
  const insurance = company.insurance?.enrolled ? company.insurance : undefined;
  const insuranceSummary = insurance ? formatInsuranceSummary(insurance) : undefined;
  const insuranceLine = [
    insuranceSummary,
    insurance?.coverageLimitWon ? `한도 ${formatCoverageLimitWon(insurance.coverageLimitWon)}` : '',
  ]
    .filter(Boolean)
    .join(', ');
  const businessUrl = company.verificationDocuments?.businessRegistrationUrl?.trim();
  const contractUrl = company.verificationDocuments?.parkingContractUrl?.trim();
  const certificateUrl = insurance?.certificateUrl?.trim();
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
    <section className="rounded-2xl bg-[#f4f5f7] p-4">
      <div className="flex items-start gap-2.5">
        {photoUrl && !photoFailed ? (
          <img
            src={photoUrl}
            alt={`${name} 주차장`}
            className="h-14 w-14 shrink-0 rounded-xl object-cover"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/10">
            <Building2 size={22} className="text-brand" strokeWidth={2.25} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">{name}</p>
          {tel && company.phone ? (
            <a
              href={tel}
              className="mt-1 flex w-fit items-center gap-1 text-[13px] font-bold text-brand"
            >
              <Phone size={12} strokeWidth={2.25} />
              {formatPhoneDisplay(company.phone)}
            </a>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        className="mt-2 inline-flex items-center gap-0.5 text-[13px] font-bold text-brand"
      >
        업체 정보 보기
        <ChevronDown
          size={14}
          className={cn('transition-transform', detailsOpen && 'rotate-180')}
        />
      </button>

      {detailsOpen ? (
        <div className="mt-3 space-y-2 border-t border-sky-border/60 pt-3">
          <dl className="space-y-1.5 text-[13px]">
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
          <ul className="space-y-2.5">
            {checks[0]?.ok ? (
              <li>
                <p className="flex items-center gap-1 text-[13px] font-bold text-ink">
                  <Check size={12} className="text-emerald-600" strokeWidth={3} />
                  사업자 확인
                </p>
                {company.representative ? (
                  <p className="mt-0.5 pl-4 text-[13px] font-semibold text-muted">
                    대표 {company.representative}
                  </p>
                ) : null}
                {businessUrl ? (
                  <span className="block pl-4">
                    <DocLink href={businessUrl}>사업자등록증 보기</DocLink>
                  </span>
                ) : null}
              </li>
            ) : null}
            {checks[2]?.ok ? (
              <li>
                <p className="flex items-center gap-1 text-[13px] font-bold text-ink">
                  <Check size={12} className="text-emerald-600" strokeWidth={3} />
                  주차장 확인
                </p>
                {contractUrl ? (
                  <span className="block pl-4">
                    <DocLink href={contractUrl}>주차장 계약서 보기</DocLink>
                  </span>
                ) : null}
              </li>
            ) : null}
            {checks[1]?.ok && insuranceLine ? (
              <li>
                <p className="flex items-center gap-1 text-[13px] font-bold text-ink">
                  <Check size={12} className="text-emerald-600" strokeWidth={3} />
                  보험
                </p>
                <p className="mt-0.5 pl-4 text-[13px] font-semibold text-muted">{insuranceLine}</p>
                {certificateUrl ? (
                  <span className="block pl-4">
                    <DocLink href={certificateUrl}>보험증권 보기</DocLink>
                  </span>
                ) : null}
                <p className="mt-1 pl-4 text-[13px] font-medium leading-relaxed text-muted">
                  {INSURANCE_DISCLAIMER}
                </p>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
