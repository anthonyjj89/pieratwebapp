"use client";

import { useState } from 'react';
import Image from 'next/image';
import { RSIProfile } from '@/services/rsi/types';

interface PlayerLookupProps {
    onResult?: (data: RSIProfile) => void;
}

export default function PlayerLookup({ onResult }: PlayerLookupProps) {
    const [handle, setHandle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<RSIProfile | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!handle) return;

        setLoading(true);
        setError(null);
        setProfile(null);

        try {
            const response = await fetch(`/api/players/${encodeURIComponent(handle)}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch player data');
            }

            setProfile(result.data);
            if (onResult) {
                onResult(result.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch player data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="Enter RSI handle"
                    className="flex-1 px-3 py-2 border rounded bg-black/20 backdrop-blur-sm"
                />
                <button
                    type="submit"
                    disabled={loading || !handle}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Search'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                    {error}
                </div>
            )}

            {profile && (
                <div className="space-y-4 p-4 bg-black/20 backdrop-blur-sm rounded">
                    <div className="flex items-start gap-4">
                        {profile.avatarUrl && (
                            <div className="relative w-20 h-20">
                                <Image
                                    src={profile.avatarUrl}
                                    alt={`${profile.handle}'s avatar`}
                                    fill
                                    className="rounded object-cover"
                                    unoptimized // Since this is an external URL
                                />
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold">{profile.handle}</h3>
                            <p className="text-sm opacity-75">Enlisted: {profile.enlisted}</p>
                            {profile.location && (
                                <p className="text-sm opacity-75">Location: {profile.location}</p>
                            )}
                        </div>
                    </div>

                    {profile.mainOrg && (
                        <div className="pt-4 border-t border-white/10">
                            <h4 className="font-semibold mb-2">Main Organization</h4>
                            <div className="flex items-center gap-3">
                                {profile.mainOrg.logoUrl && (
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={profile.mainOrg.logoUrl}
                                            alt={`${profile.mainOrg.name} logo`}
                                            fill
                                            className="rounded object-cover"
                                            unoptimized // Since this is an external URL
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">{profile.mainOrg.name}</p>
                                    <p className="text-sm opacity-75">Rank: {profile.mainOrg.rank}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {profile.affiliatedOrgs.length > 0 && (
                        <div className="pt-4 border-t border-white/10">
                            <h4 className="font-semibold mb-2">Affiliated Organizations</h4>
                            <div className="space-y-3">
                                {profile.affiliatedOrgs.map((org, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        {org.logoUrl && (
                                            <div className="relative w-8 h-8">
                                                <Image
                                                    src={org.logoUrl}
                                                    alt={`${org.name} logo`}
                                                    fill
                                                    className="rounded object-cover"
                                                    unoptimized // Since this is an external URL
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{org.name}</p>
                                            <p className="text-sm opacity-75">Rank: {org.rank}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
