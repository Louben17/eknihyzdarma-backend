#!/usr/bin/env python3
"""
Author Photos from Wikipedia
=============================
Hledá fotky autorů na Wikipedii (CS → EN) a nahrává je do Strapi.
Zpracovává POUZE autory BEZ stávající fotky. Existující fotky nemazá.

Použití:
    py author_photos.py
    py author_photos.py --dry-run      # jen výpis co by se dělalo
    py author_photos.py --start 50     # pokračovat od pozice 50
"""

import argparse
import sys
import time
import re
import os

import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ── Konfigurace ──────────────────────────────────────────
STRAPI_URL = os.getenv("STRAPI_URL", "https://eknihyzdarma-backend-1.onrender.com")
TOKEN = os.getenv("STRAPI_TOKEN", "f336ce288b5630eaa259b8013754b07982841afcdbaa2c58605721ee4e50c5bdecee0b6163a97be4879a93f76e6e2ca1a2add9f586de922f4064054098c104bce3ad367a46e08fd478c722cdfa51068d4292f24d12569d35444d53393c048e19f3511e56c56aff628297ce143de14954f1c1892c23d0b3722685045417b87e4c")

DELAY_WIKI  = 0.4   # pauza mezi Wiki dotazy
DELAY_STRAPI = 0.5  # pauza mezi Strapi operacemi

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "eknihyzdarma.cz/1.0 (public library; contact@eknihyzdarma.cz)"})

# ── Strapi helpers ────────────────────────────────────────

def strapi_headers():
    return {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}


def get_authors_without_photo(start_page=1):
    """Vrátí všechny autory bez fotky jako list dictů {name, documentId, slug}."""
    authors = []
    page = start_page
    while True:
        r = SESSION.get(f"{STRAPI_URL}/api/authors", params={
            "pagination[page]": page,
            "pagination[pageSize]": 100,
            "fields[0]": "name",
            "fields[1]": "slug",
            "populate[photo][fields][0]": "url",
            "sort": "name:asc",
        }, headers={"Authorization": f"Bearer {TOKEN}"}, timeout=20)
        r.raise_for_status()
        data = r.json()
        batch = data.get("data", [])
        if not batch:
            break
        for a in batch:
            if not a.get("photo"):
                authors.append({
                    "name": a["name"],
                    "documentId": a["documentId"],
                    "slug": a.get("slug", ""),
                })
        total_pages = data.get("meta", {}).get("pagination", {}).get("pageCount", 1)
        if page >= total_pages:
            break
        page += 1
        time.sleep(0.2)
    return authors


def upload_image(image_bytes: bytes, filename: str, mime: str) -> int | None:
    """Nahraje obrázek do Strapi media library, vrátí numeric id."""
    try:
        r = SESSION.post(
            f"{STRAPI_URL}/api/upload",
            headers={"Authorization": f"Bearer {TOKEN}"},
            files={"files": (filename, image_bytes, mime)},
            timeout=60,
        )
        if not r.ok:
            return None
        result = r.json()
        if isinstance(result, list) and result:
            return result[0]["id"]
        return None
    except Exception:
        return None


def set_author_photo(doc_id: str, file_id: int) -> bool:
    """Nastaví photo pole u autora."""
    r = SESSION.put(
        f"{STRAPI_URL}/api/authors/{doc_id}",
        headers=strapi_headers(),
        json={"data": {"photo": file_id}},
        timeout=15,
    )
    return r.ok


# ── Jméno → zobrazitelná forma ─────────────────────────────

def marc_to_display(name: str) -> str:
    """'Dostojevskij, Fjodor Michajlovič' → 'Fjodor Michajlovič Dostojevskij'"""
    if "," in name:
        parts = [p.strip() for p in name.split(",", 1)]
        if parts[1]:
            return f"{parts[1]} {parts[0]}"
    return name


def name_variants(name: str) -> list[str]:
    """Vrátí seznam variant jména pro hledání na Wikipedii."""
    display = marc_to_display(name)
    variants = []
    if display != name:
        variants.append(display)
    variants.append(name)
    # Zkrácená verze (pouze jméno + příjmení, bez středního jména)
    words = display.split()
    if len(words) >= 3:
        short = f"{words[0]} {words[-1]}"
        if short not in variants:
            variants.append(short)
    return variants


