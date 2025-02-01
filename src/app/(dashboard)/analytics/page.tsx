import { TradeTool } from '@/components/tools/TradeTool';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold text-white">Analytics</h1>
      
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Trade Data</h2>
        <TradeTool />
      </div>

      <div className="rounded-lg bg-slate-800/50 p-4 backdrop-blur">
        <h2 className="mb-4 text-xl font-semibold text-white">Trade History</h2>
        <p className="text-slate-400">No trade history available yet.</p>
      </div>
    </div>
  );
}
