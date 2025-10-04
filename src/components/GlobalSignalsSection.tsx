import React from 'react';
import { PageGrid } from '@/layout/PageGrid';
import { Card } from '@/components/ui/card';
import { MetricMicroCard } from './MetricMicroCard';
import { useGlobalSignals } from '@/hooks/useGlobalSignals';
import { FORCE_MOCK, DATA_SOURCE } from '@/config/dataMode';

// Safe array access helpers
const last = <T,>(arr: T[]) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : undefined);
const prev = <T,>(arr: T[]) => (Array.isArray(arr) && arr.length > 1 ? arr[arr.length - 2] : undefined);

// Get YoY from API data (preferred) or calculate manually as fallback
const getYoY = (arr: any[]): number | undefined => {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  
  // First, try to get yoyChange from the latest data point (from API)
  const latest = arr[arr.length - 1];
  if (latest && typeof latest.yoyChange === 'number') {
    return latest.yoyChange;
  }
  
  // Fallback: calculate manually if we have enough data (12 months ago)
  if (arr.length < 13) return undefined;
  const curr = arr[arr.length - 1];
  const yearAgo = arr[arr.length - 13];
  if (!curr || !yearAgo || typeof curr.value !== 'number' || typeof yearAgo.value !== 'number') return undefined;
  return ((curr.value - yearAgo.value) / yearAgo.value) * 100;
};

// Helper to determine data status
const getDataStatus = (source: keyof typeof DATA_SOURCE, isLoading: boolean, isError: boolean): 'live' | 'mock' | 'disconnected' => {
  if (isError) return 'disconnected';
  return DATA_SOURCE[source] === 'live' ? 'live' : 'mock';
};

