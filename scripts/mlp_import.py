#!/usr/bin/env python3
"""
MLP → Strapi Import
====================
Importuje výstup mlp_scraper.py do Strapi backendu přes REST API.

Co dělá:
  1. Načte JSON ze scraperu
  2. Pro každou knihu zkontroluje duplicitu (mlpId)
  3. Pokud autor neexistuje → vytvoří ho
  4. Vytvoří knihu s externalLinks + coverExternalUrl
  5. Nastaví status na published

Spuštění:
    python mlp_import.py                          # import z mlp_books.json
    python mlp_import.py --input mlp_books.json   # jiný vstupní soubor
    python mlp_import.py --dry-run                # jen simulace, nezapíše do Strapi
    python mlp_import.py --category "Česká literatura"  # přiřadit kategorii

Prerekvizity:
    pip install requests
    Strapi musí běžet + mít API token nastavený níže
"""

import argparse
import json
import os
import re
import sys
import time
import unicodedata
from typing import Optional

import requests

# Oprava Windows cp1250 encoding
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ──────────────────────────────────────────────
# KONFIGURACE – upravte dle svého prostředí
# ──────────────────────────────────────────────

STRAPI_URL = os.getenv("STRAPI_URL", "http://localhost:1337")
STRAPI_TOKEN = os.getenv("STRAPI_TOKEN", "")  # API token ze Strapi adminu

# Pauza mezi požadavky (sekundy) – buďte ohleduplní k serveru
DELAY = 0.3


# ──────────────────────────────────────────────
# Strapi API helpers
# ──────────────────────────────────────────────

def headers() -> dict:
    h = {"Content-Type": "application/json"}
    if STRAPI_TOKEN:
        h["Authorization"] = f"Bearer {STRAPI_TOKEN}"
    return h


def strapi_get(path: str, params: dict = None) -> dict:
    resp = requests.get(f"{STRAPI_URL}{path}", headers=headers(), params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


def strapi_post(path: str, data: dict) -> dict:
    resp = requests.post(f"{STRAPI_URL}{path}", headers=headers(), json=data, timeout=15)
    if not resp.ok:
        print(f"  ✗ POST {path} → {resp.status_code}: {resp.text[:200]}")
        resp.raise_for_status()
    return resp.json()


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:200]


# ──────────────────────────────────────────────
# Author helpers
# ──────────────────────────────────────────────

_author_cache: dict[str, str] = {}  # name → documentId


def find_or_create_author(name: str, dry_run: bool = False) -> Optional[str]:
    """Najde autora podle jména nebo ho vytvoří. Vrátí documentId."""
    if name in _author_cache:
        return _author_cache[name]

    # V dry-run módu přeskočíme všechna volání Strapi
    if dry_run:
        _author_cache[name] = f"dry-author-{slugify(name)}"
        return _author_cache[name]

    # Hledáme v Strapi
    try:
        result = strapi_get("/api/authors", {"filters[name][$eq]": name, "fields[0]": "name"})
        if result.get("data"):
            doc_id = result["data"][0]["documentId"]
            _author_cache[name] = doc_id
            return doc_id
    except Exception as e:
        print(f"    ⚠ Chyba při hledání autora '{name}': {e}")
        return None

    # Autor neexistuje → vytvoříme

    try:
        result = strapi_post("/api/authors", {
            "data": {
                "name": name,
                "slug": slugify(name),
            }
        })
        doc_id = result["data"]["documentId"]
        _author_cache[name] = doc_id
        print(f"    ✓ Autor vytvořen: {name}")
        return doc_id
    except Exception as e:
        print(f"    ✗ Nelze vytvořit autora '{name}': {e}")
        return None


# ──────────────────────────────────────────────
# Category helper
# ──────────────────────────────────────────────

_category_cache: dict[str, str] = {}


def find_or_create_category(name: str, dry_run: bool = False) -> Optional[str]:
    """Najde kategorii nebo ji vytvoří. Vrátí documentId."""
    if not name:
        return None
    if name in _category_cache:
        return _category_cache[name]

    if dry_run:
        _category_cache[name] = f"dry-cat-{slugify(name)}"
        return _category_cache[name]

    try:
        result = strapi_get("/api/categories", {"filters[name][$eq]": name, "fields[0]": "name"})
        if result.get("data"):
            doc_id = result["data"][0]["documentId"]
            _category_cache[name] = doc_id
            return doc_id
    except Exception:
        pass

    try:
        result = strapi_post("/api/categories", {
            "data": {"name": name, "slug": slugify(name)}
        })
        doc_id = result["data"]["documentId"]
        _category_cache[name] = doc_id
        print(f"    ✓ Kategorie vytvořena: {name}")
        return doc_id
    except Exception as e:
        print(f"    ✗ Nelze vytvořit kategorii '{name}': {e}")
        return None


# ──────────────────────────────────────────────
# Duplicita check
# ──────────────────────────────────────────────

def book_exists(mlp_id: str) -> bool:
    """Zkontroluje, zda kniha s daným mlpId už existuje."""
    try:
        result = strapi_get("/api/books", {
            "filters[mlpId][$eq]": mlp_id,
            "fields[0]": "mlpId",
        })
        return len(result.get("data", [])) > 0
    except Exception:
        return False


# ──────────────────────────────────────────────
# Slug uniqueness
# ──────────────────────────────────────────────

def make_unique_slug(base_slug: str) -> str:
    """Zajistí unikátnost slugu přidáním sufixu pokud je potřeba."""
    slug = base_slug
    counter = 1
    while True:
        try:
            result = strapi_get("/api/books", {
                "filters[slug][$eq]": slug,
                "fields[0]": "slug",
            })
            if not result.get("data"):
                return slug
        except Exception:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


