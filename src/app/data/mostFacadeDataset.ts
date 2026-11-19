const DATASET_ROOT = "https://raw.githubusercontent.com/yq1ngz/living-structure-prompts2facades/main";

const properties = [
  { id: 1, slug: "1_levels_of_scale", en: "Levels of Scale", zh: "尺度层级" },
  { id: 2, slug: "2_strong_centers", en: "Strong Centers", zh: "强中心" },
  { id: 3, slug: "3_thick_boundaries", en: "Thick Boundaries", zh: "厚边界" },
  { id: 4, slug: "4_alternating_repetition", en: "Alternating Repetition", zh: "交替重复" },
  { id: 5, slug: "5_positive_space", en: "Positive Space", zh: "正空间" },
  { id: 6, slug: "6_good_shape", en: "Good Shape", zh: "良好形状" },
  { id: 7, slug: "7_local_symmetries", en: "Local Symmetries", zh: "局部对称" },
  { id: 8, slug: "8_deep_interlock_and_ambiguity", en: "Deep Interlock and Ambiguity", zh: "深度交织与模糊性" },
  { id: 9, slug: "9_contrast", en: "Contrast", zh: "对比" },
  { id: 10, slug: "10_gradients", en: "Gradients", zh: "渐变" },
  { id: 11, slug: "11_roughness", en: "Roughness", zh: "粗糙性" },
  { id: 12, slug: "12_echoes", en: "Echoes", zh: "共鸣" },
  { id: 13, slug: "13_the_void", en: "The Void", zh: "虚空" },
  { id: 14, slug: "14_simplicity_and_inner_calm", en: "Simplicity and Inner Calm", zh: "简洁与内在平静" },
  { id: 15, slug: "15_not_separateness", en: "Not-Separateness", zh: "非分离性" },
] as const;

export function getMostFacadeProperty(propertyId: number) {
  return properties.find(property => property.id === propertyId) ?? null;
}

export type MostFacadePair = {
  source: 'living-structure' | 'before-after-streetscape' | 'beautimeter-book';
  propertyId: number;
  propertyEn: string;
  propertyZh: string;
  pairNumber: number;
  imageA: string;
  imageB: string;
  positivePromptSlot: "A" | "B";
  articlePairId?: string;
};

function makePair(property: typeof properties[number], pairNumber: number, positivePromptFirst: boolean): MostFacadePair {
  const positive = `${DATASET_ROOT}/${property.slug}/${property.id}-${pairNumber}a.png`;
  const negative = `${DATASET_ROOT}/${property.slug}/${property.id}-${pairNumber}b.png`;

  return {
    source: 'living-structure',
    propertyId: property.id,
    propertyEn: property.en,
    propertyZh: property.zh,
    pairNumber,
    imageA: positivePromptFirst ? positive : negative,
    imageB: positivePromptFirst ? negative : positive,
    positivePromptSlot: positivePromptFirst ? "A" : "B",
  };
}

const BEFORE_AFTER_ROOT = 'https://raw.githubusercontent.com/yq1ngz/before-after-streetscape/main/2_Seperate%20images%20without%20watermarks';

export function makeBeforeAfterPair(pairNumber: number, firstImageIsA = true): MostFacadePair {
  const id = Math.max(1, Math.min(400, Math.floor(pairNumber)));
  const first = `${BEFORE_AFTER_ROOT}/${id}-1.jpg`;
  const second = `${BEFORE_AFTER_ROOT}/${id}-2.jpg`;
  return {
    source: 'before-after-streetscape',
    propertyId: id,
    propertyEn: `Before–after streetscape ${id}`,
    propertyZh: `街景前后对照 ${id}`,
    pairNumber: id,
    imageA: firstImageIsA ? first : second,
    imageB: firstImageIsA ? second : first,
    positivePromptSlot: 'A',
  };
}

export function prepareBeforeAfterSession(seed: number, count = 10): MostFacadePair[] {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const ids = Array.from({ length: 400 }, (_, index) => index + 1);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, Math.max(0, Math.min(400, Math.floor(count)))).map(id => makeBeforeAfterPair(id, random() < 0.5));
}

export function randomMostFacadePair(random = Math.random): MostFacadePair {
  return makePair(properties[Math.floor(random() * properties.length)], Math.floor(random() * 3) + 1, random() < 0.5);
}

// Reproducible order, one pair per property, with independently shuffled A/B slots.
export function prepareMostFacadeSession(seed: number, count = 10): MostFacadePair[] {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const order = [...properties];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.slice(0, Math.max(0, Math.min(15, Math.floor(count)))).map(property => makePair(property, Math.floor(random() * 3) + 1, random() < 0.5));
}

// AI-only rounds draw evenly from both source repositories, then randomize pair order and A/B slots.
export function prepareMostAiSession(seed: number, count = 10): MostFacadePair[] {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const total = Math.max(0, Math.min(20, Math.floor(count)));
  const streetscapeCount = Math.floor(total / 2);
  const facadeCount = total - streetscapeCount;
  const facades = prepareMostFacadeSession(seed ^ 0x51f15e, facadeCount);
  const streetscapes = prepareBeforeAfterSession(seed ^ 0xa37c29, streetscapeCount);
  const pairs = [...facades, ...streetscapes];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs;
}

export const MOST_FACADE_DATASET_URL = "https://github.com/yq1ngz/living-structure-prompts2facades";
