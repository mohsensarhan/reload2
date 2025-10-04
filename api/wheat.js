export const config = { runtime: 'edge' };
import { json, fail, csvToSeries } from './_utils.js';

// USDA wheat prices
const WHEAT_CSV = 'https://apps.fas.usda.gov/psdonline/api/webapi_get.aspx?type=excel&commodity_code=0440000&market_year=2020,2021,2022,2023,2024';

export default async function handler() {
  try {
    const r = await fetch(WHEAT_CSV, { headers: { accept: 'text/csv' } });
    if (!r.ok) return fail(r.status, `USDA wheat ${r.status}`);
    const csv = await r.text();
    const series = csvToSeries(csv, 'Egypt');
    return json({ source: 'USDA', unit: '$/mt', frequency: 'monthly', series });
  } catch (e) {
    return fail(500, e.message);
  }
}