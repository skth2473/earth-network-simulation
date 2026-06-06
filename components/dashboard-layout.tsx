'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SimulationControls } from './simulation-controls';
import { useSimulation } from '@/lib/simulation-context';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: '📊', key: 'overview' },
  { href: '/india', label: 'India Ministry', icon: '🏛️', key: 'india', lockKey: 'india' },
  { href: '/nlec', label: 'Livestock System', icon: '🐄', key: 'nlec', lockKey: 'livestock' },
  { href: '/earth-network', label: 'Earth Network', icon: '🌍', key: 'earth', lockKey: 'earth_network' },
  { href: '/energy', label: 'Energy System', icon: '⚡', key: 'energy', lockKey: 'energy' },
  { href: '/treasury', label: 'Treasury & SWF', icon: '💰', key: 'treasury', lockKey: 'india' },
  { href: '/space', label: 'Space Program', icon: '🚀', key: 'space', lockKey: 'space' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { state } = useSimulation();

  const isLocked = (item: typeof NAV_ITEMS[0]) => {
    if (!item.lockKey || item.lockKey === 'india') return false;
    const unlocks = state.unlock_system;
    return !unlocks[item.lockKey as keyof typeof unlocks];
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <nav className="w-56 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Earth Network</h1>
          <p className="text-xs text-muted-foreground">Tier-Based Progression</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const locked = isLocked(item);
            return (
              <Link
                key={item.href}
                href={locked ? '#' : item.href}
                onClick={(e) => locked && e.preventDefault()}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : locked
                    ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {locked && <span className="ml-auto text-xs">🔒</span>}
              </Link>
            );
          })}
        </div>

        <div className="p-3 border-t border-border">
          <SimulationControls />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
