import { SimulationState, MinistryProgram } from './types';
import { MINISTRY_PROGRAMS } from './ministry-programs';

/**
 * Execute a ministry program with success/failure mechanics
 * Failure: lose 20-40% of allocated budget + morale -15-25 + efficiency -5-20
 * Success: gain benefits from the program
 */
export function executeProgram(
  state: SimulationState,
  ministryId: string,
  programId: string
): { state: SimulationState; success: boolean; message: string } {
  const newState = JSON.parse(JSON.stringify(state)) as SimulationState;
  const ministry = newState.india.ministries.find(m => m.id === ministryId);
  if (!ministry) {
    return { state, success: false, message: 'Ministry not found' };
  }

  const program = ministry.programs?.find(p => p.id === programId);
  if (!program) {
    return { state, success: false, message: 'Program not found' };
  }

  if (program.status !== 'pending') {
    return { state, success: false, message: 'Program is not pending' };
  }

  // Check if ministry has enough budget
  if (ministry.allocation < program.budget_required) {
    return { state, success: false, message: 'Insufficient budget allocated' };
  }

  // Pay budget upfront and transition to executing state
  ministry.allocation -= program.budget_required;
  program.status = 'executing';
  
  // Apply Minister speed skills if assigned
  let duration = program.time_required || 45;
  if (ministry.assigned_minister === 'bhabha' && ministry.id === 'it') duration = Math.round(duration * 0.7); // Bhabha: 30% speedup
  else if (ministry.assigned_minister === 'azad' && ministry.id === 'education') duration = Math.round(duration * 0.75); // Azad: 25% speedup
  else if (ministry.assigned_minister === 'kaur' && ministry.id === 'health') duration = Math.round(duration * 0.75); // Kaur: 25% speedup
  else if (ministry.assigned_minister === 'patel' && (ministry.id === 'defence' || ministry.id === 'finance')) duration = Math.round(duration * 0.8); // Patel: 20% speedup
  
  // Apply VIP level speed buffs (5% speedup per level above 1, max 50%)
  if (newState.india.vip_level && newState.india.vip_level > 1) {
    const vip_speed_factor = 1 - (newState.india.vip_level - 1) * 0.05;
    duration = Math.round(duration * Math.max(0.5, vip_speed_factor));
  }

  program.time_remaining = duration;

  return {
    state: newState,
    success: true,
    message: `${program.name} execution started! Real-time countdown initiated.`,
  };
}

/**
 * Resolve a program once its countdown finishes (roll success or failure)
 */
export function completeProgram(
  state: SimulationState,
  ministryId: string,
  programId: string
): { state: SimulationState; success: boolean; message: string } {
  const newState = JSON.parse(JSON.stringify(state)) as SimulationState;
  const ministry = newState.india.ministries.find(m => m.id === ministryId);
  if (!ministry) {
    return { state, success: false, message: 'Ministry not found' };
  }

  const program = ministry.programs?.find(p => p.id === programId);
  if (!program) {
    return { state, success: false, message: 'Program not found' };
  }

  if (program.status !== 'executing') {
    return { state, success: false, message: 'Program is not currently executing' };
  }

  // Roll success/failure (apply VIP and minister buffs to success rate)
  let base_success_rate = program.success_rate;
  
  // Buffs:
  // 1. VIP Level: +2% success rate per VIP level
  const vip_buff = (newState.india.vip_level || 1) * 0.02;
  base_success_rate = Math.min(0.95, base_success_rate + vip_buff);

  // 2. Assigned Minister buffs:
  if (ministry.assigned_minister === 'nehru') {
    base_success_rate = Math.min(0.95, base_success_rate + 0.05); // Nehru boosts success rate of all programs by 5%
  } else if (ministry.assigned_minister === 'azad' && ministry.id === 'education') {
    base_success_rate = Math.min(0.95, base_success_rate + 0.15); // Azad boosts education success by 15%
  } else if (ministry.assigned_minister === 'kaur' && ministry.id === 'health') {
    base_success_rate = Math.min(0.95, base_success_rate + 0.15); // Kaur boosts health success by 15%
  }

  const success = Math.random() < base_success_rate;

  if (success) {
    // Success path
    program.status = 'success';
    
    // Minister buffs on impact:
    let morale_mod = program.morale_impact;
    let eff_mod = program.efficiency_gain;
    
    if (ministry.assigned_minister === 'patel' && (ministry.id === 'defence' || ministry.id === 'finance')) {
      eff_mod = Math.round(eff_mod * 1.25); // Patel gives +25% efficiency gains
    }

    ministry.morale = Math.min(0.95, ministry.morale + morale_mod * 0.01);
    ministry.efficiency = Math.min(0.95, ministry.efficiency + eff_mod * 0.005);
    
    // Partially refund budget on success
    ministry.allocation += program.budget_required * 0.3;

    // Gain VIP points on success (50 points)
    if (newState.india.vip_points !== undefined) {
      newState.india.vip_points += 50;
      // Level up VIP if points reach target: level * 200
      const target = (newState.india.vip_level || 1) * 200;
      if (newState.india.vip_points >= target) {
        newState.india.vip_points -= target;
        newState.india.vip_level = (newState.india.vip_level || 1) + 1;
        newState.nlec.logs = [`VIP LEVEL UP! Reached VIP Level ${newState.india.vip_level}.`, ...(newState.nlec.logs || [])].slice(0, 5);
      }
    }

    return {
      state: newState,
      success: true,
      message: `${program.name} succeeded! Morale +${morale_mod}, Efficiency +${eff_mod}`,
    };
  } else {
    // Failure path
    program.status = 'failed';
    const morale_loss = 12 + Math.random() * 8; // 12-20 morale loss
    const efficiency_loss = 4 + Math.random() * 10; // 4-14 efficiency loss

    ministry.morale = Math.max(0.3, ministry.morale - morale_loss * 0.01);
    ministry.efficiency = Math.max(0.5, ministry.efficiency - efficiency_loss * 0.005);

    return {
      state: newState,
      success: false,
      message: `${program.name} FAILED! Morale -${morale_loss.toFixed(0)}, Efficiency -${efficiency_loss.toFixed(1)}`,
    };
  }
}

