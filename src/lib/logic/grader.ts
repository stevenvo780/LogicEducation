/**
 * Extended Grading System
 * Supports all exercise types with partial credit
 */

import { LogicParser } from './parser';
import { generateTruthTable } from './evaluator';
import { Formula } from './types';
import { isTautology } from './analyzer';
import {
  ExerciseType,
  MultipleChoiceContent,
  MultipleChoiceSolution,
  SymbolArrangementSolution,
  FormulationSolution,
  ValidationContent,
  ValidationSolution,
  TruthTableContent,
  TruthTableSolution,
  NormalFormContent,
  NormalFormSolution,
  IdentifyFallacySolution
} from '@/lib/exercises/exerciseTypes';

// ============================================================================
// TYPES
// ============================================================================

export interface GradingResult {
  isCorrect: boolean;
  score: number;         // 0.0 to 1.0 for partial credit
  feedback: string;
  explanation?: string;
  details?: Record<string, unknown>;
}

export interface ExerciseData {
  type: ExerciseType;
  formula?: string;      // Legacy or primary formula
  content: unknown;       // Parsed JSON content
  solution: unknown;      // Parsed JSON solution
  explanation?: string | null;
}

// ============================================================================
// MAIN GRADING FUNCTION
// ============================================================================

export function gradeSubmission(exercise: ExerciseData, studentAnswer: unknown): GradingResult {
  try {
    switch (exercise.type) {
      case 'EQUIVALENCE':
        return gradeEquivalence(exercise, studentAnswer as string);

      case 'MULTIPLE_CHOICE':
        return gradeMultipleChoice(
          exercise.content as MultipleChoiceContent,
          exercise.solution as MultipleChoiceSolution,
          studentAnswer as string[],
          exercise.explanation
        );

      case 'SYMBOL_ARRANGEMENT':
        return gradeSymbolArrangement(
          exercise.solution as SymbolArrangementSolution,
          studentAnswer as string,
          exercise.explanation
        );

      case 'FORMULATION':
        return gradeFormulation(
          exercise.solution as FormulationSolution,
          studentAnswer as string,
          exercise.explanation
        );

      case 'VALIDATION':
        return gradeValidation(
          exercise.solution as ValidationSolution,
          studentAnswer as { isValid: boolean; justification?: string },
          exercise.explanation
        );

      case 'TRUTH_TABLE':
        return gradeTruthTable(
          exercise.content as TruthTableContent,
          exercise.solution as TruthTableSolution,
          studentAnswer as Record<string, boolean[]>,
          exercise.explanation
        );

      case 'NORMAL_FORM':
        return gradeNormalForm(
          exercise.content as NormalFormContent,
          exercise.solution as NormalFormSolution,
          studentAnswer as string,
          exercise.explanation
        );

      case 'IDENTIFY_FALLACY':
        return gradeIdentifyFallacy(
          exercise.solution as IdentifyFallacySolution,
          studentAnswer as string,
          exercise.explanation
        );

      default:
        return {
          isCorrect: false,
          score: 0,
          feedback: `Tipo de ejercicio no soportado: ${exercise.type}`
        };
    }
  } catch (e) {
    return {
      isCorrect: false,
      score: 0,
      feedback: `Error al evaluar: ${(e as Error).message}`
    };
  }
}

// ============================================================================
// EQUIVALENCE GRADING
// ============================================================================

function gradeEquivalence(exercise: ExerciseData, studentAnswer: string): GradingResult {
  try {
    const targetFormulaStr = exercise.formula || (exercise.content as { targetFormula?: string })?.targetFormula;
    if (!targetFormulaStr) {
      return { isCorrect: false, score: 0, feedback: 'Error: Configuración de ejercicio inválida.' };
    }

    const parser = new LogicParser();
    const studentFormula = parser.parse(studentAnswer.trim());
    const targetFormula = parser.parse(targetFormulaStr);

    const areEquivalent = checkEquivalence(studentFormula, targetFormula);

    if (areEquivalent) {
      return {
        isCorrect: true,
        score: 1,
        feedback: '¡Correcto! Tu fórmula es lógicamente equivalente.',
        explanation: exercise.explanation || undefined
      };
    } else {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Incorrecto. Tu fórmula no es equivalente. Revisa la tabla de verdad.',
        explanation: exercise.explanation || undefined
      };
    }
  } catch (e) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Error de sintaxis: ' + (e as Error).message
    };
  }
}

