/**
 * 최근 예약 기억 (localStorage) — 재방문 시 차량번호 프리필용.
 * 위치·사진 등 민감 정보는 저장하지 않으며, 조회 시 비밀번호가 필요하다.
 * 출고(arrivalDate) 후 7일이 지나면 자동으로 잊는다.
 * 추후 소셜 로그인 도입 시 이 방식은 대체될 예정.
 */
const KEY = 'airpick_recent_reservation';
const RETENTION_DAYS = 7;

export interface RecentReservation {
  id: string;
  carNumber: string;
  arrivalDate: string;
}

export function saveRecentReservation(r: RecentReservation): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(r));
  } catch {
    /* localStorage 미지원·사생활 모드 — 무시 */
  }
}

export function clearRecentReservation(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 무시 */
  }
}

export function getRecentReservation(now: Date = new Date()): RecentReservation | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RecentReservation>;
    if (!parsed?.id || !parsed?.carNumber) return null;

    if (parsed.arrivalDate) {
      const expiry = new Date(`${parsed.arrivalDate}T00:00:00`);
      if (!Number.isNaN(expiry.getTime())) {
        expiry.setDate(expiry.getDate() + RETENTION_DAYS + 1);
        if (now > expiry) {
          clearRecentReservation();
          return null;
        }
      }
    }

    return {
      id: parsed.id,
      carNumber: parsed.carNumber,
      arrivalDate: parsed.arrivalDate ?? '',
    };
  } catch {
    return null;
  }
}
