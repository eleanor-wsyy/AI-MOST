import { useState } from 'react';
import { Download, Loader2, Play, RefreshCcw, Sparkles } from 'lucide-react';
import type { MostBookPair } from '@/app/data/mostBookDataset';
import { BEAUTIMETER_BOOK_REFERENCES, MOST_WORDINGS, type MostWordingId } from '@/app/data/mostBookDataset';
import type { MostLocalAiTrial } from '@/app/lib/mostLocalTrials';
import { useLanguage } from '@/app/i18n/LanguageContext';
import { runMostAiPair, type ConditionResult } from './MostAiConditions';
import { exportLocalMostAiTrials, readLocalMostAiTrials } from '@/app/lib/mostLocalTrials';
import { AiRequestError } from '@/app/lib/aiClient';

const roleLabels = {
  ls15: { en: 'M1 · LS15 score', zh: '方法1 · LS15 活力结构分' },
  sim1: { en: 'M2 · Single individual (Pretending)', zh: '方法2 · 单一个人模拟 (Pretending)' },
  pred: { en: 'M3 · Average human % (Predicting)', zh: '方法3 · 平均人/100人预测 (Predicting)' },
  sim30: { en: 'M2b · 30 repeated SIM1', zh: '方法2b · 30次独立单人聚合' },
} as const;

function outputLabel(result: ConditionResult, en: boolean) {
  if (result.condition === 'pred') return result.predictedA === null || result.predictedB === null || result.predictedTie === null ? '—' : `A ${result.predictedA}% · B ${result.predictedB}% · ${en ? 'Tie' : '接近'} ${result.predictedTie}% (${result.choice ?? '—'})`;
  if (result.condition === 'ls15') return result.scoreA === null || result.scoreB === null ? '—' : `A ${result.scoreA.toFixed(2)}/15 · B ${result.scoreB.toFixed(2)}/15 (${result.choice ?? '—'})`;
  if (result.condition === 'sim30') return `A ${result.aCount} · B ${result.bCount} · ${en ? 'Tie' : '接近'} ${result.tieCount} (${result.valid}/${result.attempted})`;
  if (result.choice === 'tie') return en ? 'Similar / hard to tell' : '接近／难区分';
  if (!result.choice) return '—';
  return `${en ? 'Choice' : '选择'} ${result.choice}`;
}

