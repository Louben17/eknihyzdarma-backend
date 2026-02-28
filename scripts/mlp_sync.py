#!/usr/bin/env python3
"""
MLP Auto-sync
=============
Automaticky sleduje MLP (Městská knihovna Praha) přes OAI-PMH protokol
a importuje nově přidané e-knihy do Strapi backendu.

Stav (datum posledního běhu) ukládá do mlp_sync_state.json ve stejné složce.

Spuštění (ruční):
    python3 mlp_sync.py --url http://localhost:1337 --token <TOKEN>
    python3 mlp_sync.py --dry-run            # simulace – nic nezapíše
    python3 mlp_sync.py --from 2024-01-01    # přepsat datum "od kdy"

Cron (každou noc ve 3:00):
    0 3 * * * cd /var/www/eknihyzdarma-backend/scripts && \\
        python3 mlp_sync.py --url http://localhost:1337 --token <TOKEN> \\
        >> /var/log/mlp_sync.log 2>&1

Prerekvizity:
    pip3 install requests
    STRAPI_TOKEN musí mít práva: books.create, authors.create, categories.create
"""

import argparse
import json
import os
import re
import sys
import time
import unicodedata
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests

# ── Encoding fix (Windows) ───────────────────────────────────────────────────
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ── Konfigurace ──────────────────────────────────────────────────────────────

OAI_BASE    = "http://web2.mlp.cz/cgi/oai"
OAI_SET     = "ebook"
OAI_PREFIX  = "marc21"

STRAPI_URL   = os.getenv("STRAPI_URL",   "http://localhost:1337")
STRAPI_TOKEN = os.getenv("STRAPI_TOKEN", "")

DELAY = 0.4          # pauza mezi Strapi požadavky (s)
OAI_DELAY = 1.5      # pauza mezi OAI stránkami (s)

# Soubor stavu – uloží datum posledního úspěšného běhu
SCRIPT_DIR  = Path(__file__).parent
STATE_FILE  = SCRIPT_DIR / "mlp_sync_state.json"

# XML jmenné prostory
NS_OAI  = "http://www.openarchives.org/OAI/2.0/"
NS_MARC = "http://www.loc.gov/MARC21/slim"

# Formáty ke stažení
FORMAT_MAP      = {"epub": "EPUB", "pdf": "PDF", "prc": "PRC", "mobi": "MOBI",
                   "txt": "TXT", "html": "HTML", "rtf": "RTF", "pdb": "PDB"}
PRIORITY_FORMATS = {"epub", "pdf", "prc", "mobi"}

# ── Kategorizace (přeneseno z mlp_import_v2.py) ──────────────────────────────

TOPIC_EXACT = {
    "česká literatura": "Česká literatura",
    "slovenská literatura": "Slovenská literatura",
    "světová literatura": "Světová literatura",
    "anglická literatura": "Světová literatura",
    "americká literatura": "Světová literatura",
    "francouzská literatura": "Světová literatura",
    "německá literatura": "Světová literatura",
    "ruská literatura": "Světová literatura",
    "polská literatura": "Světová literatura",
    "italská literatura": "Světová literatura",
    "španělská literatura": "Světová literatura",
    "skandinávská literatura": "Světová literatura",
    "maďarská literatura": "Světová literatura",
    "japonská literatura": "Světová literatura",
    "norská literatura": "Světová literatura",
    "detektivní literatura": "Detektivní",
    "detektivky": "Detektivní",
    "kriminální literatura": "Detektivní",
    "science fiction": "Sci-fi",
    "vědeckofantastická literatura": "Sci-fi",
    "fantasy": "Fantasy",
    "fantasy literatura": "Fantasy",
    "horor": "Horor",
    "horory": "Horor",
    "thriller": "Thriller",
    "thrillery": "Thriller",
    "dobrodružná literatura": "Dobrodružná",
    "romantická literatura": "Romance",
    "romance": "Romance",
    "milostná literatura": "Romance",
    "historická literatura": "Historická beletrie",
    "historická beletrie": "Historická beletrie",
    "literatura faktu": "Literatura faktu",
    "populárně naučná literatura": "Literatura faktu",
    "naučná literatura": "Literatura faktu",
    "dětská literatura": "Dětská literatura",
    "literatura pro děti a mládež": "Dětská literatura",
    "pohádky": "Dětská literatura",
    "biografie": "Biografie",
    "autobiografie": "Biografie",
    "memoáry": "Biografie",
    "paměti": "Biografie",
    "cestovní literatura": "Cestování",
    "cestopisy": "Cestování",
    "humor": "Humor",
    "humoristická literatura": "Humor",
    "satira": "Humor",
    "poezie": "Poezie",
    "básně": "Poezie",
    "drama": "Drama",
    "divadelní hry": "Drama",
    "beletrie": "Beletrie",
    "próza": "Beletrie",
    "eseje": "Esejistika",
    "filosofie": "Filosofie",
    "filozofie": "Filosofie",
    "psychologie": "Psychologie",
    "erotická literatura": "Erotická literatura",
}

