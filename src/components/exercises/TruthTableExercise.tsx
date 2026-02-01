"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Table2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TruthTableContent, TruthTableSolution } from '@/lib/exercises/exerciseTypes';
import { LogicParser } from '@/lib/logic/parser';
import { generateTruthTable } from '@/lib/logic/evaluator';

interface TruthTableExerciseProps {
  content: TruthTableContent;
  solution?: TruthTableSolution;
  onSubmit: (answers: Record<string, boolean[]>) => void;
  isSubmitted?: boolean;
  result?: {
    isCorrect: boolean;
    correctCells: number;
    totalCells: number;
    feedback: string;
  };
  showSolution?: boolean;
  readOnly?: boolean;
}

interface CellState {
  row: number;
  column: string;
  value: boolean | null;
  isHidden: boolean;
  isCorrect?: boolean;
}

export const TruthTableExercise: React.FC<TruthTableExerciseProps> = ({
  content,
  solution,
  onSubmit,
  isSubmitted = false,
  result,
  showSolution = false,
  readOnly = false
}) => {
  const [userAnswers, setUserAnswers] = useState<Map<string, boolean | null>>(new Map());

  // Generate the truth table from the formula
  const tableData = useMemo(() => {
    try {
      const parser = new LogicParser();
      const formula = parser.parse(content.formula);
      const table = generateTruthTable(formula);
      return table;
    } catch (e) {
      console.error('Error generating truth table:', e);
      return null;
    }
  }, [content.formula]);

  // Create a set of hidden cell keys for quick lookup
  const hiddenCellKeys = useMemo(() => {
    return new Set(
      content.hiddenCells.map(cell => `${cell.row}-${cell.column}`)
    );
  }, [content.hiddenCells]);

  // Get the correct value for a cell
  const getCorrectValue = (row: number, column: string): boolean | null => {
    if (!solution || !solution.values[column]) return null;
    return solution.values[column][row] ?? null;
  };

  // Handle cell click (cycle through: null -> true -> false -> null)
  const handleCellClick = (row: number, column: string) => {
    if (readOnly || isSubmitted) return;

    const key = `${row}-${column}`;
    if (!hiddenCellKeys.has(key)) return;

    setUserAnswers(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(key);
      if (current === null || current === undefined) {
        newMap.set(key, true);
      } else if (current === true) {
        newMap.set(key, false);
      } else {
        newMap.set(key, null);
      }
      return newMap;
    });
  };

  // Submit answers
  const handleSubmit = () => {
    const answers: Record<string, boolean[]> = {};

    // Initialize arrays for hidden columns
    content.hiddenCells.forEach(cell => {
      if (!answers[cell.column]) {
        answers[cell.column] = [];
      }
    });

    // Fill in user answers
    userAnswers.forEach((value, key) => {
      const [row, column] = key.split('-');
      const rowNum = parseInt(row);
      if (!answers[column]) answers[column] = [];
      if (value !== null) {
        answers[column][rowNum] = value;
      }
    });

    onSubmit(answers);
  };

  // Check if all hidden cells have been filled
  const allFilled = useMemo(() => {
    return content.hiddenCells.every(cell => {
      const key = `${cell.row}-${cell.column}`;
      const value = userAnswers.get(key);
      return value !== null && value !== undefined;
    });
  }, [content.hiddenCells, userAnswers]);

  if (!tableData) {
    return (
      <div className="p-4 text-rose-400 bg-rose-500/10 rounded-xl">
        Error al generar la tabla de verdad
      </div>
    );
  }

  const columns = [...tableData.variables, 'result'];
  const columnLabels: Record<string, string> = {
    result: content.formula
  };
  tableData.variables.forEach(v => {
    columnLabels[v] = v;
  });

  return (
    <div className="space-y-6">
      {/* Formula display */}
      <div className="glass rounded-xl p-4">
        <div className="text-sm text-gray-500 mb-2">Fórmula:</div>
        <code className="text-xl font-mono text-[var(--accent)]">
          {content.formula}
        </code>
      </div>

      {/* Instructions */}
      <div className="flex items-start gap-2 text-sm text-gray-400">
        <HelpCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Haz clic en las celdas vacías para completar los valores.
          Cada clic cambia el valor: <span className="text-emerald-400">V</span> → <span className="text-rose-400">F</span> → vacío
        </p>
      </div>

      {/* Truth Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  className={cn(
                    "px-4 py-3 text-center font-mono border-b-2 border-white/20",
                    col === 'result'
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "bg-white/5 text-gray-300"
                  )}
                >
                  {columnLabels[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIndex * 0.03 }}
                className="border-b border-white/5"
              >
                {columns.map(col => {
                  const isHidden = hiddenCellKeys.has(`${rowIndex}-${col}`);
                  const userValue = userAnswers.get(`${rowIndex}-${col}`);

                  // Get the actual value (from truth table for variables, or from userValue for hidden cells)
                  let displayValue: boolean | null = null;
                  if (!isHidden) {
                    if (col === 'result') {
                      displayValue = row.result;
                    } else {
                      displayValue = row.assignment[col];
                    }
                  } else if (userValue !== null && userValue !== undefined) {
                    displayValue = userValue;
                  }

                  // Correct value for checking
                  const correctValue = showSolution ? getCorrectValue(rowIndex, col) : null;
                  const isCorrect = showSolution && isHidden && userValue !== null && userValue === correctValue;
                  const isWrong = showSolution && isHidden && userValue !== null && userValue !== correctValue;

                  return (
                    <td
                      key={col}
                      onClick={() => isHidden && handleCellClick(rowIndex, col)}
                      className={cn(
                        "px-4 py-3 text-center font-mono transition-all",
                        col === 'result' && "bg-[var(--accent)]/5",
                        isHidden && !readOnly && !isSubmitted && "cursor-pointer hover:bg-white/10",
                        isHidden && "bg-indigo-500/10 border-2 border-dashed border-indigo-500/30",
                        showSolution && isCorrect && "bg-emerald-500/20 border-emerald-500",
                        showSolution && isWrong && "bg-rose-500/20 border-rose-500"
                      )}
                    >
                      {displayValue === null ? (
                        isHidden ? (
                          <span className="text-gray-600">?</span>
                        ) : null
                      ) : displayValue ? (
                        <span className={cn(
                          "font-bold",
                          showSolution && isCorrect && "text-emerald-400",
                          showSolution && isWrong && "text-rose-400",
                          !showSolution && "text-emerald-400"
                        )}>V</span>
                      ) : (
                        <span className={cn(
                          "font-bold",
                          showSolution && isCorrect && "text-emerald-400",
                          showSolution && isWrong && "text-rose-400",
                          !showSolution && "text-rose-400"
                        )}>F</span>
                      )}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
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
                : "bg-amber-500/20 border border-amber-500/30"
            )}
          >
            {result.isCorrect ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Table2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className={result.isCorrect ? "text-emerald-300" : "text-amber-300"}>
                {result.feedback}
              </p>
              {!result.isCorrect && (
                <p className="text-sm text-gray-400 mt-1">
                  Celdas correctas: {result.correctCells}/{result.totalCells}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      {!isSubmitted && !readOnly && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all",
            allFilled
              ? "bg-[var(--primary)] hover:bg-indigo-600 text-white"
              : "bg-white/5 text-gray-600 cursor-not-allowed"
          )}
        >
          {allFilled ? 'Enviar Respuestas' : `Completa las ${content.hiddenCells.length} celdas`}
        </button>
      )}
    </div>
  );
};

export default TruthTableExercise;
