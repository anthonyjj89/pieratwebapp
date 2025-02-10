"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { DiscordGuild } from '@/types/discord';

interface ServerOption {
    id: string;
    name: string;
    status: 'available' | 'exists' | 'no-permission';
    orgId?: string;
}

export default function SetupPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [servers, setServers] = useState<ServerOption[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load available Discord servers
    useEffect(() => {
        const loadServers = async () => {
            if (!session?.discordGuilds) {
                console.log('No discord guilds in session:', session);
                setError('No Discord servers found in session');
                setLoading(false);
                return;
            }

            try {
                console.log('Loading servers for guilds:', session.discordGuilds.length);
                // Check each guild against our database
                const results = await Promise.all(
                    session.discordGuilds.map(async (guild: DiscordGuild) => {
                        console.log('Checking guild:', guild.id);
                        const response = await fetch(`/api/organizations/check/${guild.id}`);
                        const data = await response.json();

                        let status: ServerOption['status'];
                        if (data.exists) {
                            status = 'exists';
                        } else if (guild.permissions.includes('ADMINISTRATOR')) {
                            status = 'available';
                        } else {
                            status = 'no-permission';
                        }

                        return {
                            id: guild.id,
                            name: guild.name,
                            status,
                            orgId: data.orgId
                        };
                    })
                );

                console.log('Processed servers:', results);
                setServers(results);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(`Failed to load servers: ${errorMessage}`);
                console.error('Error loading servers:', err);
            } finally {
                setLoading(false);
            }
        };

        loadServers();
    }, [session]);

    const handleCreateOrg = async (serverId: string) => {
        const server = servers.find(s => s.id === serverId);
        if (!server) return;

        try {
            const response = await fetch('/api/organizations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: server.name,
                    discordGuildId: server.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create organization');
            }

            router.push('/dashboard');
        } catch (err) {
            setError('Failed to create organization');
            console.error('Error creating organization:', err);
        }
    };

    const handleJoinOrg = async (serverId: string) => {
        const server = servers.find(s => s.id === serverId);
        if (!server?.orgId) return;

        try {
            const response = await fetch(`/api/organizations/${server.orgId}/join`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to request membership');
            }

            router.push('/dashboard');
        } catch (err) {
            setError('Failed to request membership');
            console.error('Error requesting membership:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-lg mb-4">Loading servers...</p>
                {error && (
                    <div className="text-red-400 text-sm">
                        Error: {error}
                    </div>
                )}
                <div className="text-sm opacity-50 mt-4">
                    Session Status: {session ? 'Active' : 'None'}
                    <br />
                    Guilds Count: {session?.discordGuilds?.length || 0}
                    <br />
                    Access Token: {session?.accessToken ? '✓ Present' : '✗ Missing'}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black/90">
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4">Welcome to PieRat</h1>
                    <p className="text-lg opacity-75">
                        Choose a Discord server to get started
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500 rounded mb-8">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                <div className="grid gap-6">
                    {servers.map((server) => (
                        <div
                            key={server.id}
                            className="p-6 bg-black/20 backdrop-blur-sm rounded border border-white/10"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-medium">
                                        {server.name}
                                    </h3>
                                    <p className="text-sm opacity-75 mt-1">
                                        {server.status === 'exists' && 'Organization exists'}
                                        {server.status === 'available' && 'Available for setup'}
                                        {server.status === 'no-permission' && 'Admin permission required'}
                                    </p>
                                </div>
                                <div>
                                    {server.status === 'available' && (
                                        <button
                                            onClick={() => handleCreateOrg(server.id)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                                        >
                                            Create Organization
                                        </button>
                                    )}
                                    {server.status === 'exists' && (
                                        <button
                                            onClick={() => handleJoinOrg(server.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                                        >
                                            Request to Join
                                        </button>
                                    )}
                                    {server.status === 'no-permission' && (
                                        <button
                                            disabled
                                            className="px-4 py-2 bg-gray-600 text-white rounded opacity-50 cursor-not-allowed"
                                        >
                                            Admin Required
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {servers.length === 0 && (
                        <div className="text-center p-12 bg-black/20 backdrop-blur-sm rounded">
                            <p className="text-lg opacity-75">
                                No Discord servers found. Make sure you have admin permissions in at least one server.
                            </p>
                            <div className="text-sm opacity-50 mt-4">
                                Session Status: {session ? 'Active' : 'None'}
                                <br />
                                Guilds Count: {session?.discordGuilds?.length || 0}
                                <br />
                                Access Token: {session?.accessToken ? '✓ Present' : '✗ Missing'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
