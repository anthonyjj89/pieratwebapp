import TradeTool from '@/components/tools/TradeTool';
import type { PriceData } from '@/services/trade/types';

export default function AnalyticsPage() {
    const handleTradeResult = (data: PriceData) => {
        console.log('Trade data:', data);
        // TODO: Add analytics visualization
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8 text-white">Trade Analytics</h1>
            
            <div className="bg-black/30 backdrop-blur-lg shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Trade Data</h2>
                <TradeTool onResult={handleTradeResult} />
            </div>
        </div>
    );
}
