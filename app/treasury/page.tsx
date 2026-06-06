'use client';

import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { LockedTier } from '@/components/locked-tier';
import { TrendChart } from '@/components/trend-chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function TreasuryDashboard() {
  const { state, history } = useSimulation();

  const allocation_data = [
    { name: 'Space Program', value: state.swf.balance * state.swf.allocation_to_space, color: '#06b6d4' },
    { name: 'Infrastructure', value: state.swf.balance * state.swf.allocation_to_infrastructure, color: '#10b981' },
    { name: 'Research', value: state.swf.balance * state.swf.allocation_to_research, color: '#7c3aed' },
  ];

  const balance_change = history.length > 0
    ? ((state.swf.balance - history[Math.max(0, history.length - 12)].swf_balance) /
        history[Math.max(0, history.length - 12)].swf_balance) *
      100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Treasury & Sovereign Wealth Fund</h1>
          <p className="text-muted-foreground">Manage national finances and long-term investment strategy</p>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="SWF Balance"
            value={state.swf.balance}
            unit="Million ₹"
            change={balance_change}
            status={state.swf.balance > 400000 ? 'good' : 'warning'}
          />
          <KPICard
            title="Monthly Contribution"
            value={state.swf.monthly_contribution}
            unit="Million ₹"
          />
          <KPICard
            title="YTD Returns"
            value={state.swf.returns_ytd}
            unit="Million ₹"
            status={state.swf.returns_ytd > 20000 ? 'good' : 'warning'}
          />
          <KPICard
            title="Total Invested"
            value={state.swf.total_invested}
            unit="Million ₹"
          />
        </div>

        {/* Allocation KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Space Allocation"
            value={(state.swf.allocation_to_space * 100).toFixed(1)}
            unit="%"
          />
          <KPICard
            title="Infrastructure Allocation"
            value={(state.swf.allocation_to_infrastructure * 100).toFixed(1)}
            unit="%"
          />
          <KPICard
            title="Research Allocation"
            value={(state.swf.allocation_to_research * 100).toFixed(1)}
            unit="%"
          />
        </div>

        {/* Fund Allocation Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Fund Allocation Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocation_data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(1)}T`}
                >
                  {allocation_data.map((entry, index) => (
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
            <h3 className="text-lg font-semibold mb-4 text-foreground">Fund Details</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Space Program</span>
                  <span className="font-semibold text-cyan-400">₹{(state.swf.balance * state.swf.allocation_to_space / 1000).toFixed(1)}T</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${state.swf.allocation_to_space * 100}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Infrastructure</span>
                  <span className="font-semibold text-green-400">₹{(state.swf.balance * state.swf.allocation_to_infrastructure / 1000).toFixed(1)}T</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${state.swf.allocation_to_infrastructure * 100}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Research</span>
                  <span className="font-semibold text-purple-400">₹{(state.swf.balance * state.swf.allocation_to_research / 1000).toFixed(1)}T</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${state.swf.allocation_to_research * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Financial Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-foreground">Cash Flow</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Opening Balance</span>
                  <span className="font-mono text-foreground">₹{(state.swf.balance - state.swf.monthly_contribution - state.swf.returns_ytd / 12).toFixed(0)}M</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span className="text-muted-foreground">Monthly Contribution</span>
                  <span className="font-mono">+₹{state.swf.monthly_contribution.toFixed(0)}M</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span className="text-muted-foreground">Monthly Returns</span>
                  <span className="font-mono">+₹{(state.swf.returns_ytd / 12).toFixed(0)}M</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between font-semibold">
                  <span className="text-foreground">Current Balance</span>
                  <span className="font-mono text-primary">₹{state.swf.balance.toFixed(0)}M</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-foreground">Investment Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-mono text-foreground">₹{state.swf.total_invested.toFixed(0)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">YTD Return Rate</span>
                  <span className="font-mono text-green-400">{((state.swf.returns_ytd / state.swf.total_invested) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allocation Ratio</span>
                  <span className="font-mono text-foreground">{((state.swf.total_invested / state.swf.balance) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Cash</span>
                  <span className="font-mono text-primary">₹{(state.swf.balance - state.swf.total_invested).toFixed(0)}M</span>
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
              { key: 'swf_balance', label: 'SWF Balance', color: '#10b981' },
            ]}
            title="Fund Balance Growth"
          />
          <TrendChart
            data={history}
            lines={[
              { key: 'swf_balance', label: 'Total Balance', color: '#3b82f6' },
            ]}
            title="Long-Term Growth Trend"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
