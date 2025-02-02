import { TradeTool } from '@/components/tools';
import { StatsCard } from '@/components/dashboard';

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            {/* Trade Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatsCard
                    title="Most Profitable Route"
                    value="Unknown"
                    trend={{ value: 0, label: "profit margin" }}
                />
                <StatsCard
                    title="Best Commodity"
                    value="Unknown"
                    trend={{ value: 0, label: "profit per unit" }}
                />
                <StatsCard
                    title="Total Trade Volume"
                    value="0 aUEC"
                    trend={{ value: 0, label: "vs last week" }}
                />
            </div>

            {/* Trade Tool */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Trade Calculator</h2>
                <TradeTool />
            </div>

            {/* Trade History */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Trade History</h2>
                <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                    <p className="text-center opacity-75">No trade history available</p>
                </div>
            </div>
        </div>
    );
}