# ──────────────────────────────────────────────
# Import jedné knihy
# ──────────────────────────────────────────────

def import_book(book: dict, category_id: Optional[str], dry_run: bool) -> bool:
    """
    Importuje jednu knihu do Strapi.
    Vrátí True při úspěchu.
    """
    mlp_id = book.get("mlpId", "")
    title = book.get("title", "").strip()

    if not title:
        print(f"  ✗ Přeskočeno (chybí název)")
        return False

    # Kontrola duplicity (přeskočíme v dry-run)
    if not dry_run and mlp_id and book_exists(mlp_id):
        print(f"  ⏭ Přeskočeno (již existuje): {title[:50]}")
        return False

    # Autor
    author_id = None
    if book.get("author"):
        author_id = find_or_create_author(book["author"], dry_run)

    # Slug
    base_slug = book.get("slug") or slugify(title)
    slug = base_slug if dry_run else make_unique_slug(base_slug)

    # Data pro Strapi
    data = {
        "title": title,
        "slug": slug,
        "description": book.get("description") or "",
        "isFree": True,
        "isFeatured": False,
        "downloads": 0,
        "externalLinks": book.get("links", []),
        "coverExternalUrl": book.get("coverUrl"),
        "mlpId": mlp_id,
    }

    if author_id:
        data["author"] = author_id

    if category_id:
        data["category"] = category_id

    if dry_run:
        print(f"  [DRY] {title[:60]} | autor: {book.get('author', '—')} | formáty: {[l['format'] for l in book.get('links', [])]}")
        return True

    try:
        result = strapi_post("/api/books", {"data": data})
        new_id = result.get("data", {}).get("documentId", "?")
        print(f"  ✓ [{new_id}] {title[:60]}")
        return True
    except Exception as e:
        print(f"  ✗ Chyba: {e} | {title[:40]}")
        return False


# ──────────────────────────────────────────────
# Hlavní program
# ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="MLP → Strapi Import")
    parser.add_argument("--input", default="mlp_books.json",
                        help="Vstupní JSON soubor (výstup ze scraperu)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Simulace – nezapisuje do Strapi")
    parser.add_argument("--category", default="",
                        help="Název kategorie pro všechny importované knihy")
    parser.add_argument("--token", default="",
                        help="Strapi API token (alternativa k env STRAPI_TOKEN)")
    parser.add_argument("--url", default="",
                        help="Strapi URL (default: http://localhost:1337)")
    args = parser.parse_args()

    global STRAPI_URL, STRAPI_TOKEN
    if args.url:
        STRAPI_URL = args.url
    if args.token:
        STRAPI_TOKEN = args.token

    print("=" * 60)
    print("  MLP → Strapi Import")
    print("=" * 60)
    print(f"  Strapi:   {STRAPI_URL}")
    print(f"  Token:    {'nastaven ✓' if STRAPI_TOKEN else '⚠ NENÍ nastaven'}")
    print(f"  Vstup:    {args.input}")
    print(f"  Kategorie: {args.category or '(žádná)'}")
    print(f"  Dry-run:  {'ANO' if args.dry_run else 'NE'}")
    print()

    if not STRAPI_TOKEN and not args.dry_run:
        print("  ⚠ VAROVÁNÍ: Strapi API token není nastaven!")
        print("  Nastav env proměnnou STRAPI_TOKEN nebo použij --token <token>")
        print("  Token získáš v Strapi admin → Settings → API Tokens")
        print()

    # Načíst vstupní soubor
    try:
        with open(args.input, encoding="utf-8") as f:
            books = json.load(f)
    except FileNotFoundError:
        print(f"  ✗ Soubor '{args.input}' nenalezen. Nejdřív spusť mlp_scraper.py")
        sys.exit(1)

    print(f"  Načteno {len(books)} knih ze souboru.\n")

    # Kategorie
    category_id = None
    if args.category:
        category_id = find_or_create_category(args.category, args.dry_run)
        if category_id:
            print(f"  Kategorie '{args.category}' → {category_id}\n")

    # Testové připojení k Strapi
    if not args.dry_run:
        try:
            strapi_get("/api/books", {"pagination[pageSize]": "1"})
            print("  ✓ Připojení ke Strapi OK\n")
        except Exception as e:
            print(f"  ✗ Nelze se připojit ke Strapi: {e}")
            print("  Ujisti se, že Strapi běží a token je správný.")
            sys.exit(1)

    # Import knih
    success = 0
    skipped = 0
    failed = 0

    for i, book in enumerate(books, 1):
        title = book.get("title", "?")[:50]
        print(f"[{i:>3}/{len(books)}] {title}")

        ok = import_book(book, category_id, args.dry_run)
        if ok:
            success += 1
        elif "existuje" in title or book_exists(book.get("mlpId", "")):
            skipped += 1
        else:
            skipped += 1

        if not args.dry_run:
            time.sleep(DELAY)

    print()
    print("=" * 60)
    print(f"  ✓ Importováno: {success}")
    print(f"  ⏭ Přeskočeno: {skipped}")
    print(f"  ✗ Chyby:      {failed}")
    print("=" * 60)

    if not args.dry_run and success > 0:
        print()
        print("  ⚠ Nezapomeň v Strapi adminu:")
        print("  1. Settings → Roles → Public → book: zaškrtnout find, findOne")
        print("  2. Zkontrolovat importované knihy v Content Manager")


if __name__ == "__main__":
    main()
