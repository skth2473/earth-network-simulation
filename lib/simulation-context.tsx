'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SimulationState, HistoricalRecord, Ministry } from './types';
import { initializeSimulation, simulateMonth, createHistoricalRecord } from './simulation-engine';

interface SimulationContextType {
  state: SimulationState;
  history: HistoricalRecord[];
  setSpeed: (speed: 'paused' | 'normal' | 'fast' | 'ultra') => void;
  simulateStep: () => void;
  updateMinistry: (ministry: Ministry) => void;
  updateState: (newState: SimulationState) => void;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const STORAGE_KEY = 'earth-network-simulation';
const HISTORY_KEY = 'earth-network-history';

function sanitizeLoadedState(loaded: any): SimulationState {
  if (!loaded) return loaded;
  
  if (!loaded.nlec) {
    loaded.nlec = {
      total_livestock: 6500,
      feed_storage: 5000,
      feed_production: 500,
      food_output: 10370,
      profit: 150000,
      budget: 100000,
      livestock: [],
      upgrades: {
        automated_feeding: false,
        veterinary_care: false,
        genetics_program: false,
        feed_silo_expansion: false,
      },
      logs: ['NLEC Livestock Management System initialized.'],
    };
  }

  if (loaded.nlec.budget === undefined) loaded.nlec.budget = 100000;
  if (!loaded.nlec.upgrades) {
    loaded.nlec.upgrades = {
      automated_feeding: false,
      veterinary_care: false,
      genetics_program: false,
      feed_silo_expansion: false,
    };
  } else {
    if (loaded.nlec.upgrades.automated_feeding === undefined) loaded.nlec.upgrades.automated_feeding = false;
    if (loaded.nlec.upgrades.veterinary_care === undefined) loaded.nlec.upgrades.veterinary_care = false;
    if (loaded.nlec.upgrades.genetics_program === undefined) loaded.nlec.upgrades.genetics_program = false;
    if (loaded.nlec.upgrades.feed_silo_expansion === undefined) loaded.nlec.upgrades.feed_silo_expansion = false;
  }
  if (!loaded.nlec.logs) {
    loaded.nlec.logs = ['NLEC Livestock Management System initialized.'];
  }

  const defaultLivestockData = {
    Cattle: { feeding_quality: 'standard', breeding_mode: 'balanced' },
    Goats: { feeding_quality: 'standard', breeding_mode: 'balanced' },
    Poultry: { feeding_quality: 'standard', breeding_mode: 'balanced' },
  };

  if (Array.isArray(loaded.nlec.livestock)) {
    loaded.nlec.livestock = loaded.nlec.livestock.map((l: any) => {
      const defaults = (defaultLivestockData as any)[l.species] || { feeding_quality: 'standard', breeding_mode: 'balanced' };
      return {
        ...l,
        feeding_quality: l.feeding_quality || defaults.feeding_quality,
        breeding_mode: l.breeding_mode || defaults.breeding_mode,
      };
    });
  }

  return loaded as SimulationState;
}

function sanitizeLoadedHistory(loadedHistory: any[]): HistoricalRecord[] {
  if (!Array.isArray(loadedHistory)) return [];
  return loadedHistory.map((h: any) => {
    return {
      ...h,
      nlec_food_output: h.nlec_food_output !== undefined ? h.nlec_food_output : (h.india_gdp ? h.india_gdp * 10 : 10370),
      nlec_profit: h.nlec_profit !== undefined ? h.nlec_profit : (h.india_gdp ? h.india_gdp * 300 : 150000),
      nlec_total_livestock: h.nlec_total_livestock !== undefined ? h.nlec_total_livestock : 6500,
      nlec_feed_storage: h.nlec_feed_storage !== undefined ? h.nlec_feed_storage : 5000,
    };
  });
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimulationState | null>(null);
  const [history, setHistory] = useState<HistoricalRecord[]>([]);

  // Initialize on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(sanitizeLoadedState(parsed));
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          setHistory(sanitizeLoadedHistory(parsedHistory));
        }
      } catch {
        setState(initializeSimulation());
      }
    } else {
      setState(initializeSimulation());
    }
  }, []);

  // Auto-simulate based on speed
  useEffect(() => {
    if (!state) return;

    if (state.simulation_speed === 'paused') return;

    const intervals: Record<string, number> = {
      normal: 2000,
      fast: 800,
      ultra: 200,
    };

    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev) return prev;
        const newState = simulateMonth(prev);
        const record = createHistoricalRecord(newState);

        setHistory((h) => {
          const nextHistory = [...h, record].slice(-500);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
          return nextHistory;
        });

        return newState;
      });
    }, intervals[state.simulation_speed]);

    return () => clearInterval(interval);
  }, [state?.simulation_speed]);

  const setSpeed = (speed: 'paused' | 'normal' | 'fast' | 'ultra') => {
    setState((prev) => (prev ? { ...prev, simulation_speed: speed } : prev));
  };

  const simulateStep = () => {
    setState((prev) => {
      if (!prev) return prev;
      const newState = simulateMonth(prev);
      const record = createHistoricalRecord(newState);

      setHistory((h) => {
        const nextHistory = [...h, record].slice(-500);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
        return nextHistory;
      });

      return newState;
    });
  };

  const updateMinistry = (ministry: Ministry) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        india: {
          ...prev.india,
          ministries: prev.india.ministries.map((m) =>
            m.id === ministry.id ? ministry : m
          ),
        },
      };
    });
  };

  const updateState = (newState: SimulationState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const saveGame = () => {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      alert('Game saved successfully');
    }
  };

  const loadGame = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(sanitizeLoadedState(parsed));
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          setHistory(sanitizeLoadedHistory(parsedHistory));
        }
        alert('Game loaded successfully');
      } catch {
        alert('Failed to load game');
      }
    }
  };

  const resetGame = () => {
    if (confirm('Are you sure you want to reset the game?')) {
      setState(initializeSimulation());
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(HISTORY_KEY);
    }
  };

  if (!state) return <div className="bg-background text-foreground flex items-center justify-center h-screen">Loading simulation...</div>;

  return (
    <SimulationContext.Provider
      value={{
        state,
        history,
        setSpeed,
        simulateStep,
        updateMinistry,
        updateState,
        saveGame,
        loadGame,
        resetGame,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
}
