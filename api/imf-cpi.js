export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// FRED CPI data for Egypt
const FRED_CSV = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=EGYPCPIPCHPT';

export default async function handler() {
  try {
    const r = await fetch(FRED_CSV, { 
      headers: { 
        'User-Agent': 'EFB-Dashboard/1.0',
        'Accept': 'text/csv'
      } 
    });
    
    if (!r.ok) return fail(r.status, `FRED CPI ${r.status}`);
    
    const csvText = await r.text();
    const lines = csvText.trim().split('\n');
    const dataLines = lines.slice(1); // Skip header
    
    const series = dataLines
      .map(line => {
        const [date, value] = line.split(',');
        const numValue = parseFloat(value);
        if (!date || !value || value === '.' || isNaN(numValue)) return null;
        // Extract year from date (YYYY-MM-DD format)
        const year = date.substring(0, 4);
        return { date: year, value: numValue };
      })
      .filter(Boolean);
    
    // Calculate YoY (this is already a YoY indicator, but we can add MoM if needed)
    // For CPI inflation, the value itself is already YoY, so we'll just pass it through
    const seriesWithYoY = series.map((point, index) => {
      if (index > 0) {
        const prevValue = series[index - 1].value;
        const yoyChange = point.value - prevValue; // Change in inflation rate
        return { ...point, yoyChange: Number(yoyChange.toFixed(2)) };
      }
      return point;
    });

    return json({ source: 'FRED', unit: '% change', frequency: 'annual', series: seriesWithYoY });
  } catch (e) {
    return fail(500, e.message);
  }
}