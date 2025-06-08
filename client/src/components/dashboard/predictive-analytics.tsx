import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Prediction {
    label: string;
    value: string | number;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    description: string;
}

const predictiveData: Prediction[] = [
    {
        label: 'Q3 Revenue Forecast',
        value: '$1.2M',
        trend: 'up',
        confidence: 0.85,
        description: 'Strong sales pipeline and seasonal trends indicate a 15% increase over Q2.'
    },
    {
        label: 'Client Churn Risk',
        value: '3.2%',
        trend: 'down',
        confidence: 0.92,
        description: 'Recent support improvements and successful campaigns have lowered predicted churn.'
    },
    {
        label: 'Top Performing Region',
        value: 'North America',
        trend: 'stable',
        confidence: 0.95,
        description: 'Consistent growth driven by enterprise accounts.'
    },
    {
        label: 'Next Month\'s Lead Generation',
        value: '~1,200',
        trend: 'up',
        confidence: 0.78,
        description: 'Based on marketing spend and recent conversion rates.'
    }
];

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return null;
};

export const PredictiveAnalytics: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {predictiveData.map((prediction: Prediction) => (
                        <div key={prediction.label} className="flex items-start">
                            <div className="flex-shrink-0">
                                <TrendIcon trend={prediction.trend} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{prediction.label}</p>
                                <p className="text-lg font-semibold">{prediction.value}</p>
                                <p className="text-xs text-gray-500">{`Confidence: ${(prediction.confidence * 100).toFixed(0)}%`}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{prediction.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};