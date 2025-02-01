import { useState, useEffect } from 'react';
import scraper from '@/services/trade/scraper';
import type { PriceData, TradeCommodity } from '@/services/trade/types';

interface Props {
    onResult?: (data: PriceData) => void;
}

export default function TradeTool({ onResult }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [commodities, setCommodities] = useState<TradeCommodity[]>([]);
    const [selectedCommodity, setSelectedCommodity] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [priceData, setPriceData] = useState<PriceData | null>(null);

    // Load commodities on mount
    useEffect(() => {
        loadCommodities();
    }, []);

    const loadCommodities = async () => {
        try {
            setLoading(true);
            const data = await scraper.getCommodities();
            setCommodities(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load commodities');
        } finally {
            setLoading(false);
        }
    };

    const handleCommoditySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCommodity) return;

        setLoading(true);
        setError(null);

        try {
            const data = await scraper.getCommodityPrices(selectedCommodity);
            setPriceData(data);
            if (onResult) {
                onResult(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch commodity prices');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLocation) return;

        setLoading(true);
        setError(null);

        try {
            const data = await scraper.getLocationPrices(selectedLocation);
            setPriceData(data);
            if (onResult) {
                onResult(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch location prices');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="space-y-8">
                {/* Search Forms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Commodity Search */}
                    <form onSubmit={handleCommoditySubmit} className="space-y-4 bg-white/5 backdrop-blur-sm p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white">Search by Commodity</h3>
                        <div>
                            <label htmlFor="commodity" className="block text-sm font-medium text-gray-200">
                                Select Commodity
                            </label>
                            <select
                                id="commodity"
                                value={selectedCommodity}
                                onChange={(e) => setSelectedCommodity(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                disabled={loading}
                            >
                                <option value="">Select a commodity</option>
                                {commodities.map((commodity) => (
                                    <option key={commodity.code} value={commodity.code}>
                                        {commodity.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !selectedCommodity}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Loading...' : 'Search Commodity'}
                        </button>
                    </form>

                    {/* Location Search */}
                    <form onSubmit={handleLocationSubmit} className="space-y-4 bg-white/5 backdrop-blur-sm p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white">Search by Location</h3>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-200">
                                Enter Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter location name"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !selectedLocation}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Loading...' : 'Search Location'}
                        </button>
                    </form>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                {/* Results Display */}
                {priceData && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-white">Price Data</h3>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 p-4 rounded-md">
                                <div className="text-sm text-gray-400">Min Price</div>
                                <div className="text-xl font-semibold text-white">{priceData.min} aUEC</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-md">
                                <div className="text-sm text-gray-400">Max Price</div>
                                <div className="text-xl font-semibold text-white">{priceData.max} aUEC</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-md">
                                <div className="text-sm text-gray-400">Average</div>
                                <div className="text-xl font-semibold text-white">{Math.round(priceData.avg)} aUEC</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-md">
                                <div className="text-sm text-gray-400">Median</div>
                                <div className="text-xl font-semibold text-white">{priceData.median} aUEC</div>
                            </div>
                        </div>

                        {/* Locations Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">System</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Inventory</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {priceData.locations.map((location, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white/5' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{location.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{location.system}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                {location.price.current} aUEC
                                                <span className="text-xs text-gray-400 ml-2">
                                                    (Avg: {location.price.avg})
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                {location.inventory.current} SCU
                                                <span className="text-xs text-gray-400 ml-2">
                                                    (Avg: {location.inventory.avg})
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {location.type}
                                                {location.isNoQuestions && (
                                                    <span className="ml-2 text-yellow-500">No Questions</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