/**
 * Check unlock conditions and update unlock system
 */
export function updateUnlockSystem(state: SimulationState): SimulationState {
  const newState = JSON.parse(JSON.stringify(state)) as SimulationState;
  const unlock = newState.unlock_system;

  // Livestock unlock: when avg ministry morale >= 70%
  const avg_morale = newState.india.ministries.reduce((sum, m) => sum + m.morale, 0) / newState.india.ministries.length;
  unlock.livestock_unlock_progress = Math.min(100, avg_morale * 100 / 70);

  if (avg_morale >= 0.7 && !unlock.livestock) {
    unlock.livestock = true;
    console.log('[v0] Livestock system unlocked!');
  }

  // Energy unlock: when livestock on earth 10001 reaches 60% coverage
  const earth_10001 = newState.earth_network.earths.find(e => e.id === 'earth_10001');
  if (earth_10001) {
    // Get livestock coverage from NLEC data
    const livestock_coverage = calculateLivestockCoverage(newState);
    if (livestock_coverage >= 60 && !unlock.energy) {
      unlock.energy = true;
      console.log('[v0] Energy system unlocked!');
    }
  }

  // Agriculture unlock: when energy is unlocked
  if (unlock.energy && !unlock.agriculture) {
    unlock.agriculture = true;
    console.log('[v0] Agriculture system unlocked!');
  }

  // Earth Network unlock: when agriculture is unlocked
  if (unlock.agriculture && !unlock.earth_network) {
    unlock.earth_network = true;
    console.log('[v0] Earth Network system unlocked!');
  }

  // Space unlock: when earth network is unlocked
  if (unlock.earth_network && !unlock.space) {
    unlock.space = true;
    console.log('[v0] Space program unlocked!');
  }

  return newState;
}

/**
 * Calculate livestock coverage percentage for Earth 10001
 */
export function calculateLivestockCoverage(state: SimulationState): number {
  if (state.nlec.livestock.length === 0) return 0;

  // Simple approach: coverage is based on total livestock relative to initial target
  const total_livestock = state.nlec.livestock.reduce((sum, l) => sum + l.count, 0);
  const initial_target = 1000 + 500 + 5000; // Cattle + Goats + Poultry initial (including male & female)
  return Math.min(100, (total_livestock / initial_target) * 100);
}

/**
 * Initialize ministry programs for a ministry
 */
export function initializeMinistryPrograms(ministryId: string): MinistryProgram[] {
  const programData = MINISTRY_PROGRAMS[ministryId] || [];
  return programData.map(p => {
    // Randomize duration between 30 and 120 seconds
    const duration = 30 + Math.floor(Math.random() * 90);
    return {
      ...p,
      execution_month: (new Date().getMonth() + p.execution_month) % 12,
      status: 'pending' as const,
      time_required: duration,
      time_remaining: duration,
    };
  });
}

/**
 * Auto-execute programs at scheduled months
 */
export function autoExecuteScheduledPrograms(state: SimulationState): SimulationState {
  const newState = JSON.parse(JSON.stringify(state)) as SimulationState;

  newState.india.ministries.forEach(ministry => {
    if (!ministry.programs) return;

    ministry.programs.forEach(program => {
      // Auto-execute if month matches and status is pending
      if (program.execution_month === newState.current_month && program.status === 'pending') {
        const result = executeProgram(newState, ministry.id, program.id);
        // Program status is already updated in place
      }
    });
  });

  return newState;
}
