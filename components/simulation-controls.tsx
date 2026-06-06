'use client';

import { useSimulation } from '@/lib/simulation-context';
import { Button } from '@/components/ui/button';

export function SimulationControls() {
  const { state, setSpeed, simulateStep, saveGame, loadGame, resetGame } = useSimulation();

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Simulation Speed</h3>
        <div className="flex gap-2">
          {(['paused', 'normal', 'fast', 'ultra'] as const).map((speed) => (
            <Button
              key={speed}
              onClick={() => setSpeed(speed)}
              variant={state.simulation_speed === speed ? 'default' : 'outline'}
              size="sm"
              className="flex-1 capitalize"
            >
              {speed}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Controls</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={simulateStep} variant="outline" size="sm" className="text-xs">
            Step Forward
          </Button>
          <Button onClick={saveGame} variant="outline" size="sm" className="text-xs">
            Save
          </Button>
          <Button onClick={loadGame} variant="outline" size="sm" className="text-xs">
            Load
          </Button>
          <Button onClick={resetGame} variant="destructive" size="sm" className="text-xs">
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border">
        <p>
          Year: <span className="font-mono text-foreground">{state.current_year}</span>
        </p>
        <p>
          Month: <span className="font-mono text-foreground">{state.current_month}</span>
        </p>
      </div>
    </div>
  );
}
