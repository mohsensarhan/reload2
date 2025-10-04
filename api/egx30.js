export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// Yahoo Finance for EGX30 Index
const YAHOO_EGX30_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/EGX30.CA?interval=1mo&range=2y';

export default async function handler() {
  try {
    const response = await fetch(YAHOO_EGX30_URL, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      return fail(response.status, `Yahoo Finance ${response.status}`);
    }
    
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      return fail(500, 'Invalid Yahoo Finance response');
    }
    
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;
    
    const points = timestamps
      .map((ts, i) => {
        const date = new Date(ts * 1000);
        const monthDate = date.toISOString().substring(0, 7);
        const value = closes[i];
        if (!value) return null;
        return { date: monthDate, value: Number(value.toFixed(2)) };
      })
      .filter(Boolean);
    
    // Calculate YoY
    const pointsWithYoY = points.map((point, index) => {
      const yearAgoDate = new Date(point.date);
      yearAgoDate.setFullYear(yearAgoDate.getFullYear() - 1);
      const yearAgoKey = yearAgoDate.toISOString().substring(0, 7);
      
      const yearAgoPoint = points.find(p => p.date === yearAgoKey);
      if (yearAgoPoint && yearAgoPoint.value) {
        const yoyChange = ((point.value - yearAgoPoint.value) / yearAgoPoint.value) * 100;
        return { ...point, yoyChange: Number(yoyChange.toFixed(2)) };
      }
      
      return point;
    });
    
    return json({
      source: 'Yahoo Finance',
      unit: 'points',
      frequency: 'monthly',
      points: pointsWithYoY
    });
  } catch (error) {
    return fail(500, error.message);
  }
}