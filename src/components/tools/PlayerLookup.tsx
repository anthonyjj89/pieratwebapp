import { useState } from 'react';
import { RSIProfile } from '@/services/rsi/types';
import scraper from '@/services/rsi/scraper';

interface Props {
    onResult?: (profile: RSIProfile) => void;
}

export default function PlayerLookup({ onResult }: Props) {
    const [handle, setHandle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!handle) return;

        setLoading(true);
        setError(null);

        try {
            const profile = await scraper.getProfileData(handle);
            if (onResult) {
                onResult(profile);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch player data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
                        Player Handle
                    </label>
                    <input
                        type="text"
                        id="handle"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter RSI handle"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !handle}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Loading...' : 'Lookup Player'}
                </button>
            </form>
        </div>
    );
}
