'use client';

import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { TrendChart } from '@/components/trend-chart';
import { LockedTier } from '@/components/locked-tier';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { NLECUpgrades } from '@/lib/types';

export default function NLECDashboard() {
  const { state, history, updateState } = useSimulation();
  const isLocked = !state.unlock_system.livestock;

  // Species details map for icons
  const speciesMeta: Record<string, { icon: string; color: string }> = {
    Cattle: { icon: '🐄', color: '#7c3aed' },
    Goats: { icon: '🐐', color: '#3b82f6' },
    Poultry: { icon: '🐓', color: '#10b981' },
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
  const feedStoragePct = Math.min(100, (state.nlec.feed_storage / 10000) * 100);

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
  const buyLivestock = (speciesName: string) => {
    const cost = 1500; // Million ₹
    if (state.nlec.budget < cost) return;
    const newState = JSON.parse(JSON.stringify(state));
    const species = newState.nlec.livestock.find((l: any) => l.species === speciesName);
    if (species) {
      species.count += 100;
      species.count_male += 40;
      species.count_female += 60;
      newState.nlec.budget -= cost;
      newState.nlec.total_livestock = newState.nlec.livestock.reduce((sum: number, l: any) => sum + l.count, 0);
      newState.nlec.logs = [`Purchased 100 ${speciesName} (cost ₹${cost}M).`, ...(newState.nlec.logs || [])].slice(0, 5);
      updateState(newState);
    }
  };

  const sellLivestock = (speciesName: string) => {
    const yieldAmt = 1000; // Million ₹
    const newState = JSON.parse(JSON.stringify(state));
    const species = newState.nlec.livestock.find((l: any) => l.species === speciesName);
    if (species && species.count >= 110) {
      species.count -= 100;
      species.count_male = Math.max(5, species.count_male - 40);
      species.count_female = Math.max(5, species.count_female - 60);
      newState.nlec.budget += yieldAmt;
      newState.nlec.total_livestock = newState.nlec.livestock.reduce((sum: number, l: any) => sum + l.count, 0);
      newState.nlec.logs = [`Sold 100 ${speciesName} (+₹${yieldAmt}M yield).`, ...(newState.nlec.logs || [])].slice(0, 5);
      updateState(newState);
    }
  };

  // Feed Operations
  const buyEmergencyFeed = () => {
    const cost = 5000; // Million ₹
    if (state.nlec.budget < cost) return;
    const newState = JSON.parse(JSON.stringify(state));
    newState.nlec.feed_storage += 1000;
    newState.nlec.budget -= cost;
    newState.nlec.logs = [`Imported 1,000M kg Emergency Feed (cost ₹${cost}M).`, ...(newState.nlec.logs || [])].slice(0, 5);
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
      description: 'Spacious storage upgrades increase base monthly feed production by +100M kg/month.',
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

  // Calculate percentage change for Food Output KPI
  const food_output_change =
    history.length > 1
      ? ((state.nlec.food_output - history[Math.max(0, history.length - 2)].nlec_food_output) /
          Math.max(1, history[Math.max(0, history.length - 2)].nlec_food_output)) *
        100
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Livestock & Food Production System (NLEC)</h1>
            <p className="text-muted-foreground">Manage breeding rates, dietary qualities, buy/sell herds, and invest in infrastructure.</p>
          </div>
          <div className="bg-card border border-border px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">NLEC Budget</div>
              <div className="text-lg font-bold text-primary">₹{Math.round(state.nlec.budget).toLocaleString()}M</div>
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
            <div className="bg-card border border-border rounded-lg p-5 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>🌾</span> Feed Supply Control
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Silo Capacity (10,000M kg max)</span>
                  <span className="font-semibold text-foreground">{Math.round(state.nlec.feed_storage).toLocaleString()}M kg</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      feedStoragePct > 50 ? 'bg-emerald-500' : feedStoragePct > 20 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${feedStoragePct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-background p-3 rounded-lg border border-border">
                <div className="text-center border-r border-border">
                  <div className="text-[10px] text-muted-foreground uppercase">Production</div>
                  <div className="text-sm font-semibold text-green-400">+{feedProductionRate}M kg</div>
                </div>
                <div className="text-center border-r border-border">
                  <div className="text-[10px] text-muted-foreground uppercase">Consumption</div>
                  <div className="text-sm font-semibold text-rose-400">-{Math.round(feedConsumptionRate)}M kg</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground uppercase">Net Change</div>
                  <div className={`text-sm font-bold ${netFeedChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netFeedChange >= 0 ? '+' : ''}{Math.round(netFeedChange)}M kg
                  </div>
                </div>
              </div>

              {state.nlec.feed_storage <= 1000 && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg animate-pulse flex items-start gap-2">
                  <span>⚠️</span>
                  <div>
                    <span className="font-bold">Starvation Warning:</span> Storage is critically low. If feed hits 0, health will decline by 8% monthly.
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={buyEmergencyFeed}
                  disabled={state.nlec.budget < 5000}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold py-2 px-3 rounded border border-border transition-colors disabled:opacity-50"
                >
                  Buy Emergency Feed (₹5,000M)
                  <div className="text-[9px] font-normal text-muted-foreground">+1,000M kg instant</div>
                </button>
                <button
                  onClick={upgradeFeedProduction}
                  disabled={state.nlec.budget < 8000}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold py-2 px-3 rounded border border-border transition-colors disabled:opacity-50"
                >
                  Upgrade Plant (₹8,000M)
                  <div className="text-[9px] font-normal text-muted-foreground">+100M kg/month base</div>
                </button>
              </div>
            </div>

            {/* Upgrades Store */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>🛠️</span> Infrastructure Upgrades
              </h3>
              
              <div className="space-y-3">
                {upgradesList.map((upgrade) => {
                  const purchased = !!state.nlec.upgrades?.[upgrade.key];
                  const canAfford = state.nlec.budget >= upgrade.cost;
                  
                  return (
                    <div key={upgrade.key} className="bg-background border border-border rounded-lg p-3 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-bold text-foreground">{upgrade.name}</span>
                          {purchased ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Installed</span>
                          ) : (
                            <span className="text-xs font-bold text-primary">₹{upgrade.cost.toLocaleString()}M</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{upgrade.description}</p>
                      </div>
                      
                      {!purchased && (
                        <button
                          onClick={() => buyUpgrade(upgrade.key, upgrade.cost, upgrade.name)}
                          disabled={!canAfford}
                          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold py-1.5 px-3 rounded transition-colors disabled:opacity-50"
                        >
                          Buy Upgrade
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
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>🧬</span> Species Breeding & Dietary Controls
              </h3>
              
              <div className="space-y-6">
                {state.nlec.livestock.map((species) => {
                  const meta = speciesMeta[species.species] || { icon: '🐾', color: '#a8a29e' };
                  const isStarvingSpecies = state.nlec.feed_storage <= 0;
                  
                  return (
                    <div key={species.species} className="border border-border/80 bg-background rounded-lg p-4 space-y-4">
                      {/* Species Header */}
                      <div className="flex justify-between items-center border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl">{meta.icon}</span>
                          <div>
                            <h4 className="font-bold text-foreground text-base">{species.species}</h4>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(species.count).toLocaleString()} animals total ({Math.round(species.count_male)}M / {Math.round(species.count_female)}F)
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => buyLivestock(species.species)}
                            disabled={state.nlec.budget < 1500}
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs px-2.5 py-1 rounded font-semibold transition-colors disabled:opacity-50 border border-emerald-500/20"
                          >
                            + Buy 100 (₹1.5kM)
                          </button>
                          <button
                            onClick={() => sellLivestock(species.species)}
                            disabled={species.count < 110}
                            className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs px-2.5 py-1 rounded font-semibold transition-colors disabled:opacity-50 border border-rose-500/20"
                          >
                            - Sell 100 (₹1kM)
                          </button>
                        </div>
                      </div>

                      {/* Primary Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div className="bg-card/50 border border-border/40 rounded p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">Health</div>
                          <div className={`text-base font-bold flex items-center gap-1.5 mt-0.5 ${
                            species.health > 0.8 ? 'text-emerald-400' : species.health > 0.5 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {(species.health * 100).toFixed(0)}%
                            {isStarvingSpecies && <span className="text-xs text-rose-500 animate-pulse"> starving</span>}
                          </div>
                          <div className="w-full bg-muted rounded-full h-1 mt-1.5 overflow-hidden">
                            <div className={`h-full ${
                              species.health > 0.8 ? 'bg-emerald-500' : species.health > 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                            }`} style={{ width: `${species.health * 100}%` }} />
                          </div>
                        </div>

                        <div className="bg-card/50 border border-border/40 rounded p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">Productivity</div>
                          <div className="text-base font-bold text-foreground mt-0.5">
                            {(species.productivity * 100).toFixed(0)}%
                          </div>
                        </div>

                        <div className="bg-card/50 border border-border/40 rounded p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">Reproduction</div>
                          <div className="text-base font-bold text-cyan-400 mt-0.5">
                            {(species.reproduction_rate * 100).toFixed(0)}%
                          </div>
                        </div>

                        <div className="bg-card/50 border border-border/40 rounded p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">Coverage</div>
                          <div className="text-base font-bold text-purple-400 mt-0.5">
                            {species.coverage_percentage.toFixed(0)}%
                          </div>
                        </div>
                      </div>

                      {/* Policy Toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        
                        {/* Feeding Quality Selector */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-semibold uppercase">Feed Quality Policy</label>
                          <div className="grid grid-cols-3 border border-border rounded overflow-hidden">
                            {(['standard', 'premium', 'organic'] as const).map((quality) => {
                              const active = species.feeding_quality === quality;
                              const labelColors = {
                                standard: 'bg-muted text-muted-foreground',
                                premium: 'bg-amber-600 text-white font-semibold',
                                organic: 'bg-emerald-600 text-white font-semibold',
                              };
                              return (
                                <button
                                  key={quality}
                                  onClick={() => setFeedingQuality(species.species, quality)}
                                  className={`text-xs py-1.5 px-1 capitalize transition-colors ${
                                    active ? labelColors[quality] : 'bg-card text-foreground hover:bg-muted/50'
                                  }`}
                                >
                                  {quality}
                                </button>
                              );
                            })}
                          </div>
                          <div className="text-[9px] text-muted-foreground">
                            {species.feeding_quality === 'standard' && 'Base Cost (₹10/unit) | Normal stats'}
                            {species.feeding_quality === 'premium' && '1.5x Cost (₹15/unit) | +1% Health, +10% Productivity'}
                            {species.feeding_quality === 'organic' && '2.0x Cost (₹20/unit) | +2% Health, +25% Productivity'}
                          </div>
                        </div>

                        {/* Breeding Mode Selector */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground font-semibold uppercase">Breeding Policy</label>
                          <div className="grid grid-cols-3 border border-border rounded overflow-hidden">
                            {(['controlled', 'balanced', 'intensive'] as const).map((mode) => {
                              const active = species.breeding_mode === mode;
                              const labelColors = {
                                controlled: 'bg-blue-600 text-white font-semibold',
                                balanced: 'bg-muted text-muted-foreground',
                                intensive: 'bg-rose-600 text-white font-semibold',
                              };
                              return (
                                <button
                                  key={mode}
                                  onClick={() => setBreedingMode(species.species, mode)}
                                  className={`text-xs py-1.5 px-1 capitalize transition-colors ${
                                    active ? labelColors[mode] : 'bg-card text-foreground hover:bg-muted/50'
                                  }`}
                                >
                                  {mode}
                                </button>
                              );
                            })}
                          </div>
                          <div className="text-[9px] text-muted-foreground">
                            {species.breeding_mode === 'controlled' && 'Conserves Feed (10% growth) | +1% Health'}
                            {species.breeding_mode === 'balanced' && 'Standard Growth rate and standard feed demands'}
                            {species.breeding_mode === 'intensive' && 'Max Growth (150% growth) | -2% Health, +25% Feed demanded'}
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
        <div className="bg-card border border-border rounded-lg p-5 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>📟</span> System Activity Console
          </h3>
          <div className="bg-black/80 font-mono text-xs p-4 rounded-lg border border-border h-40 overflow-y-auto space-y-1.5">
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

        {/* Species Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-4">
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

          <div className="bg-card border border-border rounded-lg p-4">
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
    </DashboardLayout>
  );
}