TOPIC_KEYWORDS = [
    ("česká lit", "Česká literatura"), ("slovenská lit", "Slovenská literatura"),
    ("světová lit", "Světová literatura"), ("anglická lit", "Světová literatura"),
    ("americká lit", "Světová literatura"), ("francouzská lit", "Světová literatura"),
    ("německá lit", "Světová literatura"), ("ruská lit", "Světová literatura"),
    ("detektiv", "Detektivní"), ("kriminál", "Detektivní"),
    ("science fiction", "Sci-fi"), ("vědeckofant", "Sci-fi"),
    ("fantasy", "Fantasy"), ("horor", "Horor"), ("thriller", "Thriller"),
    ("dobrodruž", "Dobrodružná"), ("romantick", "Romance"), ("milostn", "Romance"),
    ("historick", "Historická beletrie"), ("populárně", "Literatura faktu"),
    ("naučná", "Literatura faktu"), ("dětská", "Dětská literatura"),
    ("pro děti", "Dětská literatura"), ("pohádky", "Dětská literatura"),
    ("biografi", "Biografie"), ("autobiografi", "Biografie"),
    ("memoár", "Biografie"), ("paměti", "Biografie"),
    ("cestopi", "Cestování"), ("cestovní", "Cestování"),
    ("humor", "Humor"), ("satir", "Humor"),
    ("básn", "Poezie"), ("poezie", "Poezie"), ("lyrik", "Poezie"),
    ("drama", "Drama"), ("divadel", "Drama"),
    ("erotick", "Erotická literatura"), ("filosofi", "Filosofie"),
    ("filozofi", "Filosofie"), ("psychologi", "Psychologie"),
]

TITLE_GENRE_KEYWORDS = [
    (["zpěvy", "básn", "balada", "epigramy", "haiku", "elegie", "sonety",
      "verše", "verš", "žalmy", "óda"], "Poezie"),
    (["komedie o", "tragédie", "zpěvohra", "fraška", "drama o", "divadeln"], "Drama"),
    (["pohádky", "pohádka", "pohádkové", "pro děti", "pro mládež"], "Dětská literatura"),
    (["dobrodružství", "dobrodružný"], "Dobrodružná"),
    (["paměti", "memoáry", "zápisky", "deník"], "Biografie"),
    (["cesta do", "cesta kolem", "cestopis", "expedice"], "Cestování"),
]

FOREIGN_SURNAMES = {
    "dostojevskij", "tolstoj", "turgenev", "bulgakov", "čechov", "zamjatin",
    "puškin", "gogol", "gorkij", "ostrovskij", "bunin", "lermontov",
    "goethe", "schiller", "kafka", "mann", "rilke", "hesse", "brecht",
    "schnitzler", "musil", "zweig", "werfel", "fontane", "kleist",
    "hugo", "proust", "flaubert", "zola", "balzac", "molière", "voltaire",
    "dumas", "maupassant", "rolland", "stendhal", "rostand", "verne",
    "dickens", "hardy", "joyce", "woolf", "lawrence", "kipling",
    "thackeray", "austen", "wilde", "swift", "shakespeare", "shelley",
    "poe", "london", "fitzgerald", "hemingway", "dreiser", "crane",
    "melville", "twain", "whitman", "faulkner", "o'neill", "mitchell",
    "ibsen", "hamsun", "andersen", "strindberg", "heidenstam",
    "pirandello", "goldoni", "boccaccio", "leopardi",
    "cervantes", "lorca", "vega", "unamuno",
    "homéros", "sofokles", "euripidés", "aristofanés",
    "ovidius", "catullus", "tacitus", "caesar", "vergilius",
    "cicero", "seneca", "sienkiewicz", "doyle", "chesterton",
    "scott", "carducci", "stevenson", "hearn",
}


