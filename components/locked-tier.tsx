'use client';

interface LockedTierProps {
  tierName: string;
  unlockedAt?: string;
  children?: React.ReactNode;
}

export function LockedTier({ tierName, unlockedAt, children }: LockedTierProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-40 border-2 border-dashed border-red-600/30">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-2">🔒</div>
          <h3 className="text-lg font-bold text-red-300 mb-1">{tierName} LOCKED</h3>
          <p className="text-sm text-red-300/70 max-w-xs">
            {unlockedAt || 'Complete prerequisites to unlock this system'}
          </p>
        </div>
      </div>
      <div className="opacity-40 pointer-events-none">
        {children}
      </div>
    </div>
  );
}
