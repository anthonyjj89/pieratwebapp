"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';

interface HitReport {
    id: string;
    targetId: string;
    location: string;
    totalValue: number;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string;
    participants: {
        userId: string;
        role: string;
    }[];
    profitDistribution: {
        method: 'equal' | 'role' | 'contribution';
        shares: {
            userId: string;
            amount: number;
            status: 'pending' | 'paid';
        }[];
    };
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type SortField = 'date' | 'value';
type SortOrder = 'asc' | 'desc';

export default function ReportsPage() {
    const { organization, loading, error } = useCurrentOrganization();
    const [reports, setReports] = useState<HitReport[]>([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    useEffect(() => {
        const fetchReports = async () => {
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
            } finally {
                setLoadingReports(false);
            }
        };

        if (organization) {
            fetchReports();
        }
    }, [organization]);

    const filteredReports = reports
        .filter(report => statusFilter === 'all' || report.status === statusFilter)
        .sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'desc'
                    ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            } else {
                return sortOrder === 'desc'
                    ? b.totalValue - a.totalValue
                    : a.totalValue - b.totalValue;
            }
        });

    if (loading || loadingReports) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading reports...</p>
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
                <h1 className="text-2xl font-bold">Hit Reports</h1>
                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                            setStatusFilter(e.target.value as StatusFilter)
                        }
                        className="px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                            setSortBy(e.target.value as SortField)
                        }
                        className="px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="value">Sort by Value</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredReports.map((report) => (
                    <div
                        key={report.id}
                        className="p-6 bg-black/20 backdrop-blur-sm rounded"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-medium">Target: {report.targetId}</h3>
                                <p className="text-sm opacity-75">
                                    Location: {report.location}
                                </p>
                                <p className="text-sm opacity-75">
                                    Date: {new Date(report.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">
                                    {report.totalValue.toLocaleString()} aUEC
                                </p>
                                <span className={`
                                    text-sm px-2 py-1 rounded
                                    ${report.status === 'approved' ? 'bg-green-500/20 text-green-300' : ''}
                                    ${report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                                    ${report.status === 'rejected' ? 'bg-red-500/20 text-red-300' : ''}
                                `}>
                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <h4 className="text-sm font-medium mb-2">Participants</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {report.participants.map((participant) => (
                                    <div
                                        key={participant.userId}
                                        className="text-sm bg-black/20 rounded p-2"
                                    >
                                        <p className="font-medium">{participant.userId}</p>
                                        <p className="opacity-75">{participant.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredReports.length === 0 && (
                    <div className="p-4 bg-black/20 backdrop-blur-sm rounded text-center">
                        <p className="opacity-75">No reports found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
