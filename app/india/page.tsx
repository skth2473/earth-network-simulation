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

  // Gemini AI Advisor States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [advisorReport, setAdvisorReport] = useState<{
    timestamp: string;
    gdpStatus: { label: string; value: string; status: 'good' | 'warning' | 'critical' };
    moraleStatus: { label: string; value: string; status: 'good' | 'warning' | 'critical'; details: string };
    nlecStatus: { label: string; value: string; status: 'good' | 'warning' | 'critical'; details: string };
    laggingIndex: { label: string; value: string; status: 'good' | 'warning' | 'critical'; details: string };
    recommendations: string[];
  } | null>(null);

  // Custom Program Forge States
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customMinistryId, setCustomMinistryId] = useState(state.india.ministries[0]?.id || '');
  const [customBudget, setCustomBudget] = useState(5); // ₹5B default
  const [customFocus, setCustomFocus] = useState<'morale' | 'efficiency' | 'balanced'>('balanced');


  const generateAdvisorReport = () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);
    
    // Animate scanning steps
    const timer = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev >= 4) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 280);

    setTimeout(() => {
      // 1. Morale Status
      const avgMorale = state.india.ministries.reduce((sum, m) => sum + m.morale, 0) / state.india.ministries.length;
      let moraleStatus: 'good' | 'warning' | 'critical' = 'good';
      let moraleDetails = '';
      if (avgMorale < 0.5) {
        moraleStatus = 'critical';
        moraleDetails = `Nationwide morale is dangerously low at ${(avgMorale * 100).toFixed(1)}%. Budget execution efficiency is halved and risk of program failure is extremely high.`;
      } else if (avgMorale < 0.7) {
        moraleStatus = 'warning';
        moraleDetails = `Morale is at ${(avgMorale * 100).toFixed(1)}%. Boost morale to 70.0% to unlock the Livestock Management System (NLEC).`;
      } else {
        moraleDetails = `Average morale is stable at ${(avgMorale * 100).toFixed(1)}%. Livestock system is fully operational.`;
      }

      // Find lowest morale ministry
      const sortedByMorale = [...state.india.ministries].sort((a, b) => a.morale - b.morale);
      const lowestMoraleM = sortedByMorale[0];

      // 2. NLEC Storage Buffer
      const has_auto_feeding = state.nlec.upgrades?.automated_feeding;
      const feed_used = state.nlec.livestock.reduce((sum, l) => {
        let feed = l.feed_required;
        if (has_auto_feeding) feed *= 0.85;
        if (l.breeding_mode === 'intensive') feed *= 1.25;
        return sum + feed;
      }, 0);
      let feed_produced = state.nlec.feed_production;
      if (state.nlec.upgrades?.feed_silo_expansion) {
        feed_produced += 100;
      }

      let nlecStatus: 'good' | 'warning' | 'critical' = 'good';
      let nlecValue = '';
      let nlecDetails = '';
      
      if (state.nlec.livestock.length === 0) {
        nlecStatus = 'warning';
        nlecValue = 'No Livestock';
        nlecDetails = 'Livestock system is unlocked but no herds have been initialized yet.';
      } else if (feed_used > feed_produced) {
        const net = feed_used - feed_produced;
        const months = state.nlec.feed_storage / net;
        nlecValue = `${months.toFixed(1)} Months`;
        if (months < 3) {
          nlecStatus = 'critical';
          nlecDetails = `CRITICAL DEFICIT: Feed storage will deplete in ${months.toFixed(1)} months. Net flow: -${net.toFixed(0)}M kg/month. Animals will starve!`;
        } else {
          nlecStatus = 'warning';
          nlecDetails = `WARNING: Storage depleting. Current buffer: ${months.toFixed(1)} months. Net flow: -${net.toFixed(0)}M kg/month.`;
        }
      } else {
        nlecValue = 'Sustainable';
        nlecDetails = `Surplus of +${(feed_produced - feed_used).toFixed(0)}M kg/month. Feed supply is stable.`;
      }

      // 3. Lagging Index
      const indices = [
        { name: 'Literacy', value: state.india.literacy, recommend: 'Assign Maulana Azad (Education) and run Literacy projects.' },
        { name: 'Corruption', value: 1 - state.india.corruption, actualVal: state.india.corruption, recommend: 'Assign Dr. B.R. Ambedkar to Law to reduce corruption.' },
        { name: 'Healthcare', value: state.india.healthcare, recommend: 'Assign Rajkumari Amrit Kaur (Health) and launch health programs.' },
        { name: 'Infrastructure', value: state.india.infrastructure, recommend: 'Increase Sovereign Wealth Fund allocation to infrastructure.' },
        { name: 'Tax Collection', value: state.india.tax_collection, recommend: 'Increase finance ministry budget to boost collection efficiency.' },
      ];
      const sortedIndices = [...indices].sort((a, b) => a.value - b.value);
      const worstIndex = sortedIndices[0];
      let indexStatus: 'good' | 'warning' | 'critical' = 'good';
      if (worstIndex.value < 0.4) indexStatus = 'critical';
      else if (worstIndex.value < 0.6) indexStatus = 'warning';

      // 4. Recommendations List
      const recs: string[] = [];
      if (avgMorale < 0.7) {
        recs.push(`Forge a custom Morale Focus program for ${lowestMoraleM.name} (morale is lowest at ${(lowestMoraleM.morale * 100).toFixed(0)}%).`);
      }
      if (nlecStatus === 'critical' || nlecStatus === 'warning') {
        recs.push('Purchase the Feed Silo Expansion upgrade in NLEC (+100M kg/month production) or adjust breeding mode to Controlled.');
      }
      recs.push(worstIndex.recommend);

      const unassignedMinisters = MINISTERS_LIST.filter(m => !state.india.ministries.some(min => min.assigned_minister === m.id));
      if (unassignedMinisters.length > 0) {
        recs.push(`You have ${unassignedMinisters.length} unassigned cabinet ministers (${unassignedMinisters.map(m => m.name).join(', ')}). Assign them to boost ministry efficiency.`);
      }

      if (state.india.vip_level && state.india.vip_level < 5) {
        recs.push(`Boost your VIP Level to unlock higher program success rates and execution speed. Claim the Mystery Chest every 30s for VIP points.`);
      }

      setAdvisorReport({
        timestamp: new Date().toLocaleTimeString(),
        gdpStatus: {
          label: 'GDP Trajectory',
          value: `₹${state.india.gdp.toFixed(1)}T`,
          status: state.india.gdp > 5.0 ? 'good' : 'warning',
        },
        moraleStatus: {
          label: 'Average Morale',
          value: `${(avgMorale * 100).toFixed(1)}%`,
          status: moraleStatus,
          details: moraleDetails,
        },
        nlecStatus: {
          label: 'NLEC Feed Buffer',
          value: nlecValue || 'N/A',
          status: nlecStatus,
          details: nlecDetails,
        },
        laggingIndex: {
          label: `Lagging: ${worstIndex.name}`,
          value: worstIndex.name === 'Corruption' ? `${(worstIndex.actualVal! * 100).toFixed(1)}%` : `${(worstIndex.value * 100).toFixed(1)}%`,
          status: indexStatus,
          details: worstIndex.recommend,
        },
        recommendations: recs,
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleForgeProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('Please enter a Program Name.');
      return;
    }

    const targetMinistry = state.india.ministries.find(m => m.id === customMinistryId);
    if (!targetMinistry) {
      alert('Invalid Ministry selected.');
      return;
    }

    if (customBudget < 2 || customBudget > 20) {
      alert('Budget allocation must be between ₹2B and ₹20B.');
      return;
    }

    if (targetMinistry.allocation < customBudget) {
      alert(`Insufficient Allocation!\n\n${targetMinistry.name} has only ₹${targetMinistry.allocation.toFixed(0)}B allocated. Reallocate budget to this ministry first.`);
      return;
    }

    const baseSuccess = 0.5 + (targetMinistry.efficiency * 0.4);
    const successRate = Math.min(0.95, baseSuccess);

    let moraleImpact = 0;
    let efficiencyGain = 0;

    if (customFocus === 'morale') {
      moraleImpact = Math.round(customBudget * 1.5);
      efficiencyGain = Math.round(customBudget * 0.5);
    } else if (customFocus === 'efficiency') {
      moraleImpact = Math.round(customBudget * 0.4);
      efficiencyGain = Math.round(customBudget * 2.0);
    } else {
      moraleImpact = Math.round(customBudget * 0.8);
      efficiencyGain = Math.round(customBudget * 1.0);
    }

    const newState = JSON.parse(JSON.stringify(state));
    const m = newState.india.ministries.find((min: any) => min.id === customMinistryId);

    m.allocation -= customBudget;

    let duration = customBudget * 4;

    if (m.assigned_minister === 'bhabha' && m.id === 'it') duration = Math.round(duration * 0.7);
    else if (m.assigned_minister === 'azad' && m.id === 'education') duration = Math.round(duration * 0.75);
    else if (m.assigned_minister === 'kaur' && m.id === 'health') duration = Math.round(duration * 0.75);
    else if (m.assigned_minister === 'patel' && (m.id === 'defence' || m.id === 'finance')) duration = Math.round(duration * 0.8);

    if (newState.india.vip_level && newState.india.vip_level > 1) {
      const vip_speed_factor = 1 - (newState.india.vip_level - 1) * 0.05;
      duration = Math.round(duration * Math.max(0.5, vip_speed_factor));
    }

    const newProgram: MinistryProgram = {
      id: `custom_${Date.now()}`,
      name: customName,
      description: customDesc.trim() || `Custom forged strategic initiative focused on ${customFocus} in ${m.name}.`,
      budget_required: customBudget,
      success_rate: Number(successRate.toFixed(2)),
      morale_impact: moraleImpact,
      efficiency_gain: efficiencyGain,
      execution_month: newState.current_month,
      status: 'executing',
      time_required: duration,
      time_remaining: duration,
    };

    if (!m.programs) m.programs = [];
    m.programs.push(newProgram);

    newState.nlec.logs = [`Forged program: ${customName} in ${m.name}. Running for ${duration}s.`, ...(newState.nlec.logs || [])].slice(0, 5);

    updateState(newState);
    alert(`Success!\n\n"${customName}" has been forged and is executing. It will run for ${duration}s in ${m.name}.`);

    setCustomName('');
    setCustomDesc('');
  };



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
  const previewMinistry = state.india.ministries.find(m => m.id === customMinistryId);
  const previewSuccess = previewMinistry ? Math.min(0.95, 0.5 + (previewMinistry.efficiency * 0.4)) : 0.7;
  let previewMorale = 0;
  let previewEff = 0;
  if (customFocus === 'morale') {
    previewMorale = customBudget * 1.5;
    previewEff = customBudget * 0.5;
  } else if (customFocus === 'efficiency') {
    previewMorale = customBudget * 0.4;
    previewEff = customBudget * 2.0;
  } else {
    previewMorale = customBudget * 0.8;
    previewEff = customBudget * 1.0;
  }

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
            <div className="bg-black/40 border border-border/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <span>🧬 Research:</span>
              <span className="font-mono text-sm text-foreground bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">{Math.floor(state.india.research_points || 0)} RP</span>
            </div>

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

        {/* Gemini AI Advisor & Custom Program Forge Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gemini AI Advisor Component - 2 Columns */}
          <div className="lg:col-span-2 bg-gradient-to-br from-card/90 to-card/65 border border-border/80 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            {/* Ambient glowing light element behind the icon */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/10 border border-blue-400/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 .364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                      Gemini Strategic AI Advisor
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Real-time Simulation Telemetry Analysis</p>
                  </div>
                </div>
                {advisorReport && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20 shadow-sm animate-pulse">
                    ACTIVE SENSORS
                  </span>
                )}
              </div>

              {/* Body */}
              {isAnalyzing ? (
                <div className="bg-black/40 border border-indigo-500/20 rounded-xl p-4 font-mono text-xs text-blue-400 space-y-3 shadow-inner h-60 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                    <span className="font-bold">Analyzing Ministry Telemetry...</span>
                  </div>
                  <div className="space-y-1.5 text-slate-400 border-t border-slate-900 pt-3">
                    {[
                      '📡 Initiating remote connection to Gemini AI core...',
                      '📊 Fetching ministry budget allocations & morale metrics...',
                      '🌾 Pulling NLEC storage silo sensor data...',
                      '🔍 Cross-referencing cabinet minister assignments...',
                      '💡 Formulating strategic development directives...',
                    ].slice(0, analysisStep + 1).map((line, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-blue-500 select-none">&gt;</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : advisorReport ? (
                <div className="space-y-4">
                  {/* Metric Status Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-background/40 border border-border/60 rounded-xl p-2.5 flex flex-col justify-between shadow-sm min-h-[72px]">
                      <span className="text-[10px] text-muted-foreground font-medium">{advisorReport.gdpStatus.label}</span>
                      <span className="text-sm font-bold text-foreground font-mono mt-1">{advisorReport.gdpStatus.value}</span>
                    </div>

                    <div className={`border rounded-xl p-2.5 flex flex-col justify-between shadow-sm min-h-[72px] ${
                      advisorReport.moraleStatus.status === 'critical' ? 'bg-rose-950/15 border-rose-500/30 text-rose-300' :
                      advisorReport.moraleStatus.status === 'warning' ? 'bg-amber-950/15 border-amber-500/30 text-amber-300' :
                      'bg-emerald-950/15 border-emerald-500/30 text-emerald-300'
                    }`}>
                      <span className="text-[10px] opacity-75 font-medium">{advisorReport.moraleStatus.label}</span>
                      <span className="text-sm font-bold font-mono mt-1">{advisorReport.moraleStatus.value}</span>
                    </div>

                    <div className={`border rounded-xl p-2.5 flex flex-col justify-between shadow-sm min-h-[72px] ${
                      advisorReport.nlecStatus.status === 'critical' ? 'bg-rose-950/15 border-rose-500/30 text-rose-300' :
                      advisorReport.nlecStatus.status === 'warning' ? 'bg-amber-950/15 border-amber-500/30 text-amber-300' :
                      'bg-emerald-950/15 border-emerald-500/30 text-emerald-300'
                    }`}>
                      <span className="text-[10px] opacity-75 font-medium">{advisorReport.nlecStatus.label}</span>
                      <span className="text-sm font-bold font-mono mt-1">{advisorReport.nlecStatus.value}</span>
                    </div>

                    <div className={`border rounded-xl p-2.5 flex flex-col justify-between shadow-sm min-h-[72px] ${
                      advisorReport.laggingIndex.status === 'critical' ? 'bg-rose-950/15 border-rose-500/30 text-rose-300' :
                      advisorReport.laggingIndex.status === 'warning' ? 'bg-amber-950/15 border-amber-500/30 text-amber-300' :
                      'bg-emerald-950/15 border-emerald-500/30 text-emerald-300'
                    }`}>
                      <span className="text-[10px] opacity-75 font-medium">{advisorReport.laggingIndex.label}</span>
                      <span className="text-sm font-bold font-mono mt-1">{advisorReport.laggingIndex.value}</span>
                    </div>
                  </div>

                  {/* Detailed Analysis Reports */}
                  <div className="bg-background/30 rounded-xl p-3 border border-border/40 text-xs space-y-2 max-h-36 overflow-y-auto leading-relaxed shadow-inner">
                    <p className="text-slate-300"><strong className="text-indigo-300">Morale Audit:</strong> {advisorReport.moraleStatus.details}</p>
                    <p className="text-slate-300"><strong className="text-purple-300">NLEC Telemetry:</strong> {advisorReport.nlecStatus.details}</p>
                  </div>

                  {/* Gemini Recommendations */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <span>✨</span> Gemini Directives:
                    </h4>
                    <ul className="space-y-1 text-xs">
                      {advisorReport.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-slate-300 leading-normal bg-background/25 py-1 px-2.5 rounded-lg border border-border/20 shadow-sm">
                          <span className="text-indigo-400 font-extrabold select-none">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-background/40 border border-border/80 rounded-2xl p-6 text-center shadow-inner h-60 flex flex-col items-center justify-center space-y-4">
                  <div className="text-5xl text-indigo-500/30 animate-pulse select-none">🧠</div>
                  <div className="max-w-md space-y-1">
                    <h4 className="font-bold text-foreground text-sm">Strategic Telemetry Offline</h4>
                    <p className="text-xs text-muted-foreground">
                      Initialize the Gemini Core to run real-time diagnostic sweeps across government ministries, Sovereign Wealth budgets, and NLEC operations.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[10px] text-muted-foreground font-mono">
                {advisorReport ? `Last scan: ${advisorReport.timestamp}` : 'Ready for instruction'}
              </span>
              <button
                onClick={generateAdvisorReport}
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 transition-all border border-indigo-400/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>🧠</span>
                <span>{advisorReport ? 'Re-Analyze Simulation' : 'Ask Gemini Advisor'}</span>
              </button>
            </div>
          </div>

          {/* Custom Program Forge Component - 1 Column */}
          <div className="bg-gradient-to-br from-card/90 to-card/65 border border-border/80 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <form onSubmit={handleForgeProgram} className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-2 rounded-xl text-black shadow-md border border-yellow-400/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-foreground">
                    Cabinet Program Forge
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Execute Custom Program in Real Time</p>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-3 text-xs">
                {/* Program Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Program Name</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Clean Ganga Initiative"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 shadow-inner font-medium text-xs"
                  />
                </div>

                {/* Program Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                  <textarea
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder="e.g. Elevate hygiene and restore public faith..."
                    rows={2}
                    className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 shadow-inner font-medium text-xs resize-none"
                  />
                </div>

                {/* Target Ministry Selection & Budget slider */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category / Ministry</label>
                    <select
                      value={customMinistryId}
                      onChange={(e) => setCustomMinistryId(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-2 py-2 text-foreground font-semibold text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50"
                    >
                      {state.india.ministries.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} (₹{m.allocation.toFixed(0)}B)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Budget: ₹{customBudget}B</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="2"
                        max="20"
                        step="1"
                        value={customBudget}
                        onChange={(e) => setCustomBudget(Number(e.target.value))}
                        className="w-full h-1.5 bg-background border border-border rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Focus Target */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Strategic Priority Focus</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'morale', label: 'Morale', desc: '+1.5% Morale / +0.5% Eff' },
                      { id: 'efficiency', label: 'Efficiency', desc: '+0.4% Morale / +2.0% Eff' },
                      { id: 'balanced', label: 'Balanced', desc: '+0.8% Morale / +1.0% Eff' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setCustomFocus(f.id as any)}
                        className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all border flex flex-col items-center justify-center gap-0.5 ${
                          customFocus === f.id
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                            : 'bg-background/50 border-border/80 text-muted-foreground hover:border-amber-500/30'
                        }`}
                      >
                        <span>{f.label === 'Morale' ? '🎭' : f.label === 'Efficiency' ? '⚡' : '⚖️'} {f.label}</span>
                        <span className="text-[8px] opacity-75 font-mono leading-none">{f.desc.split(' / ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Live Preview Panel */}
              <div className="bg-background/40 border border-border/60 rounded-xl p-2.5 space-y-1.5 text-[10px] leading-tight font-medium shadow-inner">
                <div className="flex justify-between text-muted-foreground">
                  <span>Success Probability:</span>
                  <span className="font-mono text-foreground font-bold">{(previewSuccess * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Research Duration:</span>
                  <span className="font-mono text-purple-400 font-bold">{customBudget * 4} seconds</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Outcome Gains (Est.):</span>
                  <span className="font-mono text-emerald-400 font-bold">+{previewMorale.toFixed(1)}% Morale, +{previewEff.toFixed(1)}% Efficiency</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/15 hover:from-amber-400 hover:to-yellow-400 transition-all border border-yellow-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🛠️</span>
                <span>Forge & Execute Program</span>
              </button>
            </form>
          </div>
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

        {/* National Research Laboratories (Tech Tree) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/40 pb-3">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>🔬</span> National Research Laboratories (Tech Tree)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Fund historical Indian industrial initiatives using national Research Points (RP) and Sovereign Wealth Budgets.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-cyan-300 shadow-sm shadow-cyan-950/20">
                <span>🧬 R&D Pool:</span>
                <span className="font-mono text-sm text-foreground bg-cyan-900/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                  {Math.floor(state.india.research_points || 0)} RP
                </span>
              </div>
              <div className="bg-amber-950/40 border border-amber-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-300 shadow-sm shadow-amber-950/20">
                <span>💰 SWF Budget:</span>
                <span className="font-mono text-sm text-foreground bg-amber-900/40 border border-amber-500/20 px-2 py-0.5 rounded">
                  ₹{(state.swf.balance / 1000).toFixed(1)}B
                </span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-border/20 pb-3 text-xs">
            {[
              { id: 'all', label: '🌐 All Upgrades' },
              { id: 'economy', label: '📊 Economy & Infra' },
              { id: 'defence', label: '🛡️ Defence & Shipping' },
              { id: 'social', label: '🏥 Social Welfare & Labs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTechTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTechTab === tab.id
                    ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950/10'
                    : 'bg-background hover:bg-background/80 text-muted-foreground border border-border/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {RESEARCH_TECHS.filter(t => activeTechTab === 'all' || t.category === activeTechTab).map((tech) => {
              const isUnlocked = state.india.unlocked_techs?.includes(tech.id);
              const canAffordRP = (state.india.research_points || 0) >= tech.cost_rp;
              const canAffordBudget = (state.swf.balance || 0) >= tech.cost_budget * 1000;
              const canAfford = canAffordRP && canAffordBudget;
              
              return (
                <div 
                  key={tech.id} 
                  className={`border rounded-xl p-4 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden ${
                    isUnlocked 
                      ? 'bg-cyan-950/10 border-cyan-500/30 shadow-cyan-950/5' 
                      : 'bg-background/60 border-border/80 hover:border-cyan-500/20'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-sm text-foreground leading-snug">{tech.name}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isUnlocked 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                          : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60'
                      }`}>
                        {isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed min-h-[36px]">{tech.desc}</p>
                    
                    {/* Improves indicators */}
                    <div className="bg-background/40 border border-border/60 p-2 rounded-lg text-[10px] leading-tight space-y-1">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Research Output:</div>
                      <div className="text-cyan-400 font-semibold">{tech.effect}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {!isUnlocked && (
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono font-medium bg-black/20 p-1.5 rounded-lg border border-border/40">
                        <div className={`flex justify-between px-1 ${canAffordRP ? 'text-cyan-300' : 'text-rose-400'}`}>
                          <span>RP:</span>
                          <span>{tech.cost_rp}</span>
                        </div>
                        <div className={`flex justify-between px-1 ${canAffordBudget ? 'text-amber-300' : 'text-rose-400'}`}>
                          <span>Budget:</span>
                          <span>₹{tech.cost_budget}B</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleUnlockTech(tech.id)}
                      disabled={isUnlocked || !canAfford}
                      className={`w-full py-2 rounded-lg font-bold text-xs transition-all border shadow-sm ${
                        isUnlocked 
                          ? 'bg-cyan-950/20 text-cyan-500 border-cyan-500/20 cursor-not-allowed'
                          : canAfford
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white cursor-pointer border-cyan-400/20 animate-pulse'
                            : 'bg-muted text-muted-foreground cursor-not-allowed border-transparent opacity-50'
                      }`}
                    >
                      {isUnlocked ? '✓ Active' : canAfford ? '🔬 Unlock Tech' : 'Insufficient Resources'}
                    </button>
                  </div>
                </div>
              );
            })}
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
