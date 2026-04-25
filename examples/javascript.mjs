// CUTAD MovieBox API — JavaScript (Node 18+) contoh semua 5 action
//
// Usage:
//   export CUTAD_KEY="cutad_YOUR_KEY"
//   node examples/javascript.mjs
//
// Dapatkan key di https://www.cutad.web.id/docs#pricing

const KEY = process.env.CUTAD_KEY;
if (!KEY) {
  console.error("Set env CUTAD_KEY dulu. https://www.cutad.web.id/docs#pricing");
  process.exit(1);
}

const BASE = "https://www.cutad.web.id/api/public/moviebox";

async function call(params) {
  const url = new URL(BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "x-api-key": KEY } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log("=========================================");
  console.log(" CUTAD MovieBox (moviebox) — JS demo");
  console.log("=========================================\n");

  // 1) rank
  console.log("[1/5] action=rank");
  const rank = await call({ action: "rank" });
  console.log(`  items: ${rank.data.length}`);
  rank.data.slice(0, 3).forEach(i => console.log(`    - ${i.id} | ${i.title}`));
  const firstId = rank.data[0].id;
  console.log("");

  // 2) detail
  console.log(`[2/5] action=detail&id=${firstId}`);
  const detail = await call({ action: "detail", id: firstId });
  console.log(`  title: ${detail.data.title}`);
  console.log(`  description: ${(detail.data.description || "").slice(0, 120)}`);
  console.log("");

  // 3) episodes
  console.log(`[3/5] action=episodes&id=${firstId}`);
  const eps = await call({ action: "episodes", id: firstId });
  console.log(`  episodes: ${eps.data.length}`);
  eps.data.slice(0, 3).forEach(e => console.log(`    - ep ${e.episode}: ${e.title}`));
  console.log("");

  // 4) stream (format videoFakeId: {id}_s{season}_e{episode})
  const streamId = `${firstId}_s0_e0`;
  console.log(`[4/5] action=stream&id=${streamId}`);
  const stream = await call({ action: "stream", id: streamId });
  console.log(`  m3u8 url: ${(stream.data.url || "").slice(0, 80)}`);
  console.log(`  quality:  ${stream.data.quality}`);
  console.log(`  subs:     ${(stream.data.subtitles || []).length}`);
  console.log("");

  // 5) search
  console.log(`[5/5] action=search&q=love`);
  const search = await call({ action: "search", q: "love" });
  console.log(`  results: ${search.data.length}`);
  search.data.slice(0, 3).forEach(i => console.log(`    - ${i.title}`));
  console.log("");

  console.log("Done. Docs: https://www.cutad.web.id/docs");
}

main().catch(err => { console.error("ERROR:", err.message); process.exit(1); });
