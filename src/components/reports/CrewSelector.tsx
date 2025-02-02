"use client";

import { useState, useEffect } from 'react';
import { OrganizationMember } from '@/types/organizations';

interface CrewSelectorProps {
    organizationId: string;
    onSelect: (members: OrganizationMember[]) => void;
}

export default function CrewSelector({ organizationId, onSelect }: CrewSelectorProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<OrganizationMember[]>([]);

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/organizations/${organizationId}/members`);
                if (!response.ok) {
                    throw new Error('Failed to fetch organization members');
                }

                const data = await response.json();
                setMembers(data.members);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load crew members');
                console.error('Error fetching crew members:', err);
            } finally {
                setLoading(false);
            }
        };

        if (organizationId) {
            fetchMembers();
        }
    }, [organizationId]);

    const toggleMember = (member: OrganizationMember) => {
        const isSelected = selectedMembers.some(m => m.userId === member.userId);
        const newSelection = isSelected
            ? selectedMembers.filter(m => m.userId !== member.userId)
            : [...selectedMembers, member];
        
        setSelectedMembers(newSelection);
        onSelect(newSelection);
    };

    if (loading) {
        return <div className="text-center py-4">Loading crew members...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="font-semibold mb-2">Select Crew Members</h3>
            <div className="grid grid-cols-2 gap-2">
                {members.map((member) => (
                    <button
                        key={member.userId}
                        onClick={() => toggleMember(member)}
                        className={`p-2 rounded text-left ${
                            selectedMembers.some(m => m.userId === member.userId)
                                ? 'bg-blue-600 text-white'
                                : 'bg-black/20 hover:bg-black/30'
                        }`}
                    >
                        <div className="font-medium">{member.userId}</div>
                        <div className="text-sm opacity-75">{member.role}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
