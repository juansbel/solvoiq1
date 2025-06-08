import { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Eye, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import type { KnowledgeArticle, KnowledgeAnalytics } from '@shared/schema';

interface ContentAnalyticsProps {
  articles: KnowledgeArticle[];
  className?: string;
}

export function ContentAnalytics({ articles, className }: ContentAnalyticsProps) {
  const { data: analyticsData } = useQuery<KnowledgeAnalytics[]>({
    queryKey: ['/api/knowledge/analytics'],
    staleTime: 5 * 60 * 1000,
  });

  const metrics = useMemo(() => {
    if (!analyticsData || !articles.length) {
      return {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        engagementRate: 0,
        topArticles: [],
        categoryStats: []
      };
    }

    const totalViews = analyticsData.filter(a => a.action === 'view').length;
    const totalLikes = analyticsData.filter(a => a.action === 'like').length;
    const totalComments = analyticsData.filter(a => a.action === 'comment').length;
    
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    const topArticles = articles
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5);

    const categoryStats = articles.reduce((acc, article) => {
      const categoryId = article.categoryId || 0;
      if (!acc[categoryId]) {
        acc[categoryId] = { categoryId, count: 0, views: 0 };
      }
      acc[categoryId].count++;
      acc[categoryId].views += article.viewCount || 0;
      return acc;
    }, {} as Record<number, any>);

    return {
      totalViews,
      totalLikes,
      totalComments,
      engagementRate,
      topArticles,
      categoryStats: Object.values(categoryStats)
    };
  }, [analyticsData, articles]);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{metrics.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">{metrics.engagementRate.toFixed(1)}%</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <Progress value={metrics.engagementRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{new Set(analyticsData?.map(a => a.userId) || []).size}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topArticles.map((article, index) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{article.title}</p>
                    <p className="text-xs text-gray-600">{article.viewCount || 0} views</p>
                  </div>
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryId" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}