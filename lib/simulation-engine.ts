import { SimulationState, Ministry, HistoricalRecord } from './types';
import { initializeMinistryPrograms, updateUnlockSystem, autoExecuteScheduledPrograms } from './program-mechanics';

// Ministry definitions with proper IDs matching program data
const MINISTRY_DEFINITIONS = [
  { id: 'defence', name: 'Defence', budget: 800, allocation: 60, staffing: 85, efficiency: 0.85, morale: 0.75, research: 0.4 },
  { id: 'education', name: 'Education', budget: 600, allocation: 50, staffing: 80, efficiency: 0.75, morale: 0.65, research: 0.3 },
  { id: 'health', name: 'Health', budget: 550, allocation: 45, staffing: 75, efficiency: 0.7, morale: 0.6, research: 0.5 },
  { id: 'finance', name: 'Finance', budget: 400, allocation: 35, staffing: 70, efficiency: 0.9, morale: 0.8, research: 0.2 },
  { id: 'commerce', name: 'Commerce', budget: 400, allocation: 30, staffing: 60, efficiency: 0.82, morale: 0.72, research: 0.2 },
  { id: 'it', name: 'IT & Digital', budget: 700, allocation: 60, staffing: 85, efficiency: 0.85, morale: 0.85, research: 0.9 },
  { id: 'power', name: 'Power', budget: 700, allocation: 55, staffing: 78, efficiency: 0.88, morale: 0.75, research: 0.6 },
  { id: 'water', name: 'Water Resources', budget: 450, allocation: 40, staffing: 65, efficiency: 0.75, morale: 0.65, research: 0.3 },
  { id: 'railways', name: 'Railways', budget: 650, allocation: 50, staffing: 82, efficiency: 0.78, morale: 0.68, research: 0.25 },
  { id: 'roads', name: 'Road Transport', budget: 600, allocation: 45, staffing: 75, efficiency: 0.72, morale: 0.6, research: 0.25 },
  { id: 'aviation', name: 'Aviation', budget: 400, allocation: 35, staffing: 60, efficiency: 0.8, morale: 0.75, research: 0.4 },
  { id: 'shipping', name: 'Shipping', budget: 350, allocation: 30, staffing: 55, efficiency: 0.75, morale: 0.7, research: 0.3 },
  { id: 'labour', name: 'Labour', budget: 300, allocation: 25, staffing: 50, efficiency: 0.68, morale: 0.58, research: 0.15 },
  { id: 'social_justice', name: 'Social Justice', budget: 500, allocation: 40, staffing: 70, efficiency: 0.72, morale: 0.65, research: 0.1 },
  { id: 'environment', name: 'Environment', budget: 350, allocation: 30, staffing: 55, efficiency: 0.7, morale: 0.55, research: 0.4 },
  { id: 'consumer_affairs', name: 'Consumer Affairs', budget: 250, allocation: 20, staffing: 45, efficiency: 0.75, morale: 0.65, research: 0.15 },
  { id: 'agriculture', name: 'Agriculture', budget: 500, allocation: 40, staffing: 70, efficiency: 0.8, morale: 0.7, research: 0.35 },
  { id: 'rural_development', name: 'Rural Development', budget: 400, allocation: 35, staffing: 65, efficiency: 0.65, morale: 0.6, research: 0.2 },
];

