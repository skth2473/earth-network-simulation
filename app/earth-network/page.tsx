'use client';

import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { LockedTier } from '@/components/locked-tier';
import { EarthGrid } from '@/components/earth-grid';
import { TrendChart } from '@/components/trend-chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EarthNetworkDashboard() {
  const { state, history } = useSimulation();
  const isLocked = !state.unlock_system.earth_network;

  if (isLocked) {
    return (
      <DashboardLayout>
        <LockedTier tierName="Earth Network" unlockedAt="Unlock by developing the Agricultural system">
          <div className="space-y-6"><h1 className="text-3xl font-bold">Earth Network</h1></div>
        </LockedTier>
      </DashboardLayout>
    );
  }

  const status_counts = {
    discovered: state.earth_network.earths.filter((e) => e.status === 'discovered').length,
    colonizing: state.earth_network.earths.filter((e) => e.status === 'colonizing').length,
    established: state.earth_network.earths.filter((e) => e.status === 'established').length,
    thriving: state.earth_network.earths.filter((e) => e.status === 'thriving').length,
  };

  const status_data = [
    { name: 'Discovered', value: status_counts.discovered, fill: '#3b82f6' },
    { name: 'Colonizing', value: status_counts.colonizing, fill: '#f59e0b' },
    { name: 'Established', value: status_counts.established, fill: '#10b981' },
    { name: 'Thriving', value: status_counts.thriving, fill: '#8b5cf6' },
  ];

  const tech_tiers = {};
  state.earth_network.earths.forEach((e) => {
    tech_tiers[e.technology_tier] = (tech_tiers[e.technology_tier] || 0) + 1;
  });

  const tech_data = Object.entries(tech_tiers).map(([tier, count]) => ({
    name: `Tier ${tier}`,
    count,
    fill: '#7c3aed',
  }));

  const pop_change =
    history.length > 0
      ? ((state.earth_network.total_population - history[Math.max(0, history.length - 12)].network_population) /
          history[Math.max(0, history.length - 12)].network_population) *
        100
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Earth Network</h1>
          <p className="text-muted-foreground">Manage {state.earth_network.total_civilizations} civilizations across parallel Earths</p>
        </div>

        {/* Network KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Civilizations"
            value={state.earth_network.total_civilizations}
            unit="Worlds"
          />
          <KPICard
            title="Total Population"
            value={state.earth_network.total_population}
            unit="Million"
            change={pop_change}
          />
          <KPICard
            title="Avg Happiness"
            value={(state.earth_network.average_happiness * 100).toFixed(1)}
            unit="%"
            status={state.earth_network.average_happiness > 0.7 ? 'good' : 'warning'}
          />
          <KPICard
            title="Network Stability"
            value={(state.earth_network.network_stability * 100).toFixed(1)}
            unit="%"
            status={state.earth_network.network_stability > 0.75 ? 'good' : 'warning'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPICard
            title="Conflict Level"
            value={(state.earth_network.conflict_level * 100).toFixed(1)}
            unit="%"
            status={state.earth_network.conflict_level < 0.2 ? 'good' : 'critical'}
          />
          <KPICard
            title="Trade Volume"
            value={state.earth_network.trade_volume}
            unit="Million Credits"
          />
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Development Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={status_data}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
                <XAxis type="number" stroke="oklch(0.65 0 0)" />
                <YAxis dataKey="name" type="category" stroke="oklch(0.65 0 0)" width={80} />
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
            <h3 className="text-lg font-semibold mb-4 text-foreground">Technology Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tech_data}>
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
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Earth Grid Compact View */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">All {state.earth_network.total_civilizations} Worlds</h2>
          <div className="bg-card border border-border rounded-lg p-4">
            <EarthGrid earths={state.earth_network.earths} compact={true} />
          </div>
        </div>

        {/* Sample Earths */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Featured Civilizations</h2>
          <EarthGrid earths={state.earth_network.earths} compact={false} />
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={history}
            lines={[
              { key: 'network_population', label: 'Total Population', color: '#8b5cf6' },
              { key: 'average_earth_happiness', label: 'Avg Happiness', color: '#ec4899' },
            ]}
            title="Network Population & Happiness"
          />
          <TrendChart
            data={history}
            lines={[
              { key: 'average_earth_happiness', label: 'Stability', color: '#06b6d4' },
            ]}
            title="Network Stability Trend"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
