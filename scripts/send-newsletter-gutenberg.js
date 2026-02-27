/**
 * Rozešle Gutenberg newsletter dalším 300 kontaktům z hlavního seznamu,
 * kteří ještě email nedostali (automaticky vylučuje kontakty z předchozích batchů).
 *
 * Logika:
 *   1. Načte všechny emaily z SENT_LIST_IDS (seznamy, které už email dostaly)
 *   2. Z MAIN_LIST_ID vezme dalších LIMIT kontaktů, kteří nejsou v "sent" sadě
 *   3. Vytvoří dočasný Brevo seznam, naplní ho a pošle kampaň
 *
 * Použití:
 *   BREVO_API_KEY=xxx node scripts/send-newsletter-gutenberg.js
 *   BREVO_API_KEY=xxx DRY_RUN=true node scripts/send-newsletter-gutenberg.js
 *
 * Nastavení:
 *   MAIN_LIST_ID   – ID hlavního seznamu (výchozí: 2)
 *   SENT_LIST_IDS  – čárkou oddělené IDs již rozeslaných batchů (výchozí: 3)
 *   LIMIT          – kolik kontaktů poslat v tomto batchi (výchozí: 300)
 *   DRY_RUN        – true = jen zobraz, nepošli
 */

const BREVO_KEY    = process.env.BREVO_API_KEY;
const MAIN_LIST_ID = parseInt(process.env.MAIN_LIST_ID || '2');
const SENT_LIST_IDS = (process.env.SENT_LIST_IDS || '3').split(',').map(Number);
const LIMIT        = parseInt(process.env.LIMIT || '300');
const DRY_RUN      = process.env.DRY_RUN === 'true';

if (!BREVO_KEY) {
  console.error('❌ Chybí BREVO_API_KEY');
  process.exit(1);
}

const HEADERS = {
  'api-key': BREVO_KEY,
  'Content-Type': 'application/json',
};

const SENDER_NAME  = 'eknihyzdarma.cz';
const SENDER_EMAIL = 'info@eknihyzdarma.cz';
const SUBJECT      = '🇬🇧 Nově: 10 000 anglických klasik zdarma ke stažení';

