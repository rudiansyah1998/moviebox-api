/**
 * CutadClient — mini SDK untuk CUTAD Streaming API
 * Provider bawaan: moviebox (MovieBox)
 *
 * Install: copy file ini ke project kamu, import langsung.
 *   import { CutadClient } from "./client.mjs";
 *
 * Docs: https://www.cutad.web.id/docs
 */

const DEFAULT_BASE = "https://www.cutad.web.id/api/public";

export class CutadApiError extends Error {
  constructor(status, body) {
    super(`CUTAD API ${status}: ${body?.error || "unknown"}`);
    this.status = status;
    this.body = body;
  }
}

export class CutadClient {
  /**
   * @param {string} apiKey                          API key (dapat di cutad.web.id/docs)
   * @param {string} [provider="moviebox"]             Nama provider slug
   * @param {object} [opts]
   * @param {string} [opts.baseUrl]                  Override base URL
   * @param {number} [opts.timeoutMs=30000]          Timeout per request
   * @param {typeof fetch} [opts.fetch]              Custom fetch impl (Node 18+ built-in)
   */
  constructor(apiKey, provider = "moviebox", opts = {}) {
    if (!apiKey) throw new Error("apiKey required");
    this.apiKey = apiKey;
    this.provider = provider;
    this.baseUrl = opts.baseUrl || DEFAULT_BASE;
    this.timeoutMs = opts.timeoutMs ?? 30000;
    this.fetch = opts.fetch || globalThis.fetch;
    if (!this.fetch) throw new Error("fetch not available. Use Node 18+ or pass opts.fetch");
  }

  async _call(params) {
    const url = new URL(`${this.baseUrl}/${this.provider}`);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await this.fetch(url, {
        headers: { "x-api-key": this.apiKey, "Accept": "application/json" },
        signal: ctrl.signal,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.status === false) throw new CutadApiError(res.status, body);
      return body.data;
    } finally {
      clearTimeout(timer);
    }
  }

  /** List konten populer / trending. */
  rank() {
    return this._call({ action: "rank" });
  }

  /** Detail metadata konten. */
  detail(id) {
    if (!id) throw new Error("id required");
    return this._call({ action: "detail", id });
  }

  /** List episode (untuk series). Untuk movie return 1 episode dummy. */
  episodes(id) {
    if (!id) throw new Error("id required");
    return this._call({ action: "episodes", id });
  }

  /**
   * HLS stream URL + subtitle tracks.
   * @param {string} id         ID konten
   * @param {number} [season=0] Season index
   * @param {number} [episode=0] Episode index
   */
  stream(id, season = 0, episode = 0) {
    if (!id) throw new Error("id required");
    const fakeId = `${id}_s${season}_e${episode}`;
    return this._call({ action: "stream", id: fakeId });
  }

  /** Cari judul. */
  search(q) {
    if (!q) throw new Error("q required");
    return this._call({ action: "search", q });
  }
}

// Default export untuk convenience
export default CutadClient;
