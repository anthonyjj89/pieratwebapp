import { useEffect, useState } from 'react';
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

    async function fetchAnalytics() {
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
    }

    useEffect(() => {
        if (session?.user && organizationId) {
            fetchAnalytics();
        } else {
            setAnalytics(null);
            setIsLoading(false);
        }
    }, [session, organizationId]);

    const mutate = async () => {
        await fetchAnalytics();
    };

    return {
        analytics,
        isLoading,
        error,
        mutate
    };
}
