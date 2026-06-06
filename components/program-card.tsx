'use client';

import { MinistryProgram } from '@/lib/types';
import { useState } from 'react';

interface ProgramCardProps {
  program: MinistryProgram;
  ministryId: string;
  ministryBudget: number;
  onExecute: (ministryId: string, programId: string) => void;
  loading?: boolean;
}

export function ProgramCard({ program, ministryId, ministryBudget, onExecute, loading }: ProgramCardProps) {
  const canExecute = ministryBudget >= program.budget_required && program.status === 'pending';
  const successPercentage = Math.round(program.success_rate * 100);

  return (
    <div className={`border rounded-lg p-4 ${
      program.status === 'success' ? 'bg-green-900/20 border-green-600' :
      program.status === 'failed' ? 'bg-red-900/20 border-red-600' :
      'bg-card border-border hover:border-primary/50 transition-colors'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm text-foreground">{program.name}</h4>
        <span className={`text-xs px-2 py-1 rounded font-mono ${
          program.status === 'success' ? 'bg-green-600/30 text-green-300' :
          program.status === 'failed' ? 'bg-red-600/30 text-red-300' :
          program.status === 'executing' ? 'bg-blue-600/30 text-blue-300' :
          'bg-amber-600/30 text-amber-300'
        }`}>
          {program.status.toUpperCase()}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{program.description}</p>

      <div className="space-y-2 mb-3 text-xs">
        <div className="flex justify-between">
          <span>Budget Required:</span>
          <span className="font-mono">₹{program.budget_required}B</span>
        </div>
        <div className="flex justify-between">
          <span>Success Rate:</span>
          <span className={`font-mono ${program.success_rate >= 0.7 ? 'text-green-400' : program.success_rate >= 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>
            {successPercentage}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Morale Impact:</span>
          <span className={`font-mono ${program.morale_impact > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {program.morale_impact > 0 ? '+' : ''}{program.morale_impact}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Efficiency Gain:</span>
          <span className="font-mono text-blue-400">+{program.efficiency_gain}</span>
        </div>
      </div>

      {program.status === 'success' && (
        <div className="bg-green-600/20 border border-green-600/30 rounded p-2 mb-3">
          <p className="text-xs text-green-300 font-semibold">Program Successful!</p>
        </div>
      )}

      {program.status === 'failed' && (
        <div className="bg-red-600/20 border border-red-600/30 rounded p-2 mb-3">
          <p className="text-xs text-red-300 font-semibold">Program Failed</p>
          <p className="text-xs text-red-300 mt-1">Budget lost, morale and efficiency reduced</p>
        </div>
      )}

      {program.status === 'pending' && (
        <button
          onClick={() => onExecute(ministryId, program.id)}
          disabled={!canExecute || loading}
          className={`w-full py-2 rounded font-semibold text-sm transition-all ${
            canExecute
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
          }`}
        >
          {loading ? 'Executing...' : 'Execute Program'}
        </button>
      )}

      {program.status === 'executing' && (
        <div className="w-full py-2 rounded font-semibold text-sm bg-blue-600/30 text-blue-300 text-center">
          Executing...
        </div>
      )}
    </div>
  );
}