const HTML = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nové anglické knihy na eknihyzdarma.cz</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#289ad1;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                📚 eknihyzdarma.cz
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Bezplatná česká e-knihovna
              </p>
            </td>
          </tr>

          <!-- HERO obrázek -->
          <tr>
            <td style="padding:0;">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80"
                alt="Klasické knihy"
                width="600"
                style="display:block;width:100%;height:220px;object-fit:cover;"
              />
            </td>
          </tr>

          <!-- HLAVNÍ OBSAH -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <h2 style="margin:0 0 12px;color:#111827;font-size:24px;font-weight:700;line-height:1.3;">
                🇬🇧 Nově: 10 000 anglických klasik zdarma ke stažení
              </h2>
              <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
                Rozšiřujeme naši knihovnu o tisíce světových klasik v angličtině. Díky spolupráci s <strong>Project Gutenberg</strong> – největší bezplatnou digitální knihovnou na světě – nyní nabízíme ke stažení díla těch největších literárních jmen.
              </p>

              <!-- Výčet kategorií -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
                <tr>
                  <td style="background:#f0f9ff;border-left:4px solid #289ad1;border-radius:0 8px 8px 0;padding:16px 20px;">
                    <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.8;">
                      🔍 <strong>Detektivky</strong> – Arthur Conan Doyle, Sherlock Holmes série<br/>
                      💕 <strong>Romantika</strong> – Jane Austen, Charlotte Brontë<br/>
                      🚀 <strong>Sci-fi</strong> – H.G. Wells, Edgar Rice Burroughs<br/>
                      🧛 <strong>Horory</strong> – Bram Stoker (Dracula), Mary Shelley (Frankenstein)<br/>
                      ⚓ <strong>Dobrodružství</strong> – Mark Twain, Jack London, Jules Verne<br/>
                      📜 <strong>Filozofie</strong> – Platón, Nietzsche, Darwin
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;color:#4b5563;font-size:16px;line-height:1.6;">
                Knihy jsou dostupné ve formátu <strong>EPUB</strong> a mnoho z nich také <strong>MOBI</strong> pro čtečky Kindle. Stahování je zcela <strong>zdarma, bez registrace</strong>. Nové tituly přibývají každý týden automaticky.
              </p>

              <!-- CTA tlačítko -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
                <tr>
                  <td align="center" style="background-color:#289ad1;border-radius:8px;">
                    <a
                      href="https://eknihyzdarma.cz/anglicke-knihy"
                      style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;"
                    >
                      Prozkoumat anglické knihy →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0 24px;" />
            </td>
          </tr>

          <!-- SEKCE – TOP TITULY -->
          <tr>
            <td style="padding:0 40px 32px;">
              <h3 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">
                Nejpopulárnější tituly právě teď
              </h3>
              <table width="100%" cellpadding="0" cellspacing="8">
                <tr>
                  <td width="50%" style="padding:0 8px 8px 0;vertical-align:top;">
                    <a href="https://eknihyzdarma.cz/anglicke-knihy" style="text-decoration:none;">
                      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;">
                        <span style="font-size:20px;">📖</span>
                        <p style="margin:6px 0 2px;color:#111827;font-size:14px;font-weight:600;">Pride and Prejudice</p>
                        <p style="margin:0;color:#6b7280;font-size:12px;">Jane Austen</p>
                      </div>
                    </a>
                  </td>
                  <td width="50%" style="padding:0 0 8px 8px;vertical-align:top;">
                    <a href="https://eknihyzdarma.cz/anglicke-knihy" style="text-decoration:none;">
                      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;">
                        <span style="font-size:20px;">📖</span>
                        <p style="margin:6px 0 2px;color:#111827;font-size:14px;font-weight:600;">Adventures of Sherlock Holmes</p>
                        <p style="margin:0;color:#6b7280;font-size:12px;">Arthur Conan Doyle</p>
                      </div>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:0 8px 0 0;vertical-align:top;">
                    <a href="https://eknihyzdarma.cz/anglicke-knihy" style="text-decoration:none;">
                      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;">
                        <span style="font-size:20px;">📖</span>
                        <p style="margin:6px 0 2px;color:#111827;font-size:14px;font-weight:600;">Frankenstein</p>
                        <p style="margin:0;color:#6b7280;font-size:12px;">Mary Shelley</p>
                      </div>
                    </a>
                  </td>
                  <td width="50%" style="padding:0 0 0 8px;vertical-align:top;">
                    <a href="https://eknihyzdarma.cz/anglicke-knihy" style="text-decoration:none;">
                      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;">
                        <span style="font-size:20px;">📖</span>
                        <p style="margin:6px 0 2px;color:#111827;font-size:14px;font-weight:600;">The War of the Worlds</p>
                        <p style="margin:0;color:#6b7280;font-size:12px;">H.G. Wells</p>
                      </div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                📚 <strong style="color:#289ad1;">eknihyzdarma.cz</strong> – Bezplatné e-knihy pro každého
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                Dostáváte tento e-mail, protože jste se přihlásili k odběru novinek.<br/>
                <a href="{{unsubscribeUrl}}" style="color:#9ca3af;">Odhlásit se z odběru</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

async function api(method, path, body) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return json;
}

