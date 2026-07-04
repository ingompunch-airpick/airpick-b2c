import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions/v2';

// NOTE: onReservationCreatedNotify(카카오 시크릿 필요)는 카카오 값 준비 후 배포.
// 지금은 시크릿 없는 함수만 로드/배포한다.
import { getReceipt } from './api/getReceipt';
import { lookupReservation } from './api/lookupReservation';
import { cancelReservation } from './api/cancelReservation';

admin.initializeApp();

setGlobalOptions({
  region: 'asia-northeast3',
  maxInstances: 10,
});

export { getReceipt, lookupReservation, cancelReservation };