// Initialize default simulation state
export function initializeSimulation(): SimulationState {
  const initialMinistries: Ministry[] = MINISTRY_DEFINITIONS.map(m => ({
    id: m.id,
    name: m.name,
    budget: m.budget,
    allocation: m.allocation,
    staffing: m.staffing,
    efficiency: m.efficiency,
    morale: m.morale,
    research: m.research,
    impact: m.efficiency * 0.6 + m.research * 0.4 * m.morale,
    programs: initializeMinistryPrograms(m.id),
  }));

  return {
    india: {
      gdp: 3500,
      population: 1500,
      literacy: 0.75,
      healthcare: 0.7,
      infrastructure: 0.72,
      corruption: 0.35,
      tax_collection: 0.82,
      ministries: initialMinistries,
      month: 1,
      year: 2050,
    },
    nlec: {
      total_livestock: 6100,
      feed_storage: 5000,
      feed_production: 500,
      food_output: 10370,
      profit: 150000,
      livestock: [
        { species: 'Cattle', count_male: 400, count_female: 600, count: 1000, feed_required: 500, reproduction_rate: 0.08, health: 0.85, productivity: 0.8, coverage_percentage: 100 },
        { species: 'Goats', count_male: 225, count_female: 275, count: 500, feed_required: 150, reproduction_rate: 0.15, health: 0.9, productivity: 0.75, coverage_percentage: 100 },
        { species: 'Poultry', count_male: 2500, count_female: 2500, count: 5000, feed_required: 250, reproduction_rate: 0.25, health: 0.8, productivity: 0.85, coverage_percentage: 100 },
      ],
    },
    earth_network: {
      total_civilizations: 5,
      network_stability: 0.78,
      total_population: 5000,
      average_happiness: 0.72,
      trade_volume: 15000,
      conflict_level: 0.15,
      earths: Array.from({ length: 5 }, (_, i) => {
        const earthNum = 10001 + i;
        return {
          id: `earth_${earthNum}`,
          name: `Earth #${earthNum}`,
          population: 800 + Math.floor(Math.random() * 400),
          development_level: 0.3 + Math.random() * 0.3,
          technology_tier: Math.floor(Math.random() * 3) + 1,
          happiness: 0.6 + Math.random() * 0.2,
          resources: 2000 + Math.floor(Math.random() * 2000),
          infrastructure: 0.4 + Math.random() * 0.3,
          research_progress: Math.random() * 50,
          status: ['discovered', 'colonizing', 'established'][Math.floor(Math.random() * 3)] as any,
        };
      }),
    },
    energy: {
      energy_produced: 2500,
      energy_consumed: 2200,
      surplus: 300,
      efficiency: 0.88,
      solar_output: 1000,
      wind_output: 800,
      nuclear_output: 700,
      storage: 500,
      trading_agreements: 45,
    },
    swf: {
      balance: 500000,
      monthly_contribution: 15000,
      returns_ytd: 28000,
      allocation_to_space: 0.4,
      allocation_to_infrastructure: 0.35,
      allocation_to_research: 0.25,
      total_invested: 450000,
    },
    space: {
      colonized_planets: 12,
      ships_in_transit: 8,
      research_tier: 6,
      resources_invested: 200000,
      successful_missions: 28,
      failed_missions: 5,
      total_expansion_value: 350000,
    },
    current_month: 1,
    current_year: 2050,
    simulation_speed: 'paused',
    unlock_system: {
      india: true,
      livestock: false,
      energy: false,
      agriculture: false,
      earth_network: false,
      space: false,
      livestock_unlock_progress: 0,
    },
  };
}

