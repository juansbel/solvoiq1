import { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Target, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PredictiveAnalyticsProps {
  className?: string;
}

export function PredictiveAnalytics({ className }: PredictiveAnalyticsProps) {
  const [timeHorizon, setTimeHorizon] = useState('3months');

  const predictions = useMemo(() => {
    return [
      {
        id: 'revenue',
        title: 'Revenue Forecast',
        currentValue: 125000,
        predictedValue: 142000,
        confidence: 0.87,
        trend: 'up' as const,
        recommendation: 'Focus on client retention strategies to exceed forecast'
      },
      {
        id: 'churn',
        title: 'Client Churn Risk',
        currentValue: 0.08,
        predictedValue: 0.12,
        confidence: 0.92,
        trend: 'up' as const,
        recommendation: 'Implement proactive outreach to at-risk clients'
      }
    ];
  }, []);

  const forecastData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: 4000 + i * 50 + Math.random() * 500,
        predicted: 4200 + i * 60
      });
    }
    
    return data;
  }, []);

  const formatValue = (value: number, type: string) => {
    if (type === 'revenue') return `$${(value / 1000).toFixed(0)}K`;
    if (type === 'churn') return `${(value * 100).toFixed(1)}%`;
    return value.toFixed(2);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predictive Analytics</h2>
          <p className="text-gray-600">AI-powered insights and forecasts</p>
        </div>
        <Select value={timeHorizon} onValueChange={setTimeHorizon}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">1 Month</SelectItem>
            <SelectItem value="3months">3 Months</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map(prediction => (
          <Card key={prediction.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{prediction.title}</h4>
                <TrendingUp className={`h-4 w-4 ${prediction.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current</span>
                  <span className="font-semibold">
                    {formatValue(prediction.currentValue, prediction.id)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Predicted</span>
                  <span className="font-bold text-blue-600">
                    {formatValue(prediction.predictedValue, prediction.id)}
                  </span>
                </div>
                
                <Progress value={prediction.confidence * 100} className="h-2" />
                <span className="text-xs text-gray-500">
                  {(prediction.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: any) => [`$${(value / 1000).toFixed(1)}K`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="predicted" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-orange-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Client Churn Risk Increasing</p>
                <p className="text-sm text-gray-600 mt-1">
                  Implement proactive outreach to at-risk clients
                </p>
                <Badge variant="outline" className="mt-2">Next 30 Days</Badge>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <Target className="h-5 w-5 mr-2" />
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-medium text-green-800">Revenue Growth Opportunity</p>
              <p className="text-sm text-green-700 mt-1">
                Focus on client retention strategies to exceed forecast
              </p>
              <Badge className="bg-green-100 text-green-800 mt-2">
                +13.6% improvement potential
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}