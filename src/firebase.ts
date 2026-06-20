import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config/firebase';
import { initAnalytics } from './lib/analytics';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/** GA4 — Firebase Console · Analytics 대시보드에서 방문·클릭 확인 */
void isSupported().then((supported) => {
  if (supported) initAnalytics(getAnalytics(app));
});
