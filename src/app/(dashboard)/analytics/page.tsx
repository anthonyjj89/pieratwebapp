"use client";

import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useOrganizationAnalytics } from '@/hooks/useOrganizationAnalytics';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AnalyticsPage() {
    const router = useRouter();
    const { organization, isLoading: isLoadingOrg } = useCurrentOrganization();
    const { analytics, isLoading: isLoadingAnalytics, error } = useOrganizationAnalytics(
        organization?.id ?? null
    );

    useEffect(() => {
        if (!isLoadingOrg && !organization) {
            router.push('/setup');
        }
    }, [organization, isLoadingOrg, router]);

    if (isLoadingOrg || isLoadingAnalytics) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading analytics...</p>
            </div>
        );
    }

    if (!organization) {
        return null; // Will redirect in useEffect
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center p-12 bg-black/20 backdrop-blur-sm rounded">
                    <p className="text-lg opacity-75">
                        No analytics data available. Create some reports to get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-black/20 backdrop-blur-sm rounded border border-white/10">
                    <h3 className="text-lg font-medium mb-2">Total Members</h3>
                    <p className="text-3xl font-bold">{analytics.totalMembers}</p>
                </div>

                <div className="p-6 bg-black/20 backdrop-blur-sm rounded border border-white/10">
                    <h3 className="text-lg font-medium mb-2">Total Reports</h3>
                    <p className="text-3xl font-bold">{analytics.totalReports}</p>
                </div>

                <div className="p-6 bg-black/20 backdrop-blur-sm rounded border border-white/10">
                    <h3 className="text-lg font-medium mb-2">Total Profit</h3>
                    <p className="text-3xl font-bold">
                        {analytics.totalProfit.toLocaleString()} aUEC
                    </p>
                </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded border border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-6">Profit by Member</h2>
                <div className="space-y-4">
                    {analytics.profitByMember.map((member) => (
                        <div
                            key={member.memberId}
                            className="flex justify-between items-center"
                        >
                            <span>{member.memberId}</span>
                            <span>{member.profit.toLocaleString()} aUEC</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
