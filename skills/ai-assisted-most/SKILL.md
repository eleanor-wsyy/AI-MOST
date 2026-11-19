---
name: ai-assisted-most
description: Run an AI-assisted Mirror-of-the-Self Test on an image pair using Living Structure methods. Use when comparing architecture, urban, map, interior, or design images and the user wants simulated individual intuition, a population forecast, or a structural LS15 comparison. Keep model judgments separate from empirical human data.
---

# AI-assisted MOST

Use this skill to make a reproducible comparison between two supplied images. Lock the first image as **A** and the second as **B** before judging. Do not infer that either image is objectively beautiful and do not treat a model response as a human survey result.

## Conditions

Run the requested conditions independently and label them clearly:

1. **Pretending / simulated individual**  answer as one ordinary, untrained person using the active MOST wording. Return A, B, or tie plus a short phenomenological reason.
2. **Predicting / population forecast**  estimate the forced-choice distribution for a broad population of ordinary people. Return A%, B%, and tie% summing to 100. This is a model forecast, not observed data.
3. **LS15 structural comparison**  score each image on the supplied Living Structure properties from visible evidence, sum the scores, and report the higher total. Do not use the LS15 rubric during the intuitive pass.
4. **Optional repeated simulation**  run independent simulated-individual calls only when requested; report the number of valid calls and the A/B/tie counts.

Use W1 (Which of the two is more like your own self?) as the default wording. W2W4 are wording sensitivity checks. W5W6 are exploratory because their sacred or reincarnation framing can introduce additional interpretation.

## Required output

Return a compact table with the condition, wording, choice or percentages, and confidence. Then report:

- whether the conditions agree or diverge;
- whether visible surface cues (brightness, cleanliness, novelty, color, sharpness) pull against deeper structural cues;
- which result is a model simulation or forecast and which result, if any, comes from actual human records;
- a borderline flag when the forecast is 4555%, when a tie is selected, or when wordings disagree.

Never invent participant counts, calibration, or accuracy. If human data are available, compare them after the AI outputs and preserve the sample size and missing data. If a provider or model is used, record its name and the exact wording so GPT and Gemini runs can be compared.

## Prompt templates

For a simulated individual:

> You are one ordinary person with no formal training in architecture or Living Structure theory. Looking only at images A and B, answer the MOST question: [WORDING]. Choose A, B, or tie. Do not use a property checklist. Give one brief reason and return JSON: `{ "choice": "A|B|tie", "reason": "..." }`.

For a population forecast:

> Estimate how a broad, culturally diverse population of ordinary people would answer the MOST question [WORDING] for images A and B. Return integer percentages for A, B, and tie that sum to 100, with a brief rationale. This is a forecast, not survey evidence. Return JSON: `{ "a_pct": 0, "b_pct": 0, "tie_pct": 0, "rationale": "..." }`.

For LS15, use the projects 15-property definitions and ask for one score per image and property. Keep the evidence visible and report the sums; do not convert the result into a claim about shared human experience.
