/** 후기 사진 — canvas로 JPEG 압축 (data URL) */
export async function compressImageFileToDataUrl(
  file: File,
  maxWidth = 1280,
  quality = 0.82
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('이미지 처리에 실패했습니다.');
    ctx.drawImage(bitmap, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    bitmap.close();
  }
}

export function parseDataUrlImage(dataUrl: string): { buffer: Uint8Array; contentType: string } | null {
  const m = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl.trim());
  if (!m) return null;
  const contentType = m[1]!.toLowerCase() === 'image/jpg' ? 'image/jpeg' : m[1]!.toLowerCase();
  const binary = atob(m[2]!);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return { buffer, contentType };
}
