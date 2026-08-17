import { useState, type FormEvent } from 'react';
import { Button, Card, Container, FadeIn, Section, SectionTitle } from '../../../design-system';
import { COMPANY_LEGAL } from '../../../constants/companyLegal';
import { trackCtaClick, trackOutboundClick } from '../../../lib/analytics';
import { buildTelHref, formatPhoneDisplay } from '../../../utils/contact';

type Status = 'idle' | 'loading' | 'ok' | 'error';

function digitsPhone(v: string): string {
  return v.replace(/\D/g, '');
}

export function PartnerApply() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    trackCtaClick('partner_apply_submit', 'partner');

    try {
      const res = await fetch('/api/partner-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          phone: digitsPhone(phone),
          memo: memo.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(
          data.error === 'invalid_phone'
            ? '연락처를 확인해 주세요.'
            : data.error === 'missing_fields'
              ? '필수 항목을 모두 입력해 주세요.'
              : '잠시 후 다시 시도해 주세요.'
        );
        return;
      }
      setStatus('ok');
      setCompanyName('');
      setContactName('');
      setPhone('');
      setMemo('');
    } catch {
      setStatus('error');
      setErrorMsg('네트워크 오류입니다. 전화·카카오로도 문의할 수 있습니다.');
    }
  }

  const tel = buildTelHref(COMPANY_LEGAL.phone) ?? `tel:${COMPANY_LEGAL.phone}`;

  return (
    <Section id="apply" tone="sub">
      <Container>
        <SectionTitle
          align="center"
          className="mb-12"
          title={
            <>
              광고를 계속 사실 건가요?
              <br />
              아니면 플랫폼에 먼저 올라오실 건가요?
            </>
          }
          description="먼저 입점할수록 더 좋은 조건으로 함께 성장합니다. 상담은 무료입니다."
        />

        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <FadeIn>
            <Card>
              {status === 'ok' ? (
                <div className="py-8 text-center">
                  <p className="text-lg font-bold text-mkt-ink">신청이 접수되었습니다.</p>
                  <p className="mt-2 text-sm text-mkt-muted">
                    영업일 기준 순차로 연락드립니다.
                  </p>
                  <Button className="mt-6" type="button" onClick={() => setStatus('idle')}>
                    추가 신청
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <Field
                    label="업체명"
                    required
                    value={companyName}
                    onChange={setCompanyName}
                    placeholder="예: ○○주차대행"
                  />
                  <Field
                    label="담당자명"
                    required
                    value={contactName}
                    onChange={setContactName}
                    placeholder="홍길동"
                  />
                  <Field
                    label="연락처"
                    required
                    value={phone}
                    onChange={setPhone}
                    placeholder="01012345678"
                    inputMode="tel"
                  />
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-mkt-ink">
                      메모 (선택)
                    </span>
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-mkt-border bg-white px-4 py-3 text-sm text-mkt-ink outline-none transition focus:border-mkt-brand"
                      placeholder="터미널, 실내/야외, 희망 일정 등"
                    />
                  </label>
                  {status === 'error' ? (
                    <p className="text-sm font-medium text-red-600" role="alert">
                      {errorMsg}
                    </p>
                  ) : null}
                  <Button type="submit" className="w-full" disabled={status === 'loading'}>
                    {status === 'loading' ? '전송 중…' : '무료 입점 상담 신청'}
                  </Button>
                </form>
              )}
            </Card>
          </FadeIn>

          <FadeIn delay={0.1} className="flex flex-col gap-4">
            <Card className="flex flex-1 flex-col justify-center gap-4">
              <p className="text-sm font-semibold text-mkt-ink">바로 연락</p>
              <Button
                href={tel}
                variant="secondary"
                className="w-full"
                onClick={() =>
                  trackOutboundClick({
                    category: 'phone',
                    destination: COMPANY_LEGAL.phone,
                    itemName: '파트너 전화 문의',
                  })
                }
              >
                전화 문의
              </Button>
              <Button
                href={COMPANY_LEGAL.kakaoChatUrl}
                variant="secondary"
                className="w-full"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCtaClick('partner_kakao', 'partner')}
              >
                카카오 문의
              </Button>
              <p className="text-xs leading-relaxed text-mkt-muted">
                고객센터 {COMPANY_LEGAL.supportHours} ·{' '}
                {formatPhoneDisplay(COMPANY_LEGAL.phone)}
              </p>
            </Card>
            <p className="text-center text-xs text-mkt-muted">
              이미 입점한 업체는{' '}
              <a
                href="/for-partners/"
                className="font-semibold text-mkt-brand underline-offset-2 hover:underline"
              >
                입점사 자료실
              </a>
              을 이용해 주세요.
            </p>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-mkt-ink">
        {label}
        {required ? <span className="text-mkt-brand"> *</span> : null}
      </span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-2xl border border-mkt-border bg-white px-4 py-3 text-sm text-mkt-ink outline-none transition focus:border-mkt-brand"
      />
    </label>
  );
}
