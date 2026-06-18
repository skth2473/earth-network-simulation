'use client';

import { useState, useEffect } from 'react';
import { useSimulation } from '@/lib/simulation-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { KPICard } from '@/components/kpi-card';
import { RESEARCH_TECHS } from '@/lib/research-data';
import { ResearchTech } from '@/lib/types';

export default function ResearchDashboard() {
  const { state, updateState } = useSimulation();
  const [activeTab, setActiveTab] = useState<'economy' | 'defence' | 'social'>('economy');
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);

  // Auto-select first tech in the active category if none selected
  useEffect(() => {
    const categoryTechs = RESEARCH_TECHS.filter(t => t.category === activeTab);
    if (categoryTechs.length > 0) {
      setSelectedTechId(categoryTechs[0].id);
    } else {
      setSelectedTechId(null);
    }
  }, [activeTab]);

  const selectedTech = RESEARCH_TECHS.find(t => t.id === selectedTechId);

  // Status check helpers
  const isUnlocked = (techId: string) => {
    return state.india.unlocked_techs?.includes(techId) || false;
  };

  const hasPrerequisitesMet = (tech: ResearchTech) => {
    if (!tech.prerequisites || tech.prerequisites.length === 0) return true;
    return tech.prerequisites.every(id => isUnlocked(id));
  };

  const canAfford = (tech: ResearchTech) => {
    const rp = state.india.research_points || 0;
    const swf = state.swf.balance || 0;
    return rp >= tech.cost_rp && swf >= tech.cost_budget * 1000;
  };

  const handleUnlockTech = (techId: string) => {
    const tech = RESEARCH_TECHS.find(t => t.id === techId);
    if (!tech) return;

    if (!hasPrerequisitesMet(tech)) {
      const missing = tech.prerequisites?.filter(id => !isUnlocked(id)) || [];
      const missingNames = missing.map(id => RESEARCH_TECHS.find(t => t.id === id)?.name || id).join(', ');
      alert(`Cannot unlock ${tech.name} yet!\n\nPrerequisite technologies must be unlocked first: ${missingNames}`);
      return;
    }

    const rpBalance = state.india.research_points || 0;
    const swfBalance = state.swf.balance || 0;

    if (rpBalance < tech.cost_rp) {
      alert(`Insufficient Research Points!\n\nYou have ${Math.floor(rpBalance)} RP. ${tech.name} requires ${tech.cost_rp} RP.`);
      return;
    }

    if (swfBalance < tech.cost_budget * 1000) {
      alert(`Insufficient SWF Budget!\n\nYou have ₹${swfBalance.toFixed(0)}M. ${tech.name} requires ₹${tech.cost_budget}B (₹${tech.cost_budget * 1000}M).`);
      return;
    }

    const newState = JSON.parse(JSON.stringify(state));
    newState.india.research_points = (newState.india.research_points || 0) - tech.cost_rp;
    newState.swf.balance -= tech.cost_budget * 1000;
    
    if (!newState.india.unlocked_techs) {
      newState.india.unlocked_techs = [];
    }
    newState.india.unlocked_techs.push(techId);

    // Apply immediate index benefits:
    if (techId === 'five_year_plan') {
      newState.india.gdp += 0.5;
      newState.india.tax_collection = Math.min(0.95, newState.india.tax_collection + 0.05);
    } else if (techId === 'tariff_protection') {
      newState.india.gdp += 0.2;
    } else if (techId === 'iit_setup') {
      newState.india.literacy = Math.min(0.95, newState.india.literacy + 0.02);
    } else if (techId === 'aiims_setup') {
      newState.india.healthcare = Math.min(0.95, newState.india.healthcare + 0.03);
    } else if (techId === 'bhakra_dam' || techId === 'chittaranjan_loco') {
      newState.india.infrastructure = Math.min(0.95, newState.india.infrastructure + 0.04);
    } else if (techId === 'national_highway') {
      newState.india.infrastructure = Math.min(0.95, newState.india.infrastructure + 0.03);
    } else if (techId === 'sindri_fertilizer') {
      newState.nlec.feed_production = (newState.nlec.feed_production || 0) + 50;
    }

    // Direct Ministry stats boosts mapping
    const ministryMap: Record<string, { mId: string; effBoost?: number; moraleBoost?: number; staffingBoost?: number }> = {
      rbi_national: { mId: 'finance', effBoost: 10 },
      tariff_protection: { mId: 'commerce', effBoost: 8 },
      bhakra_dam: { mId: 'power', effBoost: 8 },
      chittaranjan_loco: { mId: 'railways', effBoost: 10 },
      national_highway: { mId: 'roads', effBoost: 8 },
      hal_setup: { mId: 'defence', effBoost: 10, moraleBoost: 8 },
      ncc_setup: { mId: 'defence', moraleBoost: 5, staffingBoost: 15 },
      scindia_steam: { mId: 'shipping', effBoost: 10 },
      air_india_nat: { mId: 'aviation', effBoost: 10 },
      iit_setup: { mId: 'education', effBoost: 5 },
      aiims_setup: { mId: 'health', effBoost: 5 },
      tifr_labs: { mId: 'it', effBoost: 12 },
      sindri_fertilizer: { mId: 'agriculture', effBoost: 12 },
      damodar_valley: { mId: 'water', effBoost: 10 },
      min_wages_act: { mId: 'labour', moraleBoost: 15, effBoost: 5 },
      tribal_welfare: { mId: 'social_justice', moraleBoost: 15, effBoost: 6 },
      forest_reserve: { mId: 'environment', moraleBoost: 10, effBoost: 8 },
      essential_supplies: { mId: 'consumer_affairs', effBoost: 10, moraleBoost: 5 },
      community_dev: { mId: 'rural_development', moraleBoost: 12, effBoost: 8 }
    };

    const targetBoost = ministryMap[techId];
    if (targetBoost) {
      const minIndex = newState.india.ministries.findIndex((min: any) => min.id === targetBoost.mId);
      if (minIndex !== -1) {
        const m = newState.india.ministries[minIndex];
        if (targetBoost.effBoost) {
          m.efficiency = Math.min(0.95, m.efficiency + targetBoost.effBoost * 0.01);
        }
        if (targetBoost.moraleBoost) {
          m.morale = Math.min(0.95, m.morale + targetBoost.moraleBoost * 0.01);
        }
        if (targetBoost.staffingBoost) {
          m.staffing = Math.min(100, m.staffing + targetBoost.staffingBoost);
        }
      }
    }

    // Log to event log
    newState.nlec.logs = [`Unlocked Research: ${tech.name}.`, ...(newState.nlec.logs || [])].slice(0, 5);

    updateState(newState);
  };

  // Connection line calculator helper
  const getConnectionPath = (parent: ResearchTech, child: ResearchTech) => {
    const pL = (parent.x - 1) * 38 + 4;
    const pT = (parent.y - 1) * 18 + 5;
    const cL = (child.x - 1) * 38 + 4;
    const cT = (child.y - 1) * 18 + 5;
    
    // Card dimensions: width = 20%, height = 11%
    const pW = 20;
    const pH = 11;
    
    const pCx = pL + pW / 2;
    const pCy = pT + pH / 2;
    const cCx = cL + pW / 2;
    const cCy = cT + pH / 2;

    let x1, y1, x2, y2;

    if (child.x > parent.x) {
      x1 = pL + pW;
      y1 = pCy;
      x2 = cL;
      y2 = cCy;
    } else if (child.x < parent.x) {
      x1 = pL;
      y1 = pCy;
      x2 = cL + pW;
      y2 = cCy;
    } else {
      x1 = pCx;
      y1 = child.y > parent.y ? pT + pH : pT;
      x2 = cCx;
      y2 = child.y > parent.y ? cT : cT + pH;
    }

    return {
      x1: `${x1}%`,
      y1: `${y1}%`,
      x2: `${x2}%`,
      y2: `${y2}%`
    };
  };

  const categoryTechs = RESEARCH_TECHS.filter(t => t.category === activeTab);
  const totalTechsCount = RESEARCH_TECHS.length;
  const unlockedTechsCount = RESEARCH_TECHS.filter(t => isUnlocked(t.id)).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <span>🔬</span> National Research Laboratories
            </h1>
            <p className="text-muted-foreground">Coordinate strategic R&D projects to modernize infrastructure, enhance defense capabilities, and build social welfare grids.</p>
          </div>
          
          {/* Quick R&D Statistics */}
          <div className="flex gap-2">
            <div className="bg-cyan-950/40 border border-cyan-500/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-cyan-300 shadow-md shadow-cyan-950/20 backdrop-blur-md">
              <span className="text-lg">🧬</span>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold leading-none uppercase">Research Pool</div>
                <div className="font-mono text-sm text-foreground mt-0.5">{Math.floor(state.india.research_points || 0)} RP</div>
              </div>
            </div>
            
            <div className="bg-amber-950/40 border border-amber-500/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-amber-300 shadow-md shadow-amber-950/20 backdrop-blur-md">
              <span className="text-lg">💰</span>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold leading-none uppercase">SWF Allocation</div>
                <div className="font-mono text-sm text-foreground mt-0.5">₹{(state.swf.balance / 1000).toFixed(1)}B</div>
              </div>
            </div>

            <div className="bg-purple-950/40 border border-purple-500/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-purple-300 shadow-md shadow-purple-950/20 backdrop-blur-md">
              <span className="text-lg">📈</span>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold leading-none uppercase">Progression</div>
                <div className="font-mono text-sm text-foreground mt-0.5">{unlockedTechsCount} / {totalTechsCount} Unlocked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border/40 gap-1 text-sm">
          {[
            { id: 'economy', label: '📊 Economy & Infrastructure', color: 'border-purple-500' },
            { id: 'defence', label: '🛡️ Defence & Shipping', color: 'border-cyan-500' },
            { id: 'social', label: '🏥 Social Welfare & Labs', color: 'border-yellow-500' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? `${tab.color} text-foreground bg-primary/5`
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Master Tree Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Visual Board - 3 Columns */}
          <div className="lg:col-span-3 space-y-4">
            <div className="w-full overflow-x-auto rounded-2xl border border-border/80 bg-zinc-950/50 shadow-inner relative select-none">
              
              {/* Outer Board with fixed dimensions to prevent squishing */}
              <div className="relative min-w-[900px] h-[550px] p-6">
                
                {/* SVG Connections Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="oklch(0.25 0 0)" />
                    </marker>
                    <marker
                      id="arrow-available"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="oklch(0.65 0.15 40)" />
                    </marker>
                    <marker
                      id="arrow-unlocked"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="oklch(0.55 0.25 210)" />
                    </marker>
                  </defs>

                  {/* Draw Lines */}
                  {categoryTechs.flatMap(child => {
                    if (!child.prerequisites) return [];
                    return child.prerequisites.map(parentId => {
                      const parent = RESEARCH_TECHS.find(t => t.id === parentId);
                      if (!parent) return null;
                      
                      const { x1, y1, x2, y2 } = getConnectionPath(parent, child);
                      const parentUnlocked = isUnlocked(parent.id);
                      const childUnlocked = isUnlocked(child.id);
                      const childAvailable = parentUnlocked && !childUnlocked;

                      return (
                        <line
                          key={`${parent.id}-${child.id}`}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          className={`transition-colors duration-500 ${
                            childUnlocked
                              ? 'stroke-cyan-500 stroke-[2.5]'
                              : childAvailable
                                ? 'stroke-amber-500/80 stroke-[2] stroke-dasharray-[4]'
                                : 'stroke-zinc-800 stroke-[1.5]'
                          }`}
                          style={{
                            strokeDasharray: childAvailable ? '4 3' : undefined
                          }}
                          markerEnd={
                            childUnlocked
                              ? 'url(#arrow-unlocked)'
                              : childAvailable
                                ? 'url(#arrow-available)'
                                : 'url(#arrow)'
                          }
                        />
                      );
                    }).filter(Boolean);
                  })}
                </svg>

                {/* Nodes Cards */}
                {categoryTechs.map((tech) => {
                  const unlocked = isUnlocked(tech.id);
                  const available = hasPrerequisitesMet(tech) && !unlocked;
                  const selected = selectedTechId === tech.id;

                  let borderStyle = 'border-border/60 hover:border-border';
                  let bgStyle = 'bg-zinc-900/40 backdrop-blur-md';
                  let textAccent = 'text-muted-foreground';

                  if (unlocked) {
                    borderStyle = 'border-cyan-500/50 shadow-cyan-950/20';
                    bgStyle = 'bg-cyan-950/10 backdrop-blur-md';
                    textAccent = 'text-cyan-400';
                  } else if (available) {
                    borderStyle = 'border-amber-500/50 shadow-amber-950/20 hover:border-amber-400';
                    bgStyle = 'bg-amber-950/5 backdrop-blur-md hover:bg-amber-950/10';
                    textAccent = 'text-amber-400';
                  }

                  if (selected) {
                    borderStyle += ' ring-2 ring-primary ring-offset-2 ring-offset-background';
                  }

                  return (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTechId(tech.id)}
                      style={{
                        left: `${(tech.x - 1) * 38 + 4}%`,
                        top: `${(tech.y - 1) * 18 + 5}%`,
                        width: '20%',
                        height: '11%',
                        cursor: 'pointer'
                      }}
                      className={`absolute rounded-xl border p-2 flex flex-col justify-between transition-all shadow-sm ${bgStyle} ${borderStyle}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-extrabold text-[11px] text-foreground leading-snug truncate" title={tech.name}>
                          {tech.name}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          unlocked ? 'bg-cyan-500/20 text-cyan-300' :
                          available ? 'bg-amber-500/20 text-amber-300 animate-pulse' :
                          'bg-zinc-800 text-zinc-500'
                        }`}>
                          {unlocked ? 'Active' : available ? 'Ready' : 'Locked'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/20 pt-1 mt-1 font-mono">
                        <span>Cost: {tech.cost_rp} RP</span>
                        <span className={textAccent}>₹{tech.cost_budget}B</span>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
            
            {/* Helpful legend */}
            <div className="flex gap-4 items-center justify-center text-xs bg-card/40 border border-border/40 p-3 rounded-xl">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Tree Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500/20 border border-cyan-500/50" />
                <span className="text-cyan-400 font-semibold">Active/Unlocked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/50 animate-pulse" />
                <span className="text-amber-400 font-semibold">Ready to Research</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-zinc-900 border border-border/40" />
                <span className="text-zinc-500">Locked (Requires Parent Techs)</span>
              </div>
            </div>
          </div>

          {/* Details Inspector Panel - 1 Column */}
          <div className="lg:col-span-1">
            {selectedTech ? (
              <div className="bg-gradient-to-b from-card to-card/75 border border-border rounded-2xl p-5 shadow-xl space-y-5 flex flex-col h-full min-h-[500px] justify-between relative overflow-hidden">
                {/* Visual decoration overlay */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isUnlocked(selectedTech.id) ? 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/30' :
                      hasPrerequisitesMet(selectedTech) ? 'bg-amber-500/25 text-amber-400 border border-amber-500/30 animate-pulse' :
                      'bg-zinc-800 text-zinc-500 border border-zinc-700/60'
                    }`}>
                      {isUnlocked(selectedTech.id) ? '✓ Unlocked' : hasPrerequisitesMet(selectedTech) ? '⚡ Available' : '🔒 Locked'}
                    </span>
                    <h3 className="font-extrabold text-lg text-foreground leading-snug mt-2">{selectedTech.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
                      Category: {selectedTech.category === 'economy' ? 'Economy & Infra' : selectedTech.category === 'defence' ? 'Defence & Shipping' : 'Social Welfare'}
                    </p>
                  </div>

                  {/* Historical Description */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Historical Focus:</div>
                    <p className="text-xs text-muted-foreground leading-relaxed bg-background/50 border border-border/40 p-3 rounded-xl shadow-inner font-medium">
                      {selectedTech.desc}
                    </p>
                  </div>

                  {/* Prerequisites indicator */}
                  {selectedTech.prerequisites && selectedTech.prerequisites.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Requirements:</div>
                      <div className="space-y-1 text-xs font-semibold">
                        {selectedTech.prerequisites.map(reqId => {
                          const reqTech = RESEARCH_TECHS.find(t => t.id === reqId);
                          const reqUnlocked = isUnlocked(reqId);
                          return (
                            <div key={reqId} className="flex items-center gap-1.5">
                              <span className={reqUnlocked ? 'text-cyan-400' : 'text-rose-400'}>
                                {reqUnlocked ? '✓' : '❌'}
                              </span>
                              <span className={reqUnlocked ? 'text-muted-foreground' : 'text-rose-300'}>
                                {reqTech?.name || reqId}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tech effects */}
                  <div className="space-y-2">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Permanent Benefits:</div>
                    <div className="bg-background/40 border border-border/60 p-3 rounded-xl text-xs space-y-1 shadow-sm">
                      <div className="text-cyan-400 font-bold leading-tight">{selectedTech.effect}</div>
                    </div>
                  </div>
                </div>

                {/* Costs & Unlock Button */}
                <div className="space-y-3 pt-4 border-t border-border/40">
                  {!isUnlocked(selectedTech.id) && (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold bg-black/45 p-2.5 rounded-xl border border-border/50 shadow-inner">
                      <div className={`flex flex-col items-center justify-center p-1 border-r border-border/20 ${
                        (state.india.research_points || 0) >= selectedTech.cost_rp ? 'text-cyan-400' : 'text-rose-400'
                      }`}>
                        <span className="text-[8px] text-muted-foreground font-sans uppercase">Required RP</span>
                        <span className="mt-0.5">{selectedTech.cost_rp}</span>
                        <span className="text-[8px] text-muted-foreground font-sans mt-0.5">({Math.floor(state.india.research_points || 0)} held)</span>
                      </div>
                      <div className={`flex flex-col items-center justify-center p-1 ${
                        (state.swf.balance) >= selectedTech.cost_budget * 1000 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        <span className="text-[8px] text-muted-foreground font-sans uppercase">SWF Funds</span>
                        <span className="mt-0.5">₹{selectedTech.cost_budget}B</span>
                        <span className="text-[8px] text-muted-foreground font-sans mt-0.5">(₹{(state.swf.balance / 1000).toFixed(1)}B held)</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleUnlockTech(selectedTech.id)}
                    disabled={isUnlocked(selectedTech.id) || !hasPrerequisitesMet(selectedTech) || !canAfford(selectedTech)}
                    className={`w-full py-3 rounded-xl font-bold text-xs border shadow-md transition-all duration-300 ${
                      isUnlocked(selectedTech.id)
                        ? 'bg-cyan-950/20 text-cyan-500 border-cyan-500/20 cursor-not-allowed'
                        : hasPrerequisitesMet(selectedTech) && canAfford(selectedTech)
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white cursor-pointer border-cyan-400/20 shadow-cyan-900/10 animate-pulse'
                          : 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed border-transparent opacity-60'
                    }`}
                  >
                    {isUnlocked(selectedTech.id)
                      ? '✓ Technology Operational'
                      : !hasPrerequisitesMet(selectedTech)
                        ? '🔒 Requirements Locked'
                        : canAfford(selectedTech)
                          ? '🔬 Initialize Research'
                          : 'Insufficient Resources'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-center flex flex-col justify-center items-center h-full min-h-[500px]">
                <span className="text-4xl">🔭</span>
                <h3 className="font-bold text-foreground mt-3">No Tech Selected</h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-[200px]">Click any node on the technology tree to view details and initiate R&D projects.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
