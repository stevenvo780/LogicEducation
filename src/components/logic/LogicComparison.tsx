"use client";

import React, { useState, useMemo } from 'react';
import { LogicParser } from '@/lib/logic/parser';
import { areEquivalent, getCounterModels } from '@/lib/logic/analyzer';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LogicComparison = () => {
  const [formula1, setFormula1] = useState('p -> q');
  const [formula2, setFormula2] = useState('~p | q');

  const comparison = useMemo(() => {
    try {
      if (!formula1.trim() || !formula2.trim()) return null;

      const parser = new LogicParser();
      const f1 = parser.parse(formula1);
      const f2 = parser.parse(formula2);

      const equivalent = areEquivalent(f1, f2);

      let counterExamples: Record<string, boolean>[] = [];
      if (!equivalent) {
        // Find counter examples where values differ
        // We can use getCounterModels of (f1 <-> f2) effectively
        // The areEquivalent checks if (f1 <-> f2) is a tautology.
        // If not, the counter models of (f1 <-> f2) are the cases where they differ.
        const biconditional = {
          type: 'BINARY' as const,
          operator: 'IFF' as const,
          left: f1,
          right: f2
        };
        counterExamples = getCounterModels(biconditional);
      }

      return {
        equivalent,
        counterExamples: counterExamples.slice(0, 5),
        error: null
      };

    } catch (e: unknown) {
      return { error: (e as Error).message };
    }
  }, [formula1, formula2]);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Input 1 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Fórmula A</label>
          <input
            type="text"
            value={formula1}
            onChange={(e) => setFormula1(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 font-mono text-lg text-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all"
            placeholder="p -> q"
          />
        </div>

        {/* Divider / Icon */}
        <div className="flex justify-center md:pt-6">
          <div className="bg-white/5 rounded-full p-3">
            <ArrowRightLeft className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Input 2 */}
        <div className="space-y-2 md:col-start-2">
          <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Fórmula B</label>
          <input
            type="text"
            value={formula2}
            onChange={(e) => setFormula2(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 font-mono text-lg text-white focus:border-[var(--secondary)] focus:ring-1 focus:ring-[var(--secondary)] outline-none transition-all"
            placeholder="~p | q"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {comparison?.error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="font-mono text-sm">{comparison.error}</span>
          </motion.div>
        ) : comparison ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "rounded-2xl p-8 text-center border overflow-hidden relative",
              comparison.equivalent
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-rose-500/10 border-rose-500/20"
            )}
          >
            <div className="relative z-10 flex flex-col items-center gap-4">
              {comparison.equivalent ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-400">¡Son Equivalentes!</h3>
                  <p className="text-emerald-200/60 max-w-md mx-auto">
                    Las dos fórmulas tienen exactamente la misma tabla de verdad. Son lógicamente indistinguibles.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
                    <XCircle className="w-8 h-8 text-rose-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-rose-400">No son Equivalentes</h3>
                  <p className="text-rose-200/60 max-w-md mx-auto mb-6">
                    Existen asignaciones de verdad donde las fórmulas dan resultados diferentes.
                  </p>

                  {/* Counter Examples Table */}
                  <div className="bg-black/40 rounded-xl border border-white/5 p-4 max-w-md w-full">
                    <div className="text-xs font-semibold text-gray-400 uppercase mb-3 text-left">Contraejemplos (Donde difieren)</div>
                    <div className="space-y-2">
                      {comparison.counterExamples?.map((model, idx) => (
                        <div key={idx} className="flex flex-wrap gap-2 items-center bg-white/5 rounded px-3 py-2 text-sm font-mono text-gray-300">
                          {Object.entries(model).map(([v, val]) => (
                            <span key={v} className="mr-2">
                              <span className="text-gray-500">{v}=</span>
                              <span className={val ? 'text-emerald-400' : 'text-rose-400'}>{val ? 'V' : 'F'}</span>
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
