import { requestJson } from './networkRequests';

export type AiImagePayload = { mimeType: string; base64Data: string };
export type AiSettings = { provider: 'openai' | 'gemini'; key: string; baseUrl: string; model: string };

let active: AiSettings = { provider: 'openai', key: '', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' };

export function getAiSettings() {
  return active;
}

export function saveAiSettings(settings: AiSettings) {
  active = { ...settings, key: settings.key.trim(), model: settings.model.trim(), baseUrl: settings.baseUrl.trim() };
  return active;
}

export class AiRequestError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

function compatibleEndpoint(baseUrl: string) {
  const endpoint = new URL(baseUrl);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);
  if ((!local && endpoint.protocol !== 'https:') || !['http:', 'https:'].includes(endpoint.protocol)
      || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new AiRequestError('INVALID_URL', '模型服务地址必须使用 HTTPS 或本机 HTTP，且不能包含凭据、查询参数或片段。');
  }
  const path = endpoint.pathname.replace(/\/+$/, '');
  endpoint.pathname = path.endsWith('/chat/completions') ? path : `${path || '/v1'}/chat/completions`;
  return { endpoint: endpoint.toString(), local };
}

export async function callUserAI(settings: AiSettings, request: { prompt: string; images: AiImagePayload[] }) {
  const gemini = settings.provider === 'gemini';
  const destination = gemini
    ? { endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(settings.model)}:generateContent`, local: false }
    : compatibleEndpoint(settings.baseUrl);
  if (!settings.model || (!settings.key && !destination.local)) {
    throw new AiRequestError('MISSING_SETTINGS', '请先在页面顶部填写模型和 API Key，并点击「应用模型」。');
  }

  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (gemini) headers.set('x-goog-api-key', settings.key);
  else if (settings.key) headers.set('Authorization', `Bearer ${settings.key}`);
  const imageParts = request.images.flatMap<object>((image, index) => {
    const label = `Image ${index === 0 ? 'A' : 'B'}:`;
    return gemini
      ? [{ text: label }, { inlineData: { mimeType: image.mimeType, data: image.base64Data } }]
      : [{ type: 'text', text: label }, { type: 'image_url', image_url: { url: `data:${image.mimeType};base64,${image.base64Data}` } }];
  });
  const body = gemini
    ? { contents: [{ role: 'user', parts: [{ text: request.prompt }, ...imageParts] }] }
    : { model: settings.model, messages: [{ role: 'user', content: [{ type: 'text', text: request.prompt }, ...imageParts] }] };
  type Result = {
    candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
    choices?: { message?: { content?: string } }[];
  };
  const { response, data } = await requestJson<Result>(destination.endpoint, {
    method: 'POST', headers, body: JSON.stringify(body), redirect: 'error',
  }, { timeoutMs: 120_000, retries: 0 });
  if (!response.ok) {
    throw new AiRequestError(`HTTP_${response.status}`, `模型服务返回 HTTP ${response.status}。请检查 API Key、模型名称和服务额度。`);
  }
  const reply = gemini ? data?.candidates?.[0]?.content?.parts?.filter(part => !part.thought).map(part => part.text ?? '').join('')
    : data?.choices?.[0]?.message?.content;
  return { reply: typeof reply === 'string' ? reply : '' };
}
