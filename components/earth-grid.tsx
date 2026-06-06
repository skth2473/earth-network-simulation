'use client';

import { CivilizationEarth } from '@/lib/types';

interface EarthGridProps {
  earths: CivilizationEarth[];
  compact?: boolean;
}

export function EarthGrid({ earths, compact = false }: EarthGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'discovered':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'colonizing':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'established':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'thriving':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
      default:
        return 'bg-muted/50 border-border text-muted-foreground';
    }
  };

  if (compact) {
    return (
      <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-1">
        {earths.map((earth) => (
          <div key={earth.id} className="relative group">
            <div
              className={`w-8 h-8 rounded border ${getStatusColor(earth.status)} flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}
              title={earth.name}
            >
              <span className="text-xs font-bold">{earth.id.split('_')[1]}</span>
            </div>
            <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-muted border border-border rounded p-2 text-xs whitespace-nowrap z-10 pointer-events-none">
              <p className="font-semibold">{earth.name}</p>
              <p className="text-muted-foreground">{earth.status}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {earths.slice(0, 24).map((earth) => (
        <div key={earth.id} className={`border rounded-lg p-3 space-y-2 ${getStatusColor(earth.status)}`}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-sm">{earth.name}</h4>
              <p className="text-xs opacity-75 capitalize">{earth.status}</p>
            </div>
            <span className="text-xs font-mono bg-background/50 px-2 py-1 rounded">Tier {earth.technology_tier}</span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>
              <p className="text-muted-foreground">Population</p>
              <p className="font-semibold">{(earth.population / 1000).toFixed(1)}k</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dev</p>
              <p className="font-semibold">{(earth.development_level * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Happiness</p>
              <p className="font-semibold">{(earth.happiness * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Research</p>
              <p className="font-semibold">{earth.research_progress.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
