'use client';

import { useState, useEffect } from 'react';
import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { MinistryGrid } from '@/components/ministry-grid';
import { TrendChart } from '@/components/trend-chart';
import { UnlockIndicator } from '@/components/unlock-indicator';
import { executeProgram, completeProgram } from '@/lib/program-mechanics';
import { MinistryProgram } from '@/lib/types';

const MINISTERS_LIST = [
  { id: 'nehru', name: 'Jawaharlal Nehru', role: 'Prime Minister', skill: '+5% Success Rate for all programs nationwide', avatar: '👔' },
  { id: 'patel', name: 'Sardar Patel', role: 'Home Minister', skill: '+25% Efficiency gains & +20% speed for Defence & Finance', avatar: '🛡️' },
  { id: 'bhabha', name: 'Dr. Homi Bhabha', role: 'Nuclear Commission', skill: '+30% Research speed for Scientific Research', avatar: '⚛️' },
  { id: 'azad', name: 'Maulana Azad', role: 'Education Minister', skill: '+15% Success rate & +25% speed for Education', avatar: '📚' },
  { id: 'kaur', name: 'Rajkumari Amrit Kaur', role: 'Health Minister', skill: '+15% Success rate & +25% speed for Health', avatar: '🩺' },
  { id: 'ambedkar', name: 'Dr. B.R. Ambedkar', role: 'Law Minister', skill: '-15% Corruption rate across India', avatar: '⚖️' },
];

