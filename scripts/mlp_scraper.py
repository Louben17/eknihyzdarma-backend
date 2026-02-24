#!/usr/bin/env python3
"""
MLP OAI-PMH Scraper
====================
Stahuje metadata volně dostupných e-knih z Městské knihovny Praha (MLP).
Využívá OAI-PMH protokol, výstup je JSON soubor s metadaty a linky ke stažení.

Spuštění:
    python mlp_scraper.py            # 20 knih (test)
    python mlp_scraper.py --limit 100
    python mlp_scraper.py --limit 0  # všechny (~3400)
    python mlp_scraper.py --output moje_knihy.json
"""

import argparse
import json
import sys
import time
import unicodedata
import xml.etree.ElementTree as ET
from typing import Optional

import requests

# Oprava Windows cp1250 encoding – nutné pro české znaky a emoji v konzoli
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# OAI-PMH endpoint MLP
OAI_BASE = "http://web2.mlp.cz/cgi/oai"
OAI_SET = "ebook"
OAI_PREFIX = "marc21"

# XML namespaces
NS_OAI = "http://www.openarchives.org/OAI/2.0/"
NS_MARC = "http://www.loc.gov/MARC21/slim"

# Formáty ke stažení (ext → label)
FORMAT_MAP = {
    "epub": "EPUB",
    "pdf": "PDF",
    "prc": "PRC",
    "mobi": "MOBI",
    "txt": "TXT",
    "html": "HTML",
    "rtf": "RTF",
    "pdb": "PDB",
}

# Prioritní formáty pro náš web (ostatní ignorujeme pro přehlednost)
PRIORITY_FORMATS = {"epub", "pdf", "prc", "mobi"}


# ──────────────────────────────────────────────
# MARC21 helpers
# ──────────────────────────────────────────────

def get_subfield(record: ET.Element, tag: str, code: str) -> Optional[str]:
    """Vrátí první hodnotu subfieldu z MARC21 záznamu."""
    for field in record.findall(f".//{{{NS_MARC}}}datafield[@tag='{tag}']"):
        sf = field.find(f"{{{NS_MARC}}}subfield[@code='{code}']")
        if sf is not None and sf.text:
            return sf.text.strip()
    return None


def get_all_subfields(record: ET.Element, tag: str, code: str) -> list[str]:
    """Vrátí všechny hodnoty subfieldu."""
    results = []
    for field in record.findall(f".//{{{NS_MARC}}}datafield[@tag='{tag}']"):
        sf = field.find(f"{{{NS_MARC}}}subfield[@code='{code}']")
        if sf is not None and sf.text:
            results.append(sf.text.strip())
    return results


def parse_856_fields(record: ET.Element) -> tuple[list[dict], Optional[str]]:
    """
    Zpracuje všechna pole 856 (URL linky).
    Vrátí (seznam download linků, URL obálky).
    """
    links = []
    cover_url = None

    for field in record.findall(f".//{{{NS_MARC}}}datafield[@tag='856']"):
        url_el = field.find(f"{{{NS_MARC}}}subfield[@code='u']")
        label_el = field.find(f"{{{NS_MARC}}}subfield[@code='z']")

        if url_el is None or not url_el.text:
            continue

        url = url_el.text.strip()
        label = label_el.text.strip() if label_el is not None else ""

        # Detekce obálky
        if url.endswith(".jpg") or "obálka" in label.lower() or "obalka" in label.lower():
            cover_url = url
            continue

        # Detekce formátu
        ext = url.rsplit(".", 1)[-1].lower() if "." in url else ""
        if ext in FORMAT_MAP:
            links.append({
                "url": url,
                "format": FORMAT_MAP[ext],
                "ext": ext,
                "label": label,
            })

    # Seřadit podle priority (epub první)
    priority_order = ["epub", "pdf", "prc", "mobi", "html", "txt", "rtf", "pdb"]
    links.sort(key=lambda x: priority_order.index(x["ext"]) if x["ext"] in priority_order else 99)

    return links, cover_url


