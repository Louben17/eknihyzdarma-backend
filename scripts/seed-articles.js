/**
 * seed-articles.js
 * Smaže stávající články a vytvoří 4 nové s obrázky z Unsplash.
 *
 * Použití:
 *   node scripts/seed-articles.js
 *   (token je zadrátovaný, ale lze přepsat env STRAPI_TOKEN)
 */

const STRAPI_URL = process.env.STRAPI_URL || 'https://eknihyzdarma-backend-1.onrender.com';
const TOKEN = process.env.STRAPI_TOKEN || '5025e85b5155a07527a4ae3be906d7c8e4b05049134835d0e147f8e946c086054bcc7cd81b41e932f67bf756dcd0c6a9cef42b1e7b341d499beeabc8a1110cbb14e2e25c765d0cb85ec762d29c8fdff3f67cc8fc22e7f83dc4d29b0b2b8370ff64fd05b4904426db1695e57d2f9ad4315e1170be97724964fcc991b5e2a0a667';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

// ─── Články ────────────────────────────────────────────────────────────────────

const articles = [
  {
    title: 'Nový web eknihyzdarma.cz – co se změnilo a co vás čeká',
    slug: 'novy-web-eknihyzdarma-cz-co-se-zmenilo',
    perex: 'Po dlouhé době přinášíme kompletně přepracovaný web. Nový design, rychlejší vyhledávání, stovky e-knih ve formátech EPUB, MOBI i PDF – vše zdarma a bez registrace.',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80',
    imageName: 'novy-web-cover.jpg',
    content: `## Vítejte na novém webu eknihyzdarma.cz!

Rádi vám představujeme zcela přepracovaný web **eknihyzdarma.cz**. Naším cílem bylo vytvořit místo, kde se knihy snadno hledají, rychle stahují a kde si každý čtenář přijde na své.

### Co je nového?

**Přes 400 e-knih zdarma**
V naší knihovně najdete českou i světovou literaturu – klasiku, pohádky, historické romány, dobrodružné příběhy i odborné texty. Vše ve formátech **EPUB**, **MOBI** a **PDF**.

**Moderní design a rychlé vyhledávání**
Nový web se okamžitě přizpůsobí vašemu telefonu, tabletu i počítači. Knihy hledejte podle názvu, autora nebo kategorie.

**Průvodce čtením e-knih**
Přidali jsme kompletního průvodce pro všechna zařízení – Kindle, čtečky, iPhone, Android i Windows/Mac. Najdete ho v menu pod položkou *Jak číst?*.

**Uživatelský účet**
Registrovaní uživatelé si mohou označovat oblíbené knihy a budovat svou osobní knihovnu.

### Jak to funguje?

Vše na webu je **zdarma a bez registrace**. Stačí si vybrat knihu, kliknout na tlačítko stažení a vybrat formát. Registrace slouží pouze pro ukládání oblíbených knih.

### Plány do budoucna

Chystáme pravidelné aktuality o nových přírůstcích do knihovny, tipy na čtení a recenze zajímavých titulů. Sledujte nás!

*Přejeme příjemné čtení!*`,
  },
  {
    title: '10 nejčtenějších knih roku 2024 – žebříček, který vás překvapí',
    slug: '10-nejctenejsich-knih-roku-2024',
    perex: 'Rok 2024 přinesl čtenářům skvělé tituly. Přinášíme přehled deseti nejčtenějších knih podle databáze knih – od fantasy bestsellerů po českou prózu.',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
    imageName: 'nejctenejsi-knihy-2024-cover.jpg',
    content: `## Nejčtenější knihy roku 2024

Rok 2024 byl ve znamení silné české prózy, ale i světových fantasy senzací. Přinášíme žebříček **10 nejčtenějších knih**, sestavený na základě dat z Databáze knih – největší české komunity čtenářů.

---

### 1. Čtvrté křídlo – Rebecca Yarros
Fenomenální fantasy román, který si podmanil čtenáře po celém světě. Válečná škola, draci a dávkované napětí – kombinace, která funguje dokonale.

### 2. Šikmý kostel 3 – Karin Lednická
Závěrečný díl úspěšné trilogie o ztraceném Karviné. Karin Lednická uzavírá příběh s erudicí a citlivostí, která z první knihy udělala bestseller.

### 3. Gazely – Patrik Hartl
Oblíbený český autor přichází s novou románovou komedií. Hartlův humor, který okouzlil čtenáře u *Bastardů* a *Dokonalých nepřátel*, opět naplno září.

### 4. Černočerné srdce – Robert Galbraith (J. K. Rowling)
Detektivní série se Strikem a Robinem pokračuje. Tajemná vražda, komplikované vztahy a mistrný plot – Galbraith opět přináší strhující čtení.

### 5. Marek Dvořák: Mezi nebem a pacientem – Martin Moravec
Přímočará zpověď záchranáře. Příběhy ze sanitky, které vás dostanou a zároveň přimějí zamyslet se nad křehkostí lidského života.

### 6. Les v domě – Alena Mornštajnová
Autorka *Hany* a *Stanice Šalamoun* se vrací s intimním příběhem o paměti, rodině a tajemstvích, která zůstávají ukryta v domech i lidech.

### 7. Severka – Nina Špitálníková
Debut roku! Severka je temná psychologická novela, která se pohybuje na hranici thrilleru a literární prózy. Čte se jedním dechem.

### 8. Železný plamen – Rebecca Yarros
Pokračování Čtvrtého křídla překonalo všechna očekávání. Yarros potvrdila, že první díl nebyl šťastnou náhodou.

### 9. Ignis fatuus – Petra Klabouchová
Mysteriózní historický román z prostředí šlechtické Evropy 18. století. Atmosférický, propracovaný a naprosto jedinečný.

### 10. Pláňata – Petra Dvořáková
Silný příběh o dospívání a hledání sebe sama ve venkovském prostředí. Dvořáková píše s autenticitou, která se jen tak nevidí.

---

### Tipy navíc

Mnoho klasických autorů má díla, která jsou **volná díla** a lze je číst zcela zdarma. Přejděte do naší knihovny a hledejte podle autora – možná vás překvapí, co tam najdete!`,
  },
  {
    title: 'Kindle, PocketBook nebo Kobo? Jak vybrat čtečku e-knih v roce 2025',
    slug: 'jak-vybrat-ctecku-eknih-2025-kindle-pocketbook-kobo',
    perex: 'Přemýšlíte o koupi e-ink čtečky, ale nevíte, kterou vybrat? Porovnáme tři nejoblíbenější modely a pomůžeme vám najít tu správnou pro vaše potřeby a peněženku.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80',
    imageName: 'ctecka-porovnani-cover.jpg',
    content: `## Jak vybrat čtečku e-knih?

Trh s e-ink čtečkami se v posledních letech výrazně rozvinul. Tři hlavní hráči – **Amazon Kindle**, **PocketBook** a **Kobo** – nabízejí zařízení pro různé potřeby i různé peněženky. Pojďme se na ně podívat.

---

## Amazon Kindle

**Pro koho:** Začátečníci, lidé kteří nakupují e-knihy na Amazonu

Kindle je celosvětově nejpopulárnější čtečka. Výhody jsou jasné: skvělý displej, výdrž baterie v týdnech a bezproblémová integrace s Amazon ekosystémem.

**Klíčové informace:**
- Od roku 2022 podporuje nativně formát **EPUB** (přes Send to Kindle)
- Formát MOBI/AZW3 funguje bez problémů
- Waterproof varianty (Paperwhite, Oasis, Scribe)
- Dostupný od cca **2 500 Kč** (základní model)

**Nevýhoda:** Bez Adobe DRM – knihy z českých e-shopů musíte konvertovat nebo číst v aplikaci.

---

## PocketBook

**Pro koho:** Čtenáři, kteří nakupují v českých e-shopech

PocketBook je oblíbený zejména v Česku a Slovensku díky výborné podpoře **EPUB** a kompatibilitě s Adobe DRM.

**Klíčové informace:**
- Nativní EPUB podpora bez konverze
- Adobe DRM – čtete knihy z Palmknih nebo Kosmasu
- Podpora micro SD karty
- Dostupný od cca **2 800 Kč**

---

## Kobo (Rakuten)

**Pro koho:** Čtenáři, kteří chtějí elegantní zařízení s cloudovou knihovnou

**Klíčové informace:**
- Nativní EPUB podpora
- Adobe DRM
- Skvělá integrace s veřejnými knihovnami (OverDrive)
- Dostupný od cca **3 000 Kč**

---

## Naše doporučení

- **Nakupujete na Amazonu?** → Kindle Paperwhite
- **Chcete číst z českých e-shopů?** → PocketBook nebo Kobo
- **Chcete číst zdarma z naší knihovny?** → Všechny tři fungují skvěle s EPUB nebo MOBI

Podrobný průvodce přenosem e-knih na každé z těchto zařízení najdete v sekci **Jak číst e-knihy** v hlavním menu.`,
  },
  {
    title: '5 českých klasik, které si musíte přečíst – a všechny jsou zdarma',
    slug: 'ceske-klasiky-ktere-morate-precist-zdarma',
    perex: 'Česká literatura je plná skvostů. Vybrali jsme 5 knih, které by neměly chybět v žádné knihovně – a všechny si můžete stáhnout zdarma přímo na našem webu.',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80',
    imageName: 'ceske-klasiky-cover.jpg',
    content: `## 5 českých klasik zdarma ke stažení

Česká literatura patří k nejbohatším v Evropě. Ať jde o národní obrození, meziválečnou prózu nebo pohádky – naše dědictví je obrovské. A hlavně: **velká část je volné dílo**, dostupné zdarma.

---

## 1. Babička – Božena Němcová

Asi nejznámější česká kniha všech dob. Babička není jen idylická vzpomínka na venkov – je to mistrně napsaný portrét ženy, která si zachovává lidskost uprostřed měnícího se světa.

*„Babička říkávala: Čím jednodušeji žijeme, tím šťastnější jsme."*

Ideální pro: každého, kdo chce pochopit českou duši.

---

## 2. Osudy dobrého vojáka Švejka – Jaroslav Hašek

Švejk je světová ikona. Hašek vytvořil jednu z nejoriginálnějších postav světové literatury – člověka, jehož prostoduchá upřímnost funguje jako zrcadlo absurdity války a byrokracie.

Přečtěte si alespoň první díl. Pochopíte, proč se Švejk překládal do desítek jazyků.

---

## 3. Máj – Karel Hynek Mácha

Nejslavnější česká báseň. Mácha v ní spojil romantiku s existenciálním zoufalstvím způsobem, který dodnes působí moderně. Kratičká, ale nezapomenutelná.

*„Byl pozdní večer – první máj – večerní máj – byl lásky čas."*

---

## 4. R.U.R. – Karel Čapek

Hra, která dala světu slovo **robot**. Čapek v ní předjímal otázky, se kterými se potýkáme dnes: co je to člověčenství, kde končí stroj a začíná bytost? Číst ji v roce 2025 je zvláštní zážitek.

---

## 5. Pohádky – Karel Čapek

Čapkovy pohádky nejsou jen pro děti. Jsou plné humoru, ironie a moudrosti, která dokáže oslovit dospělé stejně jako malé čtenáře. Skvělé čtení pro celou rodinu.

---

## Jak je stáhnout?

Všechna díla jsou na **eknihyzdarma.cz** dostupná zdarma ve formátech EPUB, MOBI a PDF. Stačí najít autora nebo název v naší knihovně, kliknout a stáhnout. Nevíte, na čem číst? Podívejte se do sekce **Jak číst e-knihy** v hlavním menu.`,
  },
];

