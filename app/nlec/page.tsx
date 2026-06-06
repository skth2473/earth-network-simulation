'use client';

import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { TrendChart } from '@/components/trend-chart';
import { LockedTier } from '@/components/locked-tier';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function NLECDashboard() {
  const { state, history } = useSimulation();
  const isLocked = !state.unlock_system.livestock;

  const livestock_data = state.nlec.livestock.map((l) => ({
    name: l.species,
    count: Math.round(l.count),
    feed: Math.round(l.feed_required),
    productivity: (l.productivity * 100).toFixed(0),
  }));

  const food_output_change =
    history.length > 0
      ? ((state.nlec.food_output - history[Math.max(0, history.length - 12)].india_gdp * 10) /
          (history[Math.max(0, history.length - 12)].india_gdp * 10)) *
        100
      : 0;

  if (isLocked) {
    return (
      <DashboardLayout>
        <LockedTier tierName="Livestock System" unlockedAt="Unlock by reaching 70% average ministry morale in India Ministry">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Livestock & Food Production System</h1>
          </div>
        </LockedTier>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Livestock & Food Production System</h1>
          <p className="text-muted-foreground">Manage livestock breeding, feed production, and food output</p>
        </div>

        {/* System KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Livestock"
            value={Math.round(state.nlec.total_livestock)}
            unit="Animals"
            status={state.nlec.total_livestock > 450 ? 'good' : 'warning'}
          />
          <KPICard
            title="Food Output"
            value={state.nlec.food_output}
            unit="Million kg"
            change={food_output_change}
          />
          <KPICard
            title="Feed Storage"
            value={state.nlec.feed_storage}
            unit="Million kg"
            status={state.nlec.feed_storage > 800 ? 'good' : state.nlec.feed_storage > 500 ? 'warning' : 'critical'}
          />
          <KPICard
            title="Monthly Profit"
            value={state.nlec.profit}
            unit="Million ₹"
            status={state.nlec.profit > 20000 ? 'good' : 'warning'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPICard
            title="Feed Production"
            value={state.nlec.feed_production}
            unit="Million kg/month"
          />
          <KPICard
            title="Feed Efficiency"
            value={((state.nlec.food_production / state.nlec.livestock.reduce((sum, l) => sum + l.feed_required, 0)) * 100).toFixed(1)}
            unit="%"
          />
        </div>

        {/* Livestock Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Livestock Population</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={livestock_data}>
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
                <Bar dataKey="count" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Species Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={livestock_data}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  <Cell fill="#7c3aed" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
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
        </div>

        {/* Individual Species */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Species Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.nlec.livestock.map((livestock) => (
              <div key={livestock.species} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground">{livestock.species}</h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Count</span>
                    <span className="font-semibold text-foreground">{Math.round(livestock.count)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Health</span>
                    <span className={`font-semibold ${livestock.health > 0.8 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {(livestock.health * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Productivity</span>
                    <span className="font-semibold text-foreground">{(livestock.productivity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reproduction</span>
                    <span className="font-semibold text-accent">{(livestock.reproduction_rate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Feed Required</span>
                    <span className="font-mono text-foreground">{livestock.feed_required.toFixed(1)}M kg</span>
                  </div>
                </div>

                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${livestock.health * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={history}
            lines={[
              { key: 'india_gdp', label: 'Food Output', color: '#10b981' },
            ]}
            title="Food Output Over Time"
          />
          <TrendChart
            data={history}
            lines={[
              { key: 'india_gdp', label: 'Profit Margin', color: '#f59e0b' },
            ]}
            title="System Profitability"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
