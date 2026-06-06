'use client';

import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { TrendChart } from '@/components/trend-chart';

export default function Page() {
  const { state, history } = useSimulation();

  const india_gdp_change = history.length > 0
    ? ((state.india.gdp - history[Math.max(0, history.length - 12)].india_gdp) /
        history[Math.max(0, history.length - 12)].india_gdp) * 100
    : 0;

  const pop_change = history.length > 0
    ? ((state.india.population - history[Math.max(0, history.length - 12)].india_population) /
        history[Math.max(0, history.length - 12)].india_population) * 100
    : 0;

  const earth_pop_change = history.length > 0
    ? ((state.earth_network.total_population - history[Math.max(0, history.length - 12)].network_population) /
        history[Math.max(0, history.length - 12)].network_population) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Overview Dashboard</h1>
          <p className="text-muted-foreground">Year {state.current_year}, Month {state.current_month}</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="India GDP"
            value={state.india.gdp}
            unit="Trillion ₹"
            change={india_gdp_change}
            status={india_gdp_change > 2 ? 'good' : 'warning'}
          />
          <KPICard
            title="India Population"
            value={state.india.population}
            unit="Million"
            change={pop_change}
          />
          <KPICard
            title="Network Population"
            value={state.earth_network.total_population}
            unit="Million"
            change={earth_pop_change}
          />
          <KPICard
            title="Space Planets"
            value={state.space.colonized_planets}
            unit="Colonized"
          />
        </div>

        {/* Second Row KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="SWF Balance"
            value={state.swf.balance}
            unit="Million ₹"
            status={state.swf.balance > 400000 ? 'good' : 'warning'}
          />
          <KPICard
            title="Avg Earth Happiness"
            value={(state.earth_network.average_happiness * 100).toFixed(1)}
            unit="%"
            status={state.earth_network.average_happiness > 0.7 ? 'good' : 'warning'}
          />
          <KPICard
            title="Energy Surplus"
            value={state.energy.surplus}
            unit="TWh"
            status={state.energy.surplus > 200 ? 'good' : state.energy.surplus > 0 ? 'warning' : 'critical'}
          />
          <KPICard
            title="Network Stability"
            value={(state.earth_network.network_stability * 100).toFixed(1)}
            unit="%"
          />
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={history}
            lines={[
              { key: 'india_gdp', label: 'India GDP', color: '#7c3aed' },
              { key: 'india_population', label: 'India Pop', color: '#3b82f6' },
            ]}
            title="India Economic Trends"
          />
          <TrendChart
            data={history}
            lines={[
              { key: 'swf_balance', label: 'SWF Balance', color: '#10b981' },
              { key: 'energy_surplus', label: 'Energy Surplus', color: '#f59e0b' },
            ]}
            title="Financial & Energy Trends"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={history}
            lines={[
              { key: 'network_population', label: 'Network Pop', color: '#8b5cf6' },
              { key: 'average_earth_happiness', label: 'Avg Happiness', color: '#ec4899' },
            ]}
            title="Earth Network Trends"
          />
          <TrendChart
            data={history}
            lines={[
              { key: 'space_planets', label: 'Colonized Planets', color: '#06b6d4' },
            ]}
            title="Space Expansion Progress"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
