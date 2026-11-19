import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Download, FileSpreadsheet, Layers, Sparkles, Trash2 } from 'lucide-react';
import { MostAiRound } from '@/app/components/MostAiRound';
import {
  ALL_MOST_BOOK_PAIRS,
  getMostBookPairsBySubset,
  MOST_WORDINGS,
  type MostBookSubset,
  type MostWordingId,
} from '@/app/data/mostBookDataset';
import {
  buildPairMasterComparisonRows,
  clearLocalMostAiTrials,
  exportLocalMostAiTrials,
  exportPairMasterComparisonCsv,
  readLocalMostAiTrials,
  saveLocalMostAiTrial,
  type MostLocalAiTrial,
} from '@/app/lib/mostLocalTrials';

export function MostAiWorkbench() {
  const [seed, setSeed] = useState(() => crypto.getRandomValues(new Uint32Array(1))[0]);
  const [subset, setSubset] = useState<MostBookSubset>('random10');
  const [wordingId, setWordingId] = useState<MostWordingId>('W1');
  const [includeSim30, setIncludeSim30] = useState(false);
  const [tableWordingFilter, setTableWordingFilter] = useState<MostWordingId | 'ALL'>('W1');
  const [modelFilter, setModelFilter] = useState('');
  const [trials, setTrials] = useState<MostLocalAiTrial[]>(() => readLocalMostAiTrials());

  const refreshTrials = () => setTrials(readLocalMostAiTrials());

  useEffect(() => {
    refreshTrials();
  }, []);

  const pairs = useMemo(() => getMostBookPairsBySubset(subset, seed), [subset, seed]);
  const modelLabel = (trial: MostLocalAiTrial) => `${trial.provider ?? 'unknown'} / ${trial.model ?? 'unknown'}`;
  const models = [...new Set(trials.map(modelLabel))];
  const selectedModel = models.includes(modelFilter) ? modelFilter : (models.at(-1) ?? '');
  const modelTrials = useMemo(() => trials.filter(trial => modelLabel(trial) === selectedModel), [trials, selectedModel]);
  const masterRows = useMemo(() => buildPairMasterComparisonRows(modelTrials, tableWordingFilter), [modelTrials, tableWordingFilter]);

  const stats = useMemo(() => {
    const countAgree = (getter: (r: typeof masterRows[number]) => string | null) => {
      const evaluated = masterRows.filter(r => getter(r) !== null);
      const matchedA = evaluated.filter(r => getter(r) === r.alexanderHigher).length;
      const matchedBeautimeter = evaluated.filter(r => getter(r) === r.beautimeterHigher).length;
      return {
        evaluated: evaluated.length,
        matchedA,
        pctA: evaluated.length ? Math.round((matchedA / evaluated.length) * 100) : null,
        matchedBeautimeter,
        pctBeautimeter: evaluated.length ? Math.round((matchedBeautimeter / evaluated.length) * 100) : null,
      };
    };
    return {
      ls15: countAgree(r => r.ls15Choice),
      sim1: countAgree(r => r.sim1Choice),
      pred: countAgree(r => r.predChoice),
      sim30: countAgree(r => r.sim30Choice),
    };
  }, [masterRows]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-primary">AI-ASSISTED MOST WORKBENCH · PROF. BIN JIANG PROTOCOL</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">AI 模拟 MOST 情感判断实验工作台（46 对书中案例）</h1>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
            使用《The Nature of Order》/ Beautimeter 论文中的 46 对图，比较活力结构评分、单人模拟和群体选择预测。保留 Alexander 原判与已发表的 Beautimeter 分数作为参考。
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="shrink-0" />
          <span>研究工作台 · 试次保存在当前浏览器</span>
        </div>
        <span className="rounded-full bg-amber-200/70 px-2.5 py-0.5 font-semibold">已存本地调用：{trials.length} 条</span>
      </div>

      {/* Section 1: Four Methods & Two AI Roles Overview */}
      <section className="rounded-2xl border border-border bg-white/85 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            <h2 className="font-serif text-lg font-semibold">一、教授要求的「四种评估方法 × 两种 AI 角色」实验设计框架</h2>
          </div>
          <span className="text-xs text-muted-foreground">对应会议纪要 + 教授 GPT Pretending vs. Predicting 笔记 + Beautimeter 论文</span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-stone-50/80 p-3.5">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-stone-200 px-2 py-0.5 text-xs font-bold">方法 1 · LS15</span>
              <span className="text-xs text-muted-foreground">理性结构属性 (CQ)</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold">基于活力结构 15 属性评分</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              让 AI 对左右两图分别按 15 个活力结构属性打分（0–1 分/项，总分 0–15），再比较总分高低。对应原 Beautimeter 论文的方法。
            </p>
            {stats.ls15.evaluated > 0 && (
              <p className="mt-2 text-xs font-semibold text-primary">
                已测 {stats.ls15.evaluated}/46 对 · 与书中方向一致率：{stats.ls15.pctA}%
              </p>
            )}
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">方法 2 · SIM1 / SIM30</span>
              <span className="text-xs font-semibold text-primary">角色 A：单一个人 (Pretending)</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold">模拟单个参与者情感选择</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              第一人称视角（First-person simulation）：让 AI 扮演 1 名普通人类受试者直接做 MOST 直觉判断（单次 SIM1，或重复 30 次独立模拟 SIM30 聚合）。
            </p>
            {(stats.sim1.evaluated > 0 || stats.sim30.evaluated > 0) && (
              <p className="mt-2 text-xs font-semibold text-primary">
                SIM1 已测 {stats.sim1.evaluated}/46 ({stats.sim1.pctA ?? '—'}%) · SIM30 已测 {stats.sim30.evaluated}/46 ({stats.sim30.pctA ?? '—'}%)
              </p>
            )}
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">方法 3 · PRED</span>
              <span className="text-xs font-semibold text-primary">角色 B：平均人/整个人类 (Predicting)</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold">模拟平均人 / 预测群体比例</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              第三人称视角（Third-person forecasting）：让 AI 作为观察者预测 100 名普通人类受试者在 MOST 中选 A、选 B、难区分的百分比分布。
            </p>
            {stats.pred.evaluated > 0 && (
              <p className="mt-2 text-xs font-semibold text-primary">
                已测 {stats.pred.evaluated}/46 对 · 与书中方向一致率：{stats.pred.pctA}%
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-stone-50/80 p-3.5">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-stone-200 px-2 py-0.5 text-xs font-bold">方法 4 · HUMAN</span>
              <span className="text-xs text-muted-foreground">人类经验基准 (PQ)</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold">传统 Subject Agreement 方法</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              真实人类受试者问卷调查的一致性比例与众数选择（参考 2015 论文 392 份问卷的方法、Alexander 书中基准，以及后续收集的真实学生数据）。
            </p>
            <p className="mt-2 text-xs font-semibold text-stone-700">
              书中基准：全部 46 对左图 (A) 生命度更高 · 原文 Beautimeter 一致率 41/46 (89.1%)
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Six MOST Wordings Table (Appendix B) */}
      <section className="rounded-2xl border border-border bg-white/85 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h2 className="font-serif text-lg font-semibold">二、MOST 六种经典提问措辞对比表（源自 2015 论文 Appendix B p. 53 & Alexander 2002）</h2>
          </div>
          <span className="text-xs text-muted-foreground">点击任意一行即可切换下方实验所使用的提问措辞（W1–W6）</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/90 text-stone-700">
              <tr>
                <th className="px-3 py-2.5 font-semibold">编号</th>
                <th className="px-3 py-2.5 font-semibold">维度定位</th>
                <th className="px-3 py-2.5 font-semibold">Appendix B 英文原句（Alexander 2002）</th>
                <th className="px-3 py-2.5 font-semibold">中文对照</th>
                <th className="px-3 py-2.5 font-semibold">角色 A：单人模拟 (SIM1)</th>
                <th className="px-3 py-2.5 font-semibold">角色 B：平均人预测 (PRED)</th>
                <th className="px-3 py-2.5 font-semibold">当前状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {MOST_WORDINGS.map((w) => {
                const active = wordingId === w.id;
                return (
                  <tr
                    key={w.id}
                    onClick={() => setWordingId(w.id)}
                    className={`cursor-pointer transition-colors ${active ? 'bg-primary/8' : 'hover:bg-stone-50'}`}
                  >
                    <td className="px-3 py-2.5 font-bold text-primary">{w.id}</td>
                    <td className="px-3 py-2.5 font-medium">{w.focusZh}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] leading-relaxed text-stone-800">{w.questionEn}</td>
                    <td className="px-3 py-2.5 leading-relaxed text-stone-700">{w.questionZh}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{w.roleSinglePromptSummaryZh}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{w.rolePredPromptSummaryZh}</td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWordingId(w.id);
                        }}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-primary text-white' : 'border border-border bg-stone-50 text-stone-700 hover:border-primary'}`}
                      >
                        {active ? '当前选中' : '选用此问法'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Experiment Controls & Active Batch Runner */}
      <section className="rounded-2xl border border-border bg-white/85 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-700">样本范围选择：</span>
            {([
              { id: 'random10', label: '随机 10 对快速批次' },
              { id: 'fig5_16', label: 'Figure 5 全部（A01–A16，16 对）' },
              { id: 'fig6_30', label: 'Figure 6 全部（B01–B30，30 对）' },
              { id: 'all46', label: '全部 46 对完整样本（A01–B30）' },
            ] as const).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSubset(item.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${subset === item.id ? 'bg-primary text-white' : 'border border-border bg-stone-50 text-stone-700 hover:border-primary'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-stone-50 px-3.5 py-1.5 text-xs font-medium">
            <input
              type="checkbox"
              checked={includeSim30}
              onChange={(e) => setIncludeSim30(e.target.checked)}
              className="rounded border-stone-300 text-primary focus:ring-primary"
            />
            <span>包含 SIM30（每对额外跑 30 次独立单人模拟，关闭则只跑 LS15 + SIM1 + PRED 3 次快速对比）</span>
          </label>
        </div>
      </section>

      <MostAiRound pairs={pairs} wordingId={wordingId} includeSim30={includeSim30}
        onSave={saveLocalMostAiTrial} onTrialsUpdated={refreshTrials}
        onDrawAgain={() => setSeed(crypto.getRandomValues(new Uint32Array(1))[0])} />

      {/* Section 4: Master 46-Pair Comparison Table */}
      <section className="rounded-2xl border border-border bg-white/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-primary" />
              <h2 className="font-serif text-lg font-semibold">三、46 对《The Nature of Order》样本四方法对照总表（可直接导出给教授讨论）</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              汇总全部 {ALL_MOST_BOOK_PAIRS.length} 对书中案例的 Alexander 原始方向（左图 A 更高）、已发表 Beautimeter 15 属性得分，以及当前实验的 LS15、模拟单人（SIM1/SIM30）、预测平均人（PRED）结果。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="按模型筛选表格" value={selectedModel} onChange={event => setModelFilter(event.target.value)}
              className="min-h-9 rounded-full border border-border bg-white px-3 text-xs font-semibold">
              {models.length === 0 && <option value="">暂无模型记录</option>}
              {models.map(model => <option key={model} value={model}>{model}</option>)}
            </select>
            <select
              value={tableWordingFilter}
              onChange={(e) => setTableWordingFilter(e.target.value as MostWordingId | 'ALL')}
              aria-label="按提问措辞筛选表格"
              className="min-h-9 rounded-full border border-border bg-white px-3 text-xs font-semibold"
            >
              <option value="ALL">汇总全部问法 (W1–W6)</option>
              {MOST_WORDINGS.map(w => (
                <option key={w.id} value={w.id}>仅看问法 {w.id}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => exportPairMasterComparisonCsv(modelTrials, tableWordingFilter)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-white"
            >
              <Download size={14} />导出此对比表 CSV
            </button>
            <button
              type="button"
              onClick={exportLocalMostAiTrials}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3.5 text-xs font-semibold hover:border-primary"
            >
              <Download size={14} />导出原始 JSON ({trials.length})
            </button>
            {trials.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearLocalMostAiTrials();
                  refreshTrials();
                }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 size={13} />清空本地记录
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="px-3 py-2.5 font-semibold">图对 ID</th>
                <th className="px-3 py-2.5 font-semibold">来源章节</th>
                <th className="px-3 py-2.5 font-semibold">预览 (A / B)</th>
                <th className="px-3 py-2.5 font-semibold">书中基准</th>
                <th className="px-3 py-2.5 font-semibold">原论文 Beautimeter 分 (A / B)</th>
                <th className="px-3 py-2.5 font-semibold">方法1 · LS15 评分</th>
                <th className="px-3 py-2.5 font-semibold">方法2 · 模拟单人 (SIM1)</th>
                <th className="px-3 py-2.5 font-semibold">方法3 · 预测平均人 (PRED %)</th>
                <th className="px-3 py-2.5 font-semibold">方法2b · 30次独立模拟 (SIM30)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {masterRows.map((row) => (
                <tr key={row.pairId} className="hover:bg-stone-50/80">
                  <td className="px-3 py-2 font-bold">{row.pairId}</td>
                  <td className="px-3 py-2 text-muted-foreground">Fig. {row.figure} (Ch. {row.chapter})</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <img src={row.imageA} alt={`${row.pairId} A`} loading="lazy" className="h-9 w-9 rounded border border-border bg-stone-50 object-contain" />
                      <img src={row.imageB} alt={`${row.pairId} B`} loading="lazy" className="h-9 w-9 rounded border border-border bg-stone-50 object-contain" />
                    </div>
                  </td>
                  <td className="px-3 py-2 font-semibold text-emerald-800">{row.alexanderHigher} (左图)</td>
                  <td className="px-3 py-2">
                    <span className="font-medium">{row.beautimeterLeft} vs {row.beautimeterRight}</span>{' '}
                    <span className={`ml-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ${row.beautimeterHigher === 'A' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                      {row.beautimeterHigher}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {row.ls15ScoreA !== null && row.ls15ScoreB !== null
                      ? `${row.ls15ScoreA.toFixed(1)} vs ${row.ls15ScoreB.toFixed(1)} (${row.ls15Choice})`
                      : <span className="text-muted-foreground">待运行</span>}
                  </td>
                  <td className="px-3 py-2">
                    {row.sim1Choice
                      ? `${row.sim1Choice}${row.sim1Runs > 1 ? ` (${row.sim1ACount}A/${row.sim1BCount}B/${row.sim1TieCount}T)` : ''}`
                      : <span className="text-muted-foreground">待运行</span>}
                  </td>
                  <td className="px-3 py-2">
                    {row.predA !== null && row.predB !== null && row.predTie !== null
                      ? `A ${row.predA}% · B ${row.predB}% · T ${row.predTie}% (${row.predChoice})`
                      : <span className="text-muted-foreground">待运行</span>}
                  </td>
                  <td className="px-3 py-2">
                    {row.sim30Valid > 0
                      ? `A:${row.sim30ACount} B:${row.sim30BCount} T:${row.sim30TieCount} (${row.sim30Choice})`
                      : <span className="text-muted-foreground">待运行</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