def detect_genre_from_title(title: str) -> Optional[str]:
    t = title.lower()
    for keywords, genre in TITLE_GENRE_KEYWORDS:
        if any(k in t for k in keywords):
            return genre
    return None


def is_foreign_author(author: Optional[str]) -> bool:
    if not author:
        return False
    parts = author.split(",")
    surname = parts[0].lower().strip()
    if surname in FOREIGN_SURNAMES:
        return True
    if len(parts) > 1:
        rest = parts[1].lower().strip()
        for word in rest.split()[1:]:
            if word.endswith(("ič", "evna", "ovna", "jevna")):
                return True
    low = author.lower()
    if " von " in low or " de " in low or " del " in low:
        return True
    return False


def pick_category(topics: list, author: Optional[str] = None,
                  title: Optional[str] = None) -> str:
    for topic in topics:
        t = topic.lower().strip().rstrip(".,;")
        if t in TOPIC_EXACT:
            return TOPIC_EXACT[t]
    for topic in topics:
        t = topic.lower()
        for keyword, category in TOPIC_KEYWORDS:
            if keyword in t:
                return category
    if title:
        genre = detect_genre_from_title(title)
        if genre:
            return genre
    if is_foreign_author(author):
        return "Světová literatura"
    return "Česká literatura"


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
    """Vrátí aktuální UTC čas ve formátu ISO 8601 pro OAI-PMH."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def today_iso() -> str:
    """Vrátí dnešní datum ve formátu YYYY-MM-DD."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


# ── State file ────────────────────────────────────────────────────────────────

def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_state(state: dict) -> None:
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


# ── OAI-PMH scraping ─────────────────────────────────────────────────────────

def get_subfield(record: ET.Element, tag: str, code: str) -> Optional[str]:
    for field in record.findall(f".//{{{NS_MARC}}}datafield[@tag='{tag}']"):
        sf = field.find(f"{{{NS_MARC}}}subfield[@code='{code}']")
        if sf is not None and sf.text:
            return sf.text.strip()
    return None


def get_all_subfields(record: ET.Element, tag: str, code: str) -> list:
    results = []
    for field in record.findall(f".//{{{NS_MARC}}}datafield[@tag='{tag}']"):
        sf = field.find(f"{{{NS_MARC}}}subfield[@code='{code}']")
        if sf is not None and sf.text:
            results.append(sf.text.strip())
    return results


def parse_856_fields(record: ET.Element) -> tuple:
    links = []
    cover_url = None
    for field in record.findall(f".//{{{NS_MARC}}}datafield[@tag='856']"):
        url_el  = field.find(f"{{{NS_MARC}}}subfield[@code='u']")
        label_el = field.find(f"{{{NS_MARC}}}subfield[@code='z']")
        if url_el is None or not url_el.text:
            continue
        url   = url_el.text.strip()
        label = label_el.text.strip() if label_el is not None else ""
        if url.endswith(".jpg") or "obálka" in label.lower() or "obalka" in label.lower():
            cover_url = url
            continue
        ext = url.rsplit(".", 1)[-1].lower() if "." in url else ""
        if ext in FORMAT_MAP:
            links.append({"url": url, "format": FORMAT_MAP[ext], "ext": ext, "label": label})
    order = ["epub", "pdf", "prc", "mobi", "html", "txt", "rtf", "pdb"]
    links.sort(key=lambda x: order.index(x["ext"]) if x["ext"] in order else 99)
    return links, cover_url


