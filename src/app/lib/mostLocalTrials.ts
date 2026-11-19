import type { MostChoice } from './mostResponses';
import {
  ALL_MOST_BOOK_PAIRS,
  BEAUTIMETER_BOOK_REFERENCES,
  REVISED_MOST_BOOK_IMAGES,
  type MostWordingId,
} from '@/app/data/mostBookDataset';

const STORAGE_KEY = 'studio-most-local-ai-trials-v1';

export type MostLocalAiCondition = 'ls15' | 'sim1' | 'pred' | 'sim30';
export type MostLocalAiTrial = {
  kind: 'local_ai_trial';
  event_id: string;
  run_id: string;
  pair_id: string;
  figure: 5 | 6;
  source: 'beautimeter-book';
  image_a: string;
  image_b: string;
  image_order_swapped: boolean;
  condition: MostLocalAiCondition;
  wording_id?: MostWordingId;
  attempt_number: number | null;
  prompt_id: string;
  prompt_hash: string;
  ai_choice: MostChoice | null;
  predicted_a_count: number | null;
  predicted_b_count: number | null;
  predicted_tie_count: number | null;
  scores_a: number[] | null;
  scores_b: number[] | null;
  score_a_total: number | null;
  score_b_total: number | null;
  reply: string;
  provider: string | null;
  model: string | null;
  elapsed_ms: number | null;
  status: 'valid' | 'invalid' | 'failed';
  error_code: string | null;
  protocol: 'most-local-v3';
  completed_at: string;
};

export function readLocalMostAiTrials(): MostLocalAiTrial[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed as MostLocalAiTrial[] : [];
  } catch {
    return [];
  }
}

export function saveLocalMostAiTrial(trial: MostLocalAiTrial) {
  const trials = readLocalMostAiTrials();
  trials.push(trial);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
}

