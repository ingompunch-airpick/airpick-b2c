/** 접수증 공개 API 응답 (토큰 검증 후) */
export interface ReceiptPublic {
  id: string;
  companyName: string;
  userName: string;
  carModel: string;
  carNumber: string;
  phone: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  departureTerminal: string;
  arrivalTerminal?: string;
  destination?: string;
  departureAirline?: string;
  departureFlight?: string;
  arrivalAirline?: string;
  arrivalFlight?: string;
  totalPrice: number;
  isIndoor: boolean;
  createdAt: string;
  status: string;
}
