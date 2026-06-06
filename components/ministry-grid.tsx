'use client';

import { Ministry } from '@/lib/types';

interface MinistryGridProps {
  ministries: Ministry[];
  onMinistryUpdate?: (ministry: Ministry) => void;
}

export function MinistryGrid({ ministries, onMinistryUpdate }: MinistryGridProps) {
  const handleBudgetChange = (ministry: Ministry, newBudget: number) => {
    const updated = { ...ministry, budget: Math.max(0, newBudget) };
    onMinistryUpdate?.(updated);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {ministries.map((ministry) => (
        <div
          key={ministry.id}
          className="bg-card border border-border rounded-lg p-3 hover:border-accent/50 transition-colors"
        >
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">{ministry.name}</h3>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-mono text-foreground">₹{ministry.budget.toFixed(0)}B</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={ministry.budget}
                onChange={(e) => handleBudgetChange(ministry, parseFloat(e.target.value))}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded p-2">
                <p className="text-xs text-muted-foreground">Efficiency</p>
                <p className="text-sm font-semibold text-foreground">{(ministry.efficiency * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <p className="text-xs text-muted-foreground">Morale</p>
                <p className="text-sm font-semibold text-foreground">{(ministry.morale * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <p className="text-xs text-muted-foreground">Research</p>
                <p className="text-sm font-semibold text-foreground">{(ministry.research * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <p className="text-xs text-muted-foreground">Impact</p>
                <p className="text-sm font-semibold text-accent">{(ministry.impact * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
