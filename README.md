# AI-assisted MOST

A standalone research workbench and GPT skill for running the Mirror of the Self Test (MOST). Based on the Living Structure Studio workbench. The tool opens in a browser and needs neither the Studio repository nor Supabase.

## Open the workbench

Use Node.js 22 or newer. In a local checkout:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Select OpenAI or Google Gemini, enter the ID of an image-capable model and your own API key, then apply the settings. An OpenAI-compatible service can be selected by entering its API base URL (including any version path, such as `/v1`). The service must accept browser requests from the local workbench. Run `npm run build` to type-check and build; `npm run preview` serves that build locally.

The API key is held in the open tab's memory. The browser sends the wording and the two images directly to the selected service for each request. The workbench stores trial results in browser storage; it does not collect human submissions or connect to a shared database. Use the JSON export to retain raw replies and trial metadata. The CSV table can be filtered by model and wording.

## Run a comparison

- Start with one pair or run the active batch of 10, 16, 30, or 46 pairs. W1 is the default; W2–W6 are available as separate wording conditions.
- LS15 scores visible Living Structure properties. SIM1 simulates one person's answer. PRED forecasts the response distribution across 100 hypothetical people. SIM30 optionally repeats the single-person simulation 30 times. Batch size and estimated calls are shown before running.
- For GPT/Gemini comparisons use the same pairs and wording without reshuffling between models. Image order is randomized per request and recorded. Report results by provider, model and wording. Outputs from the APIs may differ from outputs in their desktop chat clients.
- The 46 research pairs are the same as the original workbench: A01–A16 from Beautimeter Figure 5, B01–B30 from Figure 6, using cases from Christopher Alexander's *The Nature of Order*. Alexander's choices and published Beautimeter scores are reference columns; they are not recorded human survey responses. No participant records or Gemini experiment exports are bundled.

The portable skill and its research protocol are in `skills/ai-assisted-most/`. The included figures are research reference material; credit remains with the original works and rights holders.
