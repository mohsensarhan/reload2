export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// UNHCR Egypt data
const UNHCR_URL = 'https://data.unhcr.org/api/population/get?widget_id=314159&sv_id=39&population_type=orig';

export default async function handler() {
  try {
    const r = await fetch(UNHCR_URL, { headers: { accept: 'application/json' } });
    if (!r.ok) return fail(r.status, `UNHCR ${r.status}`);
    const body = await r.json();
    
    // Extract series from UNHCR response
    const raw = body?.data || [];
    const series = raw
      .map(item => ({ date: item.year, value: Number(item.individuals) }))
      .filter(p => p.date && Number.isFinite(p.value))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    return json({ source: 'UNHCR', unit: 'individuals', frequency: 'annual', series });
  } catch (e) {
    return fail(500, e.message);
  }
}