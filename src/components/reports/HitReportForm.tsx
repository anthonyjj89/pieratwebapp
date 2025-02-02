"use client";

import { useState } from 'react';
import { RSIProfile } from '@/services/rsi/types';
import { CargoData } from '@/services/trade/types';
import { OrganizationMember } from '@/types/organizations';
import CrewSelector from './CrewSelector';

interface HitReportFormProps {
    target?: RSIProfile | null;
    cargo?: CargoData | null;
    organizationId: string;
}

interface CargoEntry {
    code: string;
    name: string;
    quantity: number;
    value: number;
}

interface HitReport {
    targetId: string;
    organizationId: string;
    location: string;
    cargo: CargoEntry[];
    participants: OrganizationMember[];
    timestamp: Date;
}

export default function HitReportForm({ target, cargo, organizationId }: HitReportFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState('');
    const [cargoEntries, setCargoEntries] = useState<CargoEntry[]>([]);
    const [selectedCrew, setSelectedCrew] = useState<OrganizationMember[]>([]);
    const [currentQuantity, setCurrentQuantity] = useState<number>(0);

    const addCargoEntry = () => {
        if (!cargo || currentQuantity <= 0) return;

        const newEntry: CargoEntry = {
            code: cargo.code,
            name: cargo.name,
            quantity: currentQuantity,
            value: cargo.avg * currentQuantity
        };

        setCargoEntries([...cargoEntries, newEntry]);
        setCurrentQuantity(0);
    };

    const removeCargoEntry = (index: number) => {
        setCargoEntries(cargoEntries.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!target || cargoEntries.length === 0 || !location || selectedCrew.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const report: HitReport = {
                targetId: target.id,
                organizationId,
                location,
                cargo: cargoEntries,
                participants: selectedCrew,
                timestamp: new Date()
            };

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(report),
            });

            if (!response.ok) {
                throw new Error('Failed to submit report');
            }

            // Clear form
            setLocation('');
            setCargoEntries([]);
            setCurrentQuantity(0);
            setSelectedCrew([]);

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

            {/* Cargo List */}
            <div className="space-y-4">
                <h3 className="font-semibold">Cargo List</h3>
                {cargoEntries.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded">
                        <div>
                            <p className="font-medium">{entry.name}</p>
                            <p className="text-sm opacity-75">Quantity: {entry.quantity}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium">{entry.value.toLocaleString()} aUEC</p>
                            <button
                                onClick={() => removeCargoEntry(index)}
                                className="text-sm text-red-400 hover:text-red-300"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Current Cargo Selection */}
            {cargo && (
                <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
                    <h3 className="font-semibold mb-2">Add Cargo</h3>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="font-medium">{cargo.name}</p>
                            <p className="text-sm opacity-75">
                                Average Price: {cargo.avg.toLocaleString()} aUEC
                            </p>
                        </div>
                        <div className="flex items-end gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantity</label>
                                <input
                                    type="number"
                                    value={currentQuantity || ''}
                                    onChange={(e) => setCurrentQuantity(parseInt(e.target.value) || 0)}
                                    min="1"
                                    className="w-24 px-2 py-1 bg-black/20 backdrop-blur-sm border rounded"
                                />
                            </div>
                            <button
                                onClick={addCargoEntry}
                                disabled={!cargo || currentQuantity <= 0}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>
                    </div>
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

                {/* Crew Selection */}
                <CrewSelector
                    organizationId={organizationId}
                    onSelect={setSelectedCrew}
                />

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !target || cargoEntries.length === 0 || !location || selectedCrew.length === 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
}