export function GlobalSignalsSection() {
  const s = useGlobalSignals();

  return (
    <div className="space-y-3">
      {FORCE_MOCK && (
        <Card className="executive-card p-3 text-[12px] text-muted-foreground">
          Mock mode is <strong>ON</strong> (CORS-safe preview). Flip <code>FORCE_MOCK=false</code> in <code>src/config/dataMode.ts</code> after deploying /api proxies.
        </Card>
      )}

      {/* Row 1: Global Food & Economic Pressure */}
      <PageGrid cols={4} className="mb-6">
        <MetricMicroCard
          title="FAO Food Price Index"
          value={Number((last(s.ffpi) as any)?.value) || 0}
          format="number"
          unit="index"
          description="Measures global food commodity price changes. Index value where 2014-2016 average = 100."
          dataStatus={getDataStatus('ffpi', s.isLoading, s.isError)}
          dataSource="FAO"
          delta={(() => {
            const curr = last(s.ffpi) as any;
            const prevVal = prev(s.ffpi) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          yoyChange={getYoY(s.ffpi)}
          spark={(s.ffpi as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Brent Crude Oil"
          value={Number((last(s.brent) as any)?.value) || 0}
          format="number"
          unit="USD/barrel"
          description="Global oil benchmark affecting food transport costs and fertilizer prices."
          dataStatus={getDataStatus('brent', s.isLoading, s.isError)}
          dataSource="FRED"
          delta={(() => {
            const curr = last(s.brent) as any;
            const prevVal = prev(s.brent) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          yoyChange={getYoY(s.brent)}
          spark={(s.brent as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="USD/EGP Exchange Rate"
          value={Number((last(s.fx) as any)?.value) || 0}
          format="number"
          unit="EGP per USD"
          description="Egyptian Pounds per US Dollar. Higher values mean weaker EGP, making imports more expensive."
          dataStatus={getDataStatus('fx', s.isLoading, s.isError)}
          dataSource="Central Bank"
          delta={(() => {
            const curr = last(s.fx) as any;
            const prevVal = prev(s.fx) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          yoyChange={getYoY(s.fx)}
          spark={(s.fx as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Egypt EGX30 Index"
          value={Number((last(s.egx30) as any)?.value) || 0}
          format="number"
          unit="points"
          description="Egypt's benchmark stock market index tracking top 30 companies. Indicates economic confidence."
          dataStatus={getDataStatus('egx30', s.isLoading, s.isError)}
          dataSource="Yahoo Finance"
          delta={(() => {
            const curr = last(s.egx30) as any;
            const prevVal = prev(s.egx30) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          yoyChange={getYoY(s.egx30)}
          spark={(s.egx30 as any[]).map(p => ({ t: p.date, v: p.value }))}
        />
      </PageGrid>

      {/* Row 2: Commodity Prices - Staples */}
      <PageGrid cols={4} className="mb-6">
        <MetricMicroCard
          title="Global Wheat Price"
          value={Number((last(s.wheatPrice) as any)?.value) || 0}
          format="number"
          unit="USD/MT"
          description="International wheat price. Critical for Egypt as world's largest wheat importer."
          dataStatus={getDataStatus('wheatPrice', s.isLoading, s.isError)}
          dataSource="FRED"
          delta={(() => {
            const curr = last(s.wheatPrice) as any;
            const prevVal = prev(s.wheatPrice) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          yoyChange={getYoY(s.wheatPrice)}
          spark={(s.wheatPrice as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="White Rice Price"
          value={Number((last(s.rice) as any)?.value) || 0}
          format="number"
          unit="USD/MT"
          description="International white rice price (Thailand 5% broken). Key staple food commodity."
          dataStatus={getDataStatus('rice', s.isLoading, s.isError)}
          dataSource="FRED"
          delta={(() => {
            const curr = last(s.rice) as any;
            const prevVal = prev(s.rice) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          yoyChange={getYoY(s.rice)}
          spark={(s.rice as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Cooking Oil Price"
          value={Number((last(s.cookingOil) as any)?.value) || 0}
          format="number"
          unit="USD/MT"
          description="Palm oil price (proxy for cooking oil). Essential cooking ingredient."
          dataStatus={getDataStatus('cookingOil', s.isLoading, s.isError)}
          dataSource="FRED"
          delta={(() => {
            const curr = last(s.cookingOil) as any;
            const prevVal = prev(s.cookingOil) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          yoyChange={getYoY(s.cookingOil)}
          spark={(s.cookingOil as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Beef Livestock Price"
          value={Number((last(s.beef) as any)?.value) || 0}
          format="number"
          unit="USD/MT"
          description="International beef price. Protein source indicator for food security."
          dataStatus={getDataStatus('beef', s.isLoading, s.isError)}
          dataSource="FRED"
          delta={(() => {
            const curr = last(s.beef) as any;
            const prevVal = prev(s.beef) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          yoyChange={getYoY(s.beef)}
          spark={(s.beef as any[]).map(p => ({ t: p.date, v: p.value }))}
        />
      </PageGrid>

      {/* Row 3: Feed Prices & Egypt Indicators */}
      <PageGrid cols={4} className="mb-6">
        <MetricMicroCard
          title="Chicken Feed Price"
          value={Number((last(s.chickenFeed) as any)?.value) || 0}
          format="number"
          unit="USD/MT"
          description="Soybean meal price (primary chicken feed). Affects poultry production costs."
          dataStatus={getDataStatus('chickenFeed', s.isLoading, s.isError)}
          dataSource="FRED"
          delta={(() => {
            const curr = last(s.chickenFeed) as any;
            const prevVal = prev(s.chickenFeed) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          yoyChange={getYoY(s.chickenFeed)}
          spark={(s.chickenFeed as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Animal Feed Price"
          value={Number((last(s.animalFeed) as any)?.value) || 0}
          format="number"
          unit="USD/MT"
          description="Corn price (primary animal feed). Affects livestock production costs."
          dataStatus={getDataStatus('animalFeed', s.isLoading, s.isError)}
          dataSource="FRED"
          delta={(() => {
            const curr = last(s.animalFeed) as any;
            const prevVal = prev(s.animalFeed) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          yoyChange={getYoY(s.animalFeed)}
          spark={(s.animalFeed as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Egypt Unemployment"
          value={Number((last(s.unemployment) as any)?.value) || 0}
          format="percentage"
          description="Percentage of Egypt's labor force unemployed. Affects food purchasing power."
          dataStatus={getDataStatus('unemployment', s.isLoading, s.isError)}
          dataSource="Our World in Data"
          delta={(() => {
            const curr = last(s.unemployment) as any;
            const prevVal = prev(s.unemployment) as any;
            if (!curr || !prevVal) return undefined;
            const d = curr.value - prevVal.value;
            return { value: d, label: 'Δ', direction: d >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.unemployment as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Egypt GDP Growth"
          value={Number((last(s.gdp) as any)?.value) || 0}
          format="percentage"
          description="Annual GDP growth rate. Indicates economic health and food security capacity."
          dataStatus={getDataStatus('gdp', s.isLoading, s.isError)}
          dataSource="World Bank"
          delta={(() => {
            const curr = last(s.gdp) as any;
            const prevVal = prev(s.gdp) as any;
            if (!curr || !prevVal) return undefined;
            const d = curr.value - prevVal.value;
            return { value: d, label: 'Δ', direction: d >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.gdp as any[]).map(p => ({ t: p.date, v: p.value }))}
        />
      </PageGrid>

      {/* Row 4: Egypt Specific Indicators */}
      <PageGrid cols={4} className="mb-6">
        <MetricMicroCard
          title="Egypt CPI YoY"
          value={Number((last(s.cbeInflation) as any)?.value) || 0}
          format="percentage"
          description="Egypt's official annual inflation rate from Central Bank of Egypt."
          dataStatus={getDataStatus('cbe', s.isLoading, s.isError)}
          dataSource="Central Bank of Egypt"
          delta={(() => {
            const curr = last(s.cbeInflation) as any;
            const prevVal = prev(s.cbeInflation) as any;
            if (!curr || !prevVal) return undefined;
            const d = curr.value - prevVal.value;
            return { value: d, label: 'Δ', direction: d >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.cbeInflation as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="CBE Food Inflation"
          value={Number((last(s.cbeFood) as any)?.value) || 0}
          format="percentage"
          description="Egypt's food-specific inflation rate focusing on fruits and vegetables."
          dataStatus={getDataStatus('cbeFood', s.isLoading, s.isError)}
          dataSource="CBE Food Prices"
          delta={(() => {
            const curr = last(s.cbeFood) as any;
            const prevVal = prev(s.cbeFood) as any;
            if (!curr || !prevVal) return undefined;
            const d = curr.value - prevVal.value;
            return { value: d, label: 'Δ', direction: d >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.cbeFood as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Cost of Healthy Diet"
          value={Number((last(s.diet) as any)?.value) || 0}
          format="number"
          unit="int-$/day"
          description="Daily cost for one person to afford the least expensive healthy diet in Egypt."
          dataStatus={getDataStatus('diet', s.isLoading, s.isError)}
          dataSource="Our World in Data"
          delta={(() => {
            const curr = last(s.diet) as any;
            const prevVal = prev(s.diet) as any;
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'y/y', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.diet as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Food Insecurity (FIES)"
          value={Number((last(s.fies) as any)?.value) || 0}
          format="percentage"
          description="Percentage of Egypt's population experiencing moderate or severe food insecurity."
          dataStatus={getDataStatus('fies', s.isLoading, s.isError)}
          dataSource="Our World in Data"
          delta={(() => {
            const curr = last(s.fies) as any;
            const prevVal = prev(s.fies) as any;
            if (!curr || !prevVal) return undefined;
            const d = curr.value - prevVal.value;
            return { value: d, label: 'Δ', direction: d >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.fies as any[]).map(p => ({ t: p.date, v: p.value }))}
        />
      </PageGrid>

      {/* Row 5: Regional Impact */}
      <PageGrid cols={4} className="mb-6">
        <MetricMicroCard
          title="Refugees in Egypt"
          value={Number((last(s.refugees as any[]))?.value) || 0}
          format="number"
          unit="people"
          description="Total refugees and asylum-seekers registered with UNHCR in Egypt."
          dataStatus={getDataStatus('unhcr', s.isLoading, s.isError)}
          dataSource="UNHCR"
          delta={(() => {
            const refugeesData = s.refugees as any[];
            const curr = last(refugeesData);
            const prevVal = prev(refugeesData);
            if (!curr || !prevVal) return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'y/y', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.refugees as any[]).map(p => ({ t: p.date, v: p.value }))}
        />
      </PageGrid>
    </div>
  );
}