export default function IndiaDashboard() {
  const { state, history, updateMinistry, updateState } = useSimulation();
  const [selectedMinistry, setSelectedMinistry] = useState(state.india.ministries[0]?.id || '');
  const [chestCooldown, setChestCooldown] = useState(0);

  const avg_morale = state.india.ministries.reduce((sum, m) => sum + m.morale, 0) / state.india.ministries.length;
  const top_ministries = [...state.india.ministries].sort((a, b) => b.impact - a.impact).slice(0, 6);
  const currentMinistry = state.india.ministries.find(m => m.id === selectedMinistry);

  const vipLevel = state.india.vip_level || 1;
  const vipPoints = state.india.vip_points || 0;
  const vipTarget = vipLevel * 200;
  const speedups = state.india.speedups_available || 0;

  // Mystery Chest Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      const lastClaim = state.india.last_chest_claim || 0;
      const diff = Date.now() - lastClaim;
      setChestCooldown(Math.max(0, Math.ceil((30000 - diff) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.india.last_chest_claim]);

  const handleExecuteProgram = (ministryId: string, programId: string) => {
    const result = executeProgram(state, ministryId, programId);
    updateState(result.state);
    alert(result.message);
  };

  const handleSpeedUp = (ministryId: string, programId: string) => {
    const newState = JSON.parse(JSON.stringify(state));
    const ministry = newState.india.ministries.find((m: any) => m.id === ministryId);
    if (!ministry) return;
    const program = ministry.programs.find((p: any) => p.id === programId);
    if (!program || program.status !== 'executing') return;

    if (newState.india.speedups_available > 0) {
      newState.india.speedups_available -= 1;
    } else {
      if (ministry.allocation < 2) {
        alert("Need at least ₹2B Ministry Allocation to purchase a Speed Up!");
        return;
      }
      ministry.allocation -= 2;
    }

    program.time_remaining = Math.max(1, (program.time_remaining || 0) - 15);
    updateState(newState);
  };

  const handleFinishNow = (ministryId: string, programId: string) => {
    const newState = JSON.parse(JSON.stringify(state));
    const ministry = newState.india.ministries.find((m: any) => m.id === ministryId);
    if (!ministry) return;
    const program = ministry.programs.find((p: any) => p.id === programId);
    if (!program || program.status !== 'executing') return;

    if (ministry.allocation < 5) {
      alert("Need at least ₹5B Ministry Allocation to finish immediately!");
      return;
    }
    ministry.allocation -= 5;
    program.time_remaining = 0;

    const completeResult = completeProgram(newState, ministryId, programId);
    updateState(completeResult.state);
    alert(completeResult.message);
  };

  const claimChest = () => {
    const now = Date.now();
    const lastClaim = state.india.last_chest_claim || 0;
    if (now - lastClaim < 30000) return;

    const newState = JSON.parse(JSON.stringify(state));
    const isSpeedup = Math.random() < 0.4;
    let rewardMsg = '';

    if (isSpeedup) {
      newState.india.speedups_available = (newState.india.speedups_available || 0) + 2;
      rewardMsg = "Received 2x Speed Up Tokens! ⚡";
    } else {
      const budgetGain = 300 + Math.floor(Math.random() * 500);
      newState.swf.balance += budgetGain;
      rewardMsg = `Received ₹${budgetGain}M Sovereign Wealth Funds! 💰`;
    }

    newState.india.vip_points = (newState.india.vip_points || 0) + 40;
    const target = (newState.india.vip_level || 1) * 200;
    if (newState.india.vip_points >= target) {
      newState.india.vip_points -= target;
      newState.india.vip_level = (newState.india.vip_level || 1) + 1;
      rewardMsg += ` VIP LEVEL UP! Reached VIP Level ${newState.india.vip_level}.`;
    }

    newState.india.last_chest_claim = now;
    newState.nlec.logs = [`Claimed Chest: ${rewardMsg}`, ...(newState.nlec.logs || [])].slice(0, 5);
    updateState(newState);
    alert(`🎁 Chest Opened!\n\n${rewardMsg}\n+40 VIP Points`);
  };

  const assignMinister = (ministerId: string, ministryId: string) => {
    const newState = JSON.parse(JSON.stringify(state));
    
    // Clear minister from any other ministry
    newState.india.ministries.forEach((m: any) => {
      if (m.assigned_minister === ministerId) {
        m.assigned_minister = undefined;
      }
    });

    const targetM = newState.india.ministries.find((m: any) => m.id === ministryId);
    if (targetM) {
      targetM.assigned_minister = ministerId;
      newState.nlec.logs = [`Assigned ${MINISTERS_LIST.find(m => m.id === ministerId)?.name} to ${targetM.name}.`, ...(newState.nlec.logs || [])].slice(0, 5);
      updateState(newState);
      alert(`Minister Assigned!\n\n${MINISTERS_LIST.find(m => m.id === ministerId)?.name} is now supervising ${targetM.name}.`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* VIP & Mystery Chest Header Bar */}
        <div className="bg-gradient-to-r from-amber-600/20 via-yellow-600/10 to-amber-600/20 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-gradient-to-b from-yellow-400 to-amber-500 text-black font-extrabold w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-lg border border-yellow-300">
              <span className="text-[10px] leading-none uppercase">VIP</span>
              <span className="text-xl leading-tight">{vipLevel}</span>
            </div>
            <div className="flex-1 md:w-64 space-y-1">
              <div className="flex justify-between text-xs font-bold text-amber-200">
                <span>VIP Points</span>
                <span>{vipPoints} / {vipTarget}</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-amber-500/20">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 transition-all duration-500" style={{ width: `${(vipPoints / vipTarget) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="bg-black/40 border border-border/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-blue-300">
              <span>⚡ Speedups:</span>
              <span className="font-mono text-sm text-foreground bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded">{speedups}</span>
            </div>
            
            <button
              onClick={claimChest}
              disabled={chestCooldown > 0}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1.5 border ${
                chestCooldown > 0
                  ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black border-yellow-400 hover:from-yellow-400 hover:to-amber-400 cursor-pointer animate-bounce'
              }`}
            >
              <span>🎁</span>
              <span>{chestCooldown > 0 ? `Recharging (${chestCooldown}s)` : 'Claim Chest!'}</span>
            </button>
          </div>
        </div>

        {/* Dashboard Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <span>🏛️</span> India Ministry Dashboard
            </h1>
            <p className="text-muted-foreground">Manage 18 government ministries and track national development starting in 1947.</p>
          </div>
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

        {/* Council of Ministers (Heroes Panel) */}
        <div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>🦸</span> Council of Ministers (Heroes Panel)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MINISTERS_LIST.map((m) => {
                const assignedTo = state.india.ministries.find(min => min.assigned_minister === m.id);
                
                return (
                  <div key={m.id} className="bg-background/60 border border-border/80 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex gap-3">
                      <span className="text-3xl bg-secondary p-2 rounded-xl border border-border/60">{m.avatar}</span>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{m.name}</h4>
                        <p className="text-[10px] text-primary uppercase font-bold">{m.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40 leading-relaxed min-h-[50px]">{m.skill}</p>
                    <div className="flex items-center gap-2">
                      <select
                        value={assignedTo?.id || ''}
                        onChange={(e) => assignMinister(m.id, e.target.value)}
                        className="text-xs w-full bg-secondary border border-border rounded-lg p-2 font-semibold text-foreground cursor-pointer"
                      >
                        <option value="">-- Unassigned --</option>
                        {state.india.ministries.map(min => (
                          <option key={min.id} value={min.id}>{min.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Unlock Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-center">
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
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedMinistry === m.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-card border border-border hover:border-primary/50'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{currentMinistry.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allocation: ₹{currentMinistry.allocation.toFixed(0)}B | Morale: {(currentMinistry.morale * 100).toFixed(1)}% | Efficiency: {(currentMinistry.efficiency * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {currentMinistry.programs && currentMinistry.programs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentMinistry.programs.map(program => {
                    const canExecute = currentMinistry.allocation >= program.budget_required && program.status === 'pending';
                    const successPercentage = Math.round(program.success_rate * 100);
                    
                    const totalSecs = program.time_required || 45;
                    const remSecs = program.time_remaining || 0;
                    const pct = Math.max(0, Math.min(100, ((totalSecs - remSecs) / totalSecs) * 100));

                    return (
                      <div key={program.id} className={`border rounded-xl p-5 relative overflow-hidden transition-all duration-300 shadow-md ${
                        program.status === 'success' ? 'bg-emerald-950/20 border-emerald-600/30' :
                        program.status === 'failed' ? 'bg-rose-950/20 border-rose-600/30' :
                        program.status === 'executing' ? 'bg-blue-950/20 border-blue-600/30' :
                        'bg-card border-border hover:border-primary/50'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-sm text-foreground leading-tight">{program.name}</h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            program.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            program.status === 'failed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            program.status === 'executing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {program.status.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed min-h-[40px]">{program.description}</p>

                        <div className="space-y-2 mb-4 text-xs bg-background/40 p-3 rounded-lg border border-border/40 font-medium">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget Required:</span>
                            <span className="font-mono text-foreground font-bold">₹{program.budget_required}B</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base Success Rate:</span>
                            <span className={`font-mono font-bold ${program.success_rate >= 0.7 ? 'text-emerald-400' : program.success_rate >= 0.6 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {successPercentage}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Morale Impact:</span>
                            <span className={`font-mono font-bold ${program.morale_impact > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {program.morale_impact > 0 ? '+' : ''}{program.morale_impact}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Efficiency Gain:</span>
                            <span className="font-mono text-cyan-400 font-bold">+{program.efficiency_gain}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Execution Time:</span>
                            <span className="font-mono text-purple-400 font-bold">{program.time_required || 45}s</span>
                          </div>
                        </div>

                        {program.status === 'executing' && (
                          <div className="space-y-2 mb-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-blue-400 animate-pulse">⚡ Researching...</span>
                              <span className="text-foreground">{remSecs}s remaining</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border border-border/40">
                              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                onClick={() => handleSpeedUp(currentMinistry.id, program.id)}
                                className="py-1 px-2 bg-secondary hover:bg-secondary/80 text-[10px] font-bold rounded border border-border flex items-center justify-center gap-1 text-blue-300 shadow-sm cursor-pointer"
                              >
                                <span>⚡ Speed Up (-15s)</span>
                              </button>
                              <button
                                onClick={() => handleFinishNow(currentMinistry.id, program.id)}
                                className="py-1 px-2 bg-primary/20 hover:bg-primary/30 text-[10px] font-bold rounded border border-primary/30 flex items-center justify-center gap-1 text-primary-foreground shadow-sm cursor-pointer"
                              >
                                <span>💎 Finish Now (₹5B)</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {program.status === 'success' && (
                          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5 text-center">
                            <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                              <span>🎉</span> Completed Successfully!
                            </p>
                          </div>
                        )}

                        {program.status === 'failed' && (
                          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5 text-center">
                            <p className="text-xs text-rose-400 font-bold flex items-center justify-center gap-1">
                              <span>💥</span> Failed
                            </p>
                          </div>
                        )}

                        {program.status === 'pending' && (
                          <button
                            onClick={() => handleExecuteProgram(currentMinistry.id, program.id)}
                            disabled={!canExecute}
                            className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                              canExecute
                                ? 'bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer'
                                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            }`}
                          >
                            <span>🚀 Start Program</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
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
