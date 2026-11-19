import type { MostFacadePair } from './mostFacadeDataset';

const PAIR_ROOT = `${import.meta.env.BASE_URL}output/most-ai-study-2026-11-14/ppt_images`;
export type MostBookPair = MostFacadePair & {
  sharedImageObjects?: Record<'en' | 'zh', readonly [string, string]>;
};

const TOOL_OBJECTS = {
  en: ['the hatchet at the top', 'the diagonal screwdriver below'],
  zh: ['上方的斧头', '下方斜放的螺丝刀'],
} as const;

export const REVISED_MOST_BOOK_IMAGES = new Set([
  'A16', 'B01', 'B02', 'B06', 'B08', 'B09', 'B11', 'B12', 'B13', 'B14',
  'B18', 'B19', 'B20', 'B21', 'B22', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30',
]);

export type MostWordingId = 'W1' | 'W2' | 'W3' | 'W4' | 'W5' | 'W6';

export type MostWordingSpec = {
  id: MostWordingId;
  questionEn: string;
  questionZh: string;
  focusEn: string;
  focusZh: string;
  sourceRef: string;
  roleSinglePromptSummaryZh: string;
  rolePredPromptSummaryZh: string;
};

export const MOST_WORDINGS: MostWordingSpec[] = [
  {
    id: 'W1',
    questionEn: 'Which of the two is more like your own self?',
    questionZh: '这两幅图中，哪一幅更像你自己（your own self）？',
    focusEn: 'Core self-reflection (Primary frozen wording)',
    focusZh: '自我映照核心问法（主实验固定措辞）',
    sourceRef: 'Alexander (2002, p. 316); Wu & Jiang (2015, Appendix B, p. 53)',
    roleSinglePromptSummaryZh: '扮演 1 名普通被试，直觉回答哪一幅更像自己（A / B / tie）',
    rolePredPromptSummaryZh: '预测 100 名普通人回答“哪一幅更像你自己”时的 A / B / tie 人数比例',
  },
  {
    id: 'W2',
    questionEn: 'Which of the two seems closer to representing you, your own self, in your totality?',
    questionZh: '这两幅图中，哪一幅更接近代表完整的你自己（in your totality）？',
    focusEn: 'Wholeness / totality of self',
    focusZh: '整体自我（totality）映照',
    sourceRef: 'Alexander (2002, p. 316); Wu & Jiang (2015, Appendix B, p. 53)',
    roleSinglePromptSummaryZh: '扮演 1 名普通被试，判断哪一幅更代表完整的自己',
    rolePredPromptSummaryZh: '预测 100 名普通人判断“哪一幅更代表完整的自己”时的分布',
  },
  {
    id: 'W3',
    questionEn: 'Which of the two is more deeply connected to your eternal self, your aspiration, the core of you that exists inside?',
    questionZh: '这两幅图中，哪一幅与你内在的核心、愿望与永恒自我连接更深？',
    focusEn: 'Deep inner core / aspiration',
    focusZh: '内在核心与深层共鸣',
    sourceRef: 'Alexander (2002, p. 316); Wu & Jiang (2015, Appendix B, p. 53)',
    roleSinglePromptSummaryZh: '扮演 1 名普通被试，判断哪一幅与内在核心连接更深',
    rolePredPromptSummaryZh: '预测 100 名普通人就“内在核心连接”作答时的分布',
  },
  {
    id: 'W4',
    questionEn: 'Which of the two is or seems more alive or more life?',
    questionZh: '这两幅图中，哪一幅看起来更有生命力（more alive / more life）？',
    focusEn: 'Perceived life / aliveness',
    focusZh: '感知生命度与生机（perceived life）',
    sourceRef: 'Alexander (2002, p. 319); Wu & Jiang (2015, Appendix B, p. 53)',
    roleSinglePromptSummaryZh: '扮演 1 名普通被试，直觉判断哪一幅更有生命力',
    rolePredPromptSummaryZh: '预测 100 名普通人判断“哪一幅更有生命力”时的分布',
  },
  {
    id: 'W5',
    questionEn: 'Which of the two makes you more aware of God, or makes you feel closer to God?',
    questionZh: '这两幅图中，哪一幅让你更意识到神圣感或感觉更接近神性？',
    focusEn: 'Transcendent / sacred connection (framing sensitivity)',
    focusZh: '超越性/神圣感框架（措辞敏感性对照）',
    sourceRef: 'Alexander (2002, p. 355); Wu & Jiang (2015, Appendix B, p. 53)',
    roleSinglePromptSummaryZh: '扮演 1 名普通被试，在该超验措辞下给出单次选择',
    rolePredPromptSummaryZh: '预测 100 名普通人在该超验措辞下的选择分布',
  },
  {
    id: 'W6',
    questionEn: 'Which of the two would you prefer to become by the day of your death? (Assuming reincarnation, which one would you rather be in your next life?)',
    questionZh: '假设人会转世成为这两者之一，到生命尽头你更愿意成为哪一个？',
    focusEn: 'Existential identification / reincarnation metaphor',
    focusZh: '存在认同/来世隐喻（措辞敏感性对照）',
    sourceRef: 'Alexander (2002, p. 320); Wu & Jiang (2015, Appendix B, p. 53)',
    roleSinglePromptSummaryZh: '扮演 1 名普通被试，在来世成为何者的隐喻下作答',
    rolePredPromptSummaryZh: '预测 100 名普通人在来世隐喻措辞下的选择分布',
  },
];

