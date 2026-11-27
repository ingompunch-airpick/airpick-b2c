import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ensureAnonymousAuth } from './reservations';

/** 서버(readItinerary)가 돌려주는 항공편 — 출국편은 인천 출발, 귀국편은 인천 도착 날짜·시간 */
export type ItineraryFlight = {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  date: string;
  time: string;
  terminal: 'T1' | 'T2' | null;
  otherAirport: string;
};

export type ItineraryResult = {
  ok: boolean;
  message?: string;
  outbound?: ItineraryFlight | null;
  inbound?: ItineraryFlight | null;
  warnings?: string[];
};

const MAX_EDGE = 1800;
const MAX_PDF_BYTES = 4 * 1024 * 1024;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** 사진은 보내기 전에 줄인다 (용량·속도). 못 열면 원본 그대로 */
async function shrinkImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    return blob || file;
  } catch {
    return file;
  }
}

type ReadPayload = { fileBase64?: string; mimeType?: string; text?: string };

async function callReadItinerary(payload: ReadPayload): Promise<ItineraryResult> {
  await ensureAnonymousAuth();
  const call = httpsCallable<ReadPayload, ItineraryResult>(
    getFunctions(getApp(), 'asia-northeast3'),
    'readItinerary',
    { timeout: 70_000 }
  );
  try {
    const res = await call(payload);
    return res.data;
  } catch (err) {
    const msg = (err as { message?: string })?.message || '';
    // 서버가 보낸 한글 안내는 그대로, 나머지는 공통 문구
    return {
      ok: false,
      message: /[가-힣]/.test(msg) ? msg : '지금은 읽을 수 없어요. 항공편을 직접 넣어 주세요.',
    };
  }
}

/** 항공권·일정표 사진/PDF → 출국·귀국 항공편. 파일은 서버에 저장되지 않는다. */
export async function readItineraryFile(file: File): Promise<ItineraryResult> {
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!isPdf && !file.type.startsWith('image/')) {
    return { ok: false, message: '사진이나 PDF만 올릴 수 있어요.' };
  }
  if (isPdf && file.size > MAX_PDF_BYTES) {
    return { ok: false, message: 'PDF가 너무 커요. 항공편이 보이는 화면을 캡처해서 올려 주세요.' };
  }
  const blob = isPdf ? file : await shrinkImage(file);
  const mimeType = isPdf ? 'application/pdf' : blob.type || 'image/jpeg';
  return callReadItinerary({ fileBase64: await blobToBase64(blob), mimeType });
}

/** 카톡·문자로 받은 일정표 글자 → 출국·귀국 항공편 */
export async function readItineraryText(text: string): Promise<ItineraryResult> {
  const t = text.trim();
  if (t.length < 8) return { ok: false, message: '항공편이 적힌 글자를 붙여넣어 주세요.' };
  if (t.length > 6000) return { ok: false, message: '글자가 너무 길어요. 항공편 부분만 붙여넣어 주세요.' };
  return callReadItinerary({ text: t });
}
