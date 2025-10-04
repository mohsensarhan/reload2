export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// IMF Primary Commodity Prices - Wheat
const IMF_WHEAT_URL = 'https://www.imf.org/external/np/res/commod/External_Data.xls';

// Alternative: Use FRED for wheat prices
const FRED_WHEAT_URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=PWHEAMTUSDM&cosd=2022-01-01';

export default async function handler() {
  try {
    // Use FRED as primary source (more reliable)
    const response = await fetch(FRED_WHEAT_URL, {
      headers: { 
        'User-Agent': 'EFB-Dashboard/1.0',
        'Accept': 'text/csv'
      }
    });
    
    if (!response.ok) {
      return fail(response.status, `FRED Wheat ${response.status}`);
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
        
        // Convert to YYYY-MM format for monthly data
        const monthDate = date.substring(0, 7);
        return { date: monthDate, value: Number(numValue.toFixed(2)) };
      })
      .filter(Boolean);
    
    // Group by month and take average
    const monthlyData = {};
    points.forEach(p => {
      if (!monthlyData[p.date]) {
        monthlyData[p.date] = [];
      }
      monthlyData[p.date].push(p.value);
    });
    
    const monthlyPoints = Object.keys(monthlyData)
      .sort()
      .map(date => ({
        date,
        value: Number((monthlyData[date].reduce((a, b) => a + b, 0) / monthlyData[date].length).toFixed(2))
      }));
    
    // Get last 24 months
    const last24Months = monthlyPoints.slice(-24);
    
    return json({
      source: 'FRED',
      unit: 'USD/MT',
      frequency: 'monthly',
      points: last24Months
    });
  } catch (error) {
    return fail(500, error.message);
  }
}