#!/usr/bin/env python3
"""
MLP → Strapi Import v2
=======================
Importuje výstup mlp_scraper.py s inteligentní kategorizací.

Kategorie se určuje (v pořadí priority):
  1. MARC témata (z OAI-PMH) pokud nejsou prázdná
  2. Žánrová klíčová slova v titulu (Poezie, Drama, Dětská literatura)
  3. Detekce zahraničního autora (jméno, patronymikum, "von/de")
  4. Fallback: "Česká literatura"

Duplicita: kontroluje se přes mlpId – stávající knihy se nepřepíšou.
Obálky: nenastavují se (web používá generovaný placeholder).

Spuštění:
    py mlp_import_v2.py --input mlp_books_all.json --url https://... --token <TOKEN>
    py mlp_import_v2.py --dry-run --input mlp_books_all.json
    py mlp_import_v2.py --start 500 ...  # pokračovat od indexu 500
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

# Windows encoding fix
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─────────────────────────────────────────────
# KONFIGURACE
# ─────────────────────────────────────────────

STRAPI_URL = os.getenv("STRAPI_URL", "http://localhost:1337")
STRAPI_TOKEN = os.getenv("STRAPI_TOKEN", "")
DELAY = 0.4

# ─────────────────────────────────────────────
# KATEGORIZACE
# ─────────────────────────────────────────────

# Přesná shoda (lowercase topic → název kategorie)
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
    "krimi": "Detektivní",
    "science fiction": "Sci-fi",
    "vědeckofantastická literatura": "Sci-fi",
    "sci-fi": "Sci-fi",
    "fantasy": "Fantasy",
    "fantasy literatura": "Fantasy",
    "horor": "Horor",
    "horory": "Horor",
    "hororová literatura": "Horor",
    "thriller": "Thriller",
    "thrillery": "Thriller",
    "dobrodružná literatura": "Dobrodružná",
    "romantická literatura": "Romance",
    "romance": "Romance",
    "milostná literatura": "Romance",
    "historická literatura": "Historická beletrie",
    "historická beletrie": "Historická beletrie",
    "historický román": "Historická beletrie",
    "literatura faktu": "Literatura faktu",
    "populárně naučná literatura": "Literatura faktu",
    "populárně-naučná literatura": "Literatura faktu",
    "naučná literatura": "Literatura faktu",
    "dětská literatura": "Dětská literatura",
    "literatura pro děti a mládež": "Dětská literatura",
    "pohádky": "Dětská literatura",
    "bajky": "Dětská literatura",
    "biografie": "Biografie",
    "autobiografie": "Biografie",
    "memoáry": "Biografie",
    "paměti": "Biografie",
    "životopis": "Biografie",
    "cestovní literatura": "Cestování",
    "cestopisy": "Cestování",
    "humor": "Humor",
    "humoristická literatura": "Humor",
    "satira": "Humor",
    "poezie": "Poezie",
    "básně": "Poezie",
    "lyrika": "Poezie",
    "drama": "Drama",
    "divadelní hry": "Drama",
    "divadlo": "Drama",
    "beletrie": "Beletrie",
    "próza": "Beletrie",
    "eseje": "Esejistika",
    "esejistika": "Esejistika",
    "publicistika": "Publicistika",
    "filosofie": "Filosofie",
    "filozofie": "Filosofie",
    "psychologie": "Psychologie",
    "erotická literatura": "Erotická literatura",
}

# Klíčová slova pro částečnou shodu v tématu
TOPIC_KEYWORDS = [
    ("česká lit", "Česká literatura"),
    ("slovenská lit", "Slovenská literatura"),
    ("světová lit", "Světová literatura"),
    ("anglická lit", "Světová literatura"),
    ("americká lit", "Světová literatura"),
    ("francouzská lit", "Světová literatura"),
    ("německá lit", "Světová literatura"),
    ("ruská lit", "Světová literatura"),
    ("detektiv", "Detektivní"),
    ("kriminál", "Detektivní"),
    ("science fiction", "Sci-fi"),
    ("vědeckofant", "Sci-fi"),
    ("fantasy", "Fantasy"),
    ("horor", "Horor"),
    ("thriller", "Thriller"),
    ("dobrodruž", "Dobrodružná"),
    ("romantick", "Romance"),
    ("milostn", "Romance"),
    ("historick", "Historická beletrie"),
    ("populárně", "Literatura faktu"),
    ("naučná", "Literatura faktu"),
    ("dětská", "Dětská literatura"),
    ("pro děti", "Dětská literatura"),
    ("pohádky", "Dětská literatura"),
    ("biografi", "Biografie"),
    ("autobiografi", "Biografie"),
    ("memoár", "Biografie"),
    ("paměti", "Biografie"),
    ("cestopi", "Cestování"),
    ("cestovní", "Cestování"),
    ("humor", "Humor"),
    ("satir", "Humor"),
    ("básn", "Poezie"),
    ("poezie", "Poezie"),
    ("lyrik", "Poezie"),
    ("drama", "Drama"),
    ("divadel", "Drama"),
    ("erotick", "Erotická literatura"),
    ("filosofi", "Filosofie"),
    ("filozofi", "Filosofie"),
    ("psychologi", "Psychologie"),
]

# Klíčová slova v titulu → žánr
TITLE_GENRE_KEYWORDS = [
    # Poezie
    (["zpěvy", "básn", "balada", "epigramy", "haiku", "elegie", "apostrofy",
      "sonety", "lyrik", "verše", "verš", "žalmy", "óda"], "Poezie"),
    # Drama
    (["komedie o", "tragédie", "zpěvohra", "fraška", "drama o", "hra o",
      "divadeln"], "Drama"),
    # Dětská
    (["pohádky", "pohádka", "pohádkové", "pohádkový", "pro děti",
      "pro mládež"], "Dětská literatura"),
    # Dobrodružná
    (["dobrodružství", "dobrodružný", "dobrodružná"], "Dobrodružná"),
    # Biografie/paměti
    (["paměti", "memoáry", "zápisky", "deník"], "Biografie"),
    # Cestování
    (["cesta do", "cesta kolem", "cesty do", "cesty kolem", "cestopis",
      "expedice"], "Cestování"),
]

# Příjmení zahraničních autorů (lowercase)
FOREIGN_SURNAMES = {
    # Ruští
    "dostojevskij", "tolstoj", "turgenev", "bulgakov", "čechov", "zamjatin",
    "puškin", "gogol", "gorkij", "ostrovskij", "bunin", "jevtušenko",
    "saltykov-ščedrin", "lermontov", "kuprin", "andrejev",
    # Němečtí/Rakouští
    "goethe", "schiller", "kafka", "mann", "rilke", "hesse", "brecht",
    "schnitzler", "musil", "zweig", "werfel", "grimmelshausen",
    "fontane", "kleist", "tieck", "löns", "storm",
    # Francouzi
    "hugo", "proust", "flaubert", "zola", "balzac", "molière", "voltaire",
    "dumas", "maupassant", "rolland", "stendhal", "rostand", "jarry",
    "chevallier", "gide", "colette", "racine", "corneille", "beaumarchais",
    "france", "gautier", "mérimée", "nerval", "verne", "allais",
    "barbey", "rachilde",
    # Angličané/Irové/Velšané
    "dickens", "hardy", "joyce", "woolf", "lawrence", "kipling",
    "thackeray", "austen", "wilde", "swift", "shakespeare", "shelley",
    "keats", "blake", "yeats", "synge", "browning", "meredith", "sterne",
    "fielding", "defoe", "chaucer", "pope", "gay", "radcliffe", "maturin",
    "lewis", "beckford", "james", "carroll", "jerome", "wharton",
    "doyle", "chesterton", "galsworthy", "bennett", "lonsdale", "hilton",
    "stevenson", "lear", "hazlitt", "thomas", "dylan",
    # Američané
    "poe", "london", "fitzgerald", "hemingway", "dreiser", "crane",
    "melville", "lardner", "heyward", "bierce", "saki", "burns",
    "twain", "whitman", "faulkner", "o'neill", "stein", "mitchell",
    "cooper", "hawthorne", "james", "sinclair", "dreiser",
    # Poláci
    "sienkiewicz", "ossendowski", "choynowski",
    # Norové/Skandinávci
    "ibsen", "hamsun", "andersen", "strindberg", "heidenstam", "munthe",
    "strindberg", "bjørnson",
    # Italové
    "pirandello", "goldoni", "boccaccio", "leopardi", "carducci",
    "alfieri", "vergilius", "gozzi", "chiarelli", "goldsmith", "sheridan",
    "della porta", "dovizi", "carletti",
    # Španělé/Latin Amerika
    "cervantes", "lorca", "vega", "gracián", "unamuno", "valle-inclán",
    "camões", "ruiz", "alfieri", "calderón", "tirso",
    # Antičtí/Latinisté
    "homéros", "sofokles", "euripidés", "aristofanés",
    "ovidius", "catullus", "tacitus", "caesar", "vergilius",
    "cicero", "seneca", "boëthius", "epiktétos",
    # Maďaři/Ostatní střední Evropa
    # Ostatní
    "scott", "synge",
    "sienkiewicz", "della porta", "dovizi",
    # Různé
    "hearn", "alain-fournier", "unamuno",
}


def detect_genre_from_title(title: str) -> Optional[str]:
    """Detekuje žánr z klíčových slov v titulu."""
    t = title.lower()
    for keywords, genre in TITLE_GENRE_KEYWORDS:
        if any(k in t for k in keywords):
            return genre
    return None


def is_foreign_author(author: Optional[str]) -> bool:
    """Detekuje zahraničního autora."""
    if not author:
        return False
    parts = author.split(",")
    # Příjmení (část před čárkou)
    surname = parts[0].lower().strip()
    if surname in FOREIGN_SURNAMES:
        return True
    # Ruský patronym (Michajlovič, Nikolajevič, Fjodorovna...)
    if len(parts) > 1:
        rest = parts[1].lower().strip()
        words = rest.split()
        for word in words[1:]:
            if (word.endswith("ič") or word.endswith("evna") or
                    word.endswith("ovna") or word.endswith("jevna")):
                return True
    # Německé "von" / francouzské "de" / španělské "del/de la"
    low = author.lower()
    if " von " in low or " de " in low or " del " in low:
        return True
    return False


def pick_category(topics: list, author: Optional[str] = None,
                  title: Optional[str] = None) -> str:
    """Vybere kategorii v pořadí: témata → titul → autor → fallback."""

    # 1. Přesná shoda v tématu
    for topic in topics:
        t = topic.lower().strip().rstrip(".,;")
        if t in TOPIC_EXACT:
            return TOPIC_EXACT[t]

    # 2. Částečná shoda v tématu
    for topic in topics:
        t = topic.lower()
        for keyword, category in TOPIC_KEYWORDS:
            if keyword in t:
                return category

    # 3. Klíčová slova v titulu
    if title:
        genre = detect_genre_from_title(title)
        if genre:
            return genre

    # 4. Zahraniční autor
    if is_foreign_author(author):
        return "Světová literatura"

    # 5. Fallback
    return "Česká literatura"


# ─────────────────────────────────────────────
# Strapi API helpers
# ─────────────────────────────────────────────

def headers() -> dict:
    h = {"Content-Type": "application/json"}
    if STRAPI_TOKEN:
        h["Authorization"] = f"Bearer {STRAPI_TOKEN}"
    return h


def strapi_get(path: str, params: dict = None) -> dict:
    resp = requests.get(f"{STRAPI_URL}{path}", headers=headers(),
                        params=params, timeout=20)
    resp.raise_for_status()
    return resp.json()


def strapi_post(path: str, data: dict) -> dict:
    resp = requests.post(f"{STRAPI_URL}{path}", headers=headers(),
                         json=data, timeout=20)
    if not resp.ok:
        raise Exception(f"POST {path} → {resp.status_code}: {resp.text[:300]}")
    return resp.json()


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:200]


# ─────────────────────────────────────────────
# Cache
# ─────────────────────────────────────────────

_author_cache: dict = {}
_category_cache: dict = {}
_existing_mlp_ids: set = set()


def load_existing_mlp_ids() -> set:
    """Načte mlpId všech existujících knih ze Strapi (pro rychlý duplicate check)."""
    print("  Načítám existující mlpId ze Strapi...")
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
            total_pages = res.get("meta", {}).get("pagination", {}).get("pageCount", 1)
            if page >= total_pages:
                break
            page += 1
        except Exception as e:
            print(f"  ⚠ Chyba při načítání: {e}")
            break
    print(f"  ✓ {len(ids)} existujících mlpId načteno\n")
    return ids


def find_or_create_author(name: str, dry_run: bool = False) -> Optional[str]:
    if name in _author_cache:
        return _author_cache[name]
    if dry_run:
        _author_cache[name] = f"dry-{slugify(name)}"
        return _author_cache[name]
    try:
        result = strapi_get("/api/authors",
                            {"filters[name][$eq]": name, "fields[0]": "name"})
        if result.get("data"):
            doc_id = result["data"][0]["documentId"]
            _author_cache[name] = doc_id
            return doc_id
    except Exception as e:
        print(f"    ⚠ Hledání autora '{name}': {e}")
        return None
    try:
        result = strapi_post("/api/authors",
                             {"data": {"name": name, "slug": slugify(name)}})
        doc_id = result["data"]["documentId"]
        _author_cache[name] = doc_id
        print(f"    ✓ Autor vytvořen: {name}")
        return doc_id
    except Exception as e:
        print(f"    ✗ Nelze vytvořit autora '{name}': {e}")
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
        result = strapi_get("/api/categories",
                            {"filters[name][$eq]": name, "fields[0]": "name"})
        if result.get("data"):
            doc_id = result["data"][0]["documentId"]
            _category_cache[name] = doc_id
            return doc_id
    except Exception:
        pass
    try:
        result = strapi_post("/api/categories",
                             {"data": {"name": name, "slug": slugify(name)}})
        doc_id = result["data"]["documentId"]
        _category_cache[name] = doc_id
        print(f"    ✓ Kategorie vytvořena: {name}")
        return doc_id
    except Exception as e:
        print(f"    ✗ Nelze vytvořit kategorii '{name}': {e}")
        return None


def make_unique_slug(base_slug: str) -> str:
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


def import_book(book: dict, dry_run: bool) -> str:
    """Vrátí: 'ok' | 'skip' | 'error'"""
    mlp_id = book.get("mlpId", "")
    title = book.get("title", "").strip()
    if not title:
        return "error"

    # Duplicita check
    if not dry_run and mlp_id and mlp_id in _existing_mlp_ids:
        return "skip"

    author_name = book.get("author")
    topics = book.get("topics", [])
    category_name = pick_category(topics, author=author_name, title=title)

    author_id = None
    if author_name:
        author_id = find_or_create_author(author_name, dry_run)

    category_id = find_or_create_category(category_name, dry_run)

    base_slug = book.get("slug") or slugify(title)
    slug = base_slug if dry_run else make_unique_slug(base_slug)

    data = {
        "title": title,
        "slug": slug,
        "description": book.get("description") or "",
        "isFree": True,
        "isFeatured": False,
        "downloads": 0,
        "externalLinks": book.get("links", []),
        "coverExternalUrl": None,
        "mlpId": mlp_id,
    }
    if author_id:
        data["author"] = author_id
    if category_id:
        data["category"] = category_id

    if dry_run:
        print(f"  [DRY] {title[:50]:<50} | {category_name}")
        return "ok"

    try:
        strapi_post("/api/books", {"data": data})
        _existing_mlp_ids.add(mlp_id)
        return "ok"
    except Exception as e:
        print(f"  ✗ {title[:40]}: {e}")
        return "error"


# ─────────────────────────────────────────────
# Hlavní program
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="MLP → Strapi Import v2")
    parser.add_argument("--input", default="mlp_books_all.json")
    parser.add_argument("--dry-run", action="store_true",
                        help="Simulace – nezapisuje do Strapi")
    parser.add_argument("--token", default="")
    parser.add_argument("--url", default="")
    parser.add_argument("--start", type=int, default=0,
                        help="Začít od indexu N (pro pokračování po přerušení)")
    args = parser.parse_args()

    global STRAPI_URL, STRAPI_TOKEN
    if args.url:
        STRAPI_URL = args.url
    if args.token:
        STRAPI_TOKEN = args.token

    print("=" * 70)
    print("  MLP → Strapi Import v2  (s inteligentní kategorizací)")
    print("=" * 70)
    print(f"  Strapi:  {STRAPI_URL}")
    print(f"  Token:   {'nastaven ✓' if STRAPI_TOKEN else '⚠ NENÍ nastaven'}")
    print(f"  Vstup:   {args.input}")
    print(f"  Dry-run: {'ANO' if args.dry_run else 'NE'}")
    if args.start:
        print(f"  Start:   od indexu #{args.start}")
    print()

    try:
        with open(args.input, encoding="utf-8") as f:
            books = json.load(f)
    except FileNotFoundError:
        print(f"  ✗ Soubor '{args.input}' nenalezen!")
        sys.exit(1)

    print(f"  Načteno {len(books)} knih.\n")

    if not args.dry_run:
        _existing_mlp_ids.update(load_existing_mlp_ids())
        try:
            strapi_get("/api/books", {"pagination[pageSize]": "1"})
            print("  ✓ Připojení ke Strapi OK\n")
        except Exception as e:
            print(f"  ✗ Nelze se připojit: {e}")
            sys.exit(1)

    ok = skip = err = 0
    category_stats: dict = {}
    total = len(books)

    for i, book in enumerate(books[args.start:], start=args.start + 1):
        title = (book.get("title") or "?")[:50]
        cat = pick_category(book.get("topics", []),
                            author=book.get("author"),
                            title=book.get("title"))
        category_stats[cat] = category_stats.get(cat, 0) + 1

        result = import_book(book, args.dry_run)

        if result == "ok":
            ok += 1
            if not args.dry_run:
                print(f"[{i:>4}/{total}] ✓ {title:<50} | {cat}")
        elif result == "skip":
            skip += 1
            # skip tichý (příliš mnoho výstupu)
        else:
            err += 1
            print(f"[{i:>4}/{total}] ✗ {title}")

        if not args.dry_run and result != "skip":
            time.sleep(DELAY)

        if i % 100 == 0:
            print(f"\n  ─── #{i}: {ok} OK, {skip} skip, {err} err ───\n")

    print()
    print("=" * 70)
    print(f"  ✓ Importováno: {ok}")
    print(f"  ⏭ Přeskočeno:  {skip}")
    print(f"  ✗ Chyby:       {err}")
    print()
    print("  Rozdělení do kategorií:")
    for cat, count in sorted(category_stats.items(), key=lambda x: -x[1]):
        bar = "█" * (count * 30 // max(category_stats.values()))
        print(f"    {cat:<35} {count:>5}  {bar}")
    print("=" * 70)


if __name__ == "__main__":
    main()
