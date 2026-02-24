# Scripts – MLP E-knihy Import

Python skripty pro hromadný import volně dostupných e-knih z Městské knihovny Praha (MLP).

## Prerekvizity

```bash
pip install requests
```

## Workflow

### 1. Scraper – stažení metadat z OAI-PMH

```bash
# Test – 20 knih
python scripts/mlp_scraper.py --limit 20 --output scripts/mlp_books.json

# Více knih
python scripts/mlp_scraper.py --limit 100 --output scripts/mlp_books.json

# Všechny (~3400 knih, cca 30 minut)
python scripts/mlp_scraper.py --limit 0 --output scripts/mlp_books.json
```

### 2. Import – JSON → Strapi

```bash
# 1. Nejdřív dry-run (simulace, bez zápisu)
python scripts/mlp_import.py --input scripts/mlp_books.json --dry-run

# 2. Reálný import (Strapi musí běžet, potřeba API token)
python scripts/mlp_import.py \
  --input scripts/mlp_books.json \
  --token TVUJ_API_TOKEN \
  --url http://localhost:1337 \
  --category "Česká literatura"

# Pro produkci (Render)
python scripts/mlp_import.py \
  --input scripts/mlp_books.json \
  --token TVUJ_API_TOKEN \
  --url https://eknihyzdarma-backend-1.onrender.com \
  --category "Česká literatura"
```

### Získání Strapi API tokenu

Strapi admin → **Settings → API Tokens → Create new API token**
- Type: Full access (nebo Custom s právy pro books a authors)

## Co skripty dělají

- `mlp_scraper.py` – stáhne metadata z OAI-PMH endpointu MLP, parsuje MARC21 XML, uloží JSON
- `mlp_import.py` – načte JSON, pro každou knihu: zkontroluje duplicitu (mlpId), vytvoří autora pokud neexistuje, vytvoří knihu s externími linky

## Výstupní JSON struktura

```json
{
  "mlpId": "oai:www.mlp.cz:3347524",
  "title": "První parta",
  "slug": "prvni-parta",
  "author": "Čapek, Karel",
  "description": "...",
  "coverUrl": "https://web2.mlp.cz/koweb/00/03/34/75/24.jpg",
  "links": [
    { "url": "https://web2.mlp.cz/.../prvni_parta.epub", "format": "EPUB", "ext": "epub" },
    { "url": "https://web2.mlp.cz/.../prvni_parta.pdf",  "format": "PDF",  "ext": "pdf" },
    { "url": "https://web2.mlp.cz/.../prvni_parta.prc",  "format": "PRC",  "ext": "prc" }
  ]
}
```

## Právní poznámka

Knihy pochází z MLP databáze volně dostupných e-knih (public domain / otevřené licence).
Web pouze odkazuje na soubory hostované na web2.mlp.cz – neukládá kopie souborů.
Zdroj: https://www.mlp.cz/katalog/davka/NFW-EKNIHY-VOLNE
