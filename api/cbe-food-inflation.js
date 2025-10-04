export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// Central Bank of Egypt food inflation data
const CBE_URL = 'https://www.cbe.org.eg/en/EconomicResearch/Statistics/Pages/InflRates.aspx';

export default async function handler() {
  try {
    // For now, return mock data as CBE doesn't have a direct API
    // In production, you would scrape or use their official data source
    const mockData = [
      { date: '2023-01', value: 25.4 },
      { date: '2023-02', value: 26.1 },
      { date: '2023-03', value: 26.7 },
      { date: '2023-04', value: 27.2 },
      { date: '2023-05', value: 27.8 },
      { date: '2023-06', value: 28.3 }
    ];
    
    return json({ 
      source: 'CBE', 
      unit: '% change', 
      frequency: 'monthly', 
      series: mockData,
      note: 'Mock data for demonstration. Replace with actual CBE data source.'
    });
  } catch (e) {
    return fail(500, e.message);
  }
}