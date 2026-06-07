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

  // Check if ministry has enough budget
  if (ministry.allocation < program.budget_required) {
    return { state, success: false, message: 'Insufficient budget allocated' };
  }

  // Determine success/failure
  const success = Math.random() < program.success_rate;

  if (success) {
    // Success path
    program.status = 'success';
    ministry.morale = Math.min(0.95, ministry.morale + program.morale_impact * 0.01);
    ministry.efficiency = Math.min(0.95, ministry.efficiency + program.efficiency_gain * 0.005);
    ministry.allocation -= program.budget_required * 0.5; // Recover some budget on success
    return {
      state: newState,
      success: true,
      message: `${program.name} succeeded! Morale +${program.morale_impact}, Efficiency +${program.efficiency_gain}`,
    };
  } else {
    // Failure path - multi-consequence
    program.status = 'failed';
    const budget_loss = program.budget_required * (0.2 + Math.random() * 0.2); // 20-40% loss
    const morale_loss = 15 + Math.random() * 10; // 15-25 morale loss
    const efficiency_loss = 5 + Math.random() * 15; // 5-20 efficiency loss

    ministry.allocation -= budget_loss;
    ministry.morale = Math.max(0.3, ministry.morale - morale_loss * 0.01);
    ministry.efficiency = Math.max(0.5, ministry.efficiency - efficiency_loss * 0.005);

    return {
      state: newState,
      success: false,
      message: `${program.name} FAILED! Budget lost: ₹${budget_loss.toFixed(0)}, Morale -${morale_loss.toFixed(0)}, Efficiency -${efficiency_loss.toFixed(1)}`,
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
  return programData.map(p => ({
    ...p,
    execution_month: (new Date().getMonth() + p.execution_month) % 12,
    status: 'pending' as const,
  }));
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
