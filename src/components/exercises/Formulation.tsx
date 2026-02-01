"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, FileText, HelpCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormulationContent, FormulationSolution } from '@/lib/exercises/exerciseTypes';
import { SymbolPalette } from '@/components/logic/OperatorReference';

interface FormulationExerciseProps {
  content: FormulationContent;
  solution?: FormulationSolution;
  onSubmit: (formula: string) => void;
  isSubmitted?: boolean;
  result?: {
    isCorrect: boolean;
    feedback: string;
  };
  showSolution?: boolean;
  readOnly?: boolean;
}

export const FormulationExercise: React.FC<FormulationExerciseProps> = ({
  content,
  solution,
  onSubmit,
  isSubmitted = false,
  result,
  showSolution = false,
  readOnly = false
}) => {
  const [formula, setFormula] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Insert symbol into formula at cursor position or end
  const insertSymbol = (symbol: string) => {
    if (readOnly || isSubmitted) return;
    setFormula(prev => prev + symbol);
  };

  // Handle submit
  const handleSubmit = () => {
    if (!formula.trim()) return;
    onSubmit(formula.trim());
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Statement */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-[var(--accent)] shrink-0 mt-1" />
          <div>
            <p className="text-sm text-gray-500 mb-2">Traduce a lógica formal:</p>
            <p className="text-xl font-medium text-white leading-relaxed">
              "{content.naturalLanguage}"
            </p>
          </div>
        </div>
      </div>

      {/* Variable Definitions */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-[var(--primary)]/20 text-[var(--primary)] text-xs flex items-center justify-center font-mono">x</span>
          Variables Proposicionales
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(content.variables).map(([variable, meaning]) => (
            <div
              key={variable}
              className="flex items-center gap-3 p-2 rounded-lg bg-black/20"
            >
              <button
                onClick={() => insertSymbol(variable)}
                disabled={readOnly || isSubmitted}
                className={cn(
                  "w-8 h-8 rounded-lg font-mono font-bold text-[var(--primary)] bg-[var(--primary)]/10 transition-all",
                  !readOnly && !isSubmitted && "hover:bg-[var(--primary)]/20 cursor-pointer"
                )}
              >
                {variable}
              </button>
              <span className="text-sm text-gray-300 flex-1">{meaning}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Symbol Palette */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Conectivos Lógicos</h3>
        <div className="flex flex-wrap gap-2">
          {['¬', '∧', '∨', '→', '↔', '(', ')'].map(sym => (
            <button
              key={sym}
              onClick={() => insertSymbol(sym)}
              disabled={readOnly || isSubmitted}
              className={cn(
                "w-10 h-10 rounded-lg font-mono text-xl transition-all",
                "bg-white/5 border border-white/10",
                !readOnly && !isSubmitted && "hover:bg-white/10 hover:border-[var(--primary)]/50"
              )}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-400">Tu Fórmula</h3>
          {content.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-[var(--accent)] hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              {showHint ? 'Ocultar pista' : 'Ver pista'}
            </button>
          )}
        </div>

        <AnimatePresence>
          {showHint && content.hint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-2">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                {content.hint}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <input
            type="text"
            value={formula}
            onChange={(e) => !readOnly && !isSubmitted && setFormula(e.target.value)}
            disabled={readOnly || isSubmitted}
            placeholder="Escribe tu fórmula aquí..."
            className={cn(
              "w-full bg-black/40 border-2 rounded-xl px-4 py-4 font-mono text-xl text-white placeholder-gray-600 outline-none transition-all",
              isSubmitted && result?.isCorrect && "border-emerald-500/50",
              isSubmitted && !result?.isCorrect && "border-rose-500/50",
              !isSubmitted && "border-white/10 focus:border-[var(--primary)]"
            )}
          />
          {formula && !readOnly && !isSubmitted && (
            <button
              onClick={() => setFormula('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Solution display */}
      <AnimatePresence>
        {showSolution && solution && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <p className="text-sm text-gray-400 mb-2">Respuestas aceptadas:</p>
            <div className="flex flex-wrap gap-2">
              {solution.correctFormulas.map((f, i) => (
                <code key={i} className="font-mono text-lg text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded">
                  {f}
                </code>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result feedback */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "p-4 rounded-xl flex items-start gap-3",
              result.isCorrect
                ? "bg-emerald-500/20 border border-emerald-500/30"
                : "bg-rose-500/20 border border-rose-500/30"
            )}
          >
            {result.isCorrect ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <p className={result.isCorrect ? "text-emerald-300" : "text-rose-300"}>
              {result.feedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      {!isSubmitted && !readOnly && (
        <button
          onClick={handleSubmit}
          disabled={!formula.trim()}
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all",
            formula.trim()
              ? "bg-[var(--primary)] hover:bg-indigo-600 text-white"
              : "bg-white/5 text-gray-600 cursor-not-allowed"
          )}
        >
          Enviar Fórmula
        </button>
      )}
    </div>
  );
};

export default FormulationExercise;
