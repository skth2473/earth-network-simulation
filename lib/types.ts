// Data models for Earth Network Simulation

export type UnlockTier = 'india' | 'livestock' | 'energy' | 'agriculture' | 'earth_network' | 'space';

export interface MinistryProgram {
  id: string;
  name: string;
  description: string;
  budget_required: number;
  success_rate: number; // 0-1, typically 0.7 (70%)
  morale_impact: number; // positive or negative
  efficiency_gain: number; // positive
  execution_month: number; // month it executes
  status: 'pending' | 'executing' | 'success' | 'failed';
  time_required?: number; // total seconds to complete
  time_remaining?: number; // active countdown in seconds
}

export interface Ministry {
  id: string;
  name: string;
  budget: number;
  allocation: number;
  staffing: number;
  efficiency: number;
  morale: number;
  research: number;
  impact: number;
  programs: MinistryProgram[];
  assigned_minister?: string; // ID of minister assigned to this ministry
}

export interface IndiaState {
  gdp: number;
  population: number;
  literacy: number;
  healthcare: number;
  infrastructure: number;
  corruption: number;
  tax_collection: number;
  ministries: Ministry[];
  month: number;
  year: number;
  vip_level?: number;
  vip_points?: number;
  speedups_available?: number;
  last_chest_claim?: number; // timestamp of last mystery chest claim
}

export interface LivestockData {
  species: string;
  count_male: number;
  count_female: number;
  count: number; // total
  feed_required: number;
  reproduction_rate: number;
  health: number;
  productivity: number;
  coverage_percentage: number; // 0-100%, when reaches 60% unlock energy
  feeding_quality: 'standard' | 'premium' | 'organic';
  breeding_mode: 'controlled' | 'balanced' | 'intensive';
}

export interface NLECUpgrades {
  automated_feeding: boolean; // 15% feed reduction
  veterinary_care: boolean; // +10% base health & faster recovery
  genetics_program: boolean; // +20% reproduction, +15% productivity
  feed_silo_expansion: boolean; // +100M kg/month production
}

export interface NLECSystem {
  total_livestock: number;
  feed_storage: number;
  feed_production: number;
  food_output: number;
  profit: number;
  budget: number; // Accumulated budget for NLEC operations
  livestock: LivestockData[];
  upgrades: NLECUpgrades;
  logs: string[]; // Recent system events
}

export interface CivilizationEarth {
  id: string;
  name: string;
  population: number;
  development_level: number;
  technology_tier: number;
  happiness: number;
  resources: number;
  infrastructure: number;
  research_progress: number;
  status: 'discovered' | 'colonizing' | 'established' | 'thriving';
}

export interface EarthNetwork {
  total_civilizations: number;
  network_stability: number;
  total_population: number;
  average_happiness: number;
  trade_volume: number;
  conflict_level: number;
  earths: CivilizationEarth[];
}

export interface EnergyEarth {
  energy_produced: number;
  energy_consumed: number;
  surplus: number;
  efficiency: number;
  solar_output: number;
  wind_output: number;
  nuclear_output: number;
  storage: number;
  trading_agreements: number;
}

export interface SWFData {
  balance: number;
  monthly_contribution: number;
  returns_ytd: number;
  allocation_to_space: number;
  allocation_to_infrastructure: number;
  allocation_to_research: number;
  total_invested: number;
}

export interface SpaceProgram {
  colonized_planets: number;
  ships_in_transit: number;
  research_tier: number;
  resources_invested: number;
  successful_missions: number;
  failed_missions: number;
  total_expansion_value: number;
}

export interface UnlockSystem {
  india: boolean; // always unlocked
  livestock: boolean; // unlock when avg ministry morale >= 70%
  energy: boolean; // unlock when livestock on earth 10001 reaches 60% coverage
  agriculture: boolean; // unlock when energy unlocked (future expansion)
  earth_network: boolean; // unlock when agriculture unlocked (future expansion)
  space: boolean; // unlock when earth_network unlocked
  livestock_unlock_progress: number; // 0-100, for UI display
}

export interface SimulationState {
  india: IndiaState;
  nlec: NLECSystem;
  earth_network: EarthNetwork;
  energy: EnergyEarth;
  swf: SWFData;
  space: SpaceProgram;
  current_month: number;
  current_year: number;
  simulation_speed: 'paused' | 'normal' | 'fast' | 'ultra';
  unlock_system: UnlockSystem;
}

export interface HistoricalRecord {
  month: number;
  year: number;
  timestamp: number;
  india_gdp: number;
  india_population: number;
  network_population: number;
  average_earth_happiness: number;
  energy_surplus: number;
  swf_balance: number;
  space_planets: number;
  nlec_food_output: number;
  nlec_profit: number;
  nlec_total_livestock: number;
  nlec_feed_storage: number;
}
