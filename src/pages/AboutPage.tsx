import { Building2, ChevronLeft, Clock3, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  AIRPICK_SERVICES,
  COMPANY_LEGAL,
  PARTNER_VS_EXTERNAL,
} from '../constants/companyLegal';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';

export default function AboutPage({ onBack }: { onBack: () => void }) {
  const telHref = buildTelHref(COMPANY_LEGAL.phone);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-sky-bg">
      <header className="flex shrink-0 items-center gap-2 border-b border-sky-border/80 bg-sky-bg/95 px-2 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-muted transition-colors hover:bg-sky-soft"
          aria-label="닫기"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-base font-bold text-ink">{COMPANY_LEGAL.serviceName} 소개</h1>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-5 pb-8">
        <section className="rounded-3xl bg-gradient-to-br from-sky-tint to-sky-soft p-5 shadow-[0_4px_16px_rgba(49,130,246,0.1)]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
              <Building2 size={20} className="text-brand" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-brand">{COMPANY_LEGAL.name} 운영</p>
              <p className="text-sm font-bold text-ink">{COMPANY_LEGAL.serviceName}</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium leading-relaxed text-muted">
            {COMPANY_LEGAL.serviceArea} 주차대행·유심/eSIM 요금을 비교하는 플랫폼입니다. 입점 업체는
            검증·예약·추적까지, 미입점 업체는 가격 참고용으로 제공합니다.
          </p>
          <a
            href={COMPANY_LEGAL.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-xs font-bold text-brand underline-offset-2 hover:underline"
          >
            공식 사이트 {COMPANY_LEGAL.siteUrlDisplay}
          </a>
        </section>

        <Section title="무엇을 하나요">
          <ul className="space-y-3">
            {AIRPICK_SERVICES.map((service) => (
              <li key={service.id} className="rounded-2xl bg-sky-soft px-4 py-3 ring-1 ring-sky-border/60">
                <p className="text-sm font-bold text-ink">{service.title}</p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-muted">{service.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="입점 업체와 미입점 업체">
          <div className="space-y-3">
            <CompareBlock
              title={PARTNER_VS_EXTERNAL.partner.title}
              accent
              points={PARTNER_VS_EXTERNAL.partner.points}
            />
            <CompareBlock
              title={PARTNER_VS_EXTERNAL.external.title}
              points={PARTNER_VS_EXTERNAL.external.points}
            />
          </div>
        </Section>

        <Section title="고객센터">
          <dl className="space-y-2.5 rounded-2xl bg-sky-soft px-4 py-3.5 text-xs ring-1 ring-sky-border/60">
            <div className="flex items-start gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-brand" strokeWidth={2} />
              <div>
                <dt className="font-bold text-muted">연락처</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {telHref ? (
                    <a href={telHref} className="text-brand underline-offset-2 hover:underline">
                      {formatPhoneDisplay(COMPANY_LEGAL.phone)}
                    </a>
                  ) : (
                    formatPhoneDisplay(COMPANY_LEGAL.phone)
                  )}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-brand" strokeWidth={2} />
              <div>
                <dt className="font-bold text-muted">카카오 고객센터</dt>
                <dd className="mt-0.5">
                  <a
                    href={COMPANY_LEGAL.kakaoChatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand underline-offset-2 hover:underline"
                  >
                    카카오톡 상담하기
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock3 size={16} className="mt-0.5 shrink-0 text-brand" strokeWidth={2} />
              <div>
                <dt className="font-bold text-muted">운영 시간</dt>
                <dd className="mt-0.5 font-semibold text-ink">{COMPANY_LEGAL.supportHours}</dd>
              </div>
            </div>
          </dl>
        </Section>

        <Section title="사업자 정보">
          <dl className="space-y-1.5 rounded-2xl bg-sky-soft px-4 py-3.5 text-xs font-medium text-ink ring-1 ring-sky-border/60">
            <InfoRow label="브랜드" value={COMPANY_LEGAL.serviceName} />
            <InfoRow label="상호" value={COMPANY_LEGAL.name} />
            <InfoRow label="대표" value={COMPANY_LEGAL.representative} />
            <InfoRow label="사업자등록번호" value={COMPANY_LEGAL.registrationNumber} />
            <InfoRow label="주소" value={COMPANY_LEGAL.address} />
            <InfoRow
              label="이메일"
              value={
                <a
                  href={`mailto:${COMPANY_LEGAL.email}`}
                  className="text-brand underline-offset-2 hover:underline"
                >
                  {COMPANY_LEGAL.email}
                </a>
              }
            />
          </dl>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 px-0.5 text-[11px] font-bold text-brand">{title}</h2>
      {children}
    </section>
  );
}

function CompareBlock({
  title,
  points,
  accent = false,
}: {
  title: string;
  points: readonly string[];
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? 'rounded-2xl bg-white px-4 py-3.5 ring-2 ring-brand/25 shadow-[0_2px_10px_rgba(49,130,246,0.08)]'
          : 'rounded-2xl bg-sky-soft px-4 py-3.5 ring-1 ring-sky-border/60'
      }
    >
      <p className={`text-sm font-bold ${accent ? 'text-brand' : 'text-ink'}`}>{title}</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs font-medium leading-relaxed text-muted">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 break-keep">{value}</dd>
    </div>
  );
}
