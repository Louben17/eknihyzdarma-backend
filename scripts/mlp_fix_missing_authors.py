#!/usr/bin/env python3
"""
MLP Fix Missing Authors
=======================
Projde všechny knihy ve Strapi bez autora (ale s mlpId),
stáhne originální záznam z MLP přes OAI-PMH GetRecord,
extrahuje autora a doplní ho do Strapi.

Spuštění:
    python3 mlp_fix_missing_authors.py --url http://localhost:1337 --token <TOKEN>
    python3 mlp_fix_missing_authors.py --dry-run   # simulace, nic nezapisuje
"""

import argparse
import os
import re
import sys
import time
import unicodedata
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Optional

import requests

# ── Encoding fix (Windows) ───────────────────────────────────────────────────
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ── Konfigurace ───────────────────────────────────────────────────────────────
OAI_BASE   = "http://web2.mlp.cz/cgi/oai"
OAI_PREFIX = "marc21"

STRAPI_URL   = os.getenv("STRAPI_URL",   "http://localhost:1337")
STRAPI_TOKEN = os.getenv("STRAPI_TOKEN", "")

DELAY     = 0.5   # pauza mezi Strapi požadavky (s)
OAI_DELAY = 1.0   # pauza mezi OAI požadavky (s)

NS_OAI  = "http://www.openarchives.org/OAI/2.0/"
NS_MARC = "http://www.loc.gov/MARC21/slim"


# ── Pomocné funkce ────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:200]


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ── Strapi API ─────────────────────────────────────────────────────────────────

def _headers() -> dict:
    h = {"Content-Type": "application/json"}
    if STRAPI_TOKEN:
        h["Authorization"] = f"Bearer {STRAPI_TOKEN}"
    return h


def strapi_get(path: str, params: dict = None) -> dict:
    resp = requests.get(f"{STRAPI_URL}{path}", headers=_headers(), params=params, timeout=20)
    resp.raise_for_status()
    return resp.json()


def strapi_post(path: str, data: dict) -> dict:
    resp = requests.post(f"{STRAPI_URL}{path}", headers=_headers(), json=data, timeout=20)
    if not resp.ok:
        raise Exception(f"POST {path} → {resp.status_code}: {resp.text[:300]}")
    return resp.json()


def strapi_put(path: str, data: dict) -> dict:
    resp = requests.put(f"{STRAPI_URL}{path}", headers=_headers(), json=data, timeout=20)
    if not resp.ok:
        raise Exception(f"PUT {path} → {resp.status_code}: {resp.text[:300]}")
    return resp.json()


# ── Strapi: načti všechny knihy bez autora s mlpId ────────────────────────────

def load_books_without_author() -> list:
    """Vrátí seznam knih (documentId, title, mlpId) bez autora."""
    books = []
    page = 1
    while True:
        res = strapi_get("/api/books", {
            "filters[mlpId][$notNull]": "true",
            "filters[author][id][$null]": "true",
            "fields[0]": "title",
            "fields[1]": "mlpId",
            "fields[2]": "documentId",
            "pagination[page]": str(page),
            "pagination[pageSize]": "100",
            "publicationState": "preview",   # vrátí i drafty
        })
        data = res.get("data", [])
        if not data:
            break
        books.extend(data)
        meta = res.get("meta", {}).get("pagination", {})
        if page >= meta.get("pageCount", 1):
            break
        page += 1
    return books


# ── OAI-PMH: stáhni jeden záznam podle mlpId ──────────────────────────────────

def fetch_oai_author(mlp_id: str) -> Optional[str]:
    """Stáhne OAI GetRecord pro dané mlpId a vrátí jméno autora nebo None."""
    try:
        resp = requests.get(OAI_BASE, params={
            "verb":           "GetRecord",
            "identifier":     mlp_id,
            "metadataPrefix": OAI_PREFIX,
        }, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"    ⚠ OAI chyba pro {mlp_id}: {e}", flush=True)
        return None

    try:
        root = ET.fromstring(resp.content)
    except ET.ParseError as e:
        print(f"    ⚠ XML parse chyba pro {mlp_id}: {e}", flush=True)
        return None

    marc = root.find(f".//{{{NS_MARC}}}record")
    if marc is None:
        return None

    # MARC pole 100 $a = primární autor, 700 $a = vedlejší
    for tag in ("100", "700"):
        for field in marc.findall(f".//{{{NS_MARC}}}datafield[@tag='{tag}']"):
            sf = field.find(f"{{{NS_MARC}}}subfield[@code='a']")
            if sf is not None and sf.text:
                author = sf.text.strip().rstrip(",. ")
                return author
    return None


# ── Strapi: najdi nebo vytvoř autora ─────────────────────────────────────────

_author_cache: dict = {}


