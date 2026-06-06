'use client';

import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { LockedTier } from '@/components/locked-tier';
import { TrendChart } from '@/components/trend-chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

export default function SpaceProgramDashboard() {
  const { state, history } = useSimulation();
  const isLocked = !state.unlock_system.space;

  if (isLocked) {
    return (
      <DashboardLayout>
        <LockedTier tierName="Space Program" unlockedAt="Unlock by developing the Earth Network system">
          <div className="space-y-6"><h1 className="text-3xl font-bold">Space Program</h1></div>
        </LockedTier>
      </DashboardLayout>
    );
  }

  const mission_success_rate = state.space.successful_missions + state.space.failed_missions > 0
    ? (state.space.successful_missions / (state.space.successful_missions + state.space.failed_missions)) * 100
    : 0;

  const expansion_data = [
    { name: 'Planets', value: state.space.colonized_planets, color: '#06b6d4' },
    { name: 'Ships in Transit', value: state.space.ships_in_transit, color: '#f59e0b' },
    { name: 'Successful Missions', value: Math.min(state.space.successful_missions, 50), color: '#10b981' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Space Program</h1>
          <p className="text-muted-foreground">Manage planetary colonization and interstellar expansion</p>
        </div>

        {/* Space KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Colonized Planets"
            value={state.space.colonized_planets}
            unit="Worlds"
            status={state.space.colonized_planets > 10 ? 'good' : 'warning'}
          />
          <KPICard
            title="Ships in Transit"
            value={state.space.ships_in_transit}
            unit="Active"
          />
          <KPICard
            title="Research Tier"
            value={state.space.research_tier}
            unit="Level"
          />
          <KPICard
            title="Success Rate"
            value={mission_success_rate.toFixed(1)}
            unit="%"
            status={mission_success_rate > 80 ? 'good' : 'warning'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPICard
            title="Resources Invested"
            value={state.space.resources_invested}
            unit="Million ₹"
          />
          <KPICard
            title="Expansion Value"
            value={state.space.total_expansion_value}
            unit="Million ₹"
          />
        </div>

        {/* Mission Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Successful Missions</h3>
            <p className="text-3xl font-bold text-green-400">{state.space.successful_missions}</p>
            <p className="text-sm text-muted-foreground">Completed expeditions</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Failed Missions</h3>
            <p className="text-3xl font-bold text-red-400">{state.space.failed_missions}</p>
            <p className="text-sm text-muted-foreground">Lost expeditions</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Total Missions</h3>
            <p className="text-3xl font-bold text-foreground">{state.space.successful_missions + state.space.failed_missions}</p>
            <p className="text-sm text-muted-foreground">All expeditions</p>
          </div>
        </div>

        {/* Expansion Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Program Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expansion_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
                <XAxis stroke="oklch(0.65 0 0)" />
                <YAxis stroke="oklch(0.65 0 0)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.155 0 0)',
                    border: '1px solid oklch(0.25 0 0)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Mission History</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-semibold text-green-400">{mission_success_rate.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${mission_success_rate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Colonization Rate</span>
                  <span className="text-sm font-semibold text-cyan-400">{((state.space.colonized_planets / 20) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${Math.min((state.space.colonized_planets / 20) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Next Goal:</span> Expand to {state.space.colonized_planets + 3} planets
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Research Target:</span> Tier {state.space.research_tier + 1}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonized Planets */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Colonized Worlds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: state.space.colonized_planets }).map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-cyan-300 mb-2">Planet {i + 1}</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Population: {Math.floor(Math.random() * 100) + 10}M</p>
                  <p>Development: {(Math.random() * 80 + 20).toFixed(0)}%</p>
                  <p>Resources: {Math.floor(Math.random() * 5000) + 1000}M ₹</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Tiers */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Technology Advancement</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 border text-center space-y-2 ${
                  i < state.space.research_tier
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : i === state.space.research_tier
                      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                      : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                <p className="font-semibold">Tier {i + 1}</p>
                <p className="text-xs">
                  {i < state.space.research_tier
                    ? 'Unlocked'
                    : i === state.space.research_tier
                      ? 'Current'
                      : 'Locked'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={history}
            lines={[
              { key: 'space_planets', label: 'Colonized Planets', color: '#06b6d4' },
            ]}
            title="Expansion Progress"
          />
          <TrendChart
            data={history}
            lines={[
              { key: 'space_planets', label: 'Growth Rate', color: '#10b981' },
            ]}
            title="Colonization Rate Trend"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
