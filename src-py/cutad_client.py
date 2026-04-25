"""
CutadClient — mini SDK untuk CUTAD Streaming API
Provider bawaan: moviebox (MovieBox)

Install: copy file ini ke project kamu, atau pip install requests.
    from cutad_client import CutadClient

Docs: https://www.cutad.web.id/docs
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

import requests

DEFAULT_BASE = "https://www.cutad.web.id/api/public"


class CutadApiError(Exception):
    """Raised untuk semua error dari CUTAD API (401, 404, 429, dll)."""

    def __init__(self, status: int, body: Dict[str, Any]):
        self.status = status
        self.body = body
        super().__init__(f"CUTAD API {status}: {body.get('error', 'unknown')}")


class CutadClient:
    """
    Args:
        api_key: API key (dapat di https://www.cutad.web.id/docs).
        provider: nama provider slug (default "moviebox").
        base_url: override base URL (optional).
        timeout: timeout per request dalam detik (default 30).
    """

    def __init__(
        self,
        api_key: str,
        provider: str = "moviebox",
        base_url: str = DEFAULT_BASE,
        timeout: float = 30.0,
    ) -> None:
        if not api_key:
            raise ValueError("api_key required")
        self.api_key = api_key
        self.provider = provider
        self.base_url = base_url
        self.timeout = timeout
        self._session = requests.Session()
        self._session.headers.update(
            {"x-api-key": api_key, "Accept": "application/json"}
        )

    def _call(self, **params: Any) -> Any:
        url = f"{self.base_url}/{self.provider}"
        clean = {k: v for k, v in params.items() if v is not None}
        r = self._session.get(url, params=clean, timeout=self.timeout)
        try:
            body = r.json()
        except Exception:
            body = {"error": r.text}
        if not r.ok or body.get("status") is False:
            raise CutadApiError(r.status_code, body)
        return body.get("data")

    def rank(self) -> List[Dict[str, Any]]:
        """Konten populer / trending."""
        return self._call(action="rank")

    def detail(self, id: str) -> Dict[str, Any]:
        """Detail metadata konten (judul, sinopsis, genre, poster, dll)."""
        if not id:
            raise ValueError("id required")
        return self._call(action="detail", id=id)

    def episodes(self, id: str) -> List[Dict[str, Any]]:
        """List episode (untuk series). Untuk movie return 1 episode dummy."""
        if not id:
            raise ValueError("id required")
        return self._call(action="episodes", id=id)

    def stream(self, id: str, season: int = 0, episode: int = 0) -> Dict[str, Any]:
        """
        HLS stream URL + subtitle tracks.

        Args:
            id: ID konten.
            season: season index (default 0).
            episode: episode index (default 0).
        """
        if not id:
            raise ValueError("id required")
        fake_id = f"{id}_s{season}_e{episode}"
        return self._call(action="stream", id=fake_id)

    def search(self, q: str) -> List[Dict[str, Any]]:
        """Cari judul / kata kunci."""
        if not q:
            raise ValueError("q required")
        return self._call(action="search", q=q)

    def close(self) -> None:
        self._session.close()

    def __enter__(self) -> "CutadClient":
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()
