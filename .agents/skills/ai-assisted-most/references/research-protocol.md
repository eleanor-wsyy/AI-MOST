# MOST protocol and report format

## Passes

- **SIM1:** Answer one exact MOST question in the role of an ordinary person with no formal architectural training. Choose `A`, `B`, or `tie` and give one brief first-person reason. Do not apply the property rubric.
- **PRED:** Forecast how a broad, culturally varied population of ordinary people would respond to the same wording. Give integer percentages for A, B and tie summing to 100, and a brief rationale. These are uncalibrated estimates, not observed responses or personal confidence. A tied lead or an A/B gap of at most 10 percentage points is a close forecast.
- **LS15:** Score each input from 0 (not evident) to 1 (clearly evident) for each of the 15 equally weighted properties, in canonical order below. Base scores on visible evidence, not the SIM1 or PRED outcomes. Use the repository rubric in `src/app/data/properties.ts` when available. Record which visible features matter most and whether surface appeal points in a different direction.

Canonical order: Levels of Scale; Strong Centers; Thick Boundaries; Alternating Repetition; Positive Space; Good Shape; Local Symmetries; Deep Interlock and Ambiguity; Contrast; Gradients; Roughness; Echoes; The Void; Simplicity and Inner Calm; Not-Separateness.

Use the same images, object labels and exact wording for GPT/Gemini comparisons. Record the model, image order and which execution method was used. Codex session outputs and standalone API trials are different execution methods. Never infer measured accuracy from their agreement or from the model's estimated percentages.

## Wording

- W1: Which of the two is more like your own self?
- W2: Which of the two seems closer to representing you, your own self, in your totality?
- W3: Which of the two is more deeply connected to your eternal self, your aspiration, the core of you that exists inside?
- W4: Which of the two is or seems more alive or more life?
- W5: Which of the two makes you more aware of God, or makes you feel closer to God?
- W6: Which of the two would you prefer to become by the day of your death? (Assuming reincarnation, which one would you rather be in your next life?)

W2–W4 are wording sensitivity checks. Treat W5–W6 as exploratory framings. For one image, state that “the two” refers to the two labeled objects. For a full wording study show one visual report per pair and wording; reuse the image-based LS15 pass for the same inputs and label it as such.

## Local HTML

Write a JSON file next to the desired report. Paths are relative to the JSON or absolute. Use PNG, JPEG, WebP, GIF, AVIF or BMP. Use `null` for a requested pass that is still pending and omit the key for a pass that was not requested. Use `lang: "zh"` for Chinese report labels (the example uses English). `note` is optional and can describe agreement, visible caveats or reference comparisons. Start with this shape:

```json
{
  "title": "B05 · Two tools",
  "lang": "en",
  "model": "Codex",
  "wordingId": "W1",
  "question": "Which of the two is more like your own self?",
  "images": ["../public/output/most-ai-study-2026-11-14/ppt_images/B05_source.png"],
  "labels": ["Upper hatchet", "Diagonal screwdriver below"],
  "sim1": null,
  "pred": null,
  "ls15": null
}
```

Completed results use these shapes:

- `sim1`: `{ "choice": "A", "reason": "..." }` (`A`, `B` or `tie`).
- `pred`: `{ "a": 45, "b": 45, "tie": 10, "reason": "..." }` (illustrative only).
- `ls15`: `{ "a": [15 scores in canonical order], "b": [15 scores in canonical order], "reason": "..." }`. The renderer calculates totals.

Run `node <skill-folder>/scripts/render-report.mjs <run.json>`. Open the returned HTML path. The report embeds its images and works offline; regenerate and refresh it as passes finish. Do not commit a user's run JSON, report or uploads without authorization.
