import { useState, useEffect } from 'react';
import { Organization } from '@/types/organizations';

export function useCurrentOrganization() {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const response = await fetch('/api/organizations/current');
                if (!response.ok) {
                    throw new Error('Failed to fetch organization');
                }

                const data = await response.json();
                setOrganization(data.organization);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load organization');
                console.error('Error fetching organization:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganization();
    }, []);

    return { organization, loading, error };
}