export type BeautimeterBookReference = {
  pairId: string;
  figure: 5 | 6;
  chapter: 2 | 8;
  alexanderHigher: 'A';
  beautimeterLeft: number;
  beautimeterRight: number;
  beautimeterHigher: 'A' | 'B';
};

export const BEAUTIMETER_BOOK_REFERENCES: Record<string, BeautimeterBookReference> = {
  A01: { pairId: 'A01', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 12.5, beautimeterRight: 7.0, beautimeterHigher: 'A' },
  A02: { pairId: 'A02', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 12.5, beautimeterRight: 8.5, beautimeterHigher: 'A' },
  A03: { pairId: 'A03', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 11.0, beautimeterRight: 10.0, beautimeterHigher: 'A' },
  A04: { pairId: 'A04', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 12.5, beautimeterRight: 11.0, beautimeterHigher: 'A' },
  A05: { pairId: 'A05', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 9.5, beautimeterRight: 11.5, beautimeterHigher: 'B' },
  A06: { pairId: 'A06', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 13.0, beautimeterRight: 9.5, beautimeterHigher: 'A' },
  A07: { pairId: 'A07', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 6.0, beautimeterRight: 8.0, beautimeterHigher: 'B' },
  A08: { pairId: 'A08', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 12.0, beautimeterRight: 10.5, beautimeterHigher: 'A' },
  A09: { pairId: 'A09', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 11.0, beautimeterRight: 10.0, beautimeterHigher: 'A' },
  A10: { pairId: 'A10', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 11.5, beautimeterRight: 10.0, beautimeterHigher: 'A' },
  A11: { pairId: 'A11', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 12.0, beautimeterRight: 11.0, beautimeterHigher: 'A' },
  A12: { pairId: 'A12', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 12.5, beautimeterRight: 11.0, beautimeterHigher: 'A' },
  A13: { pairId: 'A13', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 13.0, beautimeterRight: 9.5, beautimeterHigher: 'A' },
  A14: { pairId: 'A14', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 12.5, beautimeterRight: 8.0, beautimeterHigher: 'A' },
  A15: { pairId: 'A15', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 13.0, beautimeterRight: 9.0, beautimeterHigher: 'A' },
  A16: { pairId: 'A16', figure: 5, chapter: 2, alexanderHigher: 'A', beautimeterLeft: 13.5, beautimeterRight: 8.5, beautimeterHigher: 'A' },
  B01: { pairId: 'B01', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 7.2, beautimeterRight: 6.5, beautimeterHigher: 'A' },
  B02: { pairId: 'B02', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 7.8, beautimeterRight: 7.1, beautimeterHigher: 'A' },
  B03: { pairId: 'B03', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 8.4, beautimeterRight: 7.6, beautimeterHigher: 'A' },
  B04: { pairId: 'B04', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 8.9, beautimeterRight: 8.1, beautimeterHigher: 'A' },
  B05: { pairId: 'B05', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 9.2, beautimeterRight: 7.3, beautimeterHigher: 'A' },
  B06: { pairId: 'B06', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 11.0, beautimeterRight: 8.4, beautimeterHigher: 'A' },
  B07: { pairId: 'B07', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 10.8, beautimeterRight: 9.1, beautimeterHigher: 'A' },
  B08: { pairId: 'B08', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 11.3, beautimeterRight: 9.5, beautimeterHigher: 'A' },
  B09: { pairId: 'B09', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 11.7, beautimeterRight: 7.8, beautimeterHigher: 'A' },
  B10: { pairId: 'B10', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 8.9, beautimeterRight: 7.7, beautimeterHigher: 'A' },
  B11: { pairId: 'B11', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 9.1, beautimeterRight: 8.2, beautimeterHigher: 'A' },
  B12: { pairId: 'B12', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 8.4, beautimeterRight: 7.6, beautimeterHigher: 'A' },
  B13: { pairId: 'B13', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 10.6, beautimeterRight: 8.8, beautimeterHigher: 'A' },
  B14: { pairId: 'B14', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 10.3, beautimeterRight: 7.9, beautimeterHigher: 'A' },
  B15: { pairId: 'B15', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 9.6, beautimeterRight: 8.3, beautimeterHigher: 'A' },
  B16: { pairId: 'B16', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 10.7, beautimeterRight: 8.9, beautimeterHigher: 'A' },
  B17: { pairId: 'B17', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 9.8, beautimeterRight: 8.4, beautimeterHigher: 'A' },
  B18: { pairId: 'B18', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 10.5, beautimeterRight: 9.2, beautimeterHigher: 'A' },
  B19: { pairId: 'B19', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 9.7, beautimeterRight: 8.9, beautimeterHigher: 'A' },
  B20: { pairId: 'B20', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 9.4, beautimeterRight: 8.6, beautimeterHigher: 'A' },
  B21: { pairId: 'B21', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 11.0, beautimeterRight: 8.5, beautimeterHigher: 'A' },
  B22: { pairId: 'B22', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 9.2, beautimeterRight: 8.0, beautimeterHigher: 'A' },
  B23: { pairId: 'B23', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 10.9, beautimeterRight: 9.3, beautimeterHigher: 'A' },
  B24: { pairId: 'B24', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 10.5, beautimeterRight: 9.7, beautimeterHigher: 'A' },
  B25: { pairId: 'B25', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 9.8, beautimeterRight: 8.4, beautimeterHigher: 'A' },
  B26: { pairId: 'B26', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 10.9, beautimeterRight: 8.7, beautimeterHigher: 'A' },
  B27: { pairId: 'B27', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 9.1, beautimeterRight: 11.3, beautimeterHigher: 'B' },
  B28: { pairId: 'B28', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 10.2, beautimeterRight: 9.4, beautimeterHigher: 'A' },
  B29: { pairId: 'B29', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 9.8, beautimeterRight: 10.7, beautimeterHigher: 'B' },
  B30: { pairId: 'B30', figure: 6, chapter: 8, alexanderHigher: 'A', beautimeterLeft: 8.7, beautimeterRight: 9.3, beautimeterHigher: 'B' },
};