// ─── Pomocné funkce ────────────────────────────────────────────────────────────

async function deleteAllArticles() {
  console.log('\n🗑️  Mazám stávající články...');
  const res = await fetch(`${STRAPI_URL}/api/articles`, { headers });
  const data = await res.json();
  const existing = data.data || [];

  if (existing.length === 0) {
    console.log('  (žádné články k mazání)');
    return;
  }

  for (const article of existing) {
    const del = await fetch(`${STRAPI_URL}/api/articles/${article.documentId}`, {
      method: 'DELETE',
      headers,
    });
    if (del.ok) {
      console.log(`  ✓ Smazán: ${article.title}`);
    } else {
      console.log(`  ✗ Chyba při mazání: ${article.title}`);
    }
  }
}

async function downloadAndUploadImage(imageUrl, filename) {
  console.log(`  ↓ Stahuji: ${filename}`);
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);

  const blob = await imgRes.blob();
  const formData = new FormData();
  formData.append('files', blob, filename);

  console.log(`  ↑ Nahrávám do Strapi...`);
  const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Upload selhal (${uploadRes.status}): ${err.substring(0, 200)}`);
  }

  const uploaded = await uploadRes.json();
  return uploaded[0];
}

async function createArticle(article, coverId) {
  const res = await fetch(`${STRAPI_URL}/api/articles`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        title: article.title,
        slug: article.slug,
        perex: article.perex,
        content: article.content,
        cover: coverId || undefined,
        publishedAt: new Date().toISOString(),
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vytvoření selhalo (${res.status}): ${err.substring(0, 300)}`);
  }

  return res.json();
}

// ─── Hlavní ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 Seed článků → ${STRAPI_URL}\n`);

  await deleteAllArticles();

  console.log('\n📝 Vytvářím nové články...');

  for (const article of articles) {
    console.log(`\n── ${article.title}`);

    let coverId = null;
    try {
      const uploaded = await downloadAndUploadImage(article.imageUrl, article.imageName);
      coverId = uploaded.id;
      console.log(`  ✓ Obrázek: id=${coverId}`);
    } catch (err) {
      console.warn(`  ⚠ Obrázek se nepodařilo nahrát: ${err.message}`);
    }

    try {
      const result = await createArticle(article, coverId);
      console.log(`  ✓ Článek vytvořen (documentId: ${result.data.documentId})`);
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
    }
  }

  console.log('\n✅ Hotovo!\n');
}

main().catch(console.error);
