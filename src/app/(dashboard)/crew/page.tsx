"use client";

import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CrewPage() {
    const router = useRouter();
    const { organization, role, isLoading } = useCurrentOrganization();

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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Crew Management</h1>
                {role === 'owner' && (
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                        onClick={() => {/* TODO: Open invite modal */}}
                    >
                        Invite Members
                    </button>
                )}
            </div>

            <div className="grid gap-6">
                {organization.members.map((member) => (
                    <div
                        key={member.userId}
                        className="p-6 bg-black/20 backdrop-blur-sm rounded border border-white/10"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-medium">
                                    {member.userId}
                                </h3>
                                <p className="text-sm opacity-75 mt-1">
                                    {member.role}
                                </p>
                            </div>
                            {role === 'owner' && member.role !== 'owner' && (
                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500"
                                        onClick={() => {/* TODO: Change role */}}
                                    >
                                        Change Role
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                                        onClick={() => {/* TODO: Remove member */}}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
