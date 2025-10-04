export const config = { runtime: 'edge' };
import { json, fail } from './_utils.js';

// Yahoo Finance API for EGX30 (^CASE30)
const YAHOO_EGX30_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/%5ECASE30?interval=1d&range=2y';

export default async function handler() {
  try {
    const response = await fetch(YAHOO_EGX30_URL, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      return json({ source: 'fallback', unit: 'points', frequency: 'daily', points: [] });
    }
    
    const data = await response.json();
    
    if (!data?.chart?.result?.[0]) {
      return json({ source: 'fallback', unit: 'points', frequency: 'daily', points: [] });
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    
    // Convert to monthly data
    const monthlyData = {};
    timestamps.forEach((ts, i) => {
      if (closes[i] !== null && !isNaN(closes[i])) {
        const date = new Date(ts * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) monthlyData[monthKey] = [];
        monthlyData[monthKey].push(closes[i]);
      }
    });
    
    const monthlyPoints = Object.keys(monthlyData)
      .sort()
      .map(date => ({
        date,
        value: Number((monthlyData[date].reduce((a, b) => a + b, 0) / monthlyData[date].length).toFixed(2))
      }));
    
    return json({
      source: 'Yahoo Finance',
      unit: 'points',
      frequency: 'monthly',
      points: monthlyPoints.slice(-24)
    });
  } catch (error) {
    return json({ source: 'fallback', unit: 'points', frequency: 'monthly', points: [] });
  }
}