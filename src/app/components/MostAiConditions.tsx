import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { AiRequestError, callUserAI, getAiSettings, type AiImagePayload } from '@/app/lib/aiClient';
import type { MostChoice } from '@/app/lib/mostResponses';
import { MOST_WORDINGS, type MostBookPair, type MostWordingId } from '@/app/data/mostBookDataset';
import { properties as livingProperties } from '@/app/data/properties';
import { useLanguage } from '@/app/i18n/LanguageContext';
import type { MostLocalAiCondition, MostLocalAiTrial } from '@/app/lib/mostLocalTrials';
import { mapMostAiReplyToSourceOrder, parseMostAiReply } from '@/app/lib/mostAiProtocol';

export type ConditionResult = {
  condition: MostLocalAiCondition;
  wordingId: MostWordingId;
  choice: MostChoice | null;
  predictedA: number | null;
  predictedB: number | null;
  predictedTie: number | null;
  scoresA: number[] | null;
  scoresB: number[] | null;
  scoreA: number | null;
  scoreB: number | null;
  attempted: number;
  valid: number;
  aCount: number;
  bCount: number;
  tieCount: number;
};

const SIM30_ATTEMPTS = 30;
const labels = {
  ls15: { en: 'Method 1 · LS15 (15-property score)', zh: '方法 1 · LS15（15 项活力结构评分）' },
  sim1: { en: 'Method 2 · Simulated individual (Pretending)', zh: '方法 2 · 模拟单一个人选择（Pretending）' },
  pred: { en: 'Method 3 · Average human forecast (Predicting)', zh: '方法 3 · 预测平均人/整个人类分布（Predicting）' },
  sim30: { en: 'Method 2b · 30 repeated individual runs', zh: '方法 2b · 30 次独立模拟个人聚合' },
} as const;

async function toPayload(url: string): Promise<AiImagePayload> {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error('MOST_AI_IMAGE_LOAD');
  const mimeType = response.headers.get('content-type')?.split(';')[0] || 'image/png';
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { mimeType, base64Data: btoa(binary) };
}

async function hashPrompt(prompt: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(prompt));
  return `sha256:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

export function getWordingQuestion(wordingId: MostWordingId): string {
  return MOST_WORDINGS.find(w => w.id === wordingId)?.questionEn ?? MOST_WORDINGS[0].questionEn;
}

export function promptFor(condition: MostLocalAiCondition, language: 'en' | 'zh', wordingId: MostWordingId = 'W1', objects?: readonly [string, string]) {
  const lang = language === 'zh' ? 'Simplified Chinese' : 'English';
  const questionText = getWordingQuestion(wordingId);
  const target = objects ? 'object' : 'image';
  const role = condition === 'ls15'
    ? `Score each ${target} separately using the 15 properties of living structure. Do not make a personal or population preference judgment.`
    : condition === 'pred'
      ? `Predict the distribution of responses from 100 ordinary people answering (${wordingId}): "${questionText}" This is a population forecast (predicting the average human / whole humanity distribution), not your own preference.`
      : `Simulate one ordinary human participant answering (${wordingId}): "${questionText}" Give one spontaneous individual response (pretending to be a single participant).`;
  const output = condition === 'pred'
    ? '{"predicted_a_count": integer, "predicted_b_count": integer, "predicted_tie_count": integer} (counts must sum to 100)'
    : condition === 'ls15'
      ? '{"scores_a": [15 numbers from 0 to 1], "scores_b": [15 numbers from 0 to 1]}'
      : '{"choice": "A" | "B" | "tie", "rationale": "one short sentence"}';
  const propertyDefinitions = livingProperties.map(property => `${property.n}. ${language === 'zh' ? property.tZh : property.tEn}: ${language === 'zh' ? property.quoteZh : property.quoteEn}`).join('\n');
  const input = objects
    ? `Compare the two objects in the single supplied book-example image: A is ${objects[0]}; B is ${objects[1]}.`
    : 'Image A and Image B are the supplied book-example images.';
  return `You are running a controlled Mirror of the Self Test comparison. ${role}\n${input} Do not use any human participant's choice. Do not claim subjective experience, measured calibration, or certainty. ${condition === 'ls15' ? `For each ${target}, score each property from 0 (not evident) to 1 (clearly evident), based only on visible evidence. The 15 equally weighted properties are:\n${propertyDefinitions}\nThe application sums the 15 scores and derives the choice.` : ''} Respond only as JSON in ${lang}: ${output}`;
}

