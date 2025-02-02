import { StatsCard } from '@/components/dashboard';

export default function CrewPage() {
    return (
        <div className="space-y-8">
            {/* Crew Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatsCard
                    title="Active Members"
                    value="0"
                    trend={{ value: 0, label: "vs last week" }}
                />
                <StatsCard
                    title="Total Earnings"
                    value="0 aUEC"
                    trend={{ value: 0, label: "per member" }}
                />
                <StatsCard
                    title="Pending Invites"
                    value="0"
                    trend={{ value: 0, label: "response rate" }}
                />
            </div>

            {/* Crew Members */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Crew Members</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
                        Invite Member
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-4 p-4 bg-black/20 backdrop-blur-sm rounded font-medium">
                        <div>Member</div>
                        <div>Role</div>
                        <div>Hits</div>
                        <div>Earnings</div>
                        <div>Status</div>
                    </div>
                    <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                        <p className="text-center opacity-75">No crew members</p>
                    </div>
                </div>
            </div>

            {/* Earnings Distribution */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Earnings Distribution</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                        <h3 className="font-semibold mb-2">Top Earners</h3>
                        <p className="opacity-75">No data available</p>
                    </div>
                    <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                        <h3 className="font-semibold mb-2">Recent Payouts</h3>
                        <p className="opacity-75">No payouts recorded</p>
                    </div>
                </div>
            </div>

            {/* Pending Invites */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Pending Invites</h2>
                <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                    <p className="text-center opacity-75">No pending invites</p>
                </div>
            </div>
        </div>
    );
}
