"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { OrganizationMember } from '@/types/organizations';

export default function CrewPage() {
    const { data: session } = useSession();
    const { organization, loading, error } = useCurrentOrganization();
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);

    // Fetch members when organization is loaded
    useEffect(() => {
        const fetchMembers = async () => {
            if (!organization) return;

            try {
                const response = await fetch(`/api/organizations/${organization.id}/members`);
                if (!response.ok) {
                    throw new Error('Failed to fetch members');
                }

                const data = await response.json();
                setMembers(data.members);
            } catch (err) {
                console.error('Error fetching members:', err);
            } finally {
                setLoadingMembers(false);
            }
        };

        if (organization) {
            fetchMembers();
        }
    }, [organization]);

    if (loading || loadingMembers) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading crew...</p>
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

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Crew Members</h1>
                {organization.ownerId === session?.user?.id && (
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                        onClick={() => {/* TODO: Open invite modal */}}
                    >
                        Invite Members
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                    <div
                        key={member.userId}
                        className="p-4 bg-black/20 backdrop-blur-sm rounded"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <p className="font-medium">{member.userId}</p>
                                <p className="text-sm opacity-75">
                                    Role: {member.role}
                                </p>
                                <p className="text-sm opacity-75">
                                    Joined: {new Date(member.joinedAt).toLocaleDateString()}
                                </p>
                            </div>
                            {organization.ownerId === session?.user?.id && member.userId !== session.user.id && (
                                <button
                                    className="text-red-400 hover:text-red-300"
                                    onClick={() => {/* TODO: Remove member */}}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {members.length === 0 && (
                <div className="p-4 bg-black/20 backdrop-blur-sm rounded text-center">
                    <p className="opacity-75">No crew members found</p>
                </div>
            )}
        </div>
    );
}
