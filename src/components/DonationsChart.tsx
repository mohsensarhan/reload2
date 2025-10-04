import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

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

interface DonationsData {
  summary: DonationsSummary;
  dailyTotals: DonationDataPoint[];
  monthlyTotals: DonationDataPoint[];
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
  return new Intl.NumberFormat('en-US').format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-blue-600">
          <span className="font-medium">Amount (EGP):</span> {formatCurrency(data.amountEGP, 'EGP')}
        </p>
        <p className="text-green-600">
          <span className="font-medium">Amount (USD):</span> {formatCurrency(data.amountUSD, 'USD')}
        </p>
        <p className="text-purple-600">
          <span className="font-medium">Donations:</span> {formatNumber(data.count)}
        </p>
      </div>
    );
  }
  return null;
};

export const DonationsChart: React.FC<DonationsChartProps> = ({ data }) => {
  const { summary, dailyTotals, monthlyTotals } = data;

  // Get recent data (last 30 days for daily, last 12 months for monthly)
  const recentDaily = dailyTotals.slice(-30);
  const recentMonthly = monthlyTotals.slice(-12);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totalDonations)}</div>
            <p className="text-xs text-muted-foreground">Completed donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount (EGP)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAmountEGP, 'EGP')}</div>
            <p className="text-xs text-muted-foreground">Egyptian Pounds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAmountUSD, 'USD')}</div>
            <p className="text-xs text-muted-foreground">US Dollars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageDonation, 'EGP')}</div>
            <p className="text-xs text-muted-foreground">Per donation</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Online Donations Trends
          </CardTitle>
          <CardDescription>
            Track donation patterns and amounts over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly View</TabsTrigger>
              <TabsTrigger value="daily">Daily View (Last 30 Days)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentMonthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.slice(-2)}`;
                      }}
                    />
                    <YAxis 
                      yAxisId="amount"
                      orientation="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis 
                      yAxisId="count"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      yAxisId="amount"
                      type="monotone" 
                      dataKey="amountEGP" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Amount (EGP)"
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      yAxisId="count"
                      type="monotone" 
                      dataKey="count" 
                      stroke="#7c3aed" 
                      strokeWidth={2}
                      name="Donation Count"
                      dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="daily" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recentDaily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="amountEGP" 
                      fill="#2563eb" 
                      name="Amount (EGP)"
                      radius={[2, 2, 0, 0]}
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