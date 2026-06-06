# Earth Network Simulation Dashboard

A comprehensive grand-strategy simulation dashboard for managing interconnected systems across parallel civilizations. Control India's government ministries, manage livestock production, oversee an Earth Network of 1000 civilizations, monitor energy production, track treasury investments, and expand into space.

## Features

### Dashboard Modules

1. **Overview Dashboard** - High-level metrics and trends across all systems
   - India GDP, population, and national statistics
   - Earth Network population and stability
   - Energy surplus and trading metrics
   - Space colonization progress
   - Multi-system trend charts

2. **India Ministry Dashboard** - Manage 18 government ministries
   - Budget allocation for Defense, Education, Healthcare, Energy, etc.
   - Track ministry efficiency, morale, research, and impact
   - Monitor national development metrics (literacy, infrastructure, corruption)
   - Adjust spending to influence outcomes

3. **Livestock & Food Production System (NLEC)**
   - Manage cattle, goats, and poultry populations
   - Monitor feed storage and food output
   - Track profitability and system health
   - View species-by-species statistics and trends

4. **Earth Network Civilization Dashboard**
   - Oversee 1000 parallel civilization Earths
   - Track development status (discovered, colonizing, established, thriving)
   - Monitor population, happiness, and technology tiers
   - View compact grid of all worlds or detailed featured civilizations

5. **Energy Production & Distribution System**
   - Monitor solar, wind, and nuclear power generation
   - Track energy consumption and surplus
   - Manage energy storage and trading agreements
   - Analyze source mix and supply vs demand

6. **Treasury & Sovereign Wealth Fund (SWF)**
   - Manage national finances and long-term investments
   - Track SWF balance, returns, and allocations
   - Monitor fund distribution to space, infrastructure, and research
   - View cash flow and investment performance

7. **Space Program**
   - Track colonized planets and ships in transit
   - Monitor mission success rates
   - View research tier advancement
   - Track expansion value and resources invested

## Simulation Engine

The dashboard features a **realistic monthly simulation** that models complex interactions:

- **India Economic Model**: GDP growth influenced by ministry impact, corruption, and random events
- **Population Dynamics**: Growth rates affected by healthcare, corruption, and infrastructure
- **Ministry Management**: Each ministry's efficiency and morale influence national development
- **NLEC System**: Livestock reproduction, feed consumption, and productivity calculations
- **Earth Network**: Civilization progression through development stages with happiness and resource generation
- **Energy Grid**: Supply/demand balancing with efficiency calculations
- **Finance**: Treasury returns, SWF growth, and allocation management
- **Space Expansion**: Mission success probability, planet colonization, and research advancement

## Controls

### Simulation Speed
- **Paused**: No automatic simulation (manual step-forward only)
- **Normal**: Monthly simulation every 2 seconds
- **Fast**: Monthly simulation every 800ms
- **Ultra**: Monthly simulation every 200ms

### Actions
- **Step Forward**: Manually advance one month
- **Save**: Save current game state to localStorage
- **Load**: Load previously saved game state
- **Reset**: Clear all progress and start fresh

## Data Persistence

- All game state is automatically saved to browser localStorage
- Save/Load functionality allows multiple playthroughs
- Historical data tracks trends over 500+ months

## Technology Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS with custom dark theme
- **Charts**: Recharts for trend visualization
- **State Management**: React Context API with localStorage
- **Type Safety**: TypeScript for all models and components

## Color Scheme

Professional dark theme optimized for data-heavy interface:
- **Background**: Dark navy (`oklch(0.11 0 0)`)
- **Cards**: Slightly lighter navy (`oklch(0.155 0 0)`)
- **Primary**: Purple accent (`oklch(0.488 0.243 264.376)`)
- **Secondary Accent**: Warm orange (`oklch(0.55 0.15 40)`)
- **Text**: Light gray for readability

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run development server**:
   ```bash
   pnpm dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

4. **Interact with dashboard**:
   - Start the simulation with Normal speed
   - Watch metrics update in real-time
   - Click navigation items to explore different systems
   - Adjust ministry budgets or observation settings
   - Save/load your progress as needed

## File Structure

```
/app
  /layout.tsx              # Root layout with SimulationProvider
  /page.tsx                # Overview dashboard
  /india/page.tsx          # India ministry dashboard
  /nlec/page.tsx           # Livestock system dashboard
  /earth-network/page.tsx  # Civilization dashboard
  /energy/page.tsx         # Energy production dashboard
  /treasury/page.tsx       # Finance & SWF dashboard
  /space/page.tsx          # Space program dashboard

/components
  /dashboard-layout.tsx    # Sidebar navigation and layout
  /kpi-card.tsx           # Key performance indicator card
  /ministry-grid.tsx      # Grid view of ministries
  /earth-grid.tsx         # Grid view of civilizations
  /trend-chart.tsx        # Line chart for historical trends
  /simulation-controls.tsx # Speed controls and actions

/lib
  /types.ts               # TypeScript interfaces
  /simulation-engine.ts   # Core simulation logic
  /simulation-context.tsx # React context provider
```

## Key Metrics

### India System
- GDP (Trillion ₹)
- Population (Million)
- Literacy Rate (%)
- Healthcare Index (%)
- Infrastructure (%)
- Corruption Index (%)

### NLEC System
- Total Livestock (count)
- Feed Storage (Million kg)
- Food Output (Million kg)
- Monthly Profit (Million ₹)

### Earth Network
- Total Civilizations (1000)
- Population (Million)
- Average Happiness (%)
- Network Stability (%)
- Conflict Level (%)

### Energy System
- Total Production (TWh)
- Total Consumption (TWh)
- Surplus (TWh)
- System Efficiency (%)
- Energy Storage (TWh)

### Treasury
- SWF Balance (Million ₹)
- Monthly Contribution (Million ₹)
- YTD Returns (Million ₹)
- Total Invested (Million ₹)

### Space
- Colonized Planets
- Ships in Transit
- Research Tier (1-10)
- Success Rate (%)
- Total Expansion Value (Million ₹)

## Future Enhancements

- Policy decision events with consequences
- Trade agreements between Earth civilizations
- Disaster/crisis simulation events
- More detailed ministry research trees
- Technology tree progression
- Environmental impact tracking
- Multiplayer shared simulations
- Database persistence for long-term play
- Advanced analytics and reporting

## License

This project is created with v0.
