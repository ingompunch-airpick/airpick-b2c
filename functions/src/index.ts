import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions/v2';

import { onReservationCreatedNotify } from './triggers/onReservationCreated';
import { getReceipt } from './api/getReceipt';

admin.initializeApp();

setGlobalOptions({
  region: 'asia-northeast3',
  maxInstances: 10,
});

export { onReservationCreatedNotify, getReceipt };
