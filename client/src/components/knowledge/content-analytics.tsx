import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AnalyticsData {
    views: number;
    likes: number;
    dislikes: number;
    shares: number;
    avgReadTime: number; // in seconds
    topReferrers: { source: string; views: number }[];
}

const data: AnalyticsData = {
    views: 1245,
    likes: 88,
    dislikes: 5,
    shares: 42,
    avgReadTime: 180,
    topReferrers: [
        { source: 'Google', views: 600 },
        { source: 'Direct', views: 350 },
        { source: 'Internal', views: 150 },
        { source: 'Social', views: 100 },
        { source: 'Other', views: 45 },
    ]
};

export const ContentAnalytics: React.FC = () => {
    const { theme } = useTheme();
    const chartColor = useMemo(() => theme === 'dark' ? '#8884d8' : '#3B82F6', [theme]);

    const chartData = useMemo(() => {
        return data.topReferrers.map(item => ({ name: item.source, views: item.views }));
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                    <div>
                        <Eye className="mx-auto h-6 w-6 text-gray-500" />
                        <p className="text-2xl font-bold">{data.views}</p>
                        <p className="text-sm text-muted-foreground">Views</p>
                    </div>
                    <div>
                        <ThumbsUp className="mx-auto h-6 w-6 text-green-500" />
                        <p className="text-2xl font-bold">{data.likes}</p>
                        <p className="text-sm text-muted-foreground">Likes</p>
                    </div>
                    <div>
                        <ThumbsDown className="mx-auto h-6 w-6 text-red-500" />
                        <p className="text-2xl font-bold">{data.dislikes}</p>
                        <p className="text-sm text-muted-foreground">Dislikes</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{`${Math.floor(data.avgReadTime / 60)}m ${data.avgReadTime % 60}s`}</p>
                        <p className="text-sm text-muted-foreground">Avg. Read Time</p>
                    </div>
                </div>

                <h4 className="font-semibold mb-2">Top Referrers</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={60} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill={chartColor} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};