"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';

type ProfitSharingMethod = 'equal' | 'role' | 'contribution';

interface OrganizationSettings {
    profitSharing: {
        method: ProfitSharingMethod;
        defaultShare: number;
    };
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const { organization, loading, error } = useCurrentOrganization();
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<OrganizationSettings>({
        profitSharing: {
            method: 'equal',
            defaultShare: 100
        }
    });

    // Load settings when organization is available
    useEffect(() => {
        if (organization?.settings) {
            setSettings(organization.settings);
        }
    }, [organization]);

    const handleSave = async () => {
        if (!organization || saving) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/organizations/${organization.id}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }
        } catch (err) {
            console.error('Error saving settings:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading settings...</p>
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

    // Only org owner can access settings
    if (organization.ownerId !== session?.user?.id) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-4 bg-red-500/10 border border-red-500 rounded max-w-md">
                    <p className="text-lg font-medium">Access Denied</p>
                    <p className="opacity-75">
                        Only the organization owner can access settings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold">Organization Settings</h1>
                <p className="opacity-75">Manage your organization&apos;s settings and preferences.</p>
            </div>

            <div className="space-y-6">
                <div className="p-6 bg-black/20 backdrop-blur-sm rounded">
                    <h2 className="text-lg font-semibold mb-4">Profit Sharing</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Distribution Method
                            </label>
                            <select
                                value={settings.profitSharing.method}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    profitSharing: {
                                        ...settings.profitSharing,
                                        method: e.target.value as ProfitSharingMethod
                                    }
                                })}
                                className="w-full px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                            >
                                <option value="equal">Equal Split</option>
                                <option value="role">Role-based</option>
                                <option value="contribution">Contribution-based</option>
                            </select>
                            <p className="mt-1 text-sm opacity-75">
                                {settings.profitSharing.method === 'equal' && 'Split profits equally among all participants'}
                                {settings.profitSharing.method === 'role' && 'Distribute profits based on member roles'}
                                {settings.profitSharing.method === 'contribution' && 'Allocate profits based on contribution'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Default Share (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={settings.profitSharing.defaultShare}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    profitSharing: {
                                        ...settings.profitSharing,
                                        defaultShare: parseInt(e.target.value) || 0
                                    }
                                })}
                                className="w-full px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                            />
                            <p className="mt-1 text-sm opacity-75">
                                Default profit share percentage for new members
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
