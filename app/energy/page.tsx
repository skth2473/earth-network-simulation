'use client';

import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { TrendChart } from '@/components/trend-chart';
import { LockedTier } from '@/components/locked-tier';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function EnergyDashboard() {
  const { state, history } = useSimulation();
  const isLocked = !state.unlock_system.energy;

  if (isLocked) {
    return (
      <DashboardLayout>
        <LockedTier tierName="Energy System" unlockedAt="Unlock by reaching 60% livestock coverage">
          <div className="space-y-6"><h1 className="text-3xl font-bold">Energy System</h1></div>
        </LockedTier>
      </DashboardLayout>
    );
  }

  const energy_data = [
    { name: 'Solar', value: state.energy.solar_output, color: '#f59e0b' },
    { name: 'Wind', value: state.energy.wind_output, color: '#06b6d4' },
    { name: 'Nuclear', value: state.energy.nuclear_output, color: '#7c3aed' },
  ];

  const balance_data = [
    { name: 'Production', value: state.energy.energy_produced },
    { name: 'Consumption', value: state.energy.energy_consumed },
    { name: 'Surplus', value: Math.max(0, state.energy.energy_produced - state.energy.energy_consumed) },
  ];

  const surplus_change = history.length > 0
    ? ((state.energy.surplus - history[Math.max(0, history.length - 12)].energy_surplus) /
        history[Math.max(0, history.length - 12)].energy_surplus) *
      100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Energy Production & Distribution</h1>
          <p className="text-muted-foreground">Monitor power generation, consumption, and trading agreements</p>
        </div>

        {/* Energy KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Production"
            value={state.energy.energy_produced}
            unit="TWh"
            status={state.energy.energy_produced > 2400 ? 'good' : 'warning'}
          />
          <KPICard
            title="Total Consumption"
            value={state.energy.energy_consumed}
            unit="TWh"
            status={state.energy.energy_consumed < state.energy.energy_produced ? 'good' : 'critical'}
          />
          <KPICard
            title="Surplus"
            value={Math.max(0, state.energy.energy_produced - state.energy.energy_consumed)}
            unit="TWh"
            change={surplus_change}
            status={state.energy.surplus > 200 ? 'good' : state.energy.surplus > 0 ? 'warning' : 'critical'}
          />
          <KPICard
            title="System Efficiency"
            value={(state.energy.efficiency * 100).toFixed(1)}
            unit="%"
            status={state.energy.efficiency > 0.85 ? 'good' : 'warning'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPICard
            title="Energy Storage"
            value={state.energy.storage}
            unit="TWh"
            status={state.energy.storage > 400 ? 'good' : 'warning'}
          />
          <KPICard
            title="Trading Agreements"
            value={state.energy.trading_agreements}
            unit="Active"
          />
        </div>

        {/* Production Mix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Energy Source Mix</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={energy_data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {energy_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.155 0 0)',
                    border: '1px solid oklch(0.25 0 0)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Supply vs Demand</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={balance_data}>
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
        </div>

        {/* Source Details */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Energy Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">☀️</span> Solar Power
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Output</span>
                  <span className="font-semibold text-foreground">{state.energy.solar_output} TWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">% of Total</span>
                  <span className="font-semibold text-foreground">{((state.energy.solar_output / state.energy.energy_produced) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: `${(state.energy.solar_output / state.energy.energy_produced) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">💨</span> Wind Power
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Output</span>
                  <span className="font-semibold text-foreground">{state.energy.wind_output} TWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">% of Total</span>
                  <span className="font-semibold text-foreground">{((state.energy.wind_output / state.energy.energy_produced) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${(state.energy.wind_output / state.energy.energy_produced) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">⚛️</span> Nuclear Power
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Output</span>
                  <span className="font-semibold text-foreground">{state.energy.nuclear_output} TWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">% of Total</span>
                  <span className="font-semibold text-foreground">{((state.energy.nuclear_output / state.energy.energy_produced) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${(state.energy.nuclear_output / state.energy.energy_produced) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={history}
            lines={[
              { key: 'energy_surplus', label: 'Energy Surplus', color: '#10b981' },
            ]}
            title="Energy Surplus Trend"
          />
          <TrendChart
            data={history}
            lines={[
              { key: 'energy_surplus', label: 'Efficiency', color: '#f59e0b' },
            ]}
            title="System Efficiency Over Time"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
