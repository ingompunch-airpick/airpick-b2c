import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/** 한 번에 쓰는 단위. 서버 POINT_STEP_WON 과 같아야 한다. */
export const POINT_STEP_WON = 5000;

export function maxPointSpend(balance: number, payableBeforePoints: number): number {
  const cappedBalance = Math.floor(Math.max(0, balance) / POINT_STEP_WON) * POINT_STEP_WON;
  const cappedPrice = Math.floor(Math.max(0, payableBeforePoints) / POINT_STEP_WON) * POINT_STEP_WON;
  return Math.min(cappedBalance, cappedPrice);
}

export function subscribePointBalance(uid: string, onBalance: (won: number) => void): () => void {
  return onSnapshot(
    doc(db, 'pointAccounts', uid),
    (snap) => {
      const balance = Math.floor(Number(snap.data()?.balance) || 0);
      onBalance(Math.max(0, balance));
    },
    () => onBalance(0)
  );
}
