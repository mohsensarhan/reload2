# Global Signals Optimization & Expansion Plan

## 📊 Current State Analysis

### Existing 8 Mini Charts (Verified)

| # | Indicator | Data Source | Update Frequency | Stale Time | Status |
|---|-----------|-------------|------------------|------------|--------|
| 1 | FAO Food Price Index | FAO via backend API | Monthly | 24h | ✅ Working |
| 2 | USD/EGP Exchange Rate | ExchangeRate-API | Daily | 6h | ✅ Working |
| 3 | Cost of Healthy Diet | Backend API | Yearly | 7d | ✅ Working |
| 4 | Food Insecurity (FIES) | Backend API | Yearly | 7d | ✅ Working |
| 5 | Egypt CPI YoY | CBE via backend API | Monthly | 6h | ✅ Working |
| 6 | CBE Food Inflation | CBE via backend API | Monthly | 6h | ✅ Working |
| 7 | Rain - ET₀ Anomaly | Open-Meteo | Daily | 1h | ✅ Working |
| 8 | Refugees in Egypt | Our World in Data | Yearly | 7d | ✅ Working |

---

## 🔧 Optimization Recommendations

### 1. **React Query Configuration** ✅ ALREADY OPTIMIZED

Current settings are well-configured:
```typescript
staleTime: Varies by data source (1h to 7d)
refetchOnWindowFocus: false (prevents unnecessary refetches)
```

**Recommendation:** Keep current settings. They're appropriate for each data source's update frequency.

### 2. **Parallel Fetching** ✅ ALREADY OPTIMIZED

Using `useQueries` for parallel fetching - excellent approach!

### 3. **Error Handling** ✅ ALREADY OPTIMIZED

Graceful fallback to mock data when APIs fail.

### 4. **Data Normalization** ✅ ALREADY OPTIMIZED

Consistent `{date, value}` format across all sources.

### 5. **Additional Optimizations to Implement**

#### A. Add Request Caching at API Level
```typescript
// In api/_utils.js - add cache headers
export const config = {
  runtime: 'edge',
  cache: 'force-cache',
  revalidate: 3600 // 1 hour
};
```

#### B. Implement Retry Logic with Exponential Backoff
```typescript
retry: 3,
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
```

#### C. Add Loading Skeletons
Currently shows nothing while loading - add skeleton UI.

#### D. Implement Data Compression
For large datasets, compress API responses.

---

## 🆕 Additional Indicators to Add

### **High Priority - Free APIs Available**

#### 1. **Brent Crude Oil Price** 🛢️
- **Source:** FRED API (Free)
- **Endpoint:** `https://fred.stlouisfed.org/series/POILBREUSDA`
- **Why:** Oil prices directly impact food transportation costs and fertilizer prices
- **Update:** Daily
- **Implementation:**
```typescript
{
  queryKey: ['brent-crude'],
  queryFn: async () => {
    const response = await fetch(
      'https://api.stlouisfed.org/fred/series/observations?series_id=POILBREUSDA&api_key=YOUR_KEY&file_type=json&limit=24'
    );
    return response.json();
  },
  staleTime: 24 * 3600 * 1000,
}
```

#### 2. **Egypt Unemployment Rate** 👥
- **Source:** Trading Economics API or World Bank
- **Why:** Unemployment affects food purchasing power
- **Update:** Quarterly
- **Alternative:** Our World in Data CSV

#### 3. **Egypt GDP Growth Rate** 📈
- **Source:** World Bank API or IMF
- **Why:** Economic growth indicator affecting food security
- **Update:** Quarterly
- **Implementation:**
```typescript
// World Bank API
https://api.worldbank.org/v2/country/EG/indicator/NY.GDP.MKTP.KD.ZG?format=json
```

#### 4. **Global Wheat Price Index** 🌾
- **Source:** FAO or IMF Primary Commodity Prices
- **Why:** Egypt is world's largest wheat importer
- **Update:** Monthly
- **Already have backend API:** `fetchWheat()`

