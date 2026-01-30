import { LogicParser } from './parser';
import { generateTruthTable } from './evaluator';
import { Formula } from './types';

export type GradingResult = {
  isCorrect: boolean;
  feedback: string;
  explanation?: string;
};

export interface ExerciseData {
  type: string;
  formula?: string; // Legacy or primary formula
  content: any;     // Parsed JSON content
  solution: any;    // Parsed JSON solution
  explanation?: string | null;
}

export function gradeSubmission(exercise: ExerciseData, studentAnswer: any): GradingResult {
  switch (exercise.type) {
    case 'EQUIVALENCE':
    default:
      return gradeEquivalence(exercise, studentAnswer);
  }
}

function gradeEquivalence(exercise: ExerciseData, studentAnswer: string): GradingResult {
  try {
    const targetFormulaStr = exercise.formula || exercise.content.targetFormula;
    if (!targetFormulaStr) {
      return { isCorrect: false, feedback: 'Error: Configuración de ejercicio inválida.' };
    }

    const parser = new LogicParser();
    const studentFormula = parser.parse(studentAnswer.trim());
    const targetFormula = parser.parse(targetFormulaStr);

    const studentTable = generateTruthTable(studentFormula);
    const targetTable = generateTruthTable(targetFormula);

    // 1. Check variables match
    const studentVars = new Set(studentTable.variables);
    const targetVars = new Set(targetTable.variables);

    // Variables must be the same (or student has subset if tautology? No, strict equivalence usually implies same vars or at least handling them)
    // For strict equivalence, we usually expect same variables or we evaluate on the union.
    // Let's evaluate on the union of variables to be safe.

    const allVars = Array.from(new Set([...studentTable.variables, ...targetTable.variables])).sort();

    // Regenerate tables with all vars to ensure consistent row ordering
    const finalStudentTable = generateTruthTable(studentFormula); // Helper might not accept specific vars, simpler to rely on standard generation if standard is robust.
    // Actually, generateTruthTable extracts vars from formula. 
    // If student uses 'p' and target uses 'p, q', the rows won't match directly logic-wise if we just compare arrays.
    // We should really check logical equivalence: (A <-> B) is Tautology.

    const areEquivalent = checkEquivalence(studentFormula, targetFormula);

    if (areEquivalent) {
      return {
        isCorrect: true,
        feedback: '¡Correcto! Tu fórmula es lógicamente equivalente.',
        explanation: exercise.explanation || undefined
      };
    } else {
      return {
        isCorrect: false,
        feedback: 'Incorrecto. Tu fórmula no es equivalente. Revisa la tabla de verdad.',
        explanation: exercise.explanation || undefined
      };
    }

  } catch (e) {
    return {
      isCorrect: false,
      feedback: 'Error de sintaxis: ' + (e as Error).message
    };
  }
}

// Logic reuse from analyzer.ts to avoid circular deps if possible, or just re-implement simple check
import { isTautology } from './analyzer';

function checkEquivalence(f1: Formula, f2: Formula): boolean {
  const biconditional: Formula = {
    type: 'BINARY',
    operator: 'IFF',
    left: f1,
    right: f2
  };
  return isTautology(biconditional);
}
