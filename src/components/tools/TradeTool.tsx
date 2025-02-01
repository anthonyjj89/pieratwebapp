import { useState } from 'react';
import { TradeScraper } from '@/services/trade/scraper';
import type { CommodityPrice, TradeLocation } from '@/services/trade/types';

export function TradeTool() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commodityData, setCommodityData] = useState<CommodityPrice | null>(null);
  const [locationData, setLocationData] = useState<TradeLocation | null>(null);

  const handleSearch = async () => {
    if (!code) return;
    
    setLoading(true);
    setError(null);
    try {
      const [commodity, location] = await Promise.all([
        TradeScraper.getCommodityPrices(code),
        TradeScraper.getLocationPrices(code)
      ]);
      setCommodityData(commodity);
      setLocationData(location);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trade data');
      setCommodityData(null);
      setLocationData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter commodity or location code..."
          className="flex-1 rounded-lg bg-slate-800/50 px-4 py-2 text-white placeholder-slate-400 backdrop-blur"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !code}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-4 text-red-500">
          {error}
        </div>
      )}

      {commodityData && (
        <div className="rounded-lg bg-slate-800/50 p-4 backdrop-blur">
          <h3 className="mb-4 text-xl font-bold text-white">{commodityData.name}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-2 font-medium text-white">Buy Prices</h4>
              <div className="space-y-1 text-sm">
                <p className="text-slate-400">
                  Min: <span className="text-white">{formatPrice(commodityData.prices.buy.min)}</span>
                </p>
                <p className="text-slate-400">
                  Max: <span className="text-white">{formatPrice(commodityData.prices.buy.max)}</span>
                </p>
                <p className="text-slate-400">
                  Avg: <span className="text-white">{formatPrice(commodityData.prices.buy.avg)}</span>
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="mb-2 font-medium text-white">Sell Prices</h4>
              <div className="space-y-1 text-sm">
                <p className="text-slate-400">
                  Min: <span className="text-white">{formatPrice(commodityData.prices.sell.min)}</span>
                </p>
                <p className="text-slate-400">
                  Max: <span className="text-white">{formatPrice(commodityData.prices.sell.max)}</span>
                </p>
                <p className="text-slate-400">
                  Avg: <span className="text-white">{formatPrice(commodityData.prices.sell.avg)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {locationData && (
        <div className="rounded-lg bg-slate-800/50 p-4 backdrop-blur">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white">{locationData.name}</h3>
            <p className="text-slate-400">{locationData.system}</p>
          </div>

          <div className="space-y-4">
            {locationData.prices.buy.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-white">Buying</h4>
                <div className="space-y-2">
                  {locationData.prices.buy.map((entry) => (
                    <div key={entry.commodity} className="flex justify-between text-sm">
                      <span className="text-slate-400">{entry.commodity}</span>
                      <span className="text-white">{formatPrice(entry.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {locationData.prices.sell.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-white">Selling</h4>
                <div className="space-y-2">
                  {locationData.prices.sell.map((entry) => (
                    <div key={entry.commodity} className="flex justify-between text-sm">
                      <span className="text-slate-400">{entry.commodity}</span>
                      <span className="text-white">{formatPrice(entry.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
