"""
CUTAD MovieBox API — Python contoh semua 5 action

Usage:
  pip install requests
  export CUTAD_KEY="cutad_YOUR_KEY"
  python examples/python.py

Dapatkan key di https://www.cutad.web.id/docs#pricing
"""

import os
import sys
import requests

KEY = os.environ.get("CUTAD_KEY")
if not KEY:
    print("Set env CUTAD_KEY dulu. https://www.cutad.web.id/docs#pricing")
    sys.exit(1)

BASE = "https://www.cutad.web.id/api/public/moviebox"
HEADERS = {"x-api-key": KEY}


def call(**params):
    r = requests.get(BASE, params=params, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()


def main():
    print("=========================================")
    print(" CUTAD MovieBox (moviebox) — Python demo")
    print("=========================================\n")

    # 1) rank
    print("[1/5] action=rank")
    rank = call(action="rank")
    print(f"  items: {len(rank['data'])}")
    for i in rank["data"][:3]:
        print(f"    - {i['id']} | {i['title']}")
    first_id = rank["data"][0]["id"]
    print()

    # 2) detail
    print(f"[2/5] action=detail&id={first_id}")
    detail = call(action="detail", id=first_id)
    d = detail["data"]
    print(f"  title: {d.get('title')}")
    print(f"  description: {(d.get('description') or '')[:120]}")
    print()

    # 3) episodes
    print(f"[3/5] action=episodes&id={first_id}")
    eps = call(action="episodes", id=first_id)
    print(f"  episodes: {len(eps['data'])}")
    for e in eps["data"][:3]:
        print(f"    - ep {e.get('episode')}: {e.get('title')}")
    print()

    # 4) stream (format: {id}_s{season}_e{episode})
    stream_id = f"{first_id}_s0_e0"
    print(f"[4/5] action=stream&id={stream_id}")
    stream = call(action="stream", id=stream_id)
    sd = stream["data"]
    print(f"  m3u8 url: {(sd.get('url') or '')[:80]}")
    print(f"  quality:  {sd.get('quality')}")
    print(f"  subs:     {len(sd.get('subtitles') or [])}")
    print()

    # 5) search
    print("[5/5] action=search&q=love")
    search = call(action="search", q="love")
    print(f"  results: {len(search['data'])}")
    for i in search["data"][:3]:
        print(f"    - {i.get('title')}")
    print()

    print("Done. Docs: https://www.cutad.web.id/docs")


if __name__ == "__main__":
    main()
