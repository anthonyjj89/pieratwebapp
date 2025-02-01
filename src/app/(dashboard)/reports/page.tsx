import PlayerLookup from '@/components/tools/PlayerLookup';
import { RSIProfile } from '@/services/rsi/types';

export default function ReportsPage() {
    const handlePlayerResult = (profile: RSIProfile) => {
        console.log('Player profile:', profile);
        // TODO: Handle player lookup result
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Reports</h1>
            
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Player Lookup</h2>
                <PlayerLookup onResult={handlePlayerResult} />
            </div>
        </div>
    );
}