#### 5. **Egypt Poverty Rate** 💰
- **Source:** World Bank Poverty & Inequality Platform
- **Why:** Direct indicator of food insecurity risk
- **Update:** Yearly
- **Implementation:**
```typescript
// World Bank API
https://api.worldbank.org/v2/country/EG/indicator/SI.POV.NAHC?format=json
```

#### 6. **Child Malnutrition Rate (Stunting)** 👶
- **Source:** Our World in Data
- **Why:** Key food security outcome indicator
- **Update:** Yearly
- **Implementation:**
```typescript
// OWID CSV
https://ourworldindata.org/grapher/share-of-children-younger-than-5-who-suffer-from-stunting.csv
```

#### 7. **Egypt Remittances (% of GDP)** 💸
- **Source:** World Bank
- **Why:** Remittances support food purchasing power
- **Update:** Yearly
- **Implementation:**
```typescript
https://api.worldbank.org/v2/country/EG/indicator/BX.TRF.PWKR.DT.GD.ZS?format=json
```

#### 8. **Global Food Supply Variability** 📊
- **Source:** FAO STAT
- **Why:** Indicates global food system stability
- **Update:** Yearly

---

## 🎯 Recommended Implementation Priority

### **Phase 1: Quick Wins (1-2 hours)**
1. ✅ Add Brent Crude Oil Price (FRED API)
2. ✅ Add Egypt Unemployment Rate (Our World in Data CSV)
3. ✅ Add Egypt GDP Growth (World Bank API)
4. ✅ Enable existing Wheat Price (already have backend API)

### **Phase 2: High-Value Additions (2-3 hours)**
5. ✅ Add Egypt Poverty Rate (World Bank API)
6. ✅ Add Child Malnutrition/Stunting (Our World in Data)
7. ✅ Add Remittances (World Bank API)

### **Phase 3: Advanced Indicators (3-4 hours)**
8. ✅ Add Food Supply Variability (FAO STAT)
9. ✅ Add Egypt Public Debt (% of GDP)
10. ✅ Add Agricultural Production Index

---

## 📋 Implementation Code Template

### New Hook Structure
```typescript
// src/hooks/useGlobalSignals.ts

export function useGlobalSignals() {
  const results = useQueries({
    queries: [
      // ... existing 8 queries ...
      
      // NEW: Brent Crude Oil
      {
        queryKey: ['brent-crude'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.brent === 'live') {
              const response = await fetch(
                'https://api.stlouisfed.org/fred/series/observations?series_id=POILBREUSDA&api_key=YOUR_KEY&file_type=json&limit=24'
              );
              const data = await response.json();
              return data.observations.map(obs => ({
                date: obs.date,
                value: parseFloat(obs.value)
              }));
            }
            return mockBrentCrude;
          } catch (error) {
            console.warn('[Brent] API failed:', error);
            return mockBrentCrude;
          }
        },
        staleTime: 24 * 3600 * 1000,
        refetchOnWindowFocus: false,
      },
      
      // NEW: Egypt Unemployment
      {
        queryKey: ['egypt-unemployment'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.unemployment === 'live') {
              const response = await fetch(
                'https://ourworldindata.org/grapher/unemployment-rate.csv'
              );
              const text = await response.text();
              // Parse CSV for Egypt data
              return parseCSVForEgypt(text);
            }
            return mockUnemployment;
          } catch (error) {
            console.warn('[Unemployment] API failed:', error);
            return mockUnemployment;
          }
        },
        staleTime: 7 * 24 * 3600 * 1000,
        refetchOnWindowFocus: false,
      },
      
      // NEW: Egypt GDP Growth
      {
        queryKey: ['egypt-gdp-growth'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.gdp === 'live') {
              const response = await fetch(
                'https://api.worldbank.org/v2/country/EG/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=20'
              );
              const data = await response.json();
              return data[1].map(item => ({
                date: item.date,
                value: item.value
              })).filter(d => d.value !== null);
            }
            return mockGDPGrowth;
          } catch (error) {
            console.warn('[GDP] API failed:', error);
            return mockGDPGrowth;
          }
        },
        staleTime: 7 * 24 * 3600 * 1000,
        refetchOnWindowFocus: false,
      },
    ]
  });
  
  return {
    // ... existing returns ...
    brentCrude: results[9].data || [],
    unemployment: results[10].data || [],
    gdpGrowth: results[11].data || [],
    isLoading: results.some(r => r.isLoading),
    isError: results.some(r => r.isError),
  };
}
```

