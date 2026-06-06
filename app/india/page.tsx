'use client';

import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { MinistryGrid } from '@/components/ministry-grid';
import { TrendChart } from '@/components/trend-chart';
import { ProgramCard } from '@/components/program-card';
import { UnlockIndicator } from '@/components/unlock-indicator';
import { useState } from 'react';
import { executeProgram } from '@/lib/program-mechanics';

export default function IndiaDashboard() {
  const { state, history, updateMinistry, updateState } = useSimulation();
  const [selectedMinistry, setSelectedMinistry] = useState(state.india.ministries[0]?.id || '');
  const [executing, setExecuting] = useState<string | null>(null);

  const literacy_change = history.length > 0
    ? ((state.india.literacy - history[Math.max(0, history.length - 12)].india_gdp) / 100) * 10
    : 0;

  const avg_morale = state.india.ministries.reduce((sum, m) => sum + m.morale, 0) / state.india.ministries.length;
  const top_ministries = [...state.india.ministries].sort((a, b) => b.impact - a.impact).slice(0, 6);
  const currentMinistry = state.india.ministries.find(m => m.id === selectedMinistry);

  const handleExecuteProgram = (ministryId: string, programId: string) => {
    setExecuting(`${ministryId}-${programId}`);
    const result = executeProgram(state, ministryId, programId);
    if (result.success) {
      updateState(result.state);
      console.log(result.message);
    }
    setTimeout(() => setExecuting(null), 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">India Ministry Dashboard</h1>
          <p className="text-muted-foreground">Manage 18 government ministries and track national development</p>
        </div>

        {/* National KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="GDP (Trillion ₹)"
            value={state.india.gdp}
            change={
              history.length > 0
                ? ((state.india.gdp - history[Math.max(0, history.length - 12)].india_gdp) /
                    history[Math.max(0, history.length - 12)].india_gdp) *
                  100
                : 0
            }
          />
          <KPICard
            title="Population (Million)"
            value={state.india.population}
            change={
              history.length > 0
                ? ((state.india.population - history[Math.max(0, history.length - 12)].india_population) /
                    history[Math.max(0, history.length - 12)].india_population) *
                  100
                : 0
            }
          />
          <KPICard
            title="Literacy Rate"
            value={(state.india.literacy * 100).toFixed(1)}
            unit="%"
            status={state.india.literacy > 0.8 ? 'good' : 'warning'}
          />
          <KPICard
            title="Corruption Index"
            value={(state.india.corruption * 100).toFixed(1)}
            unit="%"
            status={state.india.corruption < 0.3 ? 'good' : 'critical'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Healthcare Index"
            value={(state.india.healthcare * 100).toFixed(1)}
            unit="%"
          />
          <KPICard
            title="Infrastructure"
            value={(state.india.infrastructure * 100).toFixed(1)}
            unit="%"
          />
          <KPICard
            title="Tax Collection"
            value={(state.india.tax_collection * 100).toFixed(1)}
            unit="%"
          />
          <KPICard
            title="Total Budget Allocated"
            value={state.india.ministries.reduce((sum, m) => sum + m.budget, 0)}
            unit="Billion ₹"
          />
        </div>

        {/* Unlock Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-foreground mb-3">Average Ministry Morale: {(avg_morale * 100).toFixed(1)}%</h2>
            <div className="w-full bg-background rounded-full h-4 overflow-hidden border border-border">
              <div
                className={`h-full ${avg_morale >= 0.7 ? 'bg-green-600' : avg_morale >= 0.5 ? 'bg-amber-600' : 'bg-red-600'} transition-all duration-500`}
                style={{ width: `${Math.min(100, (avg_morale / 0.7) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {avg_morale >= 0.7 ? '✓ Livestock system UNLOCKED!' : `Reach 70% to unlock Livestock system (${Math.round((avg_morale / 0.7) * 100)}% progress)`}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">System Status</h3>
            <UnlockIndicator unlocks={state.unlock_system} />
          </div>
        </div>

        {/* Top Performers */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Top Performing Ministries</h2>
          <MinistryGrid ministries={top_ministries} onMinistryUpdate={updateMinistry} />
        </div>

        {/* All Ministries */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">All Ministries (Budget Allocation)</h2>
          <MinistryGrid ministries={state.india.ministries} onMinistryUpdate={updateMinistry} />
        </div>

        {/* Ministry Programs */}
        {currentMinistry && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Ministry Programs</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {state.india.ministries.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMinistry(m.id)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedMinistry === m.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border hover:border-primary/50'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{currentMinistry.name}</h3>
                  <p className="text-sm text-muted-foreground">Budget: ₹{currentMinistry.allocation.toFixed(0)}B | Morale: {(currentMinistry.morale * 100).toFixed(1)}% | Efficiency: {(currentMinistry.efficiency * 100).toFixed(1)}%</p>
                </div>
              </div>

              {currentMinistry.programs && currentMinistry.programs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentMinistry.programs.map(program => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      ministryId={currentMinistry.id}
                      ministryBudget={currentMinistry.allocation}
                      onExecute={handleExecuteProgram}
                      loading={executing === `${currentMinistry.id}-${program.id}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No programs available</p>
              )}
            </div>
          </div>
        )}

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={history}
            lines={[
              { key: 'india_gdp', label: 'GDP', color: '#7c3aed' },
            ]}
            title="GDP Growth Trend"
          />
          <TrendChart
            data={history}
            lines={[
              { key: 'india_population', label: 'Population', color: '#3b82f6' },
            ]}
            title="Population Growth"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
