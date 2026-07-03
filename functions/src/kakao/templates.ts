import { RESERVATION_CREATED_BY } from '../constants/reservationSource';
import type { AlimtalkTemplateKind } from './config';
import type { ReservationRecord } from '../reservations/types';

export interface AlimtalkMessagePayload {
  kind: AlimtalkTemplateKind;
  templateParameter: Record<string, string>;
  /** 사람이 읽기 쉬운 발송 사유 (로그용) */
  brandLabel: string;
}

export function resolveAlimtalkMessage(
  reservation: ReservationRecord,
  context: { receiptUrl: string }
): AlimtalkMessagePayload | null {
  const createdBy = reservation.createdBy?.trim();
  const companyName = reservation.companyName?.trim() || '주차대행';
  const userName = reservation.userName?.trim() || '고객';
  const carNumber = reservation.carNumber?.trim() || '-';
  const departureDate = reservation.departureDate?.trim() || '-';
  const departureTime = reservation.departureTime?.trim() || '';
  const totalPrice =
    reservation.totalPrice != null ? String(Math.round(reservation.totalPrice)) : '-';

  const baseParams: Record<string, string> = {
    고객명: userName,
    업체명: companyName,
    차량번호: carNumber,
    출국일: departureDate,
    출국시간: departureTime,
    참고요금: totalPrice,
    접수증링크: context.receiptUrl,
  };

  if (createdBy === RESERVATION_CREATED_BY.AIRPICK_B2C) {
    return {
      kind: 'airpick-b2c',
      brandLabel: '에어픽',
      templateParameter: {
        ...baseParams,
        브랜드: '에어픽',
      },
    };
  }

  if (createdBy === RESERVATION_CREATED_BY.HOMEPAGE) {
    return {
      kind: 'partner-homepage',
      brandLabel: companyName,
      templateParameter: {
        ...baseParams,
        브랜드: companyName,
      },
    };
  }

  // 레거시 홈페이지: createdBy 없이 companyId만 있는 경우 → 제휴사명 템플릿
  if (reservation.companyId && createdBy !== RESERVATION_CREATED_BY.B2B) {
    return {
      kind: 'partner-homepage',
      brandLabel: companyName,
      templateParameter: {
        ...baseParams,
        브랜드: companyName,
      },
    };
  }

  return null;
}
