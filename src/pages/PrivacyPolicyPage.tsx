import { ChevronLeft, Shield } from 'lucide-react';
import type { ReactNode } from 'react';
import { COMPANY_LEGAL } from '../constants/companyLegal';
import { formatPhoneDisplay } from '../utils/contact';

const COLLECTED_ITEMS = [
  '성함, 휴대폰번호, 차량기종, 차량번호',
  '입·출국 일시, 터미널, 항공편 정보(입력 시)',
  '여행지, 요청사항(입력 시)',
  '서비스 이용 기록, 접속 로그, 쿠키(자동 수집될 수 있음)',
];

export default function PrivacyPolicyPage({ onBack }: { onBack: () => void }) {
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
        <h1 className="text-base font-bold text-ink">개인정보처리방침</h1>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-5 pb-8">
        <section className="rounded-3xl bg-gradient-to-br from-sky-tint to-sky-soft p-5 shadow-[0_4px_16px_rgba(49,130,246,0.1)]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
              <Shield size={20} className="text-brand" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-brand">{COMPANY_LEGAL.serviceName}</p>
              <p className="text-sm font-bold text-ink">개인정보 처리방침</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium leading-relaxed text-muted">
            {COMPANY_LEGAL.name}(이하 &quot;회사&quot;)는 {COMPANY_LEGAL.serviceName} 서비스 이용과 관련하여
            개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속히 처리하기 위해
            다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>
        </section>

        <PolicySection title="1. 개인정보의 처리 목적">
          회사는 다음 목적을 위해 개인정보를 처리합니다.
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>주차대행 예약 접수·조회 및 제휴 업체 연동</li>
            <li>고객 상담, 문의·민원 처리</li>
            <li>서비스 개선, 부정 이용 방지, 법령상 의무 이행</li>
          </ul>
        </PolicySection>

        <PolicySection title="2. 수집하는 개인정보 항목">
          <ul className="list-disc space-y-1 pl-4">
            {COLLECTED_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PolicySection>

        <PolicySection title="3. 보유 및 이용 기간">
          원칙적으로 개인정보 처리 목적이 달성되면 지체 없이 파기합니다. 다만 관계 법령에 따라 보존할
          필요가 있는 경우 해당 기간 동안 보관합니다.
        </PolicySection>

        <PolicySection title="4. 개인정보의 제3자 제공">
          주차대행 예약의 이행을 위해 이용자가 선택한 <strong className="font-bold text-ink">입점 제휴
          업체</strong>에 예약에 필요한 정보가 제공될 수 있습니다. eSIM·유심 비교의 경우 제휴사
          사이트로 이동하여 별도로 처리됩니다.
        </PolicySection>

        <PolicySection title="5. 개인정보 보호책임자">
          <dl className="mt-2 space-y-1">
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted">성명</dt>
              <dd>{COMPANY_LEGAL.privacyOfficer}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted">이메일</dt>
              <dd>{COMPANY_LEGAL.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted">전화</dt>
              <dd>{formatPhoneDisplay(COMPANY_LEGAL.phone)}</dd>
            </div>
          </dl>
        </PolicySection>

        <PolicySection title="6. 사업자 정보">
          <dl className="mt-2 space-y-1">
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted">상호</dt>
              <dd>{COMPANY_LEGAL.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted">대표</dt>
              <dd>{COMPANY_LEGAL.representative}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted">사업자등록번호</dt>
              <dd>{COMPANY_LEGAL.registrationNumber}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted">주소</dt>
              <dd>{COMPANY_LEGAL.address}</dd>
            </div>
          </dl>
        </PolicySection>

        <p className="mt-6 text-[10px] font-medium text-muted-light">시행일: 2026년 6월 21일</p>
      </div>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl bg-sky-soft px-4 py-3.5 ring-1 ring-sky-border/60">
      <h2 className="text-sm font-bold text-ink">{title}</h2>
      <div className="mt-2 text-xs font-medium leading-relaxed text-muted">{children}</div>
    </section>
  );
}
