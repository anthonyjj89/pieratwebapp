"use client";

import { useState } from 'react';
import { PlayerLookup } from '@/components/tools';
import { RSIProfile } from '@/services/rsi/types';

interface CargoItem {
    type: string;
    quantity: number;
    value: number;
}

interface HitReport {
    target: string;
    location: string;
    cargo: CargoItem[];
    crew: string[];
    timestamp: Date;
    totalValue: number;
}

export default function HitReportForm() {
    const [target, setTarget] = useState<RSIProfile | null>(null);
    const [location, setLocation] = useState('');
    const [cargo, setCargo] = useState<CargoItem[]>([]);
    const [newCargoItem, setNewCargoItem] = useState<CargoItem>({
        type: '',
        quantity: 0,
        value: 0
    });

    const handleTargetFound = (profile: RSIProfile) => {
        setTarget(profile);
    };

    const addCargoItem = () => {
        if (newCargoItem.type && newCargoItem.quantity > 0 && newCargoItem.value > 0) {
            setCargo([...cargo, { ...newCargoItem }]);
            setNewCargoItem({ type: '', quantity: 0, value: 0 });
        }
    };

    const removeCargoItem = (index: number) => {
        setCargo(cargo.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!target) return;

        const report: HitReport = {
            target: target.handle,
            location,
            cargo,
            crew: [], // TODO: Add crew selection
            timestamp: new Date(),
            totalValue: cargo.reduce((sum, item) => sum + (item.quantity * item.value), 0)
        };

        // TODO: Submit report to API
        console.log('Submitting report:', report);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Target Information</h3>
                    <PlayerLookup onResult={handleTargetFound} />
                    
                    {target && (
                        <div className="mt-4 p-4 bg-black/20 backdrop-blur-sm rounded">
                            <p className="font-medium">Selected Target: {target.handle}</p>
                            {target.mainOrg && (
                                <p className="text-sm opacity-75">Organization: {target.mainOrg.name}</p>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Hit Details</h3>
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
                            <label className="block text-sm font-medium mb-1">Cargo</label>
                            <div className="space-y-2">
                                {cargo.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-black/10 rounded">
                                        <span className="flex-1">{item.type}</span>
                                        <span>{item.quantity}x</span>
                                        <span>{item.value} aUEC</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCargoItem(index)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCargoItem.type}
                                        onChange={(e) => setNewCargoItem({ ...newCargoItem, type: e.target.value })}
                                        placeholder="Cargo type"
                                        className="flex-1 px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                                    />
                                    <input
                                        type="number"
                                        value={newCargoItem.quantity || ''}
                                        onChange={(e) => setNewCargoItem({ ...newCargoItem, quantity: parseInt(e.target.value) || 0 })}
                                        placeholder="Qty"
                                        className="w-20 px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                                    />
                                    <input
                                        type="number"
                                        value={newCargoItem.value || ''}
                                        onChange={(e) => setNewCargoItem({ ...newCargoItem, value: parseInt(e.target.value) || 0 })}
                                        placeholder="Value"
                                        className="w-32 px-3 py-2 bg-black/20 backdrop-blur-sm border rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCargoItem}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={!target || !location || cargo.length === 0}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                            >
                                Submit Report
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
