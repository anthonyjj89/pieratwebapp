"use client";

import { useState } from 'react';
import { RSIScraper } from '@/services/rsi/scraper';
import type { RSIProfile } from '@/services/rsi/types';

export function PlayerLookup() {
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<RSIProfile | null>(null);

  const handleSearch = async () => {
    if (!handle) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await RSIScraper.getProfileData(handle);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player data');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Enter player handle..."
          className="flex-1 rounded-lg bg-slate-800/50 px-4 py-2 text-white placeholder-slate-400 backdrop-blur"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !handle}
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

      {profile && (
        <div className="space-y-4 rounded-lg bg-slate-800/50 p-4 backdrop-blur">
          <div className="flex items-start gap-4">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.handle}
                className="h-20 w-20 rounded-lg"
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{profile.handle}</h3>
              <p className="text-slate-400">Enlisted: {profile.enlisted}</p>
              <p className="text-slate-400">Location: {profile.location}</p>
            </div>
          </div>

          {profile.mainOrg && !profile.mainOrg.isRedacted && (
            <div className="border-t border-slate-700 pt-4">
              <h4 className="mb-2 font-bold text-white">Main Organization</h4>
              <div className="flex items-center gap-4">
                {profile.mainOrg.logoUrl && (
                  <img
                    src={profile.mainOrg.logoUrl}
                    alt={profile.mainOrg.name}
                    className="h-12 w-12 rounded"
                  />
                )}
                <div>
                  <p className="font-medium text-white">{profile.mainOrg.name}</p>
                  <p className="text-sm text-slate-400">
                    Rank: {profile.mainOrg.rank}
                  </p>
                </div>
              </div>
            </div>
          )}

          {profile.affiliatedOrgs.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <h4 className="mb-2 font-bold text-white">Affiliated Organizations</h4>
              <div className="space-y-2">
                {profile.affiliatedOrgs.map((org) => (
                  !org.isRedacted && (
                    <div key={org.sid} className="flex items-center gap-4">
                      {org.logoUrl && (
                        <img
                          src={org.logoUrl}
                          alt={org.name}
                          className="h-8 w-8 rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium text-white">{org.name}</p>
                        <p className="text-sm text-slate-400">
                          Rank: {org.rank}
                        </p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