export function clearLocalMostAiTrials() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportLocalMostAiTrials() {
  const trials = readLocalMostAiTrials();
  const payload = {
    protocol: 'most-local-v3',
    exported_at: new Date().toISOString(),
    storage: 'browser-local-only',
    trial_count: trials.length,
    trials,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `most-ai-local-trials-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type PairMasterComparisonRow = {
  pairId: string;
  figure: 5 | 6;
  chapter: 2 | 8;
  imageA: string;
  imageB: string;
  inputMode: 'single_image' | 'two_images';
  alexanderHigher: 'A';
  beautimeterLeft: number;
  beautimeterRight: number;
  beautimeterHigher: 'A' | 'B';
  ls15ScoreA: number | null;
  ls15ScoreB: number | null;
  ls15Choice: MostChoice | null;
  sim1Choice: MostChoice | null;
  sim1Runs: number;
  sim1ACount: number;
  sim1BCount: number;
  sim1TieCount: number;
  predA: number | null;
  predB: number | null;
  predTie: number | null;
  predChoice: MostChoice | null;
  sim30Valid: number;
  sim30ACount: number;
  sim30BCount: number;
  sim30TieCount: number;
  sim30Choice: MostChoice | null;
};

function modeChoice(a: number, b: number, tie: number): MostChoice | null {
  if (a + b + tie === 0) return null;
  const max = Math.max(a, b, tie);
  const winners = [a === max ? 'A' : null, b === max ? 'B' : null, tie === max ? 'tie' : null].filter(Boolean);
  return winners.length === 1 ? (winners[0] as MostChoice) : 'tie';
}

export function buildPairMasterComparisonRows(
  trials: MostLocalAiTrial[],
  wordingFilter: MostWordingId | 'ALL' = 'ALL',
): PairMasterComparisonRow[] {
  return ALL_MOST_BOOK_PAIRS.map((pair) => {
    const pairId = pair.articlePairId || `${pair.propertyId}-${pair.pairNumber}`;
    const ref = BEAUTIMETER_BOOK_REFERENCES[pairId];
    const validTrials = trials.filter((t) => {
      if (t.pair_id !== pairId || t.status !== 'valid') return false;
      if ((pair.sharedImageObjects || REVISED_MOST_BOOK_IMAGES.has(pairId)) && (t.image_a !== pair.imageA || t.image_b !== pair.imageB)) return false;
      if (pair.sharedImageObjects && (!t.prompt_id?.endsWith('-single-image') || t.image_order_swapped)) return false;
      if (t.condition === 'ls15') return true;
      const w = t.wording_id || 'W1';
      return wordingFilter === 'ALL' || w === wordingFilter;
    });

    const ls15Trials = validTrials.filter((t) => t.condition === 'ls15');
    const latestLs15 = ls15Trials[ls15Trials.length - 1] ?? null;

    const sim1Trials = validTrials.filter((t) => t.condition === 'sim1');
    const sim1ACount = sim1Trials.filter((t) => t.ai_choice === 'A').length;
    const sim1BCount = sim1Trials.filter((t) => t.ai_choice === 'B').length;
    const sim1TieCount = sim1Trials.filter((t) => t.ai_choice === 'tie').length;
    const latestSim1 = sim1Trials[sim1Trials.length - 1] ?? null;
    const sim1Choice = sim1Trials.length > 1 ? modeChoice(sim1ACount, sim1BCount, sim1TieCount) : (latestSim1?.ai_choice ?? null);

    const predTrials = validTrials.filter((t) => t.condition === 'pred');
    const latestPred = predTrials[predTrials.length - 1] ?? null;

    const sim30Trials = validTrials.filter((t) => t.condition === 'sim30');
    const sim30ACount = sim30Trials.filter((t) => t.ai_choice === 'A').length;
    const sim30BCount = sim30Trials.filter((t) => t.ai_choice === 'B').length;
    const sim30TieCount = sim30Trials.filter((t) => t.ai_choice === 'tie').length;

    return {
      pairId,
      figure: ref.figure,
      chapter: ref.chapter,
      imageA: pair.imageA,
      imageB: pair.imageB,
      inputMode: pair.sharedImageObjects ? 'single_image' : 'two_images',
      alexanderHigher: ref.alexanderHigher,
      beautimeterLeft: ref.beautimeterLeft,
      beautimeterRight: ref.beautimeterRight,
      beautimeterHigher: ref.beautimeterHigher,
      ls15ScoreA: latestLs15?.score_a_total ?? null,
      ls15ScoreB: latestLs15?.score_b_total ?? null,
      ls15Choice: latestLs15?.ai_choice ?? null,
      sim1Choice,
      sim1Runs: sim1Trials.length,
      sim1ACount,
      sim1BCount,
      sim1TieCount,
      predA: latestPred?.predicted_a_count ?? null,
      predB: latestPred?.predicted_b_count ?? null,
      predTie: latestPred?.predicted_tie_count ?? null,
      predChoice: latestPred?.ai_choice ?? null,
      sim30Valid: sim30Trials.length,
      sim30ACount,
      sim30BCount,
      sim30TieCount,
      sim30Choice: modeChoice(sim30ACount, sim30BCount, sim30TieCount),
    };
  });
}

export function exportPairMasterComparisonCsv(
  trials: MostLocalAiTrial[],
  wordingFilter: MostWordingId | 'ALL' = 'ALL',
) {
  const rows = buildPairMasterComparisonRows(trials, wordingFilter);
  const headers = [
    'pair_id',
    'figure',
    'chapter',
    'input_status',
    'wording_filter',
    'alexander_higher',
    'published_beautimeter_left',
    'published_beautimeter_right',
    'published_beautimeter_higher',
    'ls15_score_a',
    'ls15_score_b',
    'ls15_choice',
    'sim1_choice',
    'sim1_runs',
    'sim1_a_count',
    'sim1_b_count',
    'sim1_tie_count',
    'pred_a_pct',
    'pred_b_pct',
    'pred_tie_pct',
    'pred_choice',
    'sim30_valid_calls',
    'sim30_a_count',
    'sim30_b_count',
    'sim30_tie_count',
    'sim30_modal_choice',
    'input_mode',
  ];
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.pairId,
        r.figure,
        r.chapter,
        'ready',
        wordingFilter,
        r.alexanderHigher,
        r.beautimeterLeft,
        r.beautimeterRight,
        r.beautimeterHigher,
        r.ls15ScoreA ?? '',
        r.ls15ScoreB ?? '',
        r.ls15Choice ?? '',
        r.sim1Choice ?? '',
        r.sim1Runs,
        r.sim1ACount,
        r.sim1BCount,
        r.sim1TieCount,
        r.predA ?? '',
        r.predB ?? '',
        r.predTie ?? '',
        r.predChoice ?? '',
        r.sim30Valid,
        r.sim30ACount,
        r.sim30BCount,
        r.sim30TieCount,
        r.sim30Choice ?? '',
        r.inputMode,
      ].join(','),
    ),
  ];
  const csvContent = '\uFEFF' + lines.join('\n');
  const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `most-46pairs-comparison-${wordingFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