function checkEquivalence(f1: Formula, f2: Formula): boolean {
  const biconditional: Formula = {
    type: 'BINARY',
    operator: 'IFF',
    left: f1,
    right: f2
  };
  return isTautology(biconditional);
}

// ============================================================================
// MULTIPLE CHOICE GRADING
// ============================================================================

function gradeMultipleChoice(
  content: MultipleChoiceContent,
  solution: MultipleChoiceSolution,
  studentAnswer: string[],
  explanation?: string | null
): GradingResult {
  const correctSet = new Set(solution.correctOptionIds);
  const studentSet = new Set(studentAnswer);

  if (content.allowMultiple) {
    // Partial credit for multiple selection
    const totalCorrect = correctSet.size;
    let correctSelected = 0;
    let incorrectSelected = 0;

    studentAnswer.forEach(id => {
      if (correctSet.has(id)) {
        correctSelected++;
      } else {
        incorrectSelected++;
      }
    });

    // Score: correct selections minus penalties for wrong selections
    const score = Math.max(0, (correctSelected - incorrectSelected) / totalCorrect);
    const isCorrect = correctSelected === totalCorrect && incorrectSelected === 0;

    return {
      isCorrect,
      score,
      feedback: isCorrect
        ? '¡Correcto! Seleccionaste todas las respuestas correctas.'
        : correctSelected > 0
          ? `Parcialmente correcto. Acertaste ${correctSelected} de ${totalCorrect}.`
          : 'Incorrecto. Ninguna de tus selecciones es correcta.',
      explanation: explanation || undefined,
      details: { correctSelected, incorrectSelected, totalCorrect }
    };
  } else {
    // Single selection - all or nothing
    const isCorrect = studentAnswer.length === 1 && correctSet.has(studentAnswer[0]);

    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: isCorrect
        ? '¡Correcto!'
        : 'Incorrecto. Esa no es la respuesta correcta.',
      explanation: explanation || undefined
    };
  }
}

// ============================================================================
// SYMBOL ARRANGEMENT GRADING
// ============================================================================

function gradeSymbolArrangement(
  solution: SymbolArrangementSolution,
  studentAnswer: string,
  explanation?: string | null
): GradingResult {
  // Normalize the student answer (remove spaces)
  const normalizedAnswer = studentAnswer.replace(/\s+/g, '');

  // Check if it matches any correct formula (also check for logical equivalence)
  const parser = new LogicParser();

  for (const correctFormula of solution.correctFormulas) {
    const normalizedCorrect = correctFormula.replace(/\s+/g, '');

    // Direct string match
    if (normalizedAnswer === normalizedCorrect) {
      return {
        isCorrect: true,
        score: 1,
        feedback: '¡Correcto! Has construido la fórmula correctamente.',
        explanation: explanation || undefined
      };
    }

    // Try logical equivalence
    try {
      const studentFormula = parser.parse(normalizedAnswer);
      const targetFormula = parser.parse(normalizedCorrect);
      if (checkEquivalence(studentFormula, targetFormula)) {
        return {
          isCorrect: true,
          score: 1,
          feedback: '¡Correcto! Tu fórmula es lógicamente equivalente.',
          explanation: explanation || undefined
        };
      }
    } catch {
      // Parse error, continue checking
    }
  }

  return {
    isCorrect: false,
    score: 0,
    feedback: 'Incorrecto. La fórmula que construiste no es la esperada.',
    explanation: explanation || undefined
  };
}

// ============================================================================
// FORMULATION GRADING
// ============================================================================

function gradeFormulation(
  solution: FormulationSolution,
  studentAnswer: string,
  explanation?: string | null
): GradingResult {
  const parser = new LogicParser();
  const normalizedAnswer = studentAnswer.trim();

  for (const correctFormula of solution.correctFormulas) {
    // Direct match
    if (normalizedAnswer === correctFormula.trim()) {
      return {
        isCorrect: true,
        score: 1,
        feedback: '¡Excelente! Tu traducción es correcta.',
        explanation: explanation || undefined
      };
    }

    // Check logical equivalence
    try {
      const studentFormula = parser.parse(normalizedAnswer);
      const targetFormula = parser.parse(correctFormula);
      if (checkEquivalence(studentFormula, targetFormula)) {
        return {
          isCorrect: true,
          score: 1,
          feedback: '¡Correcto! Tu fórmula es lógicamente equivalente a la esperada.',
          explanation: explanation || undefined
        };
      }
    } catch {
      // Continue to next formula
    }
  }

  return {
    isCorrect: false,
    score: 0,
    feedback: 'Incorrecto. Tu traducción no captura el significado del enunciado.',
    explanation: explanation || undefined
  };
}

