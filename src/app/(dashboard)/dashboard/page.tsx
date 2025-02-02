import { StatsCard } from '@/components/dashboard';
import { HitReportForm } from '@/components/reports';

export default function DashboardPage() {
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

            {/* Hit Report Form */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Submit Hit Report</h2>
                <HitReportForm />
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
