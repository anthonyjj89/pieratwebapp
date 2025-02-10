"use client";

import { useState } from 'react';
import { CargoData } from '@/services/trade/types';

interface CargoLookupProps {
    onSelect?: (data: CargoData) => void;
}

interface Commodity {
    code: string;
    name: string;
    location: string;
    currentPrice: number;
}

export default function CargoLookup({ onSelect }: CargoLookupProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Commodity[]>([]);

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (!term) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/trade/commodities/search?q=${encodeURIComponent(term)}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch commodities');
            }

            const data = await response.json();
            setResults(data.results);
        } catch (err) {
            setError('Failed to search commodities');
            console.error('Error searching commodities:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (commodity: Commodity) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/trade/commodities/${commodity.code}`);
            if (!response.ok) {
                throw new Error('Failed to fetch price data');
            }

            const { data } = await response.json();
            if (onSelect) {
                onSelect({
                    code: commodity.code,
                    name: commodity.name,
                    avg: data.avg,
                    min: data.min,
                    max: data.max
                });
            }
        } catch (err) {
            setError('Failed to fetch price data');
            console.error('Error fetching price data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name (e.g. Recycled Material Composite)"
                    className="w-full px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                />
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-4">Searching...</div>
            ) : (
                <div className="space-y-2">
                    {results.map((commodity) => (
                        <button
                            key={commodity.code}
                            onClick={() => handleSelect(commodity)}
                            className="w-full flex items-center justify-between p-3 bg-black/20 hover:bg-black/30 rounded"
                        >
                            <div>
                                <div className="font-medium">{commodity.name}</div>
                            </div>
                            <div className="text-right">
                                <div>{commodity.currentPrice.toLocaleString()} aUEC</div>
                                <div className="text-sm opacity-75">{commodity.location}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}