def parse_record(record_el: ET.Element) -> Optional[dict]:
    header = record_el.find(f"{{{NS_OAI}}}header")
    if header is not None and header.get("status") == "deleted":
        return None
    marc = record_el.find(f".//{{{NS_MARC}}}record")
    if marc is None:
        return None

    id_el  = header.find(f"{{{NS_OAI}}}identifier") if header is not None else None
    oai_id = id_el.text.strip() if id_el is not None else None

    title_a = get_subfield(marc, "245", "a") or ""
    title_b = get_subfield(marc, "245", "b") or ""
    title   = (title_a.rstrip("/ :") + (" " + title_b.rstrip("/ :") if title_b else "")).strip()
    if not title:
        return None

    author = get_subfield(marc, "100", "a") or get_subfield(marc, "700", "a")
    if author:
        author = author.rstrip(",. ").strip()

    description = get_subfield(marc, "520", "a")
    topics      = [t.rstrip(".,;") for t in get_all_subfields(marc, "650", "a") if t]

    year = None
    ctrl = marc.find(f".//{{{NS_MARC}}}controlfield[@tag='008']")
    if ctrl is not None and ctrl.text and len(ctrl.text) >= 11:
        y = ctrl.text[7:11].strip()
        if y.isdigit():
            year = int(y)

    links, cover_url = parse_856_fields(marc)
    main_links = [lnk for lnk in links if lnk["ext"] in PRIORITY_FORMATS]
    if not main_links:
        return None

    return {
        "mlpId":       oai_id,
        "title":       title,
        "slug":        slugify(title),
        "author":      author,
        "description": description,
        "year":        year,
        "topics":      topics,
        "coverUrl":    cover_url,
        "links":       main_links,
    }


def fetch_new_records(from_date: str) -> list:
    """
    Stáhne záznamy z OAI-PMH s parametrem from=from_date.
    Vrátí seznam parsovaných knih.
    """
    books = []
    params = {
        "verb":           "ListRecords",
        "set":            OAI_SET,
        "metadataPrefix": OAI_PREFIX,
        "from":           from_date,
    }
    resumption_token = None
    page = 0

    while True:
        page += 1
        if resumption_token:
            params = {"verb": "ListRecords", "resumptionToken": resumption_token}

        try:
            resp = requests.get(OAI_BASE, params=params, timeout=30)
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"  ✗ Chyba OAI: {e}", flush=True)
            break

        try:
            root = ET.fromstring(resp.content)
        except ET.ParseError as e:
            print(f"  ✗ XML chyba: {e}", flush=True)
            break

        # Zjistit, zda OAI vrátilo chybu (noRecordsMatch = žádné nové záznamy)
        error_el = root.find(f"{{{NS_OAI}}}error")
        if error_el is not None:
            code = error_el.get("code", "")
            if code == "noRecordsMatch":
                print(f"  ℹ OAI: žádné nové záznamy od {from_date}", flush=True)
            else:
                print(f"  ✗ OAI chyba [{code}]: {error_el.text}", flush=True)
            break

        list_records = root.find(f"{{{NS_OAI}}}ListRecords")
        if list_records is None:
            break

        for record_el in list_records.findall(f"{{{NS_OAI}}}record"):
            book = parse_record(record_el)
            if book:
                books.append(book)

        token_el = list_records.find(f"{{{NS_OAI}}}resumptionToken")
        if token_el is not None and token_el.text and token_el.text.strip():
            resumption_token = token_el.text.strip()
            print(f"  ↺  Stránka {page} – zatím {len(books)} záznamů...", flush=True)
            time.sleep(OAI_DELAY)
        else:
            break

    return books


# ── Strapi API ────────────────────────────────────────────────────────────────

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


# ── Strapi cache ──────────────────────────────────────────────────────────────

_author_cache:   dict = {}
_category_cache: dict = {}
_existing_ids:   set  = set()


def load_existing_mlp_ids() -> set:
    ids = set()
    page = 1
    while True:
        try:
            res = strapi_get("/api/books", {
                "fields[0]": "mlpId",
                "filters[mlpId][$notNull]": "true",
                "pagination[page]": str(page),
                "pagination[pageSize]": "200",
            })
            data = res.get("data", [])
            if not data:
                break
            for book in data:
                mid = book.get("mlpId")
                if mid:
                    ids.add(mid)
            if page >= res.get("meta", {}).get("pagination", {}).get("pageCount", 1):
                break
            page += 1
        except Exception as e:
            print(f"  ⚠ Chyba načítání mlpId: {e}", flush=True)
            break
    return ids