def slugify(text: str) -> str:
    """Převede text na URL slug."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = "".join(c if c.isalnum() or c == " " else "-" for c in text)
    text = "-".join(text.split())
    text = text.strip("-")
    return text[:200]


# ──────────────────────────────────────────────
# Zpracování záznamu
# ──────────────────────────────────────────────

def parse_record(record_el: ET.Element) -> Optional[dict]:
    """Zpracuje jeden OAI-PMH záznam, vrátí dict nebo None."""

    # Zkontrolujeme, zda záznam není smazán
    header = record_el.find(f"{{{NS_OAI}}}header")
    if header is not None and header.get("status") == "deleted":
        return None

    marc = record_el.find(f".//{{{NS_MARC}}}record")
    if marc is None:
        return None

    # OAI identifikátor
    id_el = header.find(f"{{{NS_OAI}}}identifier") if header is not None else None
    oai_id = id_el.text.strip() if id_el is not None else None

    # Název – MARC 245 $a (hlavní) + $b (vedlejší)
    title_a = get_subfield(marc, "245", "a") or ""
    title_b = get_subfield(marc, "245", "b") or ""
    title = (title_a.rstrip("/ :") + (" " + title_b.rstrip("/ :") if title_b else "")).strip()
    if not title:
        return None

    # Autor – MARC 100 $a (primární), nebo 700 $a (přidaný)
    author = get_subfield(marc, "100", "a") or get_subfield(marc, "700", "a")
    if author:
        author = author.rstrip(",. ").strip()

    # Popis – MARC 520 $a
    description = get_subfield(marc, "520", "a")

    # Rok vydání – z MARC 008 (znaky 7-10)
    year = None
    ctrl008 = marc.find(f".//{{{NS_MARC}}}controlfield[@tag='008']")
    if ctrl008 is not None and ctrl008.text and len(ctrl008.text) >= 11:
        year_str = ctrl008.text[7:11].strip()
        if year_str.isdigit():
            year = int(year_str)

    # Témata – MARC 650 $a
    topics = get_all_subfields(marc, "650", "a")
    topics = [t.rstrip(".,;") for t in topics if t]

    # Linky ke stažení a obálka
    links, cover_url = parse_856_fields(marc)

    # Filtrujeme jen prioritní formáty pro náš web
    main_links = [lnk for lnk in links if lnk["ext"] in PRIORITY_FORMATS]

    if not main_links:
        return None  # Kniha bez stažitelných formátů – přeskočíme

    return {
        "mlpId": oai_id,
        "title": title,
        "slug": slugify(title),
        "author": author,
        "description": description,
        "year": year,
        "topics": topics,
        "coverUrl": cover_url,
        "links": main_links,  # jen EPUB, PDF, PRC, MOBI
        "allLinks": links,    # kompletní seznam pro referenci
    }


# ──────────────────────────────────────────────
# OAI-PMH stránkování
# ──────────────────────────────────────────────

def fetch_all_records(limit: int = 20, delay: float = 1.0) -> list[dict]:
    """
    Stáhne záznamy z OAI-PMH endpointu.
    limit=0 znamená stáhnout vše.
    """
    books = []
    params = {
        "verb": "ListRecords",
        "set": OAI_SET,
        "metadataPrefix": OAI_PREFIX,
    }
    resumption_token = None
    page = 0

    while True:
        page += 1
        print(f"  Stránka {page} | staženo: {len(books)}", end="")
        if limit > 0:
            print(f" / {limit}", end="")
        print()

        if resumption_token:
            params = {"verb": "ListRecords", "resumptionToken": resumption_token}

        try:
            resp = requests.get(OAI_BASE, params=params, timeout=30)
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"\n  ✗ Chyba při stahování: {e}")
            break

        try:
            root = ET.fromstring(resp.content)
        except ET.ParseError as e:
            print(f"\n  ✗ Chyba XML parsování: {e}")
            break

        list_records = root.find(f"{{{NS_OAI}}}ListRecords")
        if list_records is None:
            print("  ✗ ListRecords element nenalezen")
            break

        for record_el in list_records.findall(f"{{{NS_OAI}}}record"):
            book = parse_record(record_el)
            if book:
                books.append(book)
                print(f"    [{len(books):>4}] {book['title'][:60]:<60} – {book.get('author', '—')}")

            if limit > 0 and len(books) >= limit:
                print(f"\n  ✓ Dosažen limit {limit} knih")
                return books

        # Resumption token pro další stránku
        token_el = list_records.find(f"{{{NS_OAI}}}resumptionToken")
        if token_el is not None and token_el.text and token_el.text.strip():
            resumption_token = token_el.text.strip()
            time.sleep(delay)
        else:
            print("  ✓ Žádné další stránky")
            break

    return books


# ──────────────────────────────────────────────
# Hlavní program
# ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="MLP OAI-PMH Scraper")
    parser.add_argument("--limit", type=int, default=20,
                        help="Počet knih ke stažení (0 = vše, default: 20)")
    parser.add_argument("--output", default="mlp_books.json",
                        help="Výstupní JSON soubor (default: mlp_books.json)")
    parser.add_argument("--delay", type=float, default=1.0,
                        help="Pauza mezi stránkami v sekundách (default: 1.0)")
    args = parser.parse_args()

    print("=" * 60)
    print("  MLP E-books Scraper")
    print("  Zdroj: Městská knihovna Praha (OAI-PMH)")
    print("=" * 60)
    if args.limit == 0:
        print(f"  Režim: stáhnout VŠECHNY knihy")
    else:
        print(f"  Limit: {args.limit} knih")
    print(f"  Výstup: {args.output}")
    print()

    books = fetch_all_records(limit=args.limit, delay=args.delay)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print()
    print("=" * 60)
    print(f"  ✓ Uloženo {len(books)} knih → {args.output}")

    # Statistiky
    with_cover = sum(1 for b in books if b.get("coverUrl"))
    with_desc = sum(1 for b in books if b.get("description"))
    formats = {}
    for b in books:
        for lnk in b.get("links", []):
            formats[lnk["ext"]] = formats.get(lnk["ext"], 0) + 1

    print(f"  📸 S obálkou:   {with_cover}/{len(books)}")
    print(f"  📝 S popisem:   {with_desc}/{len(books)}")
    print(f"  📁 Formáty:     {dict(sorted(formats.items(), key=lambda x: -x[1]))}")
    print("=" * 60)

    if books:
        print("\n  Ukázka první knihy:")
        b = books[0]
        print(f"    Název:   {b['title']}")
        print(f"    Autor:   {b.get('author', '—')}")
        print(f"    Obálka:  {b.get('coverUrl', '—')}")
        print(f"    Linky:   {[f['format'] for f in b['links']]}")
        if b.get("description"):
            print(f"    Popis:   {b['description'][:120]}...")


if __name__ == "__main__":
    main()
