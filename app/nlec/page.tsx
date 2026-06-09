'use client';

import { useState } from 'react';
import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { TrendChart } from '@/components/trend-chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { NLECUpgrades } from '@/lib/types';

export default function NLECDashboard() {
  const { state, history, updateState } = useSimulation();
  const isLocked = !state.unlock_system.livestock;
  const [tradeAmount, setTradeAmount] = useState<10 | 100 | 500>(100);

  // Species details map for icons and styling
  const speciesMeta: Record<string, { icon: string; color: string; gradient: string; glow: string; text: string }> = {
    Cattle: {
      icon: '🐄',
      color: '#7c3aed',
      gradient: 'from-purple-950/30 to-violet-950/10 border-purple-500/30',
      glow: 'shadow-purple-500/5',
      text: 'text-purple-400',
    },
    Goats: {
      icon: '🐐',
      color: '#3b82f6',
      gradient: 'from-blue-950/30 to-sky-950/10 border-blue-500/30',
      glow: 'shadow-blue-500/5',
      text: 'text-blue-400',
    },
    Poultry: {
      icon: '🐓',
      color: '#10b981',
      gradient: 'from-emerald-950/30 to-teal-950/10 border-emerald-500/30',
      glow: 'shadow-emerald-500/5',
      text: 'text-emerald-400',
    },
  };

  const livestock_data = state.nlec.livestock.map((l) => ({
    name: l.species,
    count: Math.round(l.count),
    feed: Math.round(l.feed_required * (state.nlec.upgrades?.automated_feeding ? 0.85 : 1) * (l.breeding_mode === 'intensive' ? 1.25 : 1)),
    productivity: (l.productivity * 100).toFixed(0),
    health: (l.health * 100).toFixed(0),
    policy: `${l.feeding_quality.toUpperCase()} / ${l.breeding_mode.toUpperCase()}`,
  }));

  // Feed dynamics calculations
  const feedConsumptionRate = state.nlec.livestock.reduce((sum, l) => {
    let feed = l.feed_required;
    if (state.nlec.upgrades?.automated_feeding) feed *= 0.85;
    if (l.breeding_mode === 'intensive') feed *= 1.25;
    return sum + feed;
  }, 0);

  const feedProductionRate = state.nlec.feed_production + (state.nlec.upgrades?.feed_silo_expansion ? 100 : 0);
  const netFeedChange = feedProductionRate - feedConsumptionRate;
  const maxStorage = state.nlec.upgrades?.feed_silo_expansion ? 25000 : 10000;
  const feedStoragePct = Math.min(100, (state.nlec.feed_storage / maxStorage) * 100);

  // Safety buffer months
  const monthsLeft = netFeedChange < 0 ? state.nlec.feed_storage / Math.abs(netFeedChange) : Infinity;

  // Policy toggles
  const setFeedingQuality = (speciesName: string, quality: 'standard' | 'premium' | 'organic') => {
    const newState = JSON.parse(JSON.stringify(state));
    const species = newState.nlec.livestock.find((l: any) => l.species === speciesName);
    if (species) {
      species.feeding_quality = quality;
      newState.nlec.logs = [`Set ${speciesName} feed quality to ${quality.toUpperCase()}.`, ...(newState.nlec.logs || [])].slice(0, 5);
      updateState(newState);
    }
  };

  const setBreedingMode = (speciesName: string, mode: 'controlled' | 'balanced' | 'intensive') => {
    const newState = JSON.parse(JSON.stringify(state));
    const species = newState.nlec.livestock.find((l: any) => l.species === speciesName);
    if (species) {
      species.breeding_mode = mode;
      newState.nlec.logs = [`Set ${speciesName} breeding mode to ${mode.toUpperCase()}.`, ...(newState.nlec.logs || [])].slice(0, 5);
      updateState(newState);
    }
  };

  // Buying/selling livestock
  const buyLivestock = (speciesName: string, amount: number) => {
    const cost = amount * 15; // Million ₹
    if (state.nlec.budget < cost) return;
    const newState = JSON.parse(JSON.stringify(state));
    const species = newState.nlec.livestock.find((l: any) => l.species === speciesName);
    if (species) {
      species.count += amount;
      species.count_male += amount * 0.4;
      species.count_female += amount * 0.6;
      newState.nlec.budget -= cost;
      newState.nlec.total_livestock = newState.nlec.livestock.reduce((sum: number, l: any) => sum + l.count, 0);
      newState.nlec.logs = [`Purchased ${amount} ${speciesName} (cost ₹${cost}M).`, ...(newState.nlec.logs || [])].slice(0, 5);
      updateState(newState);
    }
  };

  const sellLivestock = (speciesName: string, amount: number) => {
    const yieldAmt = amount * 10; // Million ₹
    const newState = JSON.parse(JSON.stringify(state));
    const species = newState.nlec.livestock.find((l: any) => l.species === speciesName);
    if (species && species.count >= amount + 10) {
      species.count -= amount;
      species.count_male = Math.max(5, species.count_male - amount * 0.4);
      species.count_female = Math.max(5, species.count_female - amount * 0.6);
      newState.nlec.budget += yieldAmt;
      newState.nlec.total_livestock = newState.nlec.livestock.reduce((sum: number, l: any) => sum + l.count, 0);
      newState.nlec.logs = [`Sold ${amount} ${speciesName} (+₹${yieldAmt}M yield).`, ...(newState.nlec.logs || [])].slice(0, 5);
      updateState(newState);
    }
  };

  // Feed Operations
  const buyEmergencyFeed = () => {
    const cost = 5000; // Million ₹
    if (state.nlec.budget < cost) return;
    const newState = JSON.parse(JSON.stringify(state));
    const currentMax = newState.nlec.upgrades?.feed_silo_expansion ? 25000 : 10000;
    if (newState.nlec.feed_storage >= currentMax) return;

    const addAmt = Math.min(1000, currentMax - newState.nlec.feed_storage);
    newState.nlec.feed_storage += addAmt;
    newState.nlec.budget -= cost;
    newState.nlec.logs = [`Imported ${Math.round(addAmt).toLocaleString()}M kg Emergency Feed (cost ₹${cost}M).`, ...(newState.nlec.logs || [])].slice(0, 5);
    updateState(newState);
  };

  const upgradeFeedProduction = () => {
    const cost = 8000; // Million ₹
    if (state.nlec.budget < cost) return;
    const newState = JSON.parse(JSON.stringify(state));
    newState.nlec.feed_production += 100;
    newState.nlec.budget -= cost;
    newState.nlec.logs = [`Expanded Feed Production Facility (+100M kg/month, cost ₹${cost}M).`, ...(newState.nlec.logs || [])].slice(0, 5);
    updateState(newState);
  };

  // Infrastructure Upgrades Store
  const upgradesList = [
    {
      key: 'automated_feeding' as keyof NLECUpgrades,
      name: 'Automated Feeders',
      cost: 15000,
      description: 'Smart dispensers optimize feeding, reducing feed waste & requirements by 15%.',
    },
    {
      key: 'veterinary_care' as keyof NLECUpgrades,
      name: 'Advanced Vet Center',
      cost: 25000,
      description: 'Implements vaccine campaigns, raising health caps and boosting health recovery (+1%/mo).',
    },
    {
      key: 'genetics_program' as keyof NLECUpgrades,
      name: 'Genetics Lab Research',
      cost: 40000,
      description: 'Selective breeding programs increase reproduction rates by 20% and productivity by 15%.',
    },
    {
      key: 'feed_silo_expansion' as keyof NLECUpgrades,
      name: 'Feed Silo Expansion',
      cost: 10000,
      description: 'Spacious storage upgrades increase base monthly feed production by +100M kg/month and expand storage capacity to 25,000M kg.',
    },
  ];

  const buyUpgrade = (upgradeKey: keyof NLECUpgrades, cost: number, name: string) => {
    if (state.nlec.budget < cost) return;
    if (state.nlec.upgrades?.[upgradeKey]) return;
    const newState = JSON.parse(JSON.stringify(state));
    if (!newState.nlec.upgrades) {
      newState.nlec.upgrades = {
        automated_feeding: false,
        veterinary_care: false,
        genetics_program: false,
        feed_silo_expansion: false,
      };
    }
    newState.nlec.upgrades[upgradeKey] = true;
    newState.nlec.budget -= cost;
    newState.nlec.logs = [`Purchased upgrade: ${name} (cost ₹${cost}M).`, ...(newState.nlec.logs || [])].slice(0, 5);
    updateState(newState);
  };

  // Calculate percentage change for Food Output KPI
  const food_output_change =
    history.length > 1
      ? ((state.nlec.food_output - history[Math.max(0, history.length - 2)].nlec_food_output) /
          Math.max(1, history[Math.max(0, history.length - 2)].nlec_food_output)) *
        100
      : 0;

  // Unified Dashboard Body
  const renderDashboardBody = (isMock: boolean) => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <span>🐄</span> Livestock & Food Production (NLEC)
            </h1>
            <p className="text-muted-foreground">Manage breeding rates, dietary qualities, buy/sell herds, and invest in infrastructure.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Batch size selector */}
            {!isMock && (
              <div className="bg-card border border-border px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Batch Size</span>
                <div className="flex gap-1 bg-background p-0.5 rounded border border-border/80">
                  {([10, 100, 500] as const).map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTradeAmount(amount)}
                      className={`text-xs px-2.5 py-1 rounded font-bold transition-all ${
                        tradeAmount === amount
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-card border border-border px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm">
              <span className="text-2xl">💰</span>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">NLEC Budget</div>
                <div className="text-lg font-bold text-primary">₹{Math.round(state.nlec.budget).toLocaleString()}M</div>
              </div>
            </div>
          </div>
        </div>

        {/* System KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Livestock"
            value={Math.round(state.nlec.total_livestock)}
            unit="Animals"
            status={state.nlec.total_livestock > 3000 ? 'good' : state.nlec.total_livestock > 1000 ? 'warning' : 'critical'}
          />
          <KPICard
            title="Food Output"
            value={Math.round(state.nlec.food_output)}
            unit="M kg"
            change={food_output_change}
          />
          <KPICard
            title="Feed Storage"
            value={Math.round(state.nlec.feed_storage)}
            unit="M kg"
            status={state.nlec.feed_storage > 1500 ? 'good' : state.nlec.feed_storage > 500 ? 'warning' : 'critical'}
          />
          <KPICard
            title="Monthly Profit"
            value={state.nlec.profit}
            unit="M ₹"
            status={state.nlec.profit > 0 ? 'good' : 'critical'}
          />
          <KPICard
            title="Feed Efficiency"
            value={((state.nlec.food_output / Math.max(1, feedConsumptionRate)) * 100).toFixed(1)}
            unit="%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Feed Control & Upgrade Store (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Feed Control Panel */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>🌾</span> Feed Supply Control
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Silo Storage ({maxStorage.toLocaleString()}M kg capacity)</span>
                  <span className="font-bold text-foreground">{Math.round(state.nlec.feed_storage).toLocaleString()}M kg</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-border/40">
                  <div
                    className={`h-full transition-all duration-500 bg-gradient-to-r ${
                      feedStoragePct > 55 ? 'from-emerald-600 to-teal-500' : feedStoragePct > 20 ? 'from-amber-600 to-orange-500' : 'from-rose-600 to-red-500'
                    }`}
                    style={{ width: `${feedStoragePct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-muted-foreground">{feedStoragePct.toFixed(0)}% full</span>
                  <span className={`font-semibold ${
                    netFeedChange < 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                  }`}>
                    {netFeedChange < 0
                      ? `⚠️ Depletes in ${monthsLeft.toFixed(1)} months`
                      : `✅ Storage stable`
                    }
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-background/60 p-3 rounded-lg border border-border/60">
                <div className="text-center border-r border-border/60">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Production</div>
                  <div className="text-sm font-bold text-emerald-400">+{feedProductionRate}M kg</div>
                </div>
                <div className="text-center border-r border-border/60">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Consumption</div>
                  <div className="text-sm font-bold text-rose-400">-{Math.round(feedConsumptionRate)}M kg</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Net Change</div>
                  <div className={`text-sm font-bold ${netFeedChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netFeedChange >= 0 ? '+' : ''}{Math.round(netFeedChange)}M kg
                  </div>
                </div>
              </div>

              {state.nlec.feed_storage <= 1000 && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg flex items-start gap-2">
                  <span className="text-base">⚠️</span>
                  <div>
                    <span className="font-bold">Starvation Warning:</span> Storage is critically low. If feed hits 0, health will decline by 8% monthly.
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={buyEmergencyFeed}
                  disabled={isMock || state.nlec.budget < 5000 || state.nlec.feed_storage >= maxStorage}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold py-2.5 px-3 rounded-lg border border-border transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-0.5 shadow-sm"
                >
                  <span>Buy Emergency Feed (₹5,000M)</span>
                  <span className="text-[9px] font-normal text-muted-foreground">+1,000M kg (capped)</span>
                </button>
                <button
                  onClick={upgradeFeedProduction}
                  disabled={isMock || state.nlec.budget < 8000}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold py-2.5 px-3 rounded-lg border border-border transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-0.5 shadow-sm"
                >
                  <span>Upgrade Plant (₹8,000M)</span>
                  <span className="text-[9px] font-normal text-muted-foreground">+100M kg/month base</span>
                </button>
              </div>
            </div>

            {/* Upgrades Store */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>🛠️</span> Infrastructure Upgrades
              </h3>
              
              <div className="space-y-3">
                {upgradesList.map((upgrade) => {
                  const purchased = !!state.nlec.upgrades?.[upgrade.key];
                  const canAfford = state.nlec.budget >= upgrade.cost;
                  
                  let statusTag = '';
                  let statusClass = '';
                  if (purchased) {
                    statusTag = 'Installed';
                    statusClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
                  } else if (canAfford) {
                    statusTag = 'Available';
                    statusClass = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
                  } else {
                    statusTag = 'Need Budget';
                    statusClass = 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30';
                  }
                  
                  return (
                    <div key={upgrade.key} className="bg-background/80 border border-border rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:border-border/80 transition-colors">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm font-bold text-foreground">{upgrade.name}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${statusClass}`}>
                            {statusTag}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{upgrade.description}</p>
                      </div>
                      
                      {!purchased && (
                        <button
                          onClick={() => buyUpgrade(upgrade.key, upgrade.cost, upgrade.name)}
                          disabled={isMock || !canAfford}
                          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold py-2 px-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span>Purchase for ₹{upgrade.cost.toLocaleString()}M</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: Species Detailed Management (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>🧬</span> Species Breeding & Dietary Controls
              </h3>
              
              <div className="space-y-6">
                {state.nlec.livestock.map((species) => {
                  const meta = speciesMeta[species.species] || {
                    icon: '🐾',
                    color: '#a8a29e',
                    gradient: 'from-zinc-900/20 to-zinc-900/10 border-zinc-500/20',
                    glow: 'shadow-zinc-500/5',
                    text: 'text-zinc-400',
                  };
                  const isStarvingSpecies = state.nlec.feed_storage <= 0;
                  const buyCost = tradeAmount * 15;
                  const sellYield = tradeAmount * 10;
                  
                  return (
                    <div key={species.species} className={`border ${meta.gradient} bg-background/40 rounded-xl p-5 space-y-4 shadow-md ${meta.glow} transition-all duration-300 hover:shadow-lg`}>
                      {/* Species Header */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-border/40 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl filter drop-shadow-md">{meta.icon}</span>
                          <div>
                            <h4 className="font-bold text-foreground text-lg flex items-center gap-2">
                              {species.species}
                            </h4>
                            <span className="text-xs text-muted-foreground font-medium">
                              {Math.round(species.count).toLocaleString()} total animals ({Math.round(species.count_male).toLocaleString()} Male / {Math.round(species.count_female).toLocaleString()} Female)
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => buyLivestock(species.species, tradeAmount)}
                            disabled={isMock || state.nlec.budget < buyCost}
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50 border border-emerald-500/20 shadow-sm"
                          >
                            + Buy {tradeAmount} (₹{buyCost.toLocaleString()}M)
                          </button>
                          <button
                            onClick={() => sellLivestock(species.species, tradeAmount)}
                            disabled={isMock || species.count < tradeAmount + 10}
                            className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50 border border-rose-500/20 shadow-sm"
                          >
                            - Sell {tradeAmount} (₹{sellYield.toLocaleString()}M)
                          </button>
                        </div>
                      </div>

                      {/* Primary Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div className="bg-card/40 border border-border/40 rounded-xl p-3 shadow-inner">
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Health</div>
                          <div className={`text-base font-bold flex items-center gap-1.5 mt-1 ${
                            species.health > 0.8 ? 'text-emerald-400' : species.health > 0.5 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {(species.health * 100).toFixed(0)}%
                            {isStarvingSpecies && <span className="text-[10px] bg-rose-500/20 text-rose-500 border border-rose-500/30 px-1 py-0.2 rounded font-bold uppercase tracking-wider animate-pulse"> starving</span>}
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                            <div className={`h-full ${
                              species.health > 0.8 ? 'bg-emerald-500' : species.health > 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                            }`} style={{ width: `${species.health * 100}%` }} />
                          </div>
                        </div>

                        <div className="bg-card/40 border border-border/40 rounded-xl p-3 shadow-inner">
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Productivity</div>
                          <div className="text-base font-bold text-foreground mt-1">
                            {(species.productivity * 100).toFixed(0)}%
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${species.productivity * 100}%` }} />
                          </div>
                        </div>

                        <div className="bg-card/40 border border-border/40 rounded-xl p-3 shadow-inner">
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Reproduction</div>
                          <div className="text-base font-bold text-cyan-400 mt-1">
                            {(species.reproduction_rate * 100).toFixed(0)}%
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${species.reproduction_rate * 100}%` }} />
                          </div>
                        </div>

                        <div className="bg-card/40 border border-border/40 rounded-xl p-3 shadow-inner">
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Coverage</div>
                          <div className="text-base font-bold text-purple-400 mt-1">
                            {species.coverage_percentage.toFixed(0)}%
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${species.coverage_percentage}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Policy Toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        
                        {/* Feeding Quality Selector */}
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Feed Quality Policy</label>
                          <div className="grid grid-cols-3 border border-border/80 rounded-lg overflow-hidden bg-background">
                            {(['standard', 'premium', 'organic'] as const).map((quality) => {
                              const active = species.feeding_quality === quality;
                              const labelColors = {
                                standard: 'bg-muted text-muted-foreground font-semibold',
                                premium: 'bg-amber-600 text-white font-semibold shadow-sm',
                                organic: 'bg-emerald-600 text-white font-semibold shadow-sm',
                              };
                              return (
                                <button
                                  key={quality}
                                  disabled={isMock}
                                  onClick={() => setFeedingQuality(species.species, quality)}
                                  className={`text-xs py-2 px-1 capitalize transition-all ${
                                    active ? labelColors[quality] : 'bg-transparent text-foreground hover:bg-muted/50'
                                  }`}
                                >
                                  {quality}
                                </button>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-muted-foreground leading-relaxed px-1">
                            {species.feeding_quality === 'standard' && '🌾 Cost: ₹10/unit | Baseline nutrition & normal stats'}
                            {species.feeding_quality === 'premium' && '⭐ Cost: ₹15/unit | +1% Health, +10% Productivity'}
                            {species.feeding_quality === 'organic' && '🍀 Cost: ₹20/unit | +2% Health, +25% Productivity'}
                          </div>
                        </div>

                        {/* Breeding Mode Selector */}
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Breeding Policy</label>
                          <div className="grid grid-cols-3 border border-border/80 rounded-lg overflow-hidden bg-background">
                            {(['controlled', 'balanced', 'intensive'] as const).map((mode) => {
                              const active = species.breeding_mode === mode;
                              const labelColors = {
                                controlled: 'bg-blue-600 text-white font-semibold shadow-sm',
                                balanced: 'bg-muted text-muted-foreground font-semibold',
                                intensive: 'bg-rose-600 text-white font-semibold shadow-sm',
                              };
                              return (
                                <button
                                  key={mode}
                                  disabled={isMock}
                                  onClick={() => setBreedingMode(species.species, mode)}
                                  className={`text-xs py-2 px-1 capitalize transition-all ${
                                    active ? labelColors[mode] : 'bg-transparent text-foreground hover:bg-muted/50'
                                  }`}
                                >
                                  {mode}
                                </button>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-muted-foreground leading-relaxed px-1">
                            {species.breeding_mode === 'controlled' && '🛡️ Conserves Feed (10% growth rate) | +1% Health'}
                            {species.breeding_mode === 'balanced' && '⚖️ Standard growth rate and standard feed demands'}
                            {species.breeding_mode === 'intensive' && '🔥 Max Growth (150% growth rate) | -2% Health, +25% Feed'}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* System Activity Logs Console */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>📟</span> System Activity Console
          </h3>
          <div className="bg-black/95 font-mono text-xs p-4 rounded-xl border border-border h-40 overflow-y-auto space-y-1.5 shadow-inner">
            {state.nlec.logs && state.nlec.logs.length > 0 ? (
              state.nlec.logs.map((log, index) => {
                let colorClass = 'text-gray-400';
                if (log.startsWith('CRITICAL')) colorClass = 'text-rose-500 font-bold';
                else if (log.startsWith('Warning')) colorClass = 'text-amber-400 font-bold';
                else if (log.startsWith('Deficit')) colorClass = 'text-rose-400';
                else if (log.includes('Purchased') || log.includes('Upgraded') || log.includes('Invested')) colorClass = 'text-emerald-400';
                else if (log.includes('Set')) colorClass = 'text-cyan-400';
                
                return (
                  <div key={index} className="flex gap-2">
                    <span className="text-primary font-bold select-none">&gt;</span>
                    <span className={colorClass}>{log}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 italic">No activity logged. Operations running smoothly.</div>
            )}
          </div>
        </div>

        {/* Strategy Cheat-Sheet */}
        <div className="bg-card/75 border border-border rounded-xl p-5 shadow-sm space-y-4 backdrop-blur-md">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>💡</span> Policy Cheat-Sheet
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 bg-background/50 p-4 rounded-xl border border-border/60">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <span>🌾</span> Dietary (Feed Quality) Policy
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Standard:</strong> Base cost (₹10/unit). Standard growth and health.</li>
                <li><strong className="text-foreground">Premium:</strong> 1.5x cost (₹15/unit). +1% health recovery, +10% productivity.</li>
                <li><strong className="text-foreground">Organic:</strong> 2.0x cost (₹20/unit). +2% health recovery, +25% productivity.</li>
              </ul>
            </div>
            <div className="space-y-2 bg-background/50 p-4 rounded-xl border border-border/60">
              <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                <span>🧬</span> Breeding Mode Policy
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Controlled:</strong> 10% base reproduction. +1% health recovery. Saves feed.</li>
                <li><strong className="text-foreground">Balanced:</strong> Standard reproduction (100% rate) and standard feed.</li>
                <li><strong className="text-foreground">Intensive:</strong> 150% reproduction. -2% health decline, +25% feed demanded.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Species Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <span>📊</span> Population Size by Species
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={livestock_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
                <XAxis dataKey="name" stroke="oklch(0.65 0 0)" />
                <YAxis stroke="oklch(0.65 0 0)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.155 0 0)',
                    border: '1px solid oklch(0.25 0 0)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#7c3aed">
                  {livestock_data.map((entry, index) => {
                    const meta = speciesMeta[entry.name] || { color: '#7c3aed' };
                    return <Cell key={`cell-${index}`} fill={meta.color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <span>🍕</span> Animal Biomass Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={livestock_data}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {livestock_data.map((entry, index) => {
                    const meta = speciesMeta[entry.name] || { color: '#7c3aed' };
                    return <Cell key={`cell-${index}`} fill={meta.color} />;
                  })}
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

        {/* Live Historical Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={history}
            lines={[
              { key: 'nlec_food_output', label: 'Food Output', color: '#10b981' },
            ]}
            title="Food Production Trend (Million kg/month)"
          />
          <TrendChart
            data={history}
            lines={[
              { key: 'nlec_profit', label: 'Monthly Profit', color: '#f59e0b' },
            ]}
            title="Socio-Economic Profitability (Million ₹/month)"
          />
        </div>
      </div>
    );
  };

  if (isLocked) {
    const avg_morale = state.india.ministries.reduce((sum, m) => sum + m.morale, 0) / state.india.ministries.length;
    const moralePct = Math.round(avg_morale * 100);

    return (
      <DashboardLayout>
        <div className="relative min-h-[85vh]">
          {/* Blur Overlay */}
          <div className="absolute inset-0 bg-background/45 backdrop-blur-md rounded-xl flex items-center justify-center z-50 border border-border/50">
            <div className="bg-card/90 border border-border p-8 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-6 backdrop-blur-lg">
              <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive border border-destructive/20 rounded-full flex items-center justify-center text-3xl font-bold animate-pulse">
                🔒
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Livestock System Locked</h3>
                <p className="text-sm text-muted-foreground text-center">
                  India Ministry average morale must reach 70% to unlock the Livestock & Food Production System (NLEC).
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-2 bg-background/50 p-4 rounded-xl border border-border/60">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Average Ministry Morale</span>
                  <span className={moralePct >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                    {moralePct}% / 70%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-border/40">
                  <div
                    className={`h-full transition-all duration-1000 bg-gradient-to-r ${
                      moralePct >= 70 ? 'from-emerald-500 to-teal-400' : 'from-amber-500 to-orange-400'
                    }`}
                    style={{ width: `${Math.min(100, (moralePct / 70) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground flex justify-between font-mono">
                  <span>Current: {moralePct}%</span>
                  <span>Target: 70%</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic bg-muted/40 p-3 rounded-lg border border-border/40">
                💡 <strong>Tip:</strong> Go to the <strong>India Ministry</strong> page and run welfare or staff benefit programs to boost morale.
              </p>
            </div>
          </div>

          {/* Blurred Teaser Dashboard */}
          <div className="opacity-20 pointer-events-none filter blur-[4px] select-none space-y-6">
            {renderDashboardBody(true)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {renderDashboardBody(false)}
    </DashboardLayout>
  );
}
