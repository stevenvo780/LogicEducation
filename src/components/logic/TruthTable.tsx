"use client";

import React, { useMemo } from 'react';
import { generateTruthTable } from '@/lib/logic/evaluator';
import { LogicParser } from '@/lib/logic/parser';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TruthTableProps {
  formulaStr: string;
}

export const TruthTable: React.FC<TruthTableProps> = ({ formulaStr }) => {
  const { table, error, isIncomplete } = useMemo(() => {
    try {
      if (!formulaStr.trim()) return { table: null, error: null, isIncomplete: false };

      // Check for common incomplete patterns
      const trimmed = formulaStr.trim();
      const incompletePatterns = [
        /^[~¬]$/,                    // Just negation
        /[\&\|\^]$/,                 // Ends with operator
        /->$/,                       // Ends with arrow
        /<->$/,                      // Ends with biconditional
        /\($/,                       // Unclosed parenthesis
        /^->/,                       // Starts with arrow
        /^<->/,                      // Starts with biconditional
      ];

      if (incompletePatterns.some(p => p.test(trimmed))) {
        return { table: null, error: null, isIncomplete: true };
      }

      const parser = new LogicParser();
      const formula = parser.parse(formulaStr);
      const table = generateTruthTable(formula);
      return { table, error: null, isIncomplete: false };
    } catch (e: unknown) {
      const msg = (e as Error).message;
      // Make error messages more friendly
      let friendlyError = msg;
      if (msg.includes('atom expectation')) {
        friendlyError = 'Falta una variable o expresión. Verifica la sintaxis.';
      } else if (msg.includes('Unexpected token')) {
        friendlyError = 'Símbolo inesperado. Revisa la fórmula.';
      } else if (msg.includes('Unclosed')) {
        friendlyError = 'Paréntesis sin cerrar.';
      }
      return { table: null, error: friendlyError, isIncomplete: false };
    }
  }, [formulaStr]);

  if (isIncomplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-400"
      >
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">Completa la fórmula para ver la tabla...</span>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
      >
        <AlertCircle className="w-5 h-5" />
        <span className="font-mono text-sm">{error}</span>
      </motion.div>
    );
  }

  if (!table) return null;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-card)] shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="grid bg-white/5 border-b border-[var(--glass-border)]"
        style={{ gridTemplateColumns: `repeat(${table.variables.length}, 1fr) 1.5fr` }}>
        {table.variables.map((v) => (
          <div key={v} className="p-4 text-center font-bold text-[var(--accent)] font-mono uppercase tracking-wider text-sm">
            {v}
          </div>
        ))}
        <div className="p-4 text-center font-bold text-[var(--primary)] font-mono uppercase tracking-wider text-sm bg-indigo-500/10">
          Resultado
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[500px] overflow-y-auto">
        {table.rows.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="grid border-b border-[var(--glass-highlight)] last:border-0 hover:bg-white/5 transition-colors group"
            style={{ gridTemplateColumns: `repeat(${table.variables.length}, 1fr) 1.5fr` }}
          >
            {table.variables.map((v) => (
              <div key={v} className="p-3 flex justify-center items-center pointer-events-none">
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  row.assignment[v]
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30 opacity-50"
                )}>
                  {row.assignment[v] ? 'V' : 'F'}
                </span>
              </div>
            ))}

            <div className="p-3 flex justify-center items-center bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors">
              <span className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold border",
                row.result
                  ? "bg-[var(--primary)] text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                  : "bg-gray-800/50 text-gray-500 border-gray-700"
              )}>
                {row.result ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {row.result ? 'VERDADERO' : 'FALSO'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
