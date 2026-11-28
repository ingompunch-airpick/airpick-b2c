/**
 * 홈 「추천순」 — 손님이 들어올 때 순서를 한 번 정하고 그 방문 동안 유지한다.
 * 업체마다 가중치(운영 점수 1등 3 · 2등 2 · 그 밖 1 · 기준 미달 0)로 맨 위 자리를 뽑고,
 * 둘째 자리부터는 남은 업체끼리 같은 방식으로 정한다(가중치 비복원 추출).
 * 기준: 「에어픽 입점 업체 수수료·등급 정책 (안)」
 */

const SEED_KEY = 'airpick.recommendSeed';
let memorySeed = '';

function freshSeed(): string {
  try {
    const bytes = new Uint32Array(2);
    crypto.getRandomValues(bytes);
    return `${bytes[0].toString(36)}${bytes[1].toString(36)}`;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

/** 이번 방문(탭)의 순서 씨앗. 탭을 닫으면 새로 정한다. */
export function visitSeed(): string {
  try {
    const saved = sessionStorage.getItem(SEED_KEY);
    if (saved) return saved;
    const seed = freshSeed();
    sessionStorage.setItem(SEED_KEY, seed);
    return seed;
  } catch {
    if (!memorySeed) memorySeed = freshSeed();
    return memorySeed;
  }
}

/** 씨앗+업체 id → 0~1 사이 고정값 (FNV-1a) */
export function seededUnit(seed: string, id: string): number {
  let h = 0x811c9dc5;
  const text = `${seed}:${id}`;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  // 끝 글자만 다른 id(bucks·asia 등)도 고르게 흩어지게 한 번 더 섞는다 (murmur3 fmix32)
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return ((h >>> 0) + 0.5) / 4294967296;
}

/**
 * 큰 값이 앞. 가중치 w>0 이면 u^(1/w) (0~1), 0이면 언제나 그 아래(-1~0).
 * 이 값으로 내림차순 정렬하면 「가중치 비율로 맨 위 자리 뽑기 → 남은 업체로 반복」과 같다.
 */
export function recommendKey(seed: string, id: string, weight: number): number {
  const u = seededUnit(seed, id);
  return weight > 0 ? Math.pow(u, 1 / weight) : u - 1;
}
