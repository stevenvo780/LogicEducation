"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Shuffle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MultipleChoiceContent, MultipleChoiceSolution } from '@/lib/exercises/exerciseTypes';

interface MultipleChoiceExerciseProps {
  content: MultipleChoiceContent;
  solution?: MultipleChoiceSolution;
  onSubmit: (selectedIds: string[]) => void;
  isSubmitted?: boolean;
  result?: {
    isCorrect: boolean;
    feedback: string;
  };
  showSolution?: boolean;
  readOnly?: boolean;
}

export const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
  content,
  solution,
  onSubmit,
  isSubmitted = false,
  result,
  showSolution = false,
  readOnly = false
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Randomize options if needed
  const displayOptions = useMemo(() => {
    if (content.randomizeOrder) {
      return [...content.options].sort(() => Math.random() - 0.5);
    }
    return content.options;
  }, [content.options, content.randomizeOrder]);

  const handleOptionClick = (optionId: string) => {
    if (readOnly || isSubmitted) return;

    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (content.allowMultiple) {
        if (newSet.has(optionId)) {
          newSet.delete(optionId);
        } else {
          newSet.add(optionId);
        }
      } else {
        newSet.clear();
        newSet.add(optionId);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (selectedIds.size === 0) return;
    onSubmit(Array.from(selectedIds));
  };

  const isOptionCorrect = (optionId: string): boolean | null => {
    if (!showSolution || !solution) return null;
    return solution.correctOptionIds.includes(optionId);
  };

  const isOptionSelected = (optionId: string): boolean => {
    return selectedIds.has(optionId);
  };

  const getOptionStyle = (optionId: string) => {
    const selected = isOptionSelected(optionId);
    const correct = isOptionCorrect(optionId);

    if (showSolution && solution) {
      if (correct && selected) {
        return 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
      }
      if (correct && !selected) {
        return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
      }
      if (!correct && selected) {
        return 'border-rose-500 bg-rose-500/20 text-rose-300';
      }
      return 'border-white/10 text-gray-500';
    }

    if (selected) {
      return 'border-[var(--primary)] bg-[var(--primary)]/20 text-white';
    }

    return 'border-white/10 hover:border-white/30 hover:bg-white/5';
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-lg font-medium text-white">
        {content.question}
      </div>

      {/* Instructions */}
      {content.allowMultiple && (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Selecciona todas las opciones correctas
        </p>
      )}

      {/* Options */}
      <div className="space-y-3">
        {displayOptions.map((option, index) => {
          const optionStyle = getOptionStyle(option.id);
          const correct = isOptionCorrect(option.id);

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleOptionClick(option.id)}
              disabled={readOnly || isSubmitted}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4",
                optionStyle,
                (readOnly || isSubmitted) && "cursor-default",
                !readOnly && !isSubmitted && "cursor-pointer"
              )}
            >
              {/* Selection indicator */}
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                isOptionSelected(option.id)
                  ? "border-current bg-current/20"
                  : "border-gray-600"
              )}>
                {showSolution && correct !== null ? (
                  correct ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isOptionSelected(option.id) ? (
                    <X className="w-3.5 h-3.5 text-rose-400" />
                  ) : null
                ) : isOptionSelected(option.id) ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-current" />
                ) : null}
              </div>

              {/* Option text */}
              <div className="flex-1">
                {option.isFormula ? (
                  <code className="font-mono text-lg">{option.text}</code>
                ) : (
                  <span>{option.text}</span>
                )}
              </div>

              {/* Letter indicator */}
              <span className="text-sm text-gray-600 font-mono">
                {String.fromCharCode(65 + index)}
              </span>
            </motion.button>
          );
        })}
      </div>

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
            <div>
              <p className={result.isCorrect ? "text-emerald-300" : "text-rose-300"}>
                {result.feedback}
              </p>
              {/* Show per-option explanations if available */}
              {showSolution && solution?.explanations && (
                <div className="mt-3 space-y-2 text-sm">
                  {content.options.map(opt => {
                    const explanation = solution.explanations?.[opt.id];
                    if (!explanation) return null;
                    return (
                      <p key={opt.id} className="text-gray-400">
                        <span className="font-mono text-gray-500">{opt.text}:</span> {explanation}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      {!isSubmitted && !readOnly && (
        <button
          onClick={handleSubmit}
          disabled={selectedIds.size === 0}
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all",
            selectedIds.size > 0
              ? "bg-[var(--primary)] hover:bg-indigo-600 text-white"
              : "bg-white/5 text-gray-600 cursor-not-allowed"
          )}
        >
          Enviar Respuesta
        </button>
      )}
    </div>
  );
};

export default MultipleChoiceExercise;
