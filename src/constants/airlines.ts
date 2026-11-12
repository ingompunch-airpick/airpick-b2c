import airlinesCatalog from './airlines.json';
import type { Terminal } from '../types';

export type AirlineGroupId = 'domestic' | 'international' | 'other';

export interface AirlineOption {
  id: string;
  name: string;
  group: AirlineGroupId;
  allowCustom?: boolean;
}

export const AIRLINE_OTHER_NAME = '기타 (직접 입력)';

/** 아시아나 인천공항 T2 이전일 (로컬 날짜 기준) */
export const ASIANA_ICN_T2_FROM = '2026-01-14';

export const AIRLINE_GROUPS = airlinesCatalog.groups as { id: AirlineGroupId; label: string }[];

export const AIRLINE_OPTIONS = airlinesCatalog.airlines as AirlineOption[];

export function isKnownAirlineName(name: string): boolean {
  const trimmed = name.trim();
  return AIRLINE_OPTIONS.some((a) => !a.allowCustom && a.name === trimmed);
}

export function airlinesByGroup(groupId: AirlineGroupId): AirlineOption[] {
  return AIRLINE_OPTIONS.filter((a) => a.group === groupId);
}

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 출처 있는 항공사만 터미널을 제안. 모르면 null (편명·항공사 안내로 확인).
 * 대한항공 T2 · 아시아나 2026-01-14부터 T2.
 */
export function suggestedIcnTerminalForAirline(
  airlineName: string,
  onDateYmd?: string
): Terminal | null {
  const name = airlineName.trim();
  if (name === '대한항공') return 'T2';
  if (name === '아시아나항공') {
    const day = (onDateYmd && /^\d{4}-\d{2}-\d{2}$/.test(onDateYmd) ? onDateYmd : ymdLocal(new Date())).slice(
      0,
      10
    );
    return day >= ASIANA_ICN_T2_FROM ? 'T2' : 'T1';
  }
  return null;
}

/** 예약·검색 UI용 짧은 안내. 제안 터미널이 있을 때만. */
export function icnTerminalHintForAirline(airlineName: string, onDateYmd?: string): string | null {
  const name = airlineName.trim();
  const suggested = suggestedIcnTerminalForAirline(name, onDateYmd);
  if (!suggested) return null;
  if (name === '아시아나항공') {
    if (suggested === 'T2') {
      return '아시아나항공은 2026년 1월 14일부터 제2터미널입니다. 출국 터미널을 제2터미널로 맞춰 주세요.';
    }
    return '아시아나항공은 2026년 1월 14일 전까지 제1터미널 기준이었습니다. 출국일을 확인해 주세요.';
  }
  if (name === '대한항공') {
    return '대한항공은 제2터미널입니다. 출국 터미널을 제2터미널로 맞춰 주세요.';
  }
  return null;
}
