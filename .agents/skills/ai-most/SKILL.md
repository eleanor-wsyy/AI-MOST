---
name: ai-most
description: Compare images with the Mirror-of-the-Self Test (MOST) and return results directly in chat. Use for A/B image or object comparisons involving simulated individual intuition, population forecasts, or Living Structure scoring, including numbered Beautimeter examples.
---

# AI MOST

Use the active Codex session to inspect images and carry out the comparison. Do not request API credentials or call an external model unless the user explicitly chooses that workflow. A human choice is optional and is never an input to the AI passes.

1. **Inspect the inputs.** Inspect the actual images with the image viewer. Lock the first/left image as A and the second/right as B, or label two distinguishable objects in one intact image. For a numbered book pair, open the image files under `public/output/most-ai-study-2026-11-14/ppt_images/` in the checkout. B05 uses only `B05_source.png`: A is the upper hatchet; B is the diagonal screwdriver below. Do not inspect the reference verdict while making the AI judgments.
2. **Run the passes in order.** Read [the research protocol](references/research-protocol.md). Default to W1 and all three passes: simulated individual (SIM1), population forecast (PRED), then structural scoring (LS15). Use the requested conditions and W1–W6 wordings when specified. Make each pass on its own terms, without using prior choices or scores as evidence. A single Codex session is not a set of independent calls; do not present repeated answers from it as SIM30.
3. **Return only the requested results in chat.** For one pair, give its identifier or A/B labels and one short line per requested pass: SIM1 choice, PRED estimated A/B/tie percentages, and LS15 totals for A and B (out of 15). For multiple pairs or wordings, use a compact table. If the user specifies a format (e.g. numbered A/B choices only), follow it exactly. Omit explanations unless requested. Do not create a run file, generate a report, open a preview, or link to a report as part of an evaluation.

Keep AI simulations and forecasts separate from actual human data. Record the model label as `Codex` unless the specific model is known. Compare any human or published references only after the AI judgments, with their source and sample size where applicable. Distinguish judgments about visible structure from surface cues such as lighting, color and sharpness.