// ============================================================================
// VALIDATION GRADING
// ============================================================================

function gradeValidation(
  solution: ValidationSolution,
  studentAnswer: { isValid: boolean; justification?: string },
  explanation?: string | null
): GradingResult {
  const isCorrect = studentAnswer.isValid === solution.isValid;

  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect
      ? solution.isValid
        ? '¡Correcto! El argumento es válido.'
        : '¡Correcto! El argumento es inválido.'
      : solution.isValid
        ? 'Incorrecto. El argumento sí es válido.'
        : 'Incorrecto. El argumento es inválido; existe un contraejemplo.',
    explanation: explanation || solution.explanation,
    details: {
      correctAnswer: solution.isValid,
      counterexample: solution.counterexample
    }
  };
}

// ============================================================================
// TRUTH TABLE GRADING
// ============================================================================

function gradeTruthTable(
  content: TruthTableContent,
  solution: TruthTableSolution,
  studentAnswer: Record<string, boolean[]>,
  explanation?: string | null
): GradingResult {
  let correctCells = 0;
  let totalCells = content.hiddenCells.length;

  for (const cell of content.hiddenCells) {
    const correctValue = solution.values[cell.column]?.[cell.row];
    const studentValue = studentAnswer[cell.column]?.[cell.row];

    if (studentValue === correctValue) {
      correctCells++;
    }
  }

  const score = totalCells > 0 ? correctCells / totalCells : 0;
  const isCorrect = correctCells === totalCells;

  return {
    isCorrect,
    score,
    feedback: isCorrect
      ? '¡Perfecto! Todas las celdas son correctas.'
      : correctCells > 0
        ? `Casi. Tienes ${correctCells} de ${totalCells} celdas correctas.`
        : 'Incorrecto. Revisa los valores de la tabla.',
    explanation: explanation || undefined,
    details: { correctCells, totalCells }
  };
}

// ============================================================================
// NORMAL FORM GRADING
// ============================================================================

function gradeNormalForm(
  content: NormalFormContent,
  solution: NormalFormSolution,
  studentAnswer: string,
  explanation?: string | null
): GradingResult {
  const parser = new LogicParser();
  const normalizedAnswer = studentAnswer.trim();

  // Check against all valid solutions
  for (const correctFormula of solution.correctFormulas) {
    if (normalizedAnswer === correctFormula.trim()) {
      return {
        isCorrect: true,
        score: 1,
        feedback: `¡Correcto! Has convertido correctamente a ${content.targetForm}.`,
        explanation: explanation || undefined
      };
    }

    // Check logical equivalence (the form might be correct even if order varies)
    try {
      const studentFormula = parser.parse(normalizedAnswer);
      const targetFormula = parser.parse(correctFormula);
      if (checkEquivalence(studentFormula, targetFormula)) {
        // TODO: Also verify it's actually in the correct normal form
        return {
          isCorrect: true,
          score: 1,
          feedback: `¡Correcto! Tu ${content.targetForm} es válida.`,
          explanation: explanation || undefined
        };
      }
    } catch {
      // Continue
    }
  }

  return {
    isCorrect: false,
    score: 0,
    feedback: `Incorrecto. Tu respuesta no está en ${content.targetForm} o no es equivalente.`,
    explanation: explanation || undefined
  };
}

// ============================================================================
// IDENTIFY FALLACY GRADING
// ============================================================================

function gradeIdentifyFallacy(
  solution: IdentifyFallacySolution,
  studentAnswer: string,
  explanation?: string | null
): GradingResult {
  const isCorrect = studentAnswer === solution.correctFallacyId;

  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect
      ? '¡Correcto! Identificaste la falacia correctamente.'
      : 'Incorrecto. Esa no es la falacia presente en el argumento.',
    explanation: explanation || solution.explanation
  };
}