def find_or_create_author(name: str, dry_run: bool = False) -> Optional[str]:
    if name in _author_cache:
        return _author_cache[name]
    if dry_run:
        _author_cache[name] = f"dry-{slugify(name)}"
        return _author_cache[name]
    try:
        res = strapi_get("/api/authors", {"filters[name][$eq]": name, "fields[0]": "name"})
        if res.get("data"):
            doc_id = res["data"][0]["documentId"]
            _author_cache[name] = doc_id
            return doc_id
    except Exception as e:
        print(f"    ⚠ Autor lookup '{name}': {e}", flush=True)
        return None
    try:
        res = strapi_post("/api/authors", {"data": {"name": name, "slug": slugify(name), "publishedAt": now_iso()}})
        doc_id = res["data"]["documentId"]
        _author_cache[name] = doc_id
        print(f"    ✓ Autor vytvořen: {name}", flush=True)
        return doc_id
    except Exception as e:
        print(f"    ✗ Nelze vytvořit autora '{name}': {e}", flush=True)
        return None


def find_or_create_category(name: str, dry_run: bool = False) -> Optional[str]:
    if not name:
        return None
    if name in _category_cache:
        return _category_cache[name]
    if dry_run:
        _category_cache[name] = f"dry-cat-{slugify(name)}"
        return _category_cache[name]
    try:
        res = strapi_get("/api/categories", {"filters[name][$eq]": name, "fields[0]": "name"})
        if res.get("data"):
            doc_id = res["data"][0]["documentId"]
            _category_cache[name] = doc_id
            return doc_id
    except Exception:
        pass
    try:
        res = strapi_post("/api/categories", {"data": {"name": name, "slug": slugify(name), "publishedAt": now_iso()}})
        doc_id = res["data"]["documentId"]
        _category_cache[name] = doc_id
        print(f"    ✓ Kategorie vytvořena: {name}", flush=True)
        return doc_id
    except Exception as e:
        print(f"    ✗ Nelze vytvořit kategorii '{name}': {e}", flush=True)
        return None


def make_unique_slug(base_slug: str) -> str:
    slug = base_slug
    counter = 1
    while True:
        try:
            res = strapi_get("/api/books", {"filters[slug][$eq]": slug, "fields[0]": "slug"})
            if not res.get("data"):
                return slug
        except Exception:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


def import_book(book: dict, dry_run: bool) -> str:
    """Importuje jednu knihu. Vrátí 'ok' | 'skip' | 'error'."""
    mlp_id = book.get("mlpId", "")
    title  = book.get("title", "").strip()
    if not title:
        return "error"

    if mlp_id and mlp_id in _existing_ids:
        return "skip"

    author_name   = book.get("author")
    category_name = pick_category(book.get("topics", []),
                                  author=author_name, title=title)

    author_id   = find_or_create_author(author_name, dry_run) if author_name else None
    category_id = find_or_create_category(category_name, dry_run)

    base_slug = book.get("slug") or slugify(title)
    slug      = base_slug if dry_run else make_unique_slug(base_slug)

    data = {
        "title":            title,
        "slug":             slug,
        "description":      book.get("description") or "",
        "isFree":           True,
        "isFeatured":       False,
        "downloads":        0,
        "externalLinks":    book.get("links", []),
        "coverExternalUrl": None,
        "mlpId":            mlp_id,
    }
    if author_id:
        data["author"] = author_id
    if category_id:
        data["category"] = category_id

    if dry_run:
        print(f"  [DRY] {title[:55]:<55} | {category_name}", flush=True)
        return "ok"

    try:
        strapi_post("/api/books", {"data": data})
        _existing_ids.add(mlp_id)
        return "ok"
    except Exception as e:
        print(f"  ✗ {title[:45]}: {e}", flush=True)
        return "error"


