export class NetworkRequestError extends Error {
  constructor(public readonly code: "timeout" | "cancelled" | "invalid-response", message: string) {
    super(message); this.name = "NetworkRequestError";
  }
}

// When enabled, the deadline covers the response body as well as connection/response headers.
export async function withNetworkDeadline<T>(
  work: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number | null,
  externalSignal?: AbortSignal | null,
): Promise<T> {
  if (timeoutMs !== null && (!(timeoutMs > 0) || !Number.isFinite(timeoutMs))) throw new RangeError("A finite positive deadline or null is required.");
  if (externalSignal?.aborted) throw externalSignal.reason || new NetworkRequestError("cancelled", "Request cancelled.");
  const controller = new AbortController();
  let rejectAbort: (reason: unknown) => void = () => {};
  const aborted = new Promise<never>((_, reject) => { rejectAbort = reject; });
  const onAbort = () => rejectAbort(controller.signal.reason || new NetworkRequestError("cancelled", "Request cancelled."));
  const onExternalAbort = () => controller.abort(externalSignal?.reason || new NetworkRequestError("cancelled", "Request cancelled."));
  controller.signal.addEventListener("abort", onAbort, { once: true });
  externalSignal?.addEventListener("abort", onExternalAbort, { once: true });
  const timer = timeoutMs === null ? undefined : setTimeout(() => controller.abort(new NetworkRequestError("timeout", "Request timed out. Please check the connection and try again.")), timeoutMs);
  try { return await Promise.race([Promise.resolve().then(() => { if (controller.signal.aborted) throw controller.signal.reason; return work(controller.signal); }), aborted]); }
  finally {
    if (timer !== undefined) clearTimeout(timer);
    controller.signal.removeEventListener("abort", onAbort);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }
}

function retryDelay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

interface RequestOptions {
  // null explicitly opts out; all other requests retain the default deadline.
  timeoutMs?: number | null;
  retries?: number;
  retryDelayMs?: number;
  fetcher?: typeof fetch;
}
const TEMPORARY_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export async function requestJson<T = any>(
  input: string | URL,
  init: RequestInit = {},
  { timeoutMs = 30_000, retries = 0, retryDelayMs = 400, fetcher = fetch }: RequestOptions = {},
): Promise<{ response: Response; data: T }> {
  // Mutation/AI submission requests are never automatically repeated.
  const retryCount = (init.method || "GET").toUpperCase() === "GET" ? Math.max(0, Math.min(2, retries)) : 0;
  const deadline = timeoutMs === null ? Infinity : Date.now() + timeoutMs;
  return withNetworkDeadline(async signal => {
    for (let attempt = 0; ; attempt += 1) {
      let response: Response;
      try { response = await fetcher(input, { ...init, signal }); }
      catch (error) {
        if (signal.aborted || attempt >= retryCount || !(error instanceof TypeError)) throw error;
        await retryDelay(retryDelayMs * (attempt + 1), signal); continue;
      }
      if (attempt < retryCount && TEMPORARY_STATUSES.has(response.status)) {
        const retryAfter = response.headers.get("retry-after");
        const parsed = retryAfter ? (Number.isFinite(Number(retryAfter)) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now()) : 0;
        const delay = Math.max(retryDelayMs * (attempt + 1), Number.isFinite(parsed) ? parsed : 0);
        if (delay < deadline - Date.now()) {
          await response.body?.cancel();
          await retryDelay(delay, signal); continue;
        }
      }
      let data: T;
      try { data = await response.json(); }
      catch (error) {
        if (signal.aborted) throw error;
        if (response.ok) throw new NetworkRequestError("invalid-response", "The service returned an unreadable response. Please try again later.");
        data = {} as T;
      }
      return { response, data };
    }
  }, timeoutMs, init.signal);
}

export function requestBytes(input: string | URL, timeoutMs = 30_000): Promise<{ response: Response; buffer: ArrayBuffer }> {
  return withNetworkDeadline(async signal => {
    const response = await fetch(input, { signal });
    if (!response.ok) throw new Error(`Image download failed (${response.status}). Please try again.`);
    return { response, buffer: await response.arrayBuffer() };
  }, timeoutMs);
}
