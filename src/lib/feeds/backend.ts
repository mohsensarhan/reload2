const base = ''; // same-origin /api

export async function fetchFFPI() {
  const r = await fetch(`${base}/api/ffpi`); if (!r.ok) throw new Error('FFPI'); return r.json();
}
export async function fetchIMFCPI(series='PCPIF_IX', country='EG', start='2019-01') {
  const r = await fetch(`${base}/api/imf-cpi?country=${country}&series=${series}&start=${start}`); if (!r.ok) throw new Error('IMF'); return r.json();
}
export async function fetchUNHCREgypt() {
  const r = await fetch(`${base}/api/unhcr-egy`); if (!r.ok) throw new Error('UNHCR'); return r.json();
}
export async function fetchWheat() {
  const r = await fetch(`${base}/api/wheat`); if (!r.ok) throw new Error('Wheat'); return r.json();
}
export async function fetchFX() {
  const r = await fetch(`${base}/api/fx`); if (!r.ok) throw new Error('FX'); return r.json();
}
export async function fetchDiet() {
  const r = await fetch(`${base}/api/diet-cost`); if (!r.ok) throw new Error('diet'); return r.json();
}
export async function fetchFIES() {
  const r = await fetch(`${base}/api/fies-egy`); if (!r.ok) throw new Error('fies'); return r.json();
}
export async function fetchCBEInflation() {
  const r = await fetch(`${base}/api/cbe-inflation`); if (!r.ok) throw new Error('CBE inflation'); return r.json();
}
export async function fetchCBEFoodInflation() {
  const r = await fetch(`${base}/api/cbe-food-inflation`); if (!r.ok) throw new Error('CBE food inflation'); return r.json();
}
export async function fetchBrentCrude() {
  const r = await fetch(`${base}/api/brent-crude`); if (!r.ok) throw new Error('Brent Crude'); return r.json();
}
export async function fetchEgyptUnemployment() {
  const r = await fetch(`${base}/api/egypt-unemployment`); if (!r.ok) throw new Error('Egypt Unemployment'); return r.json();
}
export async function fetchEgyptGDP() {
  const r = await fetch(`${base}/api/egypt-gdp`); if (!r.ok) throw new Error('Egypt GDP'); return r.json();
}
export async function fetchWheatPrice() {
  const r = await fetch(`${base}/api/wheat-price`); if (!r.ok) throw new Error('Wheat Price'); return r.json();
}
export async function fetchRicePrice() {
  const r = await fetch(`${base}/api/rice-price`); if (!r.ok) throw new Error('Rice Price'); return r.json();
}
export async function fetchCookingOilPrice() {
  const r = await fetch(`${base}/api/cooking-oil-price`); if (!r.ok) throw new Error('Cooking Oil Price'); return r.json();
}
export async function fetchBeefPrice() {
  const r = await fetch(`${base}/api/beef-price`); if (!r.ok) throw new Error('Beef Price'); return r.json();
}
export async function fetchChickenFeedPrice() {
  const r = await fetch(`${base}/api/chicken-feed-price`); if (!r.ok) throw new Error('Chicken Feed Price'); return r.json();
}
export async function fetchAnimalFeedPrice() {
  const r = await fetch(`${base}/api/animal-feed-price`); if (!r.ok) throw new Error('Animal Feed Price'); return r.json();
}
export async function fetchEGX30() {
  const r = await fetch(`${base}/api/egx30`); if (!r.ok) throw new Error('EGX30'); return r.json();
}