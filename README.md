# AI MOST

AI MOST 是一个在 Codex 中比较两张图片的「自我之镜测试」（Mirror of the Self Test）技能。结果直接显示在对话里，不生成报告。

## 下载和使用（Codex）

1. [下载 ZIP](https://github.com/eleanor-wsyy/ai-assisted-most/archive/refs/heads/main.zip) 并解压；已有旧版的用户也可以重新下载，或在克隆的仓库中执行 `git pull`。
2. 在 Codex 中打开解压后含有本 README 的文件夹，新建对话。使用这个技能不需要另外填写 API Key，也不需要安装 Node.js。
3. 上传两张图片，输入：`$ai-most 比较这两张图。第一张是 A，第二张是 B。` 默认返回模拟个人的选择、预测人群的 A/B/平局比例，以及两张图的活力结构总分。

**不准备图片也能试：**复制 `$ai-most 用 W1 测试内置案例 B05，只返回模拟个人的选择。`

**English:** Download and unzip the repository, open the folder containing this README in Codex, and start a new chat. Attach two images and type `$ai-most Compare these images. The first is A, the second is B.` Results appear in chat. See the [skill instructions](.agents/skills/ai-most/SKILL.md).

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
