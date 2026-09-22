import { displayCompanyName } from './display';
import { formatPhoneDisplay } from './contact';

export type CompanyUsageStep = {
  title: string;
  body: string;
  mediaSrc?: string;
};

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function mapStep(item: unknown): CompanyUsageStep | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  const o = item as Record<string, unknown>;
  const title = str(o.title);
  const body = str(o.body);
  if (!title || !body) return null;
  const mediaSrc = str(o.mediaSrc) || undefined;
  return {
    title,
    body: body.replaceAll('공항 도착 전', '공항 도착 30분전'),
    ...(mediaSrc ? { mediaSrc } : {}),
  };
}

/** companies/{id}.partnerHomepage.config.steps — 파트너 홈 이용방법과 동일 소스 */
export function parsePartnerHomepageUsageSteps(
  data: Record<string, unknown>
): CompanyUsageStep[] {
  const raw = data.partnerHomepage;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
  const doc = raw as Record<string, unknown>;
  if (doc.enabled === false) return [];
  const config = doc.config;
  if (!config || typeof config !== 'object' || Array.isArray(config)) return [];
  const stepsRaw = (config as Record<string, unknown>).steps;
  if (!Array.isArray(stepsRaw)) return [];
  return stepsRaw.map(mapStep).filter((s): s is CompanyUsageStep => s != null);
}

export function parseCompanyPickupLocation(data: Record<string, unknown>): string | undefined {
  const s = str(data.pickupLocation);
  return s || undefined;
}

/** 파트너 홈에 이용방법이 없을 때 기본 안내 */
export function defaultCompanyUsageSteps(company: {
  name: string;
  phone?: string;
  pickupLocation?: string;
}): CompanyUsageStep[] {
  const nick = displayCompanyName(company.name) || '업체';
  const phone = company.phone ? formatPhoneDisplay(company.phone) : '';
  const contact = phone ? `${nick}(${phone})` : nick;
  const pickup = company.pickupLocation?.trim();

  return [
    {
      title: '온라인 예약',
      body: '에어픽에서 일정과 차량 정보를 입력해 예약합니다.',
    },
    {
      title: '도착 전 연락',
      body: pickup
        ? `공항 도착 30분전 ${contact}로 연락하면 인계 위치를 안내합니다. (기본 픽업: ${pickup})`
        : `공항 도착 30분전 ${contact}로 연락하면 인계 위치를 안내합니다.`,
    },
    {
      title: '차량 인계·보관',
      body: '안내 장소에서 차량을 맡기면 상태 확인 후 전용 주차장에 보관합니다.',
    },
    {
      title: '귀국 후 반환',
      body: '입국 후 연락 주시면 안내에 따라 차량을 반환합니다.',
    },
  ];
}

export function resolveCompanyUsageSteps(company: {
  name: string;
  phone?: string;
  pickupLocation?: string;
  usageSteps?: CompanyUsageStep[];
}): CompanyUsageStep[] {
  if (company.usageSteps && company.usageSteps.length > 0) return company.usageSteps;
  return defaultCompanyUsageSteps(company);
}
