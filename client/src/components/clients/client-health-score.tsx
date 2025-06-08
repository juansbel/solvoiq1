import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Client } from '@shared/schema';

interface ClientHealthScoreProps {
  client: Client;
  className?: string;
}

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  weight: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export function ClientHealthScore({ client, className }: ClientHealthScoreProps) {
  const healthMetrics = useMemo((): HealthMetric[] => {
    // Calculate health metrics based on client data
    const paymentHealth = 85; // Mock data since client.status doesn't exist in schema
    const engagementHealth = Math.random() * 40 + 60; // Simulated engagement
    const projectHealth = Math.random() * 30 + 70; // Simulated project progress
    const communicationHealth = Math.random() * 25 + 75; // Simulated communication frequency
    
    return [
      {
        id: 'payment',
        name: 'Payment History',
        value: paymentHealth,
        weight: 0.3,
        status: paymentHealth > 70 ? 'good' : paymentHealth > 40 ? 'warning' : 'critical',
        trend: 'stable',
        description: 'On-time payments and billing compliance'
      },
      {
        id: 'engagement',
        name: 'Engagement Level',
        value: engagementHealth,
        weight: 0.25,
        status: engagementHealth > 70 ? 'good' : engagementHealth > 40 ? 'warning' : 'critical',
        trend: 'up',
        description: 'Response times and interaction frequency'
      },
      {
        id: 'project',
        name: 'Project Progress',
        value: projectHealth,
        weight: 0.25,
        status: projectHealth > 70 ? 'good' : projectHealth > 40 ? 'warning' : 'critical',
        trend: 'up',
        description: 'Milestone completion and timeline adherence'
      },
      {
        id: 'communication',
        name: 'Communication',
        value: communicationHealth,
        weight: 0.2,
        status: communicationHealth > 70 ? 'good' : communicationHealth > 40 ? 'warning' : 'critical',
        trend: 'stable',
        description: 'Regular check-ins and feedback loops'
      }
    ];
  }, [client]);

  const overallScore = useMemo(() => {
    return healthMetrics.reduce((acc, metric) => {
      return acc + (metric.value * metric.weight);
    }, 0);
  }, [healthMetrics]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'At Risk';
    return 'Critical';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const criticalMetrics = healthMetrics.filter(m => m.status === 'critical');
  const warningMetrics = healthMetrics.filter(m => m.status === 'warning');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Client Health Score</span>
            <Badge className={getScoreColor(overallScore)}>
              {getScoreStatus(overallScore)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {Math.round(overallScore)}
            </div>
            <div className="text-sm text-gray-600">out of 100</div>
          </div>
          <Progress value={overallScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Health Metrics Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Health Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthMetrics.map(metric => (
            <div key={metric.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(metric.status)}
                  <span className="font-medium">{metric.name}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <span className={`font-semibold ${getScoreColor(metric.value)}`}>
                  {Math.round(metric.value)}%
                </span>
              </div>
              <Progress value={metric.value} className="h-2" />
              <p className="text-xs text-gray-600">{metric.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alerts and Recommendations */}
      {(criticalMetrics.length > 0 || warningMetrics.length > 0) && (
        <div className="space-y-3">
          {criticalMetrics.map(metric => (
            <Alert key={metric.id} className="border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-red-800">
                    Critical: {metric.name} needs immediate attention
                  </p>
                  <p className="text-sm text-red-700">
                    Score: {Math.round(metric.value)}% - {metric.description}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ))}
          
          {warningMetrics.map(metric => (
            <Alert key={metric.id} className="border-yellow-200">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-yellow-800">
                    Warning: {metric.name} requires monitoring
                  </p>
                  <p className="text-sm text-yellow-700">
                    Score: {Math.round(metric.value)}% - {metric.description}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overallScore < 60 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="font-medium text-red-800">Immediate Action Required</p>
                <p className="text-sm text-red-700 mt-1">
                  Schedule urgent client meeting to address concerns and develop action plan
                </p>
              </div>
            )}
            
            {overallScore >= 60 && overallScore < 80 && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-800">Improvement Opportunities</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Focus on communication and engagement to improve relationship health
                </p>
              </div>
            )}
            
            {overallScore >= 80 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">Maintain Excellence</p>
                <p className="text-sm text-green-700 mt-1">
                  Continue current practices and explore opportunities for expansion
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}