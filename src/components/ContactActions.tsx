import { MessageCircle, Phone } from 'lucide-react';
import { cn } from '../utils/cn';
import { buildTelHref } from '../utils/contact';

function ContactButton({
  href,
  disabled,
  variant,
  icon: Icon,
  label,
  sublabel,
}: {
  href?: string;
  disabled?: boolean;
  variant: 'brand' | 'muted';
  icon: typeof Phone;
  label: string;
  sublabel?: string;
}) {
  const className = cn(
    'flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-3 text-center ring-1 transition-colors',
    variant === 'brand'
      ? 'bg-brand text-white ring-brand hover:bg-brand-dark'
      : 'bg-sky-bg text-ink ring-sky-border/70 hover:bg-sky-tint',
    disabled && 'pointer-events-none opacity-45'
  );

  const content = (
    <>
      <span className="flex items-center gap-1.5 text-xs font-bold">
        <Icon size={14} strokeWidth={2.25} />
        {label}
      </span>
      {sublabel && (
        <span
          className={cn(
            'text-[10px] font-semibold',
            variant === 'brand' ? 'text-white/85' : 'text-muted'
          )}
        >
          {sublabel}
        </span>
      )}
    </>
  );

  if (disabled || !href) {
    return (
      <div className={className} aria-disabled>
        {content}
      </div>
    );
  }

  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      className={className}
      {...(isExternal
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {content}
    </a>
  );
}

export default function ContactActions({
  companyPhone,
  companyPhoneLabel,
  airpickPhone,
  airpickPhoneDisplay,
  kakaoChannelUrl,
  kakaoLabel,
  compact = false,
  showCompany = true,
}: {
  companyPhone?: string;
  companyPhoneLabel?: string;
  airpickPhone?: string;
  airpickPhoneDisplay?: string;
  kakaoChannelUrl?: string;
  kakaoLabel?: string;
  compact?: boolean;
  showCompany?: boolean;
}) {
  const companyTel = buildTelHref(companyPhone);
  const airpickTel = buildTelHref(airpickPhone);

  return (
    <div className={cn('space-y-2', compact && 'space-y-1.5')}>
      <div className={cn('grid gap-2', showCompany ? 'grid-cols-2' : 'grid-cols-1')}>
        {showCompany && (
          <ContactButton
            href={companyTel}
            disabled={!companyTel}
            variant="muted"
            icon={Phone}
            label="업체 문의"
            sublabel={
              companyTel
                ? companyPhoneLabel || '주차장 · 입출고'
                : '연락처 준비 중'
            }
          />
        )}
        <ContactButton
          href={airpickTel}
          disabled={!airpickTel}
          variant="brand"
          icon={Phone}
          label="에어픽 문의"
          sublabel={
            airpickTel
              ? airpickPhoneDisplay || '예약 · MY · 앱'
              : '번호 등록 예정'
          }
        />
      </div>
      {kakaoChannelUrl && (
        <ContactButton
          href={kakaoChannelUrl}
          variant="muted"
          icon={MessageCircle}
          label={kakaoLabel || '카카오톡 문의'}
          sublabel="에어픽 고객센터"
        />
      )}
    </div>
  );
}
