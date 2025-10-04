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
      { date: '2023-06', value: 28.3 },
      { date: '2024-01', value: 31.2 },
      { date: '2024-02', value: 32.1 },
      { date: '2024-03', value: 33.5 },
      { date: '2024-04', value: 34.2 },
      { date: '2024-05', value: 35.1 },
      { date: '2024-06', value: 35.8 }
    ];
    
    // Calculate YoY
    const dataWithYoY = mockData.map((point, index) => {
      const yearAgoDate = new Date(point.date);
      yearAgoDate.setFullYear(yearAgoDate.getFullYear() - 1);
      const yearAgoKey = yearAgoDate.toISOString().substring(0, 7);
      
      const yearAgoPoint = mockData.find(p => p.date === yearAgoKey);
      if (yearAgoPoint && yearAgoPoint.value) {
        const yoyChange = point.value - yearAgoPoint.value; // Change in inflation rate
        return { ...point, yoyChange: Number(yoyChange.toFixed(2)) };
      }
      
      return point;
    });
    
    return json({ 
      source: 'CBE', 
      unit: '% change', 
      frequency: 'monthly', 
      series: dataWithYoY,
      note: 'Mock data for demonstration. Replace with actual CBE data source.'
    });
  } catch (e) {
    return fail(500, e.message);
  }
}