def find_or_create_author(name: str, dry_run: bool = False) -> Optional[str]:
    if name in _author_cache:
        return _author_cache[name]
    if dry_run:
        _author_cache[name] = f"dry-{slugify(name)}"
        return _author_cache[name]

    # Nejprve zkus najít existujícího
    try:
        res = strapi_get("/api/authors", {"filters[name][$eq]": name, "fields[0]": "name"})
        if res.get("data"):
            doc_id = res["data"][0]["documentId"]
            _author_cache[name] = doc_id
            return doc_id
    except Exception as e:
        print(f"    ⚠ Autor lookup '{name}': {e}", flush=True)
        return None

    # Vytvoř nového (s publishedAt → published stav)
    try:
        res = strapi_post("/api/authors", {
            "data": {"name": name, "slug": slugify(name), "publishedAt": now_iso()}
        })
        doc_id = res["data"]["documentId"]
        _author_cache[name] = doc_id
        print(f"    ✓ Autor vytvořen: {name}", flush=True)
        return doc_id
    except Exception as e:
        print(f"    ✗ Nelze vytvořit autora '{name}': {e}", flush=True)
        return None


# ── Hlavní program ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Doplní chybějící autory knih z MLP")
    parser.add_argument("--url",      default="", help="Strapi URL (přepíše env STRAPI_URL)")
    parser.add_argument("--token",    default="", help="Strapi API token (přepíše env STRAPI_TOKEN)")
    parser.add_argument("--dry-run",  action="store_true", help="Simulace – nic nezapisuje")
    parser.add_argument("--limit",    type=int, default=0, help="Max počet knih ke zpracování (0 = vše)")
    args = parser.parse_args()

    global STRAPI_URL, STRAPI_TOKEN
    if args.url:
        STRAPI_URL = args.url
    if args.token:
        STRAPI_TOKEN = args.token

    run_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print("=" * 65, flush=True)
    print(f"  MLP Fix Missing Authors  [{run_time}]", flush=True)
    print("=" * 65, flush=True)
    print(f"  Strapi:   {STRAPI_URL}", flush=True)
    print(f"  Token:    {'nastaven ✓' if STRAPI_TOKEN else '⚠ NENÍ nastaven'}", flush=True)
    print(f"  Dry-run:  {'ANO' if args.dry_run else 'NE'}", flush=True)
    print(flush=True)

    if not args.dry_run and not STRAPI_TOKEN:
        print("  ⚠ STRAPI_TOKEN není nastaven!", flush=True)
        sys.exit(1)

    # Načti knihy bez autora
    print("  Načítám knihy bez autora...", flush=True)
    books = load_books_without_author()

    if args.limit:
        books = books[:args.limit]

    print(f"  ✓ Nalezeno {len(books)} knih bez autora\n", flush=True)

    if not books:
        print("  Vše v pořádku – žádné knihy bez autora.", flush=True)
        print("=" * 65, flush=True)
        return

    fixed = skipped = errors = 0

    for i, book in enumerate(books, 1):
        doc_id  = book["documentId"]
        title   = (book.get("title") or "")[:55]
        mlp_id  = book.get("mlpId", "")

        print(f"  [{i}/{len(books)}] {title}", flush=True)

        if not mlp_id:
            print(f"    ⏭  Bez mlpId – přeskočeno", flush=True)
            skipped += 1
            continue

        # Stáhni autora z MLP
        author_name = fetch_oai_author(mlp_id)
        time.sleep(OAI_DELAY)

        if not author_name:
            print(f"    ⏭  MLP autora nenašel (instrumentální dílo nebo anonymní)", flush=True)
            skipped += 1
            continue

        print(f"    → Autor z MLP: {author_name}", flush=True)

        # Najdi/vytvoř autora ve Strapi
        author_doc_id = find_or_create_author(author_name, args.dry_run)
        if not author_doc_id:
            errors += 1
            continue

        if args.dry_run:
            print(f"    [DRY] Přiřadil by autora {author_name} ke knize {doc_id}", flush=True)
            fixed += 1
            continue

        # Aktualizuj knihu
        try:
            strapi_put(f"/api/books/{doc_id}", {"data": {"author": author_doc_id}})
            print(f"    ✓ Autor přiřazen", flush=True)
            fixed += 1
        except Exception as e:
            print(f"    ✗ Chyba při aktualizaci: {e}", flush=True)
            errors += 1

        time.sleep(DELAY)

    print(flush=True)
    print("=" * 65, flush=True)
    print(f"  ✓ Opraveno:    {fixed}", flush=True)
    print(f"  ⏭  Přeskočeno: {skipped}  (bez mlpId nebo MLP autora nenašel)", flush=True)
    print(f"  ✗ Chyby:       {errors}", flush=True)
    print("=" * 65, flush=True)


if __name__ == "__main__":
    main()
