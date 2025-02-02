import { StatsCard } from '@/components/dashboard';

export default function ReportsPage() {
    return (
        <div className="space-y-8">
            {/* Hit Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatsCard
                    title="Most Valuable Hit"
                    value="0 aUEC"
                    trend={{ value: 0, label: "highest value" }}
                />
                <StatsCard
                    title="Average Hit Value"
                    value="0 aUEC"
                    trend={{ value: 0, label: "vs last week" }}
                />
                <StatsCard
                    title="Success Rate"
                    value="0%"
                    trend={{ value: 0, label: "vs last week" }}
                />
            </div>

            {/* Hit Reports */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Hit Reports</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-black/20 backdrop-blur-sm rounded font-medium">
                        <div>Target</div>
                        <div>Location</div>
                        <div>Value</div>
                        <div>Date</div>
                    </div>
                    <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                        <p className="text-center opacity-75">No reports available</p>
                    </div>
                </div>
            </div>

            {/* Hit Analysis */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Analysis</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                        <h3 className="font-semibold mb-2">Popular Routes</h3>
                        <p className="opacity-75">No data available</p>
                    </div>
                    <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                        <h3 className="font-semibold mb-2">Common Cargo</h3>
                        <p className="opacity-75">No data available</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
