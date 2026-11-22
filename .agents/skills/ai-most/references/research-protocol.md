# AI MOST research protocol

## Passes

- **SIM1:** Answer one exact MOST question in the role of an ordinary person with no formal architectural training. Choose `A`, `B`, or `tie`. Do not apply the property rubric.
- **PRED:** Forecast how a broad, culturally varied population of ordinary people would respond to the same wording. Give integer percentages for A, B and tie summing to 100, as the forecast. These are uncalibrated estimates, not observed responses or personal confidence. A tied lead or an A/B gap of at most 10 percentage points is a close forecast.
- **LS15:** Score each input from 0 (not evident) to 1 (clearly evident) for each of the 15 equally weighted properties, in canonical order below. Base scores on visible evidence, not the SIM1 or PRED outcomes. Use the repository rubric in `src/app/data/properties.ts` when available. Consider which visible features matter most and whether surface appeal points in a different direction.

Canonical order: Levels of Scale; Strong Centers; Thick Boundaries; Alternating Repetition; Positive Space; Good Shape; Local Symmetries; Deep Interlock and Ambiguity; Contrast; Gradients; Roughness; Echoes; The Void; Simplicity and Inner Calm; Not-Separateness.

Use the same images, object labels and exact wording for GPT/Gemini comparisons. Record the model, image order and which execution method was used. Codex session outputs and standalone API trials are different execution methods. Never infer measured accuracy from their agreement or from the model's estimated percentages.

## Wording

- W1: Which of the two is more like your own self?
- W2: Which of the two seems closer to representing you, your own self, in your totality?
- W3: Which of the two is more deeply connected to your eternal self, your aspiration, the core of you that exists inside?
- W4: Which of the two is or seems more alive or more life?
- W5: Which of the two makes you more aware of God, or makes you feel closer to God?
- W6: Which of the two would you prefer to become by the day of your death? (Assuming reincarnation, which one would you rather be in your next life?)

W2–W4 are wording sensitivity checks. Treat W5–W6 as exploratory framings. For one image, state that “the two” refers to the two labeled objects. For a full wording study identify each pair and wording in the results; reuse the image-based LS15 pass for the same inputs and label it as such.
