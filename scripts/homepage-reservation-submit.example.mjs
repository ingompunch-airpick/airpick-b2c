/**
 * 제휴사 홈페이지(와와 등) — Firestore reservations 저장 예시
 * 카톡은 클라이언트에서 보내지 않습니다. Functions가 createdBy로 템플릿 분기합니다.
 */
export function buildHomepageReservationPayload({
  companyId,
  companyName,
  form,
  search,
  totalPrice,
}) {
  return {
    companyId,
    companyName,
    userName: form.userName.trim(),
    phone: form.phone.trim(),
    carModel: form.carModel.trim(),
    carNumber: form.carNumber.trim(),
    departureDate: search.departureDate,
    departureTime: search.departureTime,
    departureTerminal: search.terminal,
    arrivalDate: search.arrivalDate,
    arrivalTime: search.arrivalTime,
    arrivalTerminal: search.arrivalTerminal ?? search.terminal,
    totalPrice,
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: 'homepage',
    notifyOnCreate: true,
    receiptToken: crypto.randomUUID().replace(/-/g, ''),
    paymentMethod: 'unpaid',
    isIndoor: search.isIndoor !== false,
    scratchPhotos: { synced: false },
  };
}

// await addDoc(collection(db, 'reservations'), buildHomepageReservationPayload(...));
