import airlinesCatalog from '../../public/shared/airlines.json';

export type AirlineGroupId = 'domestic' | 'international' | 'other';

export interface AirlineOption {
  id: string;
  name: string;
  group: AirlineGroupId;
  allowCustom?: boolean;
}

export const AIRLINE_OTHER_NAME = '기타 (직접 입력)';

export const AIRLINE_GROUPS = airlinesCatalog.groups as { id: AirlineGroupId; label: string }[];

export const AIRLINE_OPTIONS = airlinesCatalog.airlines as AirlineOption[];

export function isKnownAirlineName(name: string): boolean {
  const trimmed = name.trim();
  return AIRLINE_OPTIONS.some((a) => !a.allowCustom && a.name === trimmed);
}

export function airlinesByGroup(groupId: AirlineGroupId): AirlineOption[] {
  return AIRLINE_OPTIONS.filter((a) => a.group === groupId);
}
