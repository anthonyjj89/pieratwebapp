import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Organization, OrganizationMember } from '@/types/organizations';

interface UseCurrentOrganizationResult {
    organization: Organization | null;
    role: OrganizationMember['role'] | null;
    isLoading: boolean;
    error: string | null;
    mutate: () => Promise<void>;
}

export function useCurrentOrganization(): UseCurrentOrganizationResult {
    const { data: session } = useSession();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [role, setRole] = useState<OrganizationMember['role'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchOrganization() {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/organizations/current');
            if (!response.ok) {
                const data = await response.json();
                if (response.status === 404) {
                    // No organization is not an error state
                    setOrganization(null);
                    setRole(null);
                    return;
                }
                throw new Error(data.error || 'Failed to fetch organization');
            }

            const data = await response.json();
            setOrganization(data.organization);
            setRole(data.role);
        } catch (err) {
            console.error('Error fetching organization:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch organization');
            setOrganization(null);
            setRole(null);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (session?.user) {
            fetchOrganization();
        } else {
            setOrganization(null);
            setRole(null);
            setIsLoading(false);
        }
    }, [session]);

    const mutate = async () => {
        await fetchOrganization();
    };

    return {
        organization,
        role,
        isLoading,
        error,
        mutate
    };
}
