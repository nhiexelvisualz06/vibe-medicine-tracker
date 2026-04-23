// ─────────────────────────────────────────────────────────────
//  pantry.js  –  thin wrapper around Pantry JSON Cloud API
//  https://getpantry.cloud/
//
//  SETUP:
//    1. Go to https://getpantry.cloud/ and create a free account.
//    2. Copy your Pantry ID from the dashboard.
//    3. Replace PANTRY_ID below with your actual Pantry ID.
//    4. Replace BASKET_NAME below with your basket name
//       (the key you used when creating the basket in Pantry).
//
//  WHY POST and not PUT?
//      Pantry's PUT endpoint *merges* the new data on top of the
//      existing basket, which causes array entries to be duplicated
//      on every save.  POST fully *replaces* the basket contents,
//      which is what we want for a clean overwrite every time.
// ─────────────────────────────────────────────────────────────

const PANTRY_ID   = '088f2be5-90f6-48fc-b154-db342b332711';   // <- replace this
const BASKET_NAME = 'medicineUsers';        // <- replace this if different

const BASE_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BASKET_NAME}`;

export async function getBasket() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error(`Failed to fetch basket: ${res.statusText}`);
  return res.json();
}

export async function updateBasket(data) {
  // POST fully replaces the basket.
  // PUT only merges/appends and causes duplicate array entries on every save.
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update basket: ${res.statusText}`);
  // Pantry POST returns plain text ("Your Pantry was updated"), not JSON
  return res.text();
}
