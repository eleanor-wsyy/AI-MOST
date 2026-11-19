import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

const mimeTypes = { '.png': 'png', '.jpg': 'jpeg', '.jpeg': 'jpeg', '.gif': 'gif', '.webp': 'webp', '.avif': 'avif', '.bmp': 'bmp' };
const properties = ['Levels of Scale', 'Strong Centers', 'Thick Boundaries', 'Alternating Repetition', 'Positive Space', 'Good Shape', 'Local Symmetries', 'Deep Interlock and Ambiguity', 'Contrast', 'Gradients', 'Roughness', 'Echoes', 'The Void', 'Simplicity and Inner Calm', 'Not-Separateness'];
const escape = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const text = value => typeof value === 'string' && value.trim().length > 0;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const check = (ok, message) => { if (!ok) throw new Error(message); };

function render(input, folder) {
  check(record(input) && [input.title, input.model, input.question].every(text), 'A title, model and exact question are required.');
  check(/^W[1-6]$/.test(input.wordingId) && ['en', 'zh', undefined].includes(input.lang), 'Use W1-W6 and lang en or zh.');
  check(Array.isArray(input.images) && [1, 2].includes(input.images.length) && input.images.every(text), 'Provide one or two image paths.');
  check(Array.isArray(input.labels) && input.labels.length === 2 && input.labels.every(text), 'Provide separate A and B labels.');
  const passes = ['sim1', 'pred', 'ls15'].filter(key => Object.hasOwn(input, key));
  check(passes.length > 0, 'Include at least one requested pass (null when pending).');
  for (const key of passes) if (input[key] !== null) check(record(input[key]) && text(input[key].reason), `${key} needs a reason.`);
  const { sim1, pred, ls15 } = input;
  const choices = ['A', 'B', 'tie'];
  const counts = pred ? [pred.a, pred.b, pred.tie] : [];
  const isScoreList = scores => Array.isArray(scores) && scores.length === properties.length && scores.every(n => Number.isFinite(n) && n >= 0 && n <= 1);
  if (sim1) check(choices.includes(sim1.choice), 'SIM1 choice must be A, B or tie.');
  if (pred) check(counts.every(n => Number.isInteger(n) && n >= 0) && counts.reduce((a, b) => a + b, 0) === 100, 'PRED must contain nonnegative integer percentages summing to 100.');
  if (ls15) check(isScoreList(ls15.a) && isScoreList(ls15.b), 'LS15 requires two ordered lists of 15 scores from 0 to 1.');
  const inChinese = input.lang === 'zh';
  const t = (en, zh) => inChinese ? zh : en;
  const names = { sim1: t('Simulated individual', '模拟单人'), pred: t('Population forecast', '群体预测'), ls15: t('Living Structure', '活力结构评分') };
  const tie = t('Tie', '接近');
  const choiceLabel = ch => ch === 'tie' ? tie : ch;
  const total = scores => Math.round(scores.reduce((a, b) => a + b, 0) * 1e6) / 1e6;
  const shared = input.images.length === 1;
  const labels = input.labels.map((label, index) => `<span><b>${choices[index]}</b> ${escape(label)}</span>`);
  const images = input.images.map((name, i) => {
    const file = resolve(folder, name);
    const mime = mimeTypes[extname(file).toLowerCase()];
    check(mime, 'Use a supported raster image format.');
    const alt = shared ? `A: ${input.labels[0]}; B: ${input.labels[1]}` : `${choices[i]}: ${input.labels[i]}`;
    return `<figure><img alt="${escape(alt)}" src="data:image/${mime};base64,${readFileSync(file).toString('base64')}"><figcaption>${shared ? labels.join('') : labels[i]}</figcaption></figure>`;
  });
  const done = passes.filter(key => input[key] !== null).length;
  const reason = value => `<p class="reason">${escape(value.reason)}</p>`;
  const lead = counts.length ? choices.filter((_, i) => counts[i] === Math.max(...counts)) : [];
  const forecastClose = pred && (lead.length > 1 || Math.abs(pred.a - pred.b) <= 10);
  const scoreA = ls15 ? total(ls15.a) : 0;
  const scoreB = ls15 ? total(ls15.b) : 0;
  const results = {
    sim1: () => `<strong class="verdict">${choiceLabel(sim1.choice)}</strong>${reason(sim1)}`,
    pred: () => `<div class="bar" aria-hidden="true">${counts.map((value, i) => `<span class="tone${i}" style="flex-basis:${value}%"></span>`).join('')}</div>
      <div class="legend">${counts.map((value, i) => `<span><i class="tone${i}"></i>${choiceLabel(choices[i])} <b>${value}%</b></span>`).join('')}</div>
      ${forecastClose ? `<span class="close">${t('Close forecast', '预测接近')}</span>` : ''}${reason(pred)}`,
    ls15: () => `<div class="legend"><span>A <b>${scoreA.toFixed(2)} / 15</b></span><span>B <b>${scoreB.toFixed(2)} / 15</b></span><span>${t('Higher', '较高')}: <b>${scoreA > scoreB ? 'A' : scoreA < scoreB ? 'B' : tie}</b></span></div>${reason(ls15)}
      <details><summary>${t('View the 15 property scores', '查看 15 项属性评分')}</summary><table><thead><tr><th scope="col">${t('Property', '属性')}</th><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody>${properties.map((name, i) => `<tr><th scope="row">${i + 1}. ${name}</th><td>${ls15.a[i]}</td><td>${ls15.b[i]}</td></tr>`).join('')}</tbody></table></details>`,
  };
  return `<!doctype html><html lang="${inChinese ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><title>${escape(input.title)} | AI-assisted MOST</title><style>
    *{box-sizing:border-box}body{margin:0;background:#fbfcfa;color:#1d2723;font:15px/1.55 system-ui,sans-serif}main{max-width:1050px;margin:auto;padding:28px 24px 48px}h1,h2,p,figure{margin:0}h1{font-size:28px;line-height:1.2;margin:6px 0 12px}h2{font-size:19px}small,.muted,figcaption{color:#495950}.eyebrow{font-weight:700;color:#176451}.meta{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center}.meta progress{width:90px;height:8px;accent-color:#18624d}.prompt{margin:18px 0 12px;padding:9px 12px;border-left:3px solid #18624d;background:#edf4ef}.images{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.images.shared{grid-template-columns:minmax(0,650px)}img{display:block;width:100%;height:clamp(170px,38vh,380px);object-fit:contain;background:#f0f2ef;border:1px solid #dce2dc;border-radius:7px}.shared img{height:auto;max-height:43vh}figcaption,.legend{display:flex;flex-wrap:wrap;gap:6px 18px}figcaption{margin-top:7px}figcaption b{color:#176451;margin-right:4px}ol{padding:0;margin:22px 0 0;list-style:none;border-top:1px solid #dce2dc}li{display:grid;grid-template-columns:minmax(160px,1fr) 2fr;gap:12px;padding:15px 0;border-bottom:1px solid #dce2dc}li h2 small{display:block;font-size:12px}.verdict{font-size:24px}.reason{margin-top:5px}.bar{display:flex;height:9px;overflow:hidden;background:#ddd;border-radius:5px;margin:6px 0 8px;max-width:500px}.tone0{background:#227357}.tone1{background:#365f98}.tone2{background:#8a9187}.legend i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px}.close{display:block;margin-top:5px;color:#805426;font-weight:600}details{margin-top:9px}summary{cursor:pointer;color:#176451;text-decoration:underline;text-underline-offset:3px}table{border-collapse:collapse;width:100%;margin-top:8px}td,th{padding:4px 8px;text-align:left;border-bottom:1px solid #e3e9e3}th[scope=row]{font-weight:500}.note,footer{margin-top:16px}footer{font-size:13px;color:#495950}@media(max-width:560px){main{padding:20px 14px 32px}h1{font-size:23px}li{grid-template-columns:1fr;gap:4px}img{height:clamp(115px,31vh,220px)}.shared img{height:auto}}
    </style></head><body><main><header><div class="eyebrow">AI-assisted MOST</div><h1>${escape(input.title)}</h1><div class="meta"><span>${escape(input.model)} · ${t('Session analysis', '会话分析')}</span><span>${t('Passes complete', '已完成')}: ${done} / ${passes.length}</span><progress max="${passes.length}" value="${done}" aria-label="${t('Passes complete', '已完成条件数')}"></progress></div></header>
    <p class="prompt"><b>${escape(input.wordingId)}</b> · ${escape(input.question)}</p><div class="images${shared ? ' shared' : ''}">${images.join('')}</div>
    <ol>${passes.map(key => `<li><h2><small>${key.toUpperCase()}</small>${names[key]}</h2><div>${input[key] === null ? `<span class="muted">${t('Pending', '待完成')}</span>` : results[key]()}</div></li>`).join('')}</ol>
    ${text(input.note) ? `<p class="note"><b>${t('Comparison note', '对照说明')}</b> · ${escape(input.note)}</p>` : ''}<footer>${t('Model outputs only. Population forecasts are not observed survey responses.', '以上为模型输出；群体预测比例不代表真人调查结果。')}</footer></main></body></html>`;
}

try {
  check(process.argv.length === 3 && extname(process.argv[2]).toLowerCase() === '.json', 'Usage: node render-report.mjs <run.json>');
  const path = resolve(process.argv[2]);
  const output = `${path.slice(0, -5)}.html`;
  const input = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
  writeFileSync(output, render(input, dirname(path)));
  console.log(output);
} catch (error) {
  console.error(`MOST report: ${error.message}`);
  process.exitCode = 1;
}