export function simulateMonth(state: SimulationState): SimulationState {
  let newState = JSON.parse(JSON.stringify(state)) as SimulationState;

  // Auto-execute scheduled programs
  newState = autoExecuteScheduledPrograms(newState);

  // India simulation
  const total_ministry_impact = newState.india.ministries.reduce((sum, m) => sum + m.impact, 0) / newState.india.ministries.length;
  const corruption_factor = 1 - newState.india.corruption * 0.3;
  const gdp_growth = (total_ministry_impact * 0.05 + (Math.random() - 0.5) * 0.02) * corruption_factor;
  newState.india.gdp *= 1 + gdp_growth;

  const pop_growth = (0.012 + newState.india.healthcare * 0.005 - newState.india.corruption * 0.003 + (Math.random() - 0.5) * 0.005);
  newState.india.population *= 1 + pop_growth;

  newState.india.literacy = Math.min(0.99, newState.india.literacy + 0.001);
  newState.india.healthcare = Math.min(0.99, newState.india.healthcare + 0.0008);
  newState.india.infrastructure = Math.min(0.99, newState.india.infrastructure + 0.001);
  newState.india.corruption = Math.max(0.1, newState.india.corruption - 0.002);

  // Ministry updates
  newState.india.ministries = newState.india.ministries.map(m => {
    const morale_change = (m.efficiency - 0.7) * 0.01 + (Math.random() - 0.5) * 0.02;
    const efficiency_change = m.morale * 0.005 + (Math.random() - 0.5) * 0.02;
    const research_change = (m.efficiency - 0.6) * 0.03;

    return {
      ...m,
      morale: Math.max(0.3, Math.min(0.95, m.morale + morale_change)),
      efficiency: Math.max(0.5, Math.min(0.95, m.efficiency + efficiency_change)),
      research: Math.max(0, Math.min(1, m.research + research_change)),
      impact: (m.efficiency * 0.6 + m.research * 0.4) * m.morale,
    };
  });

  // NLEC simulation
  const feed_used = newState.nlec.livestock.reduce((sum, l) => sum + l.feed_required, 0);
  newState.nlec.feed_storage -= feed_used;
  newState.nlec.feed_storage += newState.nlec.feed_production;

  newState.nlec.livestock = newState.nlec.livestock.map(l => {
    const health_change = (newState.nlec.feed_storage > 500 ? 0.01 : -0.02) + (Math.random() - 0.5) * 0.02;
    const new_count = l.count * (1 + l.reproduction_rate * (l.health - 0.5) * 0.2);
    const productivity_change = l.health * 0.02 - 0.01;

    return {
      ...l,
      count: Math.max(10, new_count),
      health: Math.max(0.4, Math.min(0.95, l.health + health_change)),
      productivity: Math.max(0.3, Math.min(0.95, l.productivity + productivity_change)),
    };
  });

  newState.nlec.total_livestock = newState.nlec.livestock.reduce((sum, l) => sum + l.count, 0);
  newState.nlec.food_output = newState.nlec.total_livestock * 1.7 * newState.nlec.livestock.reduce((avg, l) => avg + l.productivity, 0) / newState.nlec.livestock.length;
  newState.nlec.profit = (newState.nlec.food_output * 29.41 - feed_used * 10);

  // Earth Network simulation
  const conflict_change = (Math.random() - 0.5) * 0.05;
  newState.earth_network.conflict_level = Math.max(0, Math.min(1, newState.earth_network.conflict_level + conflict_change));
  newState.earth_network.network_stability = 1 - newState.earth_network.conflict_level * 0.3;

  newState.earth_network.earths = newState.earth_network.earths.map(earth => {
    const dev_growth = (earth.status === 'discovered' ? 0.05 : earth.status === 'colonizing' ? 0.08 : earth.status === 'established' ? 0.03 : 0.02);
    const pop_growth_earth = 0.015 * (earth.development_level + 0.5);

    let new_status = earth.status;
    if (earth.status === 'discovered' && earth.development_level > 0.3) new_status = 'colonizing';
    if (earth.status === 'colonizing' && earth.development_level > 0.6) new_status = 'established';
    if (earth.status === 'established' && earth.development_level > 0.85) new_status = 'thriving';

    return {
      ...earth,
      population: earth.population * (1 + pop_growth_earth),
      development_level: Math.min(0.99, earth.development_level + dev_growth),
      technology_tier: earth.technology_tier + (earth.research_progress > 90 ? 1 : 0),
      happiness: Math.max(0.2, Math.min(0.95, earth.happiness + (Math.random() - 0.5) * 0.1)),
      resources: earth.resources * 1.02 + earth.population * 0.1,
      infrastructure: Math.min(0.99, earth.infrastructure + 0.005),
      research_progress: Math.max(0, Math.min(100, earth.research_progress + Math.random() * 3)),
      status: new_status,
    };
  });

  newState.earth_network.total_population = newState.earth_network.earths.reduce((sum, e) => sum + e.population, 0);
  newState.earth_network.average_happiness = newState.earth_network.earths.reduce((sum, e) => sum + e.happiness, 0) / newState.earth_network.earths.length;

  // Energy simulation
  const consumption_growth = (Math.random() - 0.5) * 0.05 + 0.02;
  const production_growth = (Math.random() - 0.5) * 0.04 + 0.015;

  newState.energy.energy_consumed = newState.energy.energy_consumed * (1 + consumption_growth);
  newState.energy.energy_produced = newState.energy.energy_produced * (1 + production_growth);
  newState.energy.surplus = newState.energy.energy_produced - newState.energy.energy_consumed;
  newState.energy.storage = Math.max(0, Math.min(2000, newState.energy.storage + newState.energy.surplus * 0.1));

  // SWF simulation
  const investment_return = newState.swf.total_invested * 0.0015;
  newState.swf.returns_ytd += investment_return;
  newState.swf.balance = newState.swf.balance + newState.swf.monthly_contribution + investment_return;
  newState.swf.total_invested = Math.min(newState.swf.balance * 0.9, newState.swf.total_invested * 1.005);

  // Space simulation
  const mission_success = Math.random() > 0.15;
  if (mission_success && newState.space.ships_in_transit > 0) {
    newState.space.successful_missions += 1;
    newState.space.ships_in_transit -= 1;
    if (Math.random() > 0.5) newState.space.colonized_planets += 1;
  } else if (!mission_success && newState.space.ships_in_transit > 0) {
    newState.space.failed_missions += 1;
    newState.space.ships_in_transit = Math.max(0, newState.space.ships_in_transit - 1);
  }

  newState.space.total_expansion_value = newState.space.colonized_planets * 20000 + newState.space.successful_missions * 5000;
  newState.space.research_tier = Math.min(10, newState.space.research_tier + (newState.swf.balance > 400000 ? 0.01 : 0));

  // Advance time
  newState.current_month += 1;
  if (newState.current_month > 12) {
    newState.current_month = 1;
    newState.current_year += 1;
  }

  // Check unlock conditions
  newState = updateUnlockSystem(newState);

  return newState;
}

export function createHistoricalRecord(state: SimulationState): HistoricalRecord {
  return {
    month: state.current_month,
    year: state.current_year,
    timestamp: Date.now(),
    india_gdp: state.india.gdp,
    india_population: state.india.population,
    network_population: state.earth_network.total_population,
    average_earth_happiness: state.earth_network.average_happiness,
    energy_surplus: state.energy.surplus,
    swf_balance: state.swf.balance,
    space_planets: state.space.colonized_planets,
  };
}
