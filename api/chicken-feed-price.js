export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// FRED API for Soybean Meal (primary chicken feed ingredient)
const FRED_SOYMEAL_URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=PSOYBUSDM&cosd=2022-01-01';

export default async function handler() {
  try {
    const response = await fetch(FRED_SOYMEAL_URL, {
      headers: { 
        'User-Agent': 'EFB-Dashboard/1.0',
        'Accept': 'text/csv'
      }
    });
    
    if (!response.ok) {
      return json({ source: 'fallback', unit: 'USD/MT', frequency: 'monthly', points: [] });
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const dataLines = lines.slice(1);
    
    const points = dataLines
      .map(line => {
        const [date, value] = line.split(',');
        const numValue = parseFloat(value);
        if (!date || !value || value === '.' || isNaN(numValue)) return null;
        const monthDate = date.substring(0, 7);
        return { date: monthDate, value: numValue };
      })
      .filter(Boolean);
    
    const monthlyData = {};
    points.forEach(p => {
      if (!monthlyData[p.date]) monthlyData[p.date] = [];
      monthlyData[p.date].push(p.value);
    });
    
    const monthlyPoints = Object.keys(monthlyData)
      .sort()
      .map(date => ({
        date,
        value: Number((monthlyData[date].reduce((a, b) => a + b, 0) / monthlyData[date].length).toFixed(2))
      }));
    
    return json({
      source: 'FRED',
      unit: 'USD/MT',
      frequency: 'monthly',
      points: monthlyPoints.slice(-24)
    });
  } catch (error) {
    return json({ source: 'fallback', unit: 'USD/MT', frequency: 'monthly', points: [] });
  }
}