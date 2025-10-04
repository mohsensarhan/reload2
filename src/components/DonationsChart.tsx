import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { createChartTooltip } from '@/components/ui/chart-tooltip';

interface DonationsSummary {
  totalDonations: number;
  totalAmountEGP: number;
  totalAmountUSD: number;
  averageDonation: number;
}

interface DonationDataPoint {
  date: string;
  amountEGP: number;
  amountUSD: number;
  count: number;
}

interface MonthlyDataPoint {
  month: string;
  amountEGP: number;
  amountUSD: number;
  count: number;
}

interface DonationsData {
  summary: DonationsSummary;
  dailyTotals: DonationDataPoint[];
  monthlyTotals: MonthlyDataPoint[];
  lastUpdated: string;
  source: string;
}

interface DonationsChartProps {
  data: DonationsData;
}

const formatCurrency = (value: number, currency: 'EGP' | 'USD' = 'EGP') => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

const formatShortNumber = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

// Custom tooltip matching your existing style
const CustomTooltip = createChartTooltip((data: any) => {
  if (!data) return null;
  
  return (
    <div className="space-y-1">
      <div className="font-medium text-foreground">
        {data.date || data.month}
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Amount (EGP):</span>
          <span className="font-medium text-primary">{formatCurrency(data.amountEGP, 'EGP')}</span>
        </div>
        {data.amountUSD > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Amount (USD):</span>
            <span className="font-medium text-emerald-600">{formatCurrency(data.amountUSD, 'USD')}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Donations:</span>
          <span className="font-medium">{formatNumber(data.count)}</span>
        </div>
      </div>
    </div>
  );
});

export const DonationsChart: React.FC<DonationsChartProps> = ({ data }) => {
  const { summary, dailyTotals, monthlyTotals } = data;

  // Get last 30 days for daily view
  const recentDaily = useMemo(() => {
    return dailyTotals.slice(-30);
  }, [dailyTotals]);

  // Get last 12 months for monthly view
  const recentMonthly = useMemo(() => {
    return monthlyTotals.slice(-12);
  }, [monthlyTotals]);

  return (
    <div className="space-y-6">
      {/* Summary Cards - Matching your existing MetricMicroCard style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Donations</p>
                <p className="text-2xl font-bold tracking-tight">{formatNumber(summary.totalDonations)}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                Live Data
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Amount (EGP)</p>
                <p className="text-2xl font-bold tracking-tight">{formatShortNumber(summary.totalAmountEGP)}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Egyptian Pounds</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Amount (USD)</p>
                <p className="text-2xl font-bold tracking-tight">{formatShortNumber(summary.totalAmountUSD)}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">US Dollars</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Donation</p>
                <p className="text-2xl font-bold tracking-tight">{formatShortNumber(summary.averageDonation)}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">EGP per donation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Matching your existing chart style */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Online Donations Trends
              </CardTitle>
              <CardDescription>
                Track donation patterns and amounts over time
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
              EFB Metabase
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Last 12 Months</TabsTrigger>
              <TabsTrigger value="daily">Last 30 Days</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentMonthly} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return `${monthNames[parseInt(month) - 1]} '${year.slice(-2)}`;
                      }}
                    />
                    <YAxis 
                      yAxisId="amount"
                      orientation="left"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatShortNumber(value)}
                    />
                    <YAxis 
                      yAxisId="count"
                      orientation="right"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line 
                      yAxisId="amount"
                      type="monotone" 
                      dataKey="amountEGP" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: 'hsl(var(--primary))',
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 2
                      }}
                    />
                    <Line 
                      yAxisId="count"
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{
                        r: 3,
                        fill: 'hsl(var(--muted-foreground))',
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 2
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="daily" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recentDaily} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatShortNumber(value)}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="amountEGP" 
                      fill="hsl(var(--primary))"
                      radius={[2, 2, 0, 0]}
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationsChart;