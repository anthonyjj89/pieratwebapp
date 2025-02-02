"use client";

import { useState } from 'react';
import { LocationPrice, PriceData } from '@/services/trade/types';

interface TradeToolProps {
    onResult?: (data: PriceData) => void;
}

export default function TradeTool({ onResult }: TradeToolProps) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<PriceData | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await fetch(`/api/trade/locations/${encodeURIComponent(code)}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch trade data');
            }

            setData(result.data);
            if (onResult) {
                onResult(result.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch trade data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter location code"
                    className="flex-1 px-3 py-2 border rounded bg-black/20 backdrop-blur-sm"
                />
                <button
                    type="submit"
                    disabled={loading || !code}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Search'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                    {error}
                </div>
            )}

            {data && (
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-black/20 backdrop-blur-sm rounded">
                        <div>
                            <h4 className="text-sm opacity-75">Min Price</h4>
                            <p className="text-lg font-semibold">{data.min.toLocaleString()} aUEC</p>
                        </div>
                        <div>
                            <h4 className="text-sm opacity-75">Max Price</h4>
                            <p className="text-lg font-semibold">{data.max.toLocaleString()} aUEC</p>
                        </div>
                        <div>
                            <h4 className="text-sm opacity-75">Average Price</h4>
                            <p className="text-lg font-semibold">{data.avg.toLocaleString()} aUEC</p>
                        </div>
                        <div>
                            <h4 className="text-sm opacity-75">Median Price</h4>
                            <p className="text-lg font-semibold">{data.median.toLocaleString()} aUEC</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {data.locations.map((location: LocationPrice, i: number) => (
                            <div key={i} className="p-4 bg-black/20 backdrop-blur-sm rounded">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-semibold">{location.name}</h3>
                                        <p className="text-sm opacity-75">{location.system}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-sm px-2 py-0.5 bg-blue-500/20 rounded">
                                                {location.faction}
                                            </span>
                                            {location.type && (
                                                <span className="text-sm px-2 py-0.5 bg-gray-500/20 rounded">
                                                    {location.type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {location.price && (
                                            <>
                                                <p className="font-semibold">{location.price.current.toLocaleString()} aUEC</p>
                                                <p className="text-sm opacity-75">
                                                    Avg: {location.price.avg.toLocaleString()} aUEC
                                                </p>
                                            </>
                                        )}
                                        {location.inventory && (
                                            <p className="text-sm opacity-75">
                                                Stock: {location.inventory.current}/{location.inventory.max}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {location.orbit && (
                                    <p className="text-sm opacity-75 mt-1">Orbit: {location.orbit}</p>
                                )}

                                {location.scuBoxSizes && location.scuBoxSizes.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm opacity-75">SCU Box Sizes:</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {location.scuBoxSizes.map((size, i) => (
                                                <span key={i} className="text-sm px-2 py-0.5 bg-green-500/20 rounded">
                                                    {size} SCU
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