# ── Hlavní program ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="MLP → Strapi Auto-sync")
    parser.add_argument("--url",      default="",
                        help="Strapi URL (přepíše env STRAPI_URL)")
    parser.add_argument("--token",    default="",
                        help="Strapi API token (přepíše env STRAPI_TOKEN)")
    parser.add_argument("--from",     dest="from_date", default="",
                        help="Datum od (YYYY-MM-DD), přepíše uložený stav")
    parser.add_argument("--dry-run",  action="store_true",
                        help="Simulace – nestahuje ani nezapisuje")
    parser.add_argument("--days",     type=int, default=7,
                        help="Kolik dní zpět hledat při prvním spuštění (default: 7)")
    args = parser.parse_args()

    global STRAPI_URL, STRAPI_TOKEN
    if args.url:
        STRAPI_URL = args.url
    if args.token:
        STRAPI_TOKEN = args.token

    # ── Hlavička logu ─────────────────────────────────────────────────────────
    run_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print("=" * 65, flush=True)
    print(f"  MLP Auto-sync  [{run_time}]", flush=True)
    print("=" * 65, flush=True)
    print(f"  Strapi:   {STRAPI_URL}", flush=True)
    print(f"  Token:    {'nastaven ✓' if STRAPI_TOKEN else '⚠ NENÍ nastaven'}", flush=True)
    print(f"  Dry-run:  {'ANO' if args.dry_run else 'NE'}", flush=True)

    # ── Určení data "od" ──────────────────────────────────────────────────────
    state = load_state()

    if args.from_date:
        from_date = args.from_date
        print(f"  Od:       {from_date}  (ruční přepis)", flush=True)
    elif state.get("last_sync_date"):
        from_date = state["last_sync_date"]
        print(f"  Od:       {from_date}  (poslední sync)", flush=True)
    else:
        # První spuštění – jdi N dní zpět
        from datetime import timedelta
        from_dt   = datetime.now(timezone.utc) - timedelta(days=args.days)
        from_date = from_dt.strftime("%Y-%m-%d")
        print(f"  Od:       {from_date}  (první spuštění, {args.days} dní zpět)", flush=True)

    print(flush=True)

    # ── Test připojení ke Strapi ──────────────────────────────────────────────
    if not args.dry_run:
        if not STRAPI_TOKEN:
            print("  ⚠ STRAPI_TOKEN není nastaven – import se nezdaří!", flush=True)
            print("  Nastav env STRAPI_TOKEN nebo použij --token <token>", flush=True)
            sys.exit(1)
        try:
            strapi_get("/api/books", {"pagination[pageSize]": "1"})
            print("  ✓ Připojení ke Strapi OK", flush=True)
        except Exception as e:
            print(f"  ✗ Nelze se připojit ke Strapi: {e}", flush=True)
            sys.exit(1)

        # Načíst existující mlpId pro rychlý duplicate check
        print("  Načítám existující záznamy ze Strapi...", flush=True)
        _existing_ids.update(load_existing_mlp_ids())
        print(f"  ✓ {len(_existing_ids)} existujících knih v databázi\n", flush=True)

    # ── Stažení nových záznamů z OAI-PMH ─────────────────────────────────────
    print(f"  Stahuji záznamy z MLP (od {from_date})...", flush=True)
    new_books = fetch_new_records(from_date)
    print(f"  ✓ OAI vrátil {len(new_books)} záznamů\n", flush=True)

    if not new_books:
        print("  Žádné nové knihy – sync dokončen.", flush=True)
        if not args.dry_run:
            state["last_sync_date"] = today_iso()
            state["last_run"]       = run_time
            state["last_new_count"] = 0
            save_state(state)
        print("=" * 65, flush=True)
        return

    # ── Import ────────────────────────────────────────────────────────────────
    ok = skip = err = 0

    for book in new_books:
        result = import_book(book, args.dry_run)
        if result == "ok":
            ok += 1
            if not args.dry_run:
                title = (book.get("title") or "")[:55]
                cat   = pick_category(book.get("topics", []),
                                      author=book.get("author"),
                                      title=book.get("title"))
                print(f"  ✓ {title:<55} | {cat}", flush=True)
        elif result == "skip":
            skip += 1
        else:
            err += 1
        if not args.dry_run and result != "skip":
            time.sleep(DELAY)

    # ── Výsledek ──────────────────────────────────────────────────────────────
    print(flush=True)
    print("=" * 65, flush=True)
    print(f"  ✓ Importováno:  {ok}", flush=True)
    print(f"  ⏭  Přeskočeno:  {skip}  (již existuje)", flush=True)
    print(f"  ✗ Chyby:        {err}", flush=True)
    print("=" * 65, flush=True)

    # ── Uložit stav ───────────────────────────────────────────────────────────
    if not args.dry_run:
        state["last_sync_date"] = today_iso()
        state["last_run"]       = run_time
        state["last_new_count"] = ok
        state["total_runs"]     = state.get("total_runs", 0) + 1
        save_state(state)
        print(f"\n  Stav uložen do: {STATE_FILE}", flush=True)


if __name__ == "__main__":
    main()
