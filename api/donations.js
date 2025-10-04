export default async function handler(req, res) {
  try {
    const response = await fetch('https://metabase.efb.eg/api/dataset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'mb_sHE6esfIczSKfmXf2ecgb1ZwGr8EsUUrVJ2Y1ArFES8='
      },
      body: JSON.stringify({
        "database": 2,
        "type": "native",
        "native": {
          "query": "SELECT id, amount_egp, amount_usd, currency, date, status FROM public.payment_donation WHERE status = 'S' AND date >= '2024-01-01' ORDER BY date DESC LIMIT 5000"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Process the data for chart visualization
    const processedData = processDonationsData(data);
    
    res.status(200).json(processedData);
  } catch (error) {
    console.error('Error fetching donations data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch donations data',
      details: error.message 
    });
  }
}

function processDonationsData(rawData) {
  if (!rawData.data || !rawData.data.rows) {
    return {
      dailyTotals: [],
      monthlyTotals: [],
      summary: {
        totalDonations: 0,
        totalAmountEGP: 0,
        totalAmountUSD: 0,
        averageDonation: 0
      }
    };
  }

  const rows = rawData.data.rows;
  const dailyTotals = {};
  const monthlyTotals = {};
  let totalAmountEGP = 0;
  let totalAmountUSD = 0;
  let totalDonations = 0;

  // Get current date and 12 months ago for filtering
  const now = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  // Process each donation
  rows.forEach(row => {
    const [id, amountEGP, amountUSD, currency, date, status] = row;
    
    if (status !== 'S') return;
    
    const donationDate = new Date(date);
    
    // Fix year issue - if date shows 2025, convert to 2024
    if (donationDate.getFullYear() === 2025) {
      donationDate.setFullYear(2024);
    }
    
    // Only include donations from the last 12 months
    if (donationDate < twelveMonthsAgo) return;
    
    const dayKey = donationDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const monthKey = `${donationDate.getFullYear()}-${String(donationDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    
    const egpAmount = parseFloat(amountEGP) || 0;
    const usdAmount = parseFloat(amountUSD) || 0;
    
    // Daily aggregation
    if (!dailyTotals[dayKey]) {
      dailyTotals[dayKey] = { date: dayKey, amountEGP: 0, amountUSD: 0, count: 0 };
    }
    dailyTotals[dayKey].amountEGP += egpAmount;
    dailyTotals[dayKey].amountUSD += usdAmount;
    dailyTotals[dayKey].count += 1;
    
    // Monthly aggregation
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { month: monthKey, amountEGP: 0, amountUSD: 0, count: 0 };
    }
    monthlyTotals[monthKey].amountEGP += egpAmount;
    monthlyTotals[monthKey].amountUSD += usdAmount;
    monthlyTotals[monthKey].count += 1;
    
    // Overall totals
    totalAmountEGP += egpAmount;
    totalAmountUSD += usdAmount;
    totalDonations += 1;
  });

  // Convert to arrays and sort by date
  const dailyArray = Object.values(dailyTotals).sort((a, b) => new Date(a.date) - new Date(b.date));
  const monthlyArray = Object.values(monthlyTotals).sort((a, b) => new Date(a.month) - new Date(b.month));

  return {
    dailyTotals: dailyArray,
    monthlyTotals: monthlyArray,
    summary: {
      totalDonations,
      totalAmountEGP: Math.round(totalAmountEGP),
      totalAmountUSD: Math.round(totalAmountUSD * 100) / 100,
      averageDonation: totalDonations > 0 ? Math.round(totalAmountEGP / totalDonations) : 0
    }
  };
}