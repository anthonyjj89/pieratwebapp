"use client";

import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SettingsForm {
    name: string;
    description: string;
    profitSharing: {
        defaultShare: number;
        method: 'equal' | 'role' | 'contribution';
    };
}

export default function SettingsPage() {
    const router = useRouter();
    const { organization, role, isLoading, mutate } = useCurrentOrganization();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // Only owners can access settings
    if (role !== 'owner') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-red-400">
                    Only organization owners can access settings
                </p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            const formData = new FormData(e.currentTarget);
            const data: SettingsForm = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                profitSharing: {
                    defaultShare: Number(formData.get('defaultShare')),
                    method: formData.get('method') as 'equal' | 'role' | 'contribution'
                }
            };

            const response = await fetch(`/api/organizations`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: organization.id,
                    ...data
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update settings');
            }

            await mutate();
        } catch (err) {
            console.error('Error updating settings:', err);
            setError(err instanceof Error ? err.message : 'Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Organization Settings</h1>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded mb-8">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Organization Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={organization.name}
                        required
                        className="w-full px-4 py-2 bg-black/20 rounded border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        defaultValue={organization.description || ''}
                        rows={3}
                        className="w-full px-4 py-2 bg-black/20 rounded border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Profit Sharing</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Default Share (%)
                            </label>
                            <input
                                type="number"
                                name="defaultShare"
                                defaultValue={organization.settings.profitSharing.defaultShare}
                                min="0"
                                max="100"
                                required
                                className="w-full px-4 py-2 bg-black/20 rounded border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Distribution Method
                            </label>
                            <select
                                name="method"
                                defaultValue={organization.settings.profitSharing.method}
                                required
                                className="w-full px-4 py-2 bg-black/20 rounded border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="equal">Equal Split</option>
                                <option value="role">By Role</option>
                                <option value="contribution">By Contribution</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
