"use client";

import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Report {
    id: string;
    createdAt: string;
    createdBy: string;
    type: string;
    profit: number;
    participants: string[];
}

export default function ReportsPage() {
    const router = useRouter();
    const { organization, isLoading } = useCurrentOrganization();
    const [reports, setReports] = useState<Report[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingReports, setIsLoadingReports] = useState(true);

    useEffect(() => {
        if (!isLoading && !organization) {
            router.push('/setup');
        }
    }, [organization, isLoading, router]);

    useEffect(() => {
        async function fetchReports() {
            if (!organization) return;

            try {
                const response = await fetch(`/api/organizations/${organization.id}/reports`);
                if (!response.ok) {
                    throw new Error('Failed to fetch reports');
                }

                const data = await response.json();
                setReports(data.reports);
            } catch (err) {
                console.error('Error fetching reports:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch reports');
            } finally {
                setIsLoadingReports(false);
            }
        }

        fetchReports();
    }, [organization]);

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

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Reports</h1>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                    onClick={() => {/* TODO: Open new report modal */}}
                >
                    New Report
                </button>
            </div>

            {isLoadingReports ? (
                <div className="flex items-center justify-center min-h-[200px]">
                    <p className="text-lg">Loading reports...</p>
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center p-12 bg-black/20 backdrop-blur-sm rounded">
                    <p className="text-lg opacity-75">
                        No reports found. Create your first report to get started.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="p-6 bg-black/20 backdrop-blur-sm rounded border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-medium">
                                        {report.type}
                                    </h3>
                                    <p className="text-sm opacity-75">
                                        Created by {report.createdBy} on{' '}
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold">
                                        {report.profit.toLocaleString()} aUEC
                                    </p>
                                    <p className="text-sm opacity-75">
                                        {report.participants.length} participants
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                                    onClick={() => {/* TODO: View report details */}}
                                >
                                    View Details
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                                    onClick={() => {/* TODO: Delete report */}}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
