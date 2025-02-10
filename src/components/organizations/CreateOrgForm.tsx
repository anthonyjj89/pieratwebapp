"use client";

import { useState, useEffect } from 'react';
import { CreateOrganizationInput } from '@/types/organizations';

interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    features: string[];
}

interface CreateOrgFormProps {
    onSubmit: (data: CreateOrganizationInput) => Promise<void>;
}

export default function CreateOrgForm({ onSubmit }: CreateOrgFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
    const [selectedGuild, setSelectedGuild] = useState<string>('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [roles, setRoles] = useState<{ [roleName: string]: { ratio: number } }>({
        'general': { ratio: 1.0 }
    });

    // Fetch available Discord servers
    const fetchGuilds = async () => {
        try {
            const response = await fetch('/api/discord/guilds');
            if (!response.ok) {
                throw new Error('Failed to fetch Discord servers');
            }
            const data = await response.json();
            setGuilds(data.guilds);
        } catch (err) {
            setError('Failed to load Discord servers');
            console.error('Error fetching guilds:', err);
        }
    };

    // Load guilds on mount
    useEffect(() => {
        fetchGuilds();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGuild || !name) return;

        setLoading(true);
        setError(null);

        try {
            await onSubmit({
                name,
                description,
                discordGuildId: selectedGuild,
                roles: roles,
                settings: {
                    profitSharing: {
                        defaultShare: 100,
                        method: 'equal'
                    }
                }
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-1">Discord Server</label>
                <select
                    value={selectedGuild}
                    onChange={(e) => setSelectedGuild(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                    required
                >
                    <option value="">Select a server</option>
                    {guilds.map((guild) => (
                        <option key={guild.id} value={guild.id}>
                            {guild.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Organization Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter organization name"
                    className="w-full px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter organization description"
                    className="w-full h-24 px-3 py-2 bg-black/20 backdrop-blur-sm border rounded resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Roles</label>
                {Object.entries(roles).map(([roleName, role]) => (
                    <div key={roleName} className="flex items-center space-x-2">
                        <label className="text-sm font-medium">{roleName}</label>
                        <input
                            type="number"
                            value={role.ratio}
                            onChange={(e) => {
                                const newRatio = parseFloat(e.target.value);
                                setRoles({
                                    ...roles,
                                    [roleName]: { ratio: newRatio },
                                });
                            }}
                            className="w-20 px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                        />
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !selectedGuild || !name}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
            >
                {loading ? 'Creating...' : 'Create Organization'}
            </button>
        </form>
    );
}
