'use client';

import { UnlockSystem } from '@/lib/types';

interface UnlockIndicatorProps {
  unlocks: UnlockSystem;
}

export function UnlockIndicator({ unlocks }: UnlockIndicatorProps) {
  const tiers = [
    { id: 'india', label: 'India Ministry', unlocked: unlocks.india, color: 'bg-purple-600' },
    { id: 'livestock', label: 'NLEC Livestock', unlocked: unlocks.livestock, color: 'bg-blue-600', progress: unlocks.livestock_unlock_progress },
    { id: 'energy', label: 'Energy System', unlocked: unlocks.energy, color: 'bg-amber-600' },
    { id: 'agriculture', label: 'Agriculture', unlocked: unlocks.agriculture, color: 'bg-green-600' },
    { id: 'earth_network', label: 'Earth Network', unlocked: unlocks.earth_network, color: 'bg-cyan-600' },
    { id: 'space', label: 'Space Program', unlocked: unlocks.space, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-3">
      {tiers.map(tier => (
        <div key={tier.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{tier.label}</span>
            {tier.unlocked ? (
              <span className="text-xs px-2 py-1 bg-green-600/30 text-green-300 rounded font-mono">UNLOCKED</span>
            ) : (
              <span className="text-xs px-2 py-1 bg-red-600/30 text-red-300 rounded font-mono">LOCKED</span>
            )}
          </div>
          {tier.progress !== undefined && (
            <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
              <div
                className={`h-full ${tier.color} transition-all duration-500`}
                style={{ width: `${Math.min(100, tier.progress)}%` }}
              />
            </div>
          )}
        </div>
      ))}

      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <p className="text-xs text-blue-300">
          <strong>Unlock Path:</strong> Increase average ministry morale to 70% to unlock Livestock. Then reach 60% livestock coverage to unlock Energy.
        </p>
      </div>
    </div>
  );
}