---

## 🎨 UI Layout Recommendations

### Current: 2 rows × 4 columns = 8 charts
### Proposed: 3 rows × 4 columns = 12 charts

**Row 1: Global Economic Pressure**
1. FAO Food Price Index
2. Brent Crude Oil Price 🆕
3. Global Wheat Price 🆕
4. USD/EGP Exchange Rate

**Row 2: Egypt Economic Indicators**
5. Egypt CPI YoY
6. CBE Food Inflation
7. Egypt GDP Growth 🆕
8. Egypt Unemployment Rate 🆕

**Row 3: Food Security & Social**
9. Cost of Healthy Diet
10. Food Insecurity (FIES)
11. Child Malnutrition 🆕
12. Refugees in Egypt

**Row 4: Environmental & Other** (Optional)
13. Rain - ET₀ Anomaly
14. Egypt Poverty Rate 🆕
15. Remittances (% GDP) 🆕
16. Agricultural Production Index 🆕

---

## 🔑 API Keys Needed

### Free APIs (No Key Required)
- ✅ Our World in Data (CSV)
- ✅ ExchangeRate-API
- ✅ Open-Meteo
- ✅ World Bank API (no key for basic access)

### Free APIs (Key Required - Free Tier)
- 🔑 FRED API (Federal Reserve Economic Data)
  - Sign up: https://fred.stlouisfed.org/docs/api/api_key.html
  - Free tier: 120 requests/minute
  
- 🔑 Trading Economics (Optional)
  - Free tier: 1000 requests/month
  - Alternative: Use World Bank instead

---

## 📈 Performance Impact Analysis

### Current Load
- 9 API calls on page load
- Total data: ~500KB
- Load time: ~2-3 seconds

### After Adding 4 New Indicators
- 13 API calls on page load
- Total data: ~700KB
- Estimated load time: ~3-4 seconds
- **Impact:** Minimal (all parallel)

### Mitigation Strategies
1. ✅ Already using parallel fetching
2. ✅ Already using appropriate stale times
3. ✅ Already using mock fallbacks
4. 🆕 Add loading skeletons
5. 🆕 Add progressive loading (show data as it arrives)

---

## 🧪 Testing Checklist

- [ ] Test each new API endpoint independently
- [ ] Verify mock data fallbacks work
- [ ] Test error handling for failed requests
- [ ] Verify data normalization
- [ ] Test loading states
- [ ] Test with slow network (throttling)
- [ ] Verify stale time behavior
- [ ] Test parallel loading performance
- [ ] Verify UI layout with 12+ charts
- [ ] Test responsive design on mobile

---

## 📝 Summary

### Current State: ✅ WELL OPTIMIZED
- Parallel fetching
- Appropriate cache times
- Error handling with fallbacks
- Data normalization

### Recommended Additions: 4-8 New Indicators
**Priority 1 (Immediate):**
1. Brent Crude Oil Price
2. Egypt Unemployment Rate
3. Egypt GDP Growth
4. Global Wheat Price

**Priority 2 (High Value):**
5. Egypt Poverty Rate
6. Child Malnutrition
7. Remittances
8. Agricultural Production Index

### Implementation Time
- Phase 1: 2-3 hours
- Phase 2: 3-4 hours
- Total: 5-7 hours for complete implementation

### Expected Outcome
- 12-16 comprehensive indicators
- Better coverage of food security factors
- Minimal performance impact
- Enhanced decision-making capability

---

**Ready to implement? Let me know which indicators you'd like to add first!** 🚀