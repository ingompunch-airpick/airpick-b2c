export type PricingTerminal = '1T' | '2T';

/** 가유(GY) 입점 — 1T: 3일 40,000 + 4일째 5,000/일 · 2T: 4일 50,000, 5일 60,000 + 6일째 5,000/일 */
export function calculateGayuBasePrice(totalDays: number, terminal: PricingTerminal): number {
  if (totalDays <= 0) return 0;

  if (terminal === '2T') {
    if (totalDays <= 4) return 50000;
    return 60000 + (totalDays - 5) * 5000;
  }

  if (totalDays <= 3) return 40000;
  return 40000 + (totalDays - 3) * 5000;
}

export interface GayuParkingPriceInput {
  totalDays: number;
  terminal: PricingTerminal;
  isCard?: boolean;
  departureDate?: string;
  arrivalDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  /** 입·출차 심야(19:00~05:00) 각 10,000원 */
  checkNightSurcharge?: (dateTime: string, start: string, end: string) => boolean;
}

export function calculateGayuParkingPrice(input: GayuParkingPriceInput): number {
  const {
    totalDays,
    terminal,
    isCard = false,
    departureDate,
    arrivalDate,
    departureTime = '10:00',
    arrivalTime = '10:00',
    checkNightSurcharge,
  } = input;

  let total = calculateGayuBasePrice(totalDays, terminal);

  if (checkNightSurcharge && departureDate) {
    const nightStart = '19:00';
    const nightEnd = '05:00';
    const nightFee = 10000;
    if (checkNightSurcharge(`${departureDate} ${departureTime}`, nightStart, nightEnd)) {
      total += nightFee;
    }
    if (arrivalDate && checkNightSurcharge(`${arrivalDate} ${arrivalTime}`, nightStart, nightEnd)) {
      total += nightFee;
    }
  }

  if (isCard) {
    total = Math.floor(total * 1.1);
  }

  return total;
}