/** Načte VŠECHNY kontakty ze zadaného seznamu (stránkovaně) */
async function fetchAllContacts(listId) {
  const all = [];
  let offset = 0;
  const pageSize = 500;
  while (true) {
    const data = await api('GET', `/contacts/lists/${listId}/contacts?limit=${pageSize}&offset=${offset}&sort=asc`);
    const contacts = data.contacts || [];
    all.push(...contacts);
    if (contacts.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

async function createList(name) {
  const data = await api('POST', '/contacts/lists', { name, folderId: 1 });
  return data.id;
}

async function addContactsToList(listId, emails) {
  const chunkSize = 150;
  for (let i = 0; i < emails.length; i += chunkSize) {
    await api('POST', `/contacts/lists/${listId}/contacts/add`, { emails: emails.slice(i, i + chunkSize) });
  }
}

async function createCampaign(listId, batchNum) {
  const date = new Date().toISOString().slice(0, 10);
  const data = await api('POST', '/emailCampaigns', {
    name: `Gutenberg newsletter batch ${batchNum} (${date})`,
    subject: SUBJECT,
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    type: 'classic',
    htmlContent: HTML,
    recipients: { listIds: [listId] },
  });
  return data.id;
}

async function sendCampaign(campaignId) {
  await api('POST', `/emailCampaigns/${campaignId}/sendNow`);
}

async function main() {
  try {
    // 1. Načti emaily, které už email dostaly
    console.log(`📋 Načítám již odeslané kontakty ze seznamů: ${SENT_LIST_IDS.join(', ')}...`);
    const sentEmails = new Set();
    for (const listId of SENT_LIST_IDS) {
      const contacts = await fetchAllContacts(listId);
      contacts.forEach(c => sentEmails.add(c.email.toLowerCase()));
      console.log(`   Seznam ${listId}: ${contacts.length} kontaktů (celkem vyloučeno: ${sentEmails.size})`);
    }

    // 2. Načti kontakty z hlavního seznamu a vyfiltruj nové
    console.log(`\n📋 Načítám kontakty z hlavního seznamu ${MAIN_LIST_ID}...`);
    const newContacts = [];
    let offset = 0;
    const pageSize = 500;

    while (newContacts.length < LIMIT) {
      const data = await api('GET', `/contacts/lists/${MAIN_LIST_ID}/contacts?limit=${pageSize}&offset=${offset}&sort=asc`);
      const contacts = data.contacts || [];
      if (contacts.length === 0) break;

      for (const c of contacts) {
        if (!sentEmails.has(c.email.toLowerCase())) {
          newContacts.push(c);
          if (newContacts.length >= LIMIT) break;
        }
      }

      offset += contacts.length;
      if (contacts.length < pageSize) break;
    }

    console.log(`✅ Nalezeno ${newContacts.length} nových kontaktů (nevyloučených)`);

    if (newContacts.length === 0) {
      console.log('⚠️  Žádné nové kontakty. Všichni ze seznamu už email dostali?');
      return;
    }

    // Číslo batche = počet existujících sent listů + 1
    const batchNum = SENT_LIST_IDS.length + 1;

    if (DRY_RUN) {
      console.log(`\n🔍 DRY RUN – batch ${batchNum}, první 5 kontaktů:`);
      newContacts.slice(0, 5).forEach(c => console.log(`  ${c.email}`));
      if (newContacts.length > 5) console.log(`  ... a dalších ${newContacts.length - 5}`);
      console.log('\nNastav DRY_RUN=false pro skutečné odeslání.');
      return;
    }

    const emails = newContacts.map(c => c.email);

    // 3. Vytvoř dočasný seznam pro tento batch
    const batchDate = new Date().toISOString().slice(0, 16).replace('T', ' ');
    console.log(`\n📂 Vytvářím seznam pro batch ${batchNum}...`);
    const tempListId = await createList(`Gutenberg batch ${batchNum} – ${batchDate}`);
    console.log(`   → Nový seznam ID: ${tempListId}`);

    // 4. Přidej kontakty
    console.log(`➕ Přidávám ${emails.length} kontaktů...`);
    await addContactsToList(tempListId, emails);
    console.log(`   → Hotovo`);

    // 5. Vytvoř kampaň
    console.log(`📧 Vytvářím kampaň...`);
    const campaignId = await createCampaign(tempListId, batchNum);
    console.log(`   → Kampaň ID: ${campaignId}`);

    // 6. Odešli
    console.log(`🚀 Odesílám...`);
    await sendCampaign(campaignId);

    console.log(`\n✅ Hotovo! Newsletter odeslán ${emails.length} kontaktům (batch ${batchNum}).`);
    console.log(`   Kampaň ID: ${campaignId}  |  Seznam ID: ${tempListId}`);
    console.log(`   Příště přidej seznam ${tempListId} do SENT_LIST_IDS:`);
    console.log(`   SENT_LIST_IDS=${[...SENT_LIST_IDS, tempListId].join(',')} BREVO_API_KEY=xxx node scripts/send-newsletter-gutenberg.js`);

  } catch (err) {
    console.error('❌ Chyba:', err.message);
    process.exit(1);
  }
}

main();
