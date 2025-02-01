import { PlayerLookup } from '@/components/tools/PlayerLookup';

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold text-white">Reports</h1>
      
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Player Lookup</h2>
        <PlayerLookup />
      </div>

      <div className="rounded-lg bg-slate-800/50 p-4 backdrop-blur">
        <h2 className="mb-4 text-xl font-semibold text-white">Recent Reports</h2>
        <p className="text-slate-400">No reports yet. Create a new report to get started.</p>
      </div>
    </div>
  );
}
