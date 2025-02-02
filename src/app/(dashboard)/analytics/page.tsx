"use client";

import { useState } from 'react';
import TradeTool from '@/components/tools/TradeTool';
import { PriceData } from '@/services/trade/types';

export default function AnalyticsPage() {
    const [tradeData, setTradeData] = useState<PriceData[]>([]);

    const handleTradeResult = (data: PriceData) => {
        setTradeData(prev => [...prev, data]);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">Trade Analytics</h2>
                <TradeTool onResult={handleTradeResult} />
            </div>

            {tradeData.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Recent Searches</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tradeData.map((data, index) => (
                            <div key={index} className="p-4 bg-black/20 backdrop-blur-sm rounded">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <h4 className="text-sm opacity-75">Min Price</h4>
                                        <p className="font-semibold">{data.min.toLocaleString()} aUEC</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm opacity-75">Max Price</h4>
                                        <p className="font-semibold">{data.max.toLocaleString()} aUEC</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm opacity-75">Average</h4>
                                        <p className="font-semibold">{data.avg.toLocaleString()} aUEC</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm opacity-75">Median</h4>
                                        <p className="font-semibold">{data.median.toLocaleString()} aUEC</p>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-white/10">
                                    <h4 className="text-sm opacity-75">Locations</h4>
                                    <p className="font-semibold">{data.locations.length} trading posts</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
