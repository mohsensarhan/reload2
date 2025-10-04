export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// World Bank API - Egypt GDP Growth Rate
const WB_GDP_URL = 'https://api.worldbank.org/v2/country/EG/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=20&date=2014:2024';

export default async function handler() {
  try {
    const response = await fetch(WB_GDP_URL, {
      headers: { 
        'User-Agent': 'EFB-Dashboard/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      return fail(response.status, `World Bank GDP ${response.status}`);
    }
    
    const data = await response.json();
    
    // World Bank API returns [metadata, data]
    if (!Array.isArray(data) || data.length < 2) {
      return fail(500, 'Invalid World Bank API response');
    }
    
    const gdpData = data[1];
    
    if (!Array.isArray(gdpData)) {
      return fail(500, 'No GDP data available');
    }
    
    // Parse and filter data
    const points = gdpData
      .map(item => {
        if (item.value !== null && item.date) {
          return {
            date: item.date,
            value: Number(item.value.toFixed(2))
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return json({
      source: 'World Bank',
      unit: '% annual',
      frequency: 'yearly',
      points
    });
  } catch (error) {
    return fail(500, error.message);
  }
}