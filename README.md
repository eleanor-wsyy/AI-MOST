# AI-assisted MOST

A Codex skill and standalone research workbench for the Mirror of the Self Test (MOST), based on the Living Structure Studio workbench. Neither workflow needs the Studio repository or Supabase.

## Run inside Codex without an API key

Open this checkout as a Codex workspace and start a conversation with `$ai-assisted-most`. Attach two images, attach one image showing both objects, or specify a bundled case such as B05. For example: `Use $ai-assisted-most on B05 with W1 and show me the visual result.`

Codex inspects the images and performs the requested passes in the current session. With Node.js 22+ available it writes an offline HTML report showing the original inputs, wording, judgment and rationale for each pass, the forecast distribution, and expandable LS15 scores. Open the HTML file from the chat result. No API key, web server or package installation is required for this workflow. The project skill lives in [`.agents/skills/ai-assisted-most/`](.agents/skills/ai-assisted-most/SKILL.md).

## Open the standalone API workbench

Use Node.js 22 or newer. In a local checkout:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Select OpenAI or Google Gemini, enter the ID of an image-capable model and your own API key, then apply the settings. An OpenAI-compatible service can be selected by entering its API base URL (including any version path, such as `/v1`). The service must accept browser requests from the local workbench. Run `npm run build` to type-check and build; `npm run preview` serves that build locally.

The API key is held in the open tab's memory. The browser sends the wording and the image input directly to the selected service for each request. The workbench stores trial results in browser storage; it does not collect human submissions or connect to a shared database. Use the JSON export to retain raw replies and trial metadata. The CSV table can be filtered by model and wording and labels the input mode as `two_images` or `single_image`.

## Run a comparison

- Start with one pair or run a batch of 10, 16, 30, or 46 pairs. W1 is the default; W2–W6 are available as separate wording conditions.
- LS15 scores visible Living Structure properties. SIM1 simulates one person's answer. PRED forecasts the response distribution across 100 hypothetical people. SIM30 optionally repeats the single-person simulation 30 times. Batch size and estimated calls are shown before running.
- For GPT/Gemini comparisons use the same pairs and wording without reshuffling between models. Image order is randomized per request and recorded. Report results by provider, model and wording. Outputs from the APIs may differ from outputs in their desktop chat clients.
- The 46 research pairs are the same as the original workbench: A01–A16 from Beautimeter Figure 5, B01–B30 from Figure 6, using cases from Christopher Alexander's *The Nature of Order*. Alexander's choices and published Beautimeter scores are reference columns; they are not recorded human survey responses. No participant records or Gemini experiment exports are bundled.
- [Image provenance](docs/most-image-provenance.csv) records each input's source on slide 2 of `GPT4MOSTFigures&Data2.pptx`, pixel bounds, and checksum. B05 uses one original scan: A is the hatchet at the top and B is the diagonal screwdriver below. Its object labels stay fixed and the trial records have a `-single-image` prompt ID suffix. Earlier trials for revised images remain in the raw JSON export and are excluded from comparisons with the current inputs.

The included figures are research reference material; credit remains with the original works and rights holders.
