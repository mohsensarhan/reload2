export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// IMF CPI data for Egypt
const IMF_CSV = 'https://www.imf.org/external/datamapper/api/PCPIPCH@WEO/EGY';

export default async function handler() {
  try {
    const r = await fetch(IMF_CSV, { headers: { accept: 'application/json' } });
    if (!r.ok) return fail(r.status, `IMF CPI ${r.status}`);
    const body = await r.json();
    
    // Extract series from IMF DataMapper response
    const raw = body?.PCPIPCH?.EGY?.values || {};
    const series = Object.entries(raw)
      .map(([year, value]) => ({ date: year, value: Number(value) }))
      .filter(p => p.date && Number.isFinite(p.value))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    return json({ source: 'IMF', unit: '% change', frequency: 'annual', series });
  } catch (e) {
    return fail(500, e.message);
  }
}