# ── Wikipedia lookup ──────────────────────────────────────

def wikipedia_thumbnail(name: str) -> tuple[str, str] | None:
    """
    Hledá thumbnail autora na CS pak EN Wikipedii.
    Vrátí (url, source_lang) nebo None.
    """
    for variant in name_variants(name):
        wiki_title = variant.strip().replace(" ", "_")
        # Filtruj nesmyslné výrazy
        if not wiki_title or len(wiki_title) < 3:
            continue

        for lang in ("cs", "en"):
            try:
                r = SESSION.get(
                    f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{wiki_title}",
                    timeout=10,
                )
                time.sleep(DELAY_WIKI)
                if not r.ok:
                    continue
                data = r.json()
                # Přijmout jen jednoznačné stránky s obrázkem
                if data.get("type") not in ("standard",):
                    continue
                thumb = data.get("thumbnail", {}).get("source")
                if thumb:
                    # Zvýšit rozlišení: Wikipedia vrací /320px-, chceme /400px-
                    thumb = re.sub(r"/\d+px-", "/400px-", thumb)
                    return thumb, lang
            except Exception:
                pass
    return None


# ── Stažení obrázku ───────────────────────────────────────

def download_image(url: str) -> tuple[bytes, str] | None:
    """Stáhne obrázek, vrátí (bytes, mime_type) nebo None."""
    try:
        r = SESSION.get(url, timeout=20)
        if r.ok and r.headers.get("content-type", "").startswith("image/"):
            return r.content, r.headers["content-type"].split(";")[0]
    except Exception:
        pass
    return None


# ── Hlavní logika ─────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Author Photos from Wikipedia")
    parser.add_argument("--dry-run", action="store_true", help="Nesahej na Strapi, jen vypiš")
    parser.add_argument("--start", type=int, default=0, help="Přeskočit prvních N autorů")
    args = parser.parse_args()

    print("=" * 60)
    print("  Author Photos – Wikipedia Scraper")
    print("=" * 60)
    print(f"  Strapi: {STRAPI_URL}")
    print(f"  Dry-run: {'ANO' if args.dry_run else 'NE'}")
    print()

    print("  Načítám autory bez fotky ze Strapi...")
    authors = get_authors_without_photo()
    total = len(authors)
    print(f"  ✓ {total} autorů bez fotky\n", flush=True)

    if args.start:
        authors = authors[args.start:]
        print(f"  Přeskakuji prvních {args.start}, zbývá {len(authors)}\n")

    found = 0
    skipped = 0
    errors = 0

    for i, author in enumerate(authors, 1 + args.start):
        name = author["name"]
        doc_id = author["documentId"]

        result = wikipedia_thumbnail(name)
        if not result:
            print(f"[{i:>4}/{total}] — {name[:50]}", flush=True)
            skipped += 1
            continue

        thumb_url, lang = result
        print(f"[{i:>4}/{total}] ✓ {name[:50]} | {lang}.wiki", flush=True)

        if args.dry_run:
            found += 1
            continue

        # Stáhnout obrázek
        img_data = download_image(thumb_url)
        if not img_data:
            print(f"         ✗ nelze stáhnout: {thumb_url[:60]}")
            errors += 1
            continue
        img_bytes, mime = img_data
        ext = mime.split("/")[-1].replace("jpeg", "jpg")
        filename = f"author_{author['slug'] or doc_id}.{ext}"

        # Nahrát do Strapi
        file_id = upload_image(img_bytes, filename, mime)
        if not file_id:
            print(f"         ✗ upload selhal")
            errors += 1
            time.sleep(DELAY_STRAPI)
            continue

        # Aktualizovat autora
        ok = set_author_photo(doc_id, file_id)
        if ok:
            found += 1
        else:
            print(f"         ✗ set_photo selhal")
            errors += 1

        time.sleep(DELAY_STRAPI)

    print()
    print("=" * 60)
    print(f"  ✓ Fotky přidány: {found}")
    print(f"  — Nenalezeno:   {skipped}")
    print(f"  ✗ Chyby:        {errors}")
    print("=" * 60)


if __name__ == "__main__":
    main()
