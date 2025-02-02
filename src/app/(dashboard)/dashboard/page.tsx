"use client";

import { useState } from 'react';
import { StatsCard } from '@/components/dashboard';
import { HitReportForm } from '@/components/reports';
import { PlayerLookup, CargoLookup } from '@/components/tools';
import { PriceData } from '@/services/trade/types';
import { RSIProfile } from '@/services/rsi/types';

export default function DashboardPage() {
    const [selectedTarget, setSelectedTarget] = useState<RSIProfile | null>(null);
    const [selectedCargo, setSelectedCargo] = useState<PriceData | null>(null);

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
                <StatsCard
                    title="Total Reports"
                    value="0"
                    trend={{ value: 0, label: "vs last week" }}
                />
                <StatsCard
                    title="Active Crew"
                    value="0"
                    trend={{ value: 0, label: "vs last week" }}
                />
                <StatsCard
                    title="Total Earnings"
                    value="0 aUEC"
                    trend={{ value: 0, label: "vs last week" }}
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-3 gap-8">
                {/* Hit Report Form */}
                <div className="col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold">Submit Hit Report</h2>
                    <HitReportForm target={selectedTarget} cargo={selectedCargo} />
                </div>

                {/* Tools */}
                <div className="space-y-8">
                    {/* Target Lookup */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Target Lookup</h3>
                        <PlayerLookup onResult={setSelectedTarget} />
                    </div>

                    {/* Cargo Lookup */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Cargo Lookup</h3>
                        <CargoLookup onSelect={setSelectedCargo} />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                    <p className="text-center opacity-75">No recent activity</p>
                </div>
            </div>
        </div>
    );
}
