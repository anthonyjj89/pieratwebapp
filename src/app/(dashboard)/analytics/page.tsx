"use client";

import { useState, useEffect } from 'react';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';

interface AnalyticsData {
    totalHits: number;
    totalValue: number;
    activeMembers: number;
    recentActivity: {
        date: string;
        value: number;
    }[];
    topMembers: {
        userId: string;
        hits: number;
        value: number;
    }[];
}

export default function AnalyticsPage() {
    const { organization, loading, error } = useCurrentOrganization();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!organization) return;

            try {
                const response = await fetch(`/api/organizations/${organization.id}/analytics`);
                if (!response.ok) {
                    throw new Error('Failed to fetch analytics');
                }

                const data = await response.json();
                setAnalytics(data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setLoadingAnalytics(false);
            }
        };

        if (organization) {
            fetchAnalytics();
        }
    }, [organization]);

    if (loading || loadingAnalytics) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading analytics...</p>
            </div>
        );
    }

    if (error || !organization) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-4 bg-red-500/10 border border-red-500 rounded max-w-md">
                    <p className="text-lg font-medium">Error</p>
                    <p className="opacity-75">
                        {error || 'No organization found. Please join or create an organization.'}
                    </p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-4 bg-black/20 backdrop-blur-sm rounded max-w-md text-center">
                    <p className="opacity-75">No analytics data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-black/20 backdrop-blur-sm rounded">
                    <h3 className="text-sm font-medium opacity-75">Total Hits</h3>
                    <p className="text-2xl font-bold mt-1">{analytics.totalHits}</p>
                </div>
                <div className="p-6 bg-black/20 backdrop-blur-sm rounded">
                    <h3 className="text-sm font-medium opacity-75">Total Value</h3>
                    <p className="text-2xl font-bold mt-1">
                        {analytics.totalValue.toLocaleString()} aUEC
                    </p>
                </div>
                <div className="p-6 bg-black/20 backdrop-blur-sm rounded">
                    <h3 className="text-sm font-medium opacity-75">Active Members</h3>
                    <p className="text-2xl font-bold mt-1">{analytics.activeMembers}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 bg-black/20 backdrop-blur-sm rounded">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-2">
                    {analytics.recentActivity.map((activity, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <span className="opacity-75">{activity.date}</span>
                            <span className="font-medium">
                                {activity.value.toLocaleString()} aUEC
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Members */}
            <div className="p-6 bg-black/20 backdrop-blur-sm rounded">
                <h2 className="text-lg font-semibold mb-4">Top Members</h2>
                <div className="space-y-4">
                    {analytics.topMembers.map((member, index) => (
                        <div key={member.userId} className="flex items-center">
                            <div className="w-8 h-8 flex items-center justify-center font-bold bg-black/20 rounded">
                                {index + 1}
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="font-medium">{member.userId}</p>
                                <p className="text-sm opacity-75">
                                    {member.hits} hits • {member.value.toLocaleString()} aUEC
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
