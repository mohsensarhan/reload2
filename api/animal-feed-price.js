export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// FRED API for Corn (primary animal feed)
const FRED_CORN_URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=PMAIZMTUSDM';

export default async function handler() {
  try {
    const response = await fetch(FRED_CORN_URL, {
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
    
    // Calculate YoY
    const pointsWithYoY = monthlyPoints.map((point, index) => {
      const yearAgoDate = new Date(point.date);
      yearAgoDate.setFullYear(yearAgoDate.getFullYear() - 1);
      const yearAgoKey = yearAgoDate.toISOString().substring(0, 7);
      
      const yearAgoPoint = monthlyPoints.find(p => p.date === yearAgoKey);
      if (yearAgoPoint && yearAgoPoint.value) {
        const yoyChange = ((point.value - yearAgoPoint.value) / yearAgoPoint.value) * 100;
        return { ...point, yoyChange: Number(yoyChange.toFixed(2)) };
      }
      
      return point;
    });
    
    return json({
      source: 'FRED',
      unit: 'USD/MT',
      frequency: 'monthly',
      points: pointsWithYoY.slice(-24)
    });
  } catch (error) {
    return json({ source: 'fallback', unit: 'USD/MT', frequency: 'monthly', points: [] });
  }
}