function promptIdFor(condition: MostLocalAiCondition, wordingId: MostWordingId): string {
  return condition === 'ls15' ? 'LS15-v1' : condition === 'sim1' ? `SIM1-${wordingId}-v1` : condition === 'pred' ? `PRED-${wordingId}-v1` : `SIM30-${wordingId}-v1`;
}

function modeOf(counts: { a: number; b: number; tie: number }): MostChoice | null {
  const max = Math.max(counts.a, counts.b, counts.tie);
  const winners = [counts.a === max ? 'A' : null, counts.b === max ? 'B' : null, counts.tie === max ? 'tie' : null].filter(Boolean);
  return winners.length === 1 ? winners[0] as MostChoice : null;
}

export async function runMostAiPair(
  pair: MostBookPair,
  language: 'en' | 'zh',
  runId: string,
  onSave: (trial: MostLocalAiTrial) => Promise<void> | void,
  onResult?: (result: ConditionResult) => void,
  options?: {
    wordingId?: MostWordingId;
    includeSim30?: boolean;
  },
): Promise<ConditionResult[]> {
  const wordingId = options?.wordingId ?? 'W1';
  const includeSim30 = options?.includeSim30 ?? true;
  const settings = getAiSettings();
  const { provider, model } = settings;
  const objects = pair.sharedImageObjects?.en;
  const sourceImages = await Promise.all((objects ? [pair.imageA] : [pair.imageA, pair.imageB]).map(toPayload));
  const next: ConditionResult[] = [];
  const order: MostLocalAiCondition[] = includeSim30
    ? ['ls15', 'sim1', 'pred', 'sim30']
    : ['ls15', 'sim1', 'pred'];

  for (const condition of order) {
    const prompt = promptFor(condition, language, wordingId, objects);
    const promptHash = await hashPrompt(prompt);
    const attempts = condition === 'sim30' ? SIM30_ATTEMPTS : 1;
    const totals = { a: 0, b: 0, tie: 0, valid: 0 };
    let latest: ConditionResult = { condition, wordingId, choice: null, predictedA: null, predictedB: null, predictedTie: null, scoresA: null, scoresB: null, scoreA: null, scoreB: null, attempted: 0, valid: 0, aCount: 0, bCount: 0, tieCount: 0 };

    for (let attempt = 1; attempt <= attempts; attempt++) {
      const imageOrderSwapped = !objects && Math.random() < 0.5;
      const images = imageOrderSwapped ? [sourceImages[1], sourceImages[0]] : sourceImages;
      const started = performance.now();
      let parsed = parseMostAiReply('', condition);
      let reply = '';
      let fatalError: AiRequestError | null = null;
      let status: MostLocalAiTrial['status'] = 'failed';
      let errorCode: string | null = 'AI_REQUEST_FAILED';

      try {
        const response = await callUserAI(settings, { prompt, images });
        reply = response.reply || '';
        parsed = mapMostAiReplyToSourceOrder(parseMostAiReply(reply, condition), imageOrderSwapped);
        status = parsed.valid ? 'valid' : 'invalid';
        errorCode = parsed.valid ? null : 'INVALID_MODEL_OUTPUT';
      } catch (error) {
        fatalError = error instanceof AiRequestError ? error : new AiRequestError('NETWORK', '模型请求失败，请检查网络或服务地址。');
        errorCode = fatalError.code;
      }

      const elapsed = Math.round(performance.now() - started);
      await onSave({
        kind: 'local_ai_trial', event_id: crypto.randomUUID(), run_id: runId,
        pair_id: pair.articlePairId || `${pair.propertyId}-${pair.pairNumber}`,
        figure: pair.propertyId === 5 ? 5 : 6, source: 'beautimeter-book',
        image_a: pair.imageA, image_b: pair.imageB, image_order_swapped: imageOrderSwapped,
        condition, wording_id: wordingId, attempt_number: condition === 'sim30' ? attempt : null,
        prompt_id: `${promptIdFor(condition, wordingId)}${objects ? '-single-image' : ''}`, prompt_hash: promptHash,
        ai_choice: parsed.choice, predicted_a_count: parsed.predictedA, predicted_b_count: parsed.predictedB, predicted_tie_count: parsed.predictedTie,
        scores_a: parsed.scoresA, scores_b: parsed.scoresB, score_a_total: parsed.scoreA, score_b_total: parsed.scoreB,
        reply, provider, model, elapsed_ms: elapsed, status, error_code: errorCode,
        protocol: 'most-local-v3', completed_at: new Date().toISOString(),
      });
      if (fatalError) throw fatalError;

      if (status === 'valid') {
        totals.valid++;
        if (condition === 'sim30' && parsed.choice === 'A') totals.a++;
        if (condition === 'sim30' && parsed.choice === 'B') totals.b++;
        if (condition === 'sim30' && parsed.choice === 'tie') totals.tie++;
      }

      latest = condition === 'sim30'
        ? { condition, wordingId, choice: modeOf(totals), predictedA: null, predictedB: null, predictedTie: null, scoresA: null, scoresB: null, scoreA: null, scoreB: null, attempted: attempt, valid: totals.valid, aCount: totals.a, bCount: totals.b, tieCount: totals.tie }
        : { condition, wordingId, choice: parsed.choice, predictedA: parsed.predictedA, predictedB: parsed.predictedB, predictedTie: parsed.predictedTie, scoresA: parsed.scoresA, scoresB: parsed.scoresB, scoreA: parsed.scoreA, scoreB: parsed.scoreB, attempted: 1, valid: Number(status === 'valid'), aCount: 0, bCount: 0, tieCount: 0 };
      onResult?.(latest);
    }
    next.push(latest);
  }
  return next;
}

