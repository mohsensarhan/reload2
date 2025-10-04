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
          "query": "SELECT\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;id&quot; AS &quot;id&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;amount_egp&quot; AS &quot;amount_egp&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;amount_usd&quot; AS &quot;amount_usd&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;currency&quot; AS &quot;currency&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;date&quot; AS &quot;date&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;status&quot; AS &quot;status&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;user_email&quot; AS &quot;user_email&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;user_phonenumber&quot; AS &quot;user_phonenumber&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;user_fullname&quot; AS &quot;user_fullname&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;token_name&quot; AS &quot;token_name&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;program_id&quot; AS &quot;program_id&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;user_id&quot; AS &quot;user_id&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;subscription_id&quot; AS &quot;subscription_id&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;collection_date&quot; AS &quot;collection_date&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;payment_type&quot; AS &quot;payment_type&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;address&quot; AS &quot;address&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;city&quot; AS &quot;city&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;client_country&quot; AS &quot;client_country&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;client_ip&quot; AS &quot;client_ip&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;card_country&quot; AS &quot;card_country&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;conversion_rate&quot; AS &quot;conversion_rate&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;type_id&quot; AS &quot;type_id&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;special_donation_id&quot; AS &quot;special_donation_id&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;payment_code&quot; AS &quot;payment_code&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;payment_message&quot; AS &quot;payment_message&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;payment_option&quot; AS &quot;payment_option&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;cash_source_id&quot; AS &quot;cash_source_id&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;dedication_message&quot; AS &quot;dedication_message&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;honoree_email&quot; AS &quot;honoree_email&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;honoree_name&quot; AS &quot;honoree_name&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;isDedicated&quot; AS &quot;isDedicated&quot;,\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;circle_id&quot; AS &quot;circle_id&quot;\nFROM\n  &quot;public&quot;.&quot;payment_donation&quot;\nWHERE\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;status&quot; = 'completed'\nORDER BY\n  &quot;public&quot;.&quot;payment_donation&quot;.&quot;date&quot; DESC\nLIMIT\n  5000"
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

  // Process each donation
  rows.forEach(row => {
    const [id, amountEGP, amountUSD, currency, date, status] = row;
    
    if (status !== 'completed') return;
    
    const donationDate = new Date(date);
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