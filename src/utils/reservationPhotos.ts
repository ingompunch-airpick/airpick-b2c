export interface ScratchPhotoSet {
  synced?: boolean;
  urls?: string[];
  front?: string;
  rear?: string;
  left?: string;
  right?: string;
}

function isDemoUrl(url: string): boolean {
  return url.includes('unsplash.com') || url.includes('images.unsplash');
}

/** Firestore scratchPhotos → 표시용 URL (B2B scratchPhotos.ts와 동일 규칙) */
export function getScratchPhotoUrls(set?: ScratchPhotoSet): string[] {
  if (!set) return [];

  if (set.urls?.length) {
    return set.urls.filter((u) => u?.trim() && !isDemoUrl(u));
  }

  return [set.front, set.rear, set.left, set.right].filter(
    (u): u is string => !!u?.trim() && !isDemoUrl(u)
  );
}

function mergePhotoUrls(...lists: (string[] | undefined)[]): string[] {
  const urls: string[] = [];
  for (const list of lists) {
    for (const raw of list || []) {
      const url = raw?.trim();
      if (url && !isDemoUrl(url) && !urls.includes(url)) {
        urls.push(url);
      }
    }
  }
  return urls;
}

/** B2B images[] + scratchPhotos + checkInPhotos → 입고 사진 */
export function getReservationCheckInPhotos(data: {
  checkInPhotos?: string[];
  images?: string[];
  scratchPhotos?: ScratchPhotoSet;
}): string[] {
  return mergePhotoUrls(
    data.checkInPhotos,
    data.images,
    getScratchPhotoUrls(data.scratchPhotos)
  );
}

export function getReservationCheckOutPhotos(data: { checkOutPhotos?: string[] }): string[] {
  return mergePhotoUrls(data.checkOutPhotos);
}
