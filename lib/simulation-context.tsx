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

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimulationState | null>(null);
  const [history, setHistory] = useState<HistoricalRecord[]>([]);

  // Initialize on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);

    if (saved) {
      try {
        setState(JSON.parse(saved));
        if (savedHistory) setHistory(JSON.parse(savedHistory));
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

        setHistory((h) => [...h, record].slice(-500)); // Keep last 500 months
        localStorage.setItem(HISTORY_KEY, JSON.stringify([...history, record]));

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

      setHistory((h) => [...h, record].slice(-500));
      localStorage.setItem(HISTORY_KEY, JSON.stringify([...history, record]));

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
        setState(JSON.parse(saved));
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedHistory) setHistory(JSON.parse(savedHistory));
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
