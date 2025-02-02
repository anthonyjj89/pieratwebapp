"use client";

import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
    const router = useRouter();
    const { organization, isLoading } = useCurrentOrganization();

    useEffect(() => {
        if (!isLoading && !organization) {
            router.push('/setup');
        }
    }, [organization, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading organization...</p>
            </div>
        );
    }

    if (!organization) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">
                Welcome to {organization.name}
            </h1>
            {/* Dashboard content */}
        </div>
    );
}
