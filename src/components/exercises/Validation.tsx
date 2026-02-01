"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, CheckSquare, AlertTriangle, HelpCircle, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValidationContent, ValidationSolution } from '@/lib/exercises/exerciseTypes';

interface ValidationExerciseProps {
  content: ValidationContent;
  solution?: ValidationSolution;
  onSubmit: (answer: { isValid: boolean; justification?: string }) => void;
  isSubmitted?: boolean;
  result?: {
    isCorrect: boolean;
    feedback: string;
  };
  showSolution?: boolean;
  readOnly?: boolean;
  requireJustification?: boolean;
}

export const ValidationExercise: React.FC<ValidationExerciseProps> = ({
  content,
  solution,
  onSubmit,
  isSubmitted = false,
  result,
  showSolution = false,
  readOnly = false,
  requireJustification = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [justification, setJustification] = useState('');

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    onSubmit({
      isValid: selectedAnswer,
      justification: requireJustification ? justification : undefined
    });
  };

  const canSubmit = selectedAnswer !== null && (!requireJustification || justification.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Argument Structure */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          Argumento a Evaluar
        </h3>

        {/* Natural Language Version (if available) */}
        {content.argumentInNaturalLanguage && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-gray-300 italic">"{content.argumentInNaturalLanguage}"</p>
          </div>
        )}

        {/* Premises */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Premisas:</p>
          <div className="space-y-2">
            {content.premises.map((premise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-gray-600 font-mono w-6">{index + 1}.</span>
                <code className="flex-1 font-mono text-lg text-[var(--primary)] bg-[var(--primary)]/10 px-4 py-2 rounded-lg">
                  {premise}
                </code>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Separator Line */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-white/20"></div>
          <ArrowDown className="w-5 h-5 text-gray-500" />
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Conclusion */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Conclusión:</p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs text-gray-600 font-mono w-6">∴</span>
            <code className="flex-1 font-mono text-lg text-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 rounded-lg">
              {content.conclusion}
            </code>
          </motion.div>
        </div>
      </div>

      {/* Question */}
      <div className="text-lg font-medium text-white">
        ¿Es este argumento lógicamente válido?
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={!readOnly && !isSubmitted ? { scale: 1.02 } : {}}
          whileTap={!readOnly && !isSubmitted ? { scale: 0.98 } : {}}
          onClick={() => !readOnly && !isSubmitted && setSelectedAnswer(true)}
          disabled={readOnly || isSubmitted}
          className={cn(
            "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
            selectedAnswer === true
              ? "border-emerald-500 bg-emerald-500/20"
              : "border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5",
            showSolution && solution?.isValid === true && "ring-2 ring-emerald-500"
          )}
        >
          <Check className={cn(
            "w-8 h-8",
            selectedAnswer === true ? "text-emerald-400" : "text-gray-500"
          )} />
          <span className={cn(
            "font-medium text-lg",
            selectedAnswer === true ? "text-emerald-300" : "text-gray-400"
          )}>
            VÁLIDO
          </span>
          <span className="text-xs text-gray-500">
            La conclusión se sigue necesariamente
          </span>
        </motion.button>

        <motion.button
          whileHover={!readOnly && !isSubmitted ? { scale: 1.02 } : {}}
          whileTap={!readOnly && !isSubmitted ? { scale: 0.98 } : {}}
          onClick={() => !readOnly && !isSubmitted && setSelectedAnswer(false)}
          disabled={readOnly || isSubmitted}
          className={cn(
            "p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
            selectedAnswer === false
              ? "border-rose-500 bg-rose-500/20"
              : "border-white/10 hover:border-rose-500/50 hover:bg-rose-500/5",
            showSolution && solution?.isValid === false && "ring-2 ring-rose-500"
          )}
        >
          <X className={cn(
            "w-8 h-8",
            selectedAnswer === false ? "text-rose-400" : "text-gray-500"
          )} />
          <span className={cn(
            "font-medium text-lg",
            selectedAnswer === false ? "text-rose-300" : "text-gray-400"
          )}>
            INVÁLIDO
          </span>
          <span className="text-xs text-gray-500">
            Existe un contraejemplo
          </span>
        </motion.button>
      </div>

      {/* Justification (if required) */}
      {requireJustification && selectedAnswer !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <label className="text-sm text-gray-400">
            {selectedAnswer
              ? 'Explica por qué es válido:'
              : 'Proporciona un contraejemplo:'}
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            disabled={readOnly || isSubmitted}
            placeholder={selectedAnswer
              ? 'Por ejemplo: Usando Modus Ponens...'
              : 'Por ejemplo: Si P=V, Q=F entonces...'}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all resize-none h-24"
          />
        </motion.div>
      )}

      {/* Solution display */}
      <AnimatePresence>
        {showSolution && solution && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-xl border",
              solution.isValid
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-rose-500/10 border-rose-500/20"
            )}
          >
            <div className="flex items-start gap-3">
              {solution.isValid ? (
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={solution.isValid ? "text-emerald-300" : "text-rose-300"}>
                  El argumento es <strong>{solution.isValid ? 'válido' : 'inválido'}</strong>
                </p>
                <p className="text-sm text-gray-400 mt-2">{solution.explanation}</p>

                {/* Show counterexample if invalid */}
                {!solution.isValid && solution.counterexample && (
                  <div className="mt-3 p-3 rounded-lg bg-black/30">
                    <p className="text-xs text-gray-500 mb-2">Contraejemplo:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(solution.counterexample).map(([variable, value]) => (
                        <span key={variable} className="font-mono text-sm">
                          <span className="text-gray-400">{variable}=</span>
                          <span className={value ? "text-emerald-400" : "text-rose-400"}>
                            {value ? 'V' : 'F'}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
          disabled={!canSubmit}
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all",
            canSubmit
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

export default ValidationExercise;
