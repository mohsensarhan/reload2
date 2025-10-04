export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// FRED API for Brent Crude Oil Prices
// Using public FRED data (no API key needed for basic access)
const FRED_BRENT_URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILBRENTEU&cosd=2022-01-01';

export default async function handler() {
  try {
    const response = await fetch(FRED_BRENT_URL, {
      headers: { 
        'User-Agent': 'EFB-Dashboard/1.0',
        'Accept': 'text/csv'
      }
    });
    
    if (!response.ok) {
      return fail(response.status, `FRED Brent ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    // Skip header
    const dataLines = lines.slice(1);
    
    // Parse CSV: DATE,VALUE
    const points = dataLines
      .map(line => {
        const [date, value] = line.split(',');
        const numValue = parseFloat(value);
        if (!date || !value || value === '.' || isNaN(numValue)) return null;
        return { date, value: numValue };
      })
      .filter(Boolean);
    
    // Calculate YoY for each point
    const pointsWithYoY = points.map((point, index) => {
      // Find value from 365 days ago
      const yearAgoIndex = points.findIndex(p => {
        const currentDate = new Date(point.date);
        const pDate = new Date(p.date);
        const daysDiff = Math.abs((currentDate - pDate) / (1000 * 60 * 60 * 24));
        return daysDiff >= 360 && daysDiff <= 370; // ~1 year ago (±5 days)
      });
      
      if (yearAgoIndex !== -1 && points[yearAgoIndex].value) {
        const yoyChange = ((point.value - points[yearAgoIndex].value) / points[yearAgoIndex].value) * 100;
        return { ...point, yoyChange: Number(yoyChange.toFixed(2)) };
      }
      
      return point;
    });
    
    // Get last 24 months of data
    const last24Months = pointsWithYoY.slice(-730); // ~2 years of daily data
    
    return json({
      source: 'FRED',
      unit: 'USD/barrel',
      frequency: 'daily',
      points: last24Months
    });
  } catch (error) {
    return fail(500, error.message);
  }
}