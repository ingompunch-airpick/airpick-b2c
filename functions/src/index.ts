import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions/v2';

import { getReceipt } from './api/getReceipt';
import { lookupReservation } from './api/lookupReservation';
import { cancelReservation } from './api/cancelReservation';
import { submitReview } from './api/submitReview';
import { listAdminReviews, moderateReview } from './api/moderateReview';
import { getIcnShuttle } from './api/icnShuttle';
import { getIcnFlight } from './api/icnFlight';
import { getDriveEta } from './api/driveEta';

admin.initializeApp();

setGlobalOptions({
  region: 'asia-northeast3',
  maxInstances: 10,
});

export {
  getReceipt,
  lookupReservation,
  cancelReservation,
  submitReview,
  listAdminReviews,
  moderateReview,
  getIcnShuttle,
  getIcnFlight,
  getDriveEta,
};