function makePair(pairId: string): MostBookPair {
  const figure = pairId.startsWith('A') ? 5 : 6;
  const pairNumber = Number(pairId.slice(1));
  const revision = REVISED_MOST_BOOK_IMAGES.has(pairId) ? '?v=ppt-audit-2' : '';
  return {
    source: 'beautimeter-book',
    propertyId: figure,
    propertyEn: figure === 5 ? 'Nature of Order · Fig. 5 (Ch. 2)' : 'Nature of Order · Fig. 6 (Ch. 8)',
    propertyZh: figure === 5 ? '《秩序的本质》图 5（第 2 章）' : '《秩序的本质》图 6（第 8 章）',
    pairNumber,
    imageA: pairId === 'B05' ? `${PAIR_ROOT}/B05_source.png` : `${PAIR_ROOT}/${pairId}_A.png${revision}`,
    imageB: pairId === 'B05' ? '' : `${PAIR_ROOT}/${pairId}_B.png${revision}`,
    ...(pairId === 'B05' ? { sharedImageObjects: TOOL_OBJECTS } : {}),
    positivePromptSlot: 'A',
    articlePairId: pairId,
  };
}

export const ALL_MOST_BOOK_PAIRS: MostBookPair[] = [
  ...Array.from({ length: 16 }, (_, i) => makePair(`A${String(i + 1).padStart(2, '0')}`)),
  ...Array.from({ length: 30 }, (_, i) => makePair(`B${String(i + 1).padStart(2, '0')}`)),
];

export type MostBookSubset = 'random10' | 'fig5_16' | 'fig6_30' | 'all46';

export function getMostBookPairsBySubset(subset: MostBookSubset, seed: number): MostBookPair[] {
  if (subset === 'fig5_16') return ALL_MOST_BOOK_PAIRS.filter(p => p.articlePairId?.startsWith('A'));
  if (subset === 'fig6_30') return ALL_MOST_BOOK_PAIRS.filter(p => p.articlePairId?.startsWith('B'));
  if (subset === 'all46') return [...ALL_MOST_BOOK_PAIRS];
  return prepareMostBookSession(seed, 10);
}

export function prepareMostBookSession(seed: number, count = 10): MostBookPair[] {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const pairs = [...ALL_MOST_BOOK_PAIRS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.slice(0, Math.max(0, Math.min(pairs.length, Math.floor(count))));
}
