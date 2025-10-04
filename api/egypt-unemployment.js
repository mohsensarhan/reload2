export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// Our World in Data - Unemployment Rate
const OWID_UNEMPLOYMENT_URL = 'https://ourworldindata.org/grapher/unemployment-rate.csv';

export default async function handler() {
  try {
    const response = await fetch(OWID_UNEMPLOYMENT_URL, {
      headers: { 
        'User-Agent': 'EFB-Dashboard/1.0',
        'Accept': 'text/csv'
      }
    });
    
    if (!response.ok) {
      return fail(response.status, `OWID Unemployment ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    // Parse header to find column indices
    const header = lines[0].split(',');
    const entityIdx = header.indexOf('Entity');
    const yearIdx = header.indexOf('Year');
    const valueIdx = header.findIndex(h => h.includes('Unemployment'));
    
    if (entityIdx === -1 || yearIdx === -1 || valueIdx === -1) {
      return fail(500, 'Invalid CSV structure');
    }
    
    // Filter for Egypt data
    const egyptData = lines.slice(1)
      .map(line => {
        const cols = line.split(',');
        if (cols[entityIdx] === 'Egypt' && cols[yearIdx] && cols[valueIdx]) {
          const value = parseFloat(cols[valueIdx]);
          if (!isNaN(value)) {
            return {
              date: cols[yearIdx],
              value: Number(value.toFixed(2))
            };
          }
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Get last 10 years
    const last10Years = egyptData.slice(-10);
    
    return json({
      source: 'Our World in Data',
      unit: '%',
      frequency: 'yearly',
      points: last10Years
    });
  } catch (error) {
    return fail(500, error.message);
  }
}