"use client";

import { useState } from 'react';
import { RSIProfile } from '@/services/rsi/types';
import { PriceData } from '@/services/trade/types';

interface HitReportFormProps {
    target?: RSIProfile | null;
    cargo?: PriceData | null;
}

interface HitReport {
    targetId: string;
    location: string;
    cargo: {
        code: string;
        quantity: number;
        value: number;
    }[];
    timestamp: Date;
}

export default function HitReportForm({ target, cargo }: HitReportFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState('');
    const [quantity, setQuantity] = useState<number>(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!target || !cargo || !location || quantity <= 0) return;

        setLoading(true);
        setError(null);

        try {
            const report: HitReport = {
                targetId: target.id,
                location,
                cargo: [{
                    code: cargo.code,
                    quantity,
                    value: cargo.avg * quantity
                }],
                timestamp: new Date()
            };

            // TODO: Submit to API
            console.log('Submitting report:', report);

            // Clear form
            setLocation('');
            setQuantity(0);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Target Info */}
            {target ? (
                <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                    <h3 className="font-semibold mb-2">Selected Target</h3>
                    <div className="flex justify-between">
                        <div>
                            <p className="font-medium">{target.handle}</p>
                            {target.mainOrg && (
                                <p className="text-sm opacity-75">
                                    Organization: {target.mainOrg.name}
                                </p>
                            )}
                        </div>
                        {target.location && (
                            <p className="text-sm opacity-75">
                                Last seen: {target.location}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                    <p className="text-center opacity-75">No target selected</p>
                </div>
            )}

            {/* Cargo Info */}
            {cargo ? (
                <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                    <h3 className="font-semibold mb-2">Selected Cargo</h3>
                    <div className="flex justify-between">
                        <div>
                            <p className="font-medium">{cargo.name}</p>
                            <p className="text-sm opacity-75">
                                Average Price: {cargo.avg.toLocaleString()} aUEC
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium">
                                {(cargo.avg * (quantity || 0)).toLocaleString()} aUEC
                            </p>
                            <p className="text-sm opacity-75">Total Value</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                    <p className="text-center opacity-75">No cargo selected</p>
                </div>
            )}

            {/* Report Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Port Olisar, Crusader"
                        className="w-full px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                        type="number"
                        value={quantity || ''}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                        required
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !target || !cargo || !location || quantity <= 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
}
