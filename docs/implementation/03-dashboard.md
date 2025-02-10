# Dashboard Implementation Guide

## Overview
This guide details the implementation of the dashboard interface and core features including hit reporting, crew management, analytics, and profit tracking.

## Prerequisites
- Authentication system from [01-auth-setup.md](./01-auth-setup.md)
- Organization system from [02-org-system.md](./02-org-system.md)

## Steps

### 1. Dashboard Layout
Create `src/app/(dashboard)/layout.tsx`:
```typescript
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
```

### 2. Analytics Types
Create `src/types/analytics.ts`:
```typescript
export interface MemberProfit {
    memberId: string;
    profit: number;
}

export interface AnalyticsResponse {
    totalMembers: number;
    totalReports: number;
    totalProfit: number;
    profitByMember: MemberProfit[];
}

export interface AnalyticsData {
    totalMembers: number;
    totalReports: number;
    totalProfit: number;
    profitByMember: Map<string, number>;
}

export function calculateProfitByMember(profitMap: Map<string, number>): MemberProfit[] {
    return Array.from(profitMap.entries())
        .map(([memberId, profit]) => ({
            memberId,
            profit: Math.round(profit)
        }))
        .sort((a, b) => b.profit - a.profit);
}

export function toAnalyticsResponse(data: AnalyticsData): AnalyticsResponse {
    return {
        totalMembers: data.totalMembers,
        totalReports: data.totalReports,
        totalProfit: Math.round(data.totalProfit),
        profitByMember: calculateProfitByMember(data.profitByMember)
    };
}
```

### 3. Analytics Hook
Create `src/hooks/useOrganizationAnalytics.ts`:
```typescript
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AnalyticsResponse } from '@/types/analytics';

interface UseOrganizationAnalyticsResult {
    analytics: AnalyticsResponse | null;
    isLoading: boolean;
    error: string | null;
    mutate: () => Promise<void>;
}

export function useOrganizationAnalytics(organizationId: string | null): UseOrganizationAnalyticsResult {
    const { data: session } = useSession();
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        if (!organizationId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/organizations/${organizationId}/analytics`);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch analytics');
            }

            const data = await response.json();
            setAnalytics(data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
            setAnalytics(null);
        } finally {
            setIsLoading(false);
        }
    }, [organizationId]);

    useEffect(() => {
        if (session?.user && organizationId) {
            fetchAnalytics();
        } else {
            setAnalytics(null);
            setIsLoading(false);
        }
    }, [session, organizationId, fetchAnalytics]);

    return {
        analytics,
        isLoading,
        error,
        mutate: fetchAnalytics
    };
}
```

### 4. Analytics Dashboard
Create `src/app/(dashboard)/analytics/page.tsx`:
```typescript
'use client';

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
```

### 5. Report Creation Form
Create `src/components/reports/HitReportForm.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HitReportForm() {
    const router = useRouter();
    const { data: session } = useSession({ required: true });
    const [formData, setFormData] = useState({
        target: {
            name: '',
            ship: '',
            location: '',
        },
        crew: [],
        loot: [],
        notes: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const report = await response.json();
            router.push(`/dashboard/reports/${report._id}`);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields */}
        </form>
    );
}
```

### 6. Testing
1. Test dashboard navigation:
   - All routes accessible
   - Proper active state highlighting
   - Mobile responsiveness
2. Test analytics:
   - Data accuracy
   - Profit calculations
   - Member profit distribution
   - Loading states
   - Error handling
3. Test report creation:
   - Form validation
   - Success/error handling
   - Profit updates in analytics

### Next Steps
1. Add report approval workflow
2. Implement file upload for evidence
3. Add real-time updates
4. Enhance analytics with charts
5. Add export functionality
6. Add profit sharing configuration UI