export function MostAiRound({
  pairs,
  wordingId,
  includeSim30,
  onSave,
  onDrawAgain,
  onTrialsUpdated,
}: {
  pairs: MostBookPair[];
  wordingId: MostWordingId;
  includeSim30: boolean;
  onSave: (trial: MostLocalAiTrial) => Promise<void> | void;
  onDrawAgain: () => void;
  onTrialsUpdated?: () => void;
}) {

  const { language } = useLanguage();
  const en = language === 'en';
  const callsPerPair = includeSim30 ? 33 : 3;
  const activeWording = MOST_WORDINGS.find(w => w.id === wordingId) ?? MOST_WORDINGS[0];
  const [running, setRunning] = useState(false);
  const [runningPairId, setRunningPairId] = useState<string | null>(null);
  const [completedPairs, setCompletedPairs] = useState(0);
  const [completedCalls, setCompletedCalls] = useState(0);
  const [results, setResults] = useState<Record<string, ConditionResult[]>>({});
  const [error, setError] = useState('');
  const [savedCount, setSavedCount] = useState(() => readLocalMostAiTrials().length);

  const handleSave = async (trial: MostLocalAiTrial) => {
    await onSave(trial);
    setSavedCount(readLocalMostAiTrials().length);
    onTrialsUpdated?.();
  };

  const runSinglePair = async (pair: MostBookPair, key: string) => {
    if (running || runningPairId) return;
    setRunningPairId(key);
    setError('');
    try {
      await runMostAiPair(
        pair,
        language === 'zh' ? 'zh' : 'en',
        crypto.randomUUID(),
        handleSave,
        result => {
          setResults(current => ({
            ...current,
            [key]: [...(current[key] ?? []).filter(item => item.condition !== result.condition), result],
          }));
        },
        { wordingId, includeSim30 },
      );
    } catch (cause) {
      setError(cause instanceof AiRequestError ? cause.message : `图对 ${pair.articlePairId} 运行中断；已完成的调用已保存。`);
    } finally {
      setRunningPairId(null);
      setSavedCount(readLocalMostAiTrials().length);
      onTrialsUpdated?.();
    }
  };

  const run = async () => {
    if (running || runningPairId) return;
    setRunning(true); setCompletedPairs(0); setCompletedCalls(0); setResults({}); setError('');
    let finished = 0;
    const runId = crypto.randomUUID();
    try {
      for (let index = 0; index < pairs.length; index++) {
        const pair = pairs[index];
        const key = `${pair.articlePairId || `${pair.propertyId}-${pair.pairNumber}`}-${index}`;
        await runMostAiPair(
          pair,
          language === 'zh' ? 'zh' : 'en',
          runId,
          handleSave,
          result => {
            setCompletedCalls(current => current + 1);
            setResults(current => ({ ...current, [key]: [...(current[key] ?? []).filter(item => item.condition !== result.condition), result] }));
          },
          { wordingId, includeSim30 },
        );
        finished = index + 1;
        setCompletedPairs(finished);
      }
    } catch (cause) {
      setError(cause instanceof AiRequestError ? cause.message : `运行中断：已完成 ${finished} 对。已完成的试次已保存。`);
    } finally {
      setSavedCount(readLocalMostAiTrials().length);
      onTrialsUpdated?.();
      setRunning(false);
    }
  };

  return <section className="space-y-5 rounded-2xl border border-border bg-white/80 p-4 sm:p-6" aria-labelledby="most-ai-round-title">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{wordingId}</span>
          <h3 id="most-ai-round-title" className="font-serif text-xl font-semibold">
            {en ? `Active Batch · ${pairs.length} Book Pairs` : `当前实验批次 · ${pairs.length} 对《秩序的本质》原图`}
          </h3>
        </div>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {en
            ? `Active question (${wordingId}): "${activeWording.questionEn}"`
            : `当前提问措辞（${wordingId}）：「${activeWording.questionZh}」（英文原句：${activeWording.questionEn}）`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {includeSim30
            ? (en ? `Full mode: LS15 + SIM1 (single person) + PRED (100 people) + SIM30 (30 repeated calls) = 33 calls/pair (${pairs.length * 33} total).` : `完整模式：每对图执行 LS15 + SIM1（单人模拟）+ PRED（100名平均人预测）+ SIM30（30次独立单人调用）= 每对 33 次（共 ${pairs.length * 33} 次）。`)
            : (en ? `Core 3-method mode: LS15 + SIM1 (single person) + PRED (100 people) = 3 calls/pair (${pairs.length * 3} total).` : `快速核心对比模式：每对图执行 LS15 + SIM1（单人模拟）+ PRED（100名平均人预测）= 每对 3 次调用（共 ${pairs.length * 3} 次）。你也可以点击任意单对卡片上的「单对测试」立即查看结果。`)}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button type="button" onClick={exportLocalMostAiTrials} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-semibold hover:border-primary">
          <Download size={15} />{en ? `Export Raw JSON (${savedCount})` : `导出原始调用记录 JSON（${savedCount}）`}
        </button>
        <button type="button" disabled={running || Boolean(runningPairId)} onClick={onDrawAgain} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-semibold hover:border-primary disabled:opacity-50">
          <RefreshCcw size={15} />{en ? 'Reshuffle Batch' : '重新随机抽样'}
        </button>
        <button type="button" disabled={running || Boolean(runningPairId)} onClick={() => void run()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {running ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {running
            ? (en ? `Running ${completedCalls}/${pairs.length * callsPerPair} calls · ${completedPairs}/${pairs.length} pairs` : `正在运行 ${completedCalls}/${pairs.length * callsPerPair} 次 · ${completedPairs}/${pairs.length} 对`)
            : (en ? `Run All ${pairs.length} Pairs (${pairs.length * callsPerPair} calls)` : `批量运行当前 ${pairs.length} 对（共 ${pairs.length * callsPerPair} 次调用）`)}
        </button>
      </div>
    </div>
    {running && <div role="progressbar" aria-label={en ? 'AI round progress' : 'AI 轮次进度'} aria-valuemin={0} aria-valuemax={pairs.length * callsPerPair} aria-valuenow={completedCalls} className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${completedCalls / (pairs.length * callsPerPair) * 100}%` }} /></div>}
    {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    <div className="grid gap-3 md:grid-cols-2">{pairs.map((pair, index) => {
      const pairId = pair.articlePairId || `${pair.propertyId}-${pair.pairNumber}`;
      const key = `${pairId}-${index}`;
      const pairResults = results[key] ?? [];
      const ref = BEAUTIMETER_BOOK_REFERENCES[pairId];
      const objects = pair.sharedImageObjects?.[en ? 'en' : 'zh'];
      const expectedConditions = includeSim30 ? 4 : 3;
      const isThisPairRunning = runningPairId === key || (running && index === completedPairs);
      return <article key={key} className="rounded-xl border border-border bg-white p-3.5 shadow-xs">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold">
              {index + 1}. {pairId} · {en ? pair.propertyEn : pair.propertyZh}
            </h4>
            {ref && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {en
                  ? `Alexander benchmark: A · Published Beautimeter: A=${ref.beautimeterLeft} vs B=${ref.beautimeterRight} (${ref.beautimeterHigher})`
                  : `Alexander 书中基准：A 更高 · 已发表美度计参考分：A=${ref.beautimeterLeft} vs B=${ref.beautimeterRight}（胜出：${ref.beautimeterHigher}）`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={running || Boolean(runningPairId)}
              onClick={() => void runSinglePair(pair, key)}
              className="inline-flex min-h-8 items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              {isThisPairRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
              {isThisPairRunning ? (en ? 'Testing…' : '测试中…') : (en ? `Test Pair (${callsPerPair})` : `单对测试 (${callsPerPair}次)`)}
            </button>
            <span className="text-xs text-muted-foreground">
              {pairResults.length >= expectedConditions
                ? (en ? 'Complete' : '已完成')
                : isThisPairRunning
                  ? (en ? `Running ${pairResults.length}/${expectedConditions}` : `运行中 ${pairResults.length}/${expectedConditions}`)
                  : pairResults.length
                    ? (en ? `Partial ${pairResults.length}/${expectedConditions}` : `已完成 ${pairResults.length}/${expectedConditions}`)
                    : (en ? 'Ready' : '就绪')}
            </span>
          </div>
        </div>
        {objects ? <figure>
          <div className="aspect-[822/528] overflow-hidden rounded-lg border border-border bg-stone-50">
            <img src={pair.imageA} alt={`${pairId}: A · ${objects[0]}; B · ${objects[1]}`} loading="lazy" className="h-full w-full object-contain" />
          </div>
          <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
            <span>A · {objects[0]}</span><span>B · {objects[1]}</span>
          </figcaption>
        </figure> : <div className="grid grid-cols-2 gap-2.5">{[pair.imageA, pair.imageB].map((src, side) => <div key={src}><div className="aspect-square overflow-hidden rounded-lg border border-border bg-stone-50"><img src={src} alt={`${pairId} ${side ? 'B' : 'A'}`} loading="lazy" className="h-full w-full object-contain" /></div><p className="mt-1 text-xs font-semibold">{en ? 'Image' : '图像'} {side ? 'B (Right)' : 'A (Left · Alexander Higher)'}</p></div>)}</div>}
        {pairResults.length > 0 && <div className="mt-3 space-y-1.5 border-t border-border pt-3">{pairResults.map(result => <div key={result.condition} className="flex items-baseline justify-between gap-2 text-xs"><span className="text-muted-foreground">{roleLabels[result.condition][en ? 'en' : 'zh']}</span><strong>{outputLabel(result, en)}</strong></div>)}</div>}
      </article>;
    })}</div>
    <p className="text-xs text-muted-foreground">{en ? 'AI outputs are saved only in this browser and immediately sync into the 46-pair comparison table below.' : 'AI 结果只保存在当前浏览器，不会发送到公开数据库，并会自动汇总到下方的「46 对书中案例总对比表」中。'}</p>
  </section>;
}
