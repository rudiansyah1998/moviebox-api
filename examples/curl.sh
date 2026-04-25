#!/usr/bin/env bash
# CUTAD MovieBox API — contoh lengkap semua 5 action via cURL
#
# Usage:
#   export CUTAD_KEY="cutad_YOUR_KEY"
#   bash examples/curl.sh

set -euo pipefail

: "${CUTAD_KEY:?Set env var CUTAD_KEY dulu. Dapat key di https://www.cutad.web.id/docs#pricing}"

BASE="https://www.cutad.web.id/api/public/moviebox"
H_AUTH=(-H "x-api-key: ${CUTAD_KEY}")

echo "=========================================="
echo " CUTAD MovieBox (moviebox) — API demo"
echo "=========================================="
echo

# 1) RANK — konten populer
echo "[1/5] GET ${BASE}?action=rank"
curl -sS "${BASE}?action=rank" "${H_AUTH[@]}" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print('status:',d.get('status'),'| items:',len(d.get('data',[]))); [print('  -',i.get('id'),'|',i.get('title','')[:60]) for i in d.get('data',[])[:3]]"
echo

# Ambil ID dari rank untuk demo berikutnya
FIRST_ID=$(curl -sS "${BASE}?action=rank" "${H_AUTH[@]}" | python3 -c "import json,sys; print(json.load(sys.stdin)['data'][0]['id'])")
echo "Using FIRST_ID=${FIRST_ID}"
echo

# 2) DETAIL — metadata lengkap
echo "[2/5] GET ${BASE}?action=detail&id=${FIRST_ID}"
curl -sS "${BASE}?action=detail&id=${FIRST_ID}" "${H_AUTH[@]}" \
  | python3 -c "import json,sys; d=json.load(sys.stdin).get('data',{}); print('title:',d.get('title'),'\ndescription:',(d.get('description','') or '')[:120])"
echo

# 3) EPISODES — list semua episode
echo "[3/5] GET ${BASE}?action=episodes&id=${FIRST_ID}"
curl -sS "${BASE}?action=episodes&id=${FIRST_ID}" "${H_AUTH[@]}" \
  | python3 -c "import json,sys; eps=json.load(sys.stdin).get('data',[]); print('episodes:',len(eps)); [print('  - ep',e.get('episode'),':',e.get('title','')[:60]) for e in eps[:3]]"
echo

# 4) STREAM — HLS URL + subtitle
# Note: stream butuh videoFakeId format: {id}_s{season}_e{episode}
STREAM_ID="${FIRST_ID}_s0_e0"  # movie / single ep
echo "[4/5] GET ${BASE}?action=stream&id=${STREAM_ID}"
curl -sS "${BASE}?action=stream&id=${STREAM_ID}" "${H_AUTH[@]}" \
  | python3 -c "import json,sys; d=json.load(sys.stdin).get('data',{}); print('m3u8 url:',(d.get('url','') or '')[:80],'\nquality:',d.get('quality'),'\nsubtitles:',len(d.get('subtitles',[])))"
echo

# 5) SEARCH — cari judul
echo "[5/5] GET ${BASE}?action=search&q=love"
curl -sS "${BASE}?action=search&q=love" "${H_AUTH[@]}" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print('results:',len(d.get('data',[]))); [print('  -',i.get('title','')[:60]) for i in d.get('data',[])[:3]]"
echo

echo "Done. Docs: https://www.cutad.web.id/docs"