export function MostAiConditions({ pair, onSave, wordingId = 'W1' }: { pair: MostBookPair; onSave: (trial: MostLocalAiTrial) => Promise<void> | void; wordingId?: MostWordingId }) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ConditionResult[]>([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const run = async (includeSim30: boolean) => {
    if (running) return;
    setRunning(true); setError(''); setResults([]); setProgress(0);
    try {
      const next = await runMostAiPair(pair, language === 'zh' ? 'zh' : 'en', crypto.randomUUID(), onSave, result => {
        setProgress(current => current + 1);
        setResults(current => [...current.filter(item => item.condition !== result.condition), result]);
      }, { wordingId, includeSim30 });
      setResults(next);
    } catch {
      setError(en ? 'The AI run stopped. Completed trials remain saved locally.' : 'AI 运行中断；已完成的试次仍保存在本地。');
    } finally { setRunning(false); }
  };

  return <section className="space-y-3 rounded-xl border border-border bg-white p-4" aria-labelledby="most-ai-conditions-title">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h4 id="most-ai-conditions-title" className="text-sm font-semibold">{en ? `Four AI procedures (${wordingId})` : `四种 AI 程序（当前问法 ${wordingId}）`}</h4><p className="mt-1 text-xs text-muted-foreground">{en ? 'LS15, one simulated-participant response, a forecast for 100 people, and optional 30 independent SIM1 calls.' : 'LS15 评分、模拟单一个人回答（Pretending）、预测 100 名平均人分布（Predicting），以及可选 30 次独立模拟。'}</p></div>
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={running} onClick={() => void run(false)} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 text-xs font-semibold text-primary disabled:opacity-50">{running ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{en ? 'Quick 3 methods (3 calls)' : '快速测 3 种核心方法（3 次调用）'}</button>
      <button type="button" disabled={running} onClick={() => void run(true)} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">{running ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{running ? (en ? `Running ${progress} calls…` : `正在运行 ${progress} 次…`) : (en ? 'Full 4 procedures (33 calls)' : '完整跑含 30 次重复（33 次调用）')}</button>
    </div></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {results.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{results.map(result => <div key={result.condition} className="rounded-lg border border-border bg-stone-50 p-3"><p className="text-xs font-semibold">{labels[result.condition][en ? 'en' : 'zh']}</p><p className="mt-2 text-sm font-bold">{result.condition === 'ls15' && result.scoreA !== null && result.scoreB !== null ? `A ${result.scoreA.toFixed(2)}/15 · B ${result.scoreB.toFixed(2)}/15 (${result.choice ?? '—'})` : result.condition === 'pred' && result.predictedA !== null && result.predictedB !== null && result.predictedTie !== null ? `A ${result.predictedA}% · B ${result.predictedB}% · ${en ? 'Tie' : '接近'} ${result.predictedTie}%` : result.condition === 'sim30' ? `A ${result.aCount} · B ${result.bCount} · ${en ? 'Tie' : '接近'} ${result.tieCount} (${result.valid}/${result.attempted} ${en ? 'valid' : '有效'})` : result.choice === 'tie' ? (en ? 'Similar / hard to tell' : '接近／难区分') : result.choice ? (en ? `Choice ${result.choice}` : `选择 ${result.choice}`) : '—'}</p></div>)}</div>}
  </section>;
}
