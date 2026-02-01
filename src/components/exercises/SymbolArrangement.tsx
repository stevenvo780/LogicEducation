"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Check, X, Shuffle, RotateCcw, Trash2, HelpCircle, Puzzle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SymbolArrangementContent, SymbolArrangementSolution } from '@/lib/exercises/exerciseTypes';
import { CONNECTIVE_SYMBOLS } from '@/lib/logic/operators';

interface SymbolArrangementExerciseProps {
  content: SymbolArrangementContent;
  solution?: SymbolArrangementSolution;
  onSubmit: (formula: string) => void;
  isSubmitted?: boolean;
  result?: {
    isCorrect: boolean;
    feedback: string;
  };
  showSolution?: boolean;
  readOnly?: boolean;
}

interface PlacedSymbol {
  instanceId: string;
  symbolId: string;
  symbol: string;
}

export const SymbolArrangementExercise: React.FC<SymbolArrangementExerciseProps> = ({
  content,
  solution,
  onSubmit,
  isSubmitted = false,
  result,
  showSolution = false,
  readOnly = false
}) => {
  const [placedSymbols, setPlacedSymbols] = useState<PlacedSymbol[]>([]);
  const [usedCounts, setUsedCounts] = useState<Map<string, number>>(new Map());

  // Track how many of each symbol is used
  const getAvailableCount = (symbolId: string): number => {
    const symbolDef = content.availableSymbols.find(s => s.id === symbolId);
    if (!symbolDef) return 0;
    return symbolDef.count - (usedCounts.get(symbolId) || 0);
  };

  // Add a symbol to the formula
  const addSymbol = (symbolId: string, symbol: string) => {
    if (readOnly || isSubmitted) return;
    if (getAvailableCount(symbolId) <= 0) return;

    const instanceId = `${symbolId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setPlacedSymbols(prev => [...prev, { instanceId, symbolId, symbol }]);
    setUsedCounts(prev => {
      const newMap = new Map(prev);
      newMap.set(symbolId, (newMap.get(symbolId) || 0) + 1);
      return newMap;
    });
  };

  // Remove a symbol from the formula
  const removeSymbol = (instanceId: string, symbolId: string) => {
    if (readOnly || isSubmitted) return;

    setPlacedSymbols(prev => prev.filter(s => s.instanceId !== instanceId));
    setUsedCounts(prev => {
      const newMap = new Map(prev);
      newMap.set(symbolId, Math.max(0, (newMap.get(symbolId) || 0) - 1));
      return newMap;
    });
  };

  // Clear all placed symbols
  const clearFormula = () => {
    if (readOnly || isSubmitted) return;
    setPlacedSymbols([]);
    setUsedCounts(new Map());
  };

  // Get the formula string
  const formulaString = useMemo(() => {
    return placedSymbols.map(s => s.symbol).join(' ');
  }, [placedSymbols]);

  // Handle reorder
  const handleReorder = (newOrder: PlacedSymbol[]) => {
    if (readOnly || isSubmitted) return;
    setPlacedSymbols(newOrder);
  };

  // Submit
  const handleSubmit = () => {
    if (placedSymbols.length === 0) return;
    // Convert to a formula string without extra spaces
    const formula = placedSymbols.map(s => s.symbol).join('');
    onSubmit(formula);
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <div className="glass rounded-xl p-4">
        <div className="text-lg font-medium text-white mb-2">
          {content.instruction}
        </div>
        {content.targetDescription && (
          <p className="text-sm text-gray-400">{content.targetDescription}</p>
        )}
      </div>

      {/* Available Symbols Palette */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Puzzle className="w-4 h-4" />
            Símbolos Disponibles
          </h3>
          <button
            onClick={clearFormula}
            disabled={readOnly || isSubmitted || placedSymbols.length === 0}
            className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {content.availableSymbols.map(symbolDef => {
            const available = getAvailableCount(symbolDef.id);
            const isAvailable = available > 0 && !readOnly && !isSubmitted;

            return (
              <motion.button
                key={symbolDef.id}
                whileHover={isAvailable ? { scale: 1.05 } : {}}
                whileTap={isAvailable ? { scale: 0.95 } : {}}
                onClick={() => addSymbol(symbolDef.id, symbolDef.symbol)}
                disabled={!isAvailable}
                className={cn(
                  "relative px-4 py-3 rounded-xl font-mono text-xl transition-all border-2",
                  isAvailable
                    ? "bg-white/5 border-white/20 hover:border-[var(--primary)]/50 hover:bg-white/10 cursor-pointer"
                    : "bg-white/2 border-white/5 text-gray-600 cursor-not-allowed"
                )}
              >
                {symbolDef.symbol}
                {symbolDef.count > 1 && (
                  <span className={cn(
                    "absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center",
                    available > 0
                      ? "bg-[var(--primary)] text-white"
                      : "bg-gray-700 text-gray-400"
                  )}>
                    {available}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Formula Building Area */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Tu Fórmula</h3>

        <div className={cn(
          "min-h-[80px] p-4 rounded-xl border-2 border-dashed transition-all",
          placedSymbols.length === 0
            ? "border-gray-700 bg-white/2"
            : "border-[var(--accent)]/30 bg-[var(--accent)]/5"
        )}>
          {placedSymbols.length === 0 ? (
            <p className="text-gray-600 text-center py-2">
              Haz clic en los símbolos para construir tu fórmula
            </p>
          ) : (
            <Reorder.Group
              axis="x"
              values={placedSymbols}
              onReorder={handleReorder}
              className="flex flex-wrap gap-2"
            >
              {placedSymbols.map((placed) => (
                <Reorder.Item
                  key={placed.instanceId}
                  value={placed}
                  className={cn(
                    "group relative px-4 py-2 rounded-lg font-mono text-xl transition-all",
                    "bg-[var(--accent)]/20 border border-[var(--accent)]/30",
                    !readOnly && !isSubmitted && "cursor-grab active:cursor-grabbing"
                  )}
                >
                  {placed.symbol}
                  {!readOnly && !isSubmitted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSymbol(placed.instanceId, placed.symbolId);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>

        {/* Formula Preview */}
        {placedSymbols.length > 0 && (
          <div className="text-sm text-gray-500">
            Vista: <code className="font-mono text-[var(--accent)]">{formulaString}</code>
          </div>
        )}
      </div>

      {/* Solution display */}
      <AnimatePresence>
        {showSolution && solution && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <p className="text-sm text-gray-400 mb-2">Respuestas correctas:</p>
            <div className="flex flex-wrap gap-2">
              {solution.correctFormulas.map((formula, i) => (
                <code key={i} className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  {formula}
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
          disabled={placedSymbols.length === 0}
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all",
            placedSymbols.length > 0
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

export default SymbolArrangementExercise;
