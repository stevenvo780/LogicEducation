/**
 * Exercise Types System
 * Defines all exercise types and their configurations
 */

// ============================================================================
// EXERCISE TYPES
// ============================================================================

export type ExerciseType =
  | 'EQUIVALENCE'           // Write an equivalent formula
  | 'MULTIPLE_CHOICE'       // Select the correct answer(s)
  | 'SYMBOL_ARRANGEMENT'    // Drag-drop to build a formula
  | 'FORMULATION'           // Natural language → formal logic
  | 'VALIDATION'            // Is this argument valid?
  | 'TRUTH_TABLE'           // Fill in truth table cells
  | 'PROOF'                 // Step-by-step proof construction
  | 'NORMAL_FORM'           // Convert to CNF/DNF/NNF
  | 'IDENTIFY_FALLACY';     // Identify the logical fallacy

// ============================================================================
// EXERCISE METADATA
// ============================================================================

export interface ExerciseTypeInfo {
  id: ExerciseType;
  name: string;
  nameES: string;
  description: string;
  icon: string; // Lucide icon name
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  interactive: boolean;
  supportsPartialCredit: boolean;
}

export const EXERCISE_TYPES: Record<ExerciseType, ExerciseTypeInfo> = {
  EQUIVALENCE: {
    id: 'EQUIVALENCE',
    name: 'Logical Equivalence',
    nameES: 'Equivalencia Lógica',
    description: 'Escribe una fórmula lógicamente equivalente a la dada.',
    icon: 'Equal',
    difficulty: 'MEDIUM',
    interactive: false,
    supportsPartialCredit: false
  },
  MULTIPLE_CHOICE: {
    id: 'MULTIPLE_CHOICE',
    name: 'Multiple Choice',
    nameES: 'Selección Múltiple',
    description: 'Selecciona la respuesta correcta entre las opciones.',
    icon: 'CircleDot',
    difficulty: 'EASY',
    interactive: false,
    supportsPartialCredit: true
  },
  SYMBOL_ARRANGEMENT: {
    id: 'SYMBOL_ARRANGEMENT',
    name: 'Symbol Arrangement',
    nameES: 'Arreglo de Símbolos',
    description: 'Arrastra y ordena los símbolos para formar una fórmula válida.',
    icon: 'Puzzle',
    difficulty: 'MEDIUM',
    interactive: true,
    supportsPartialCredit: false
  },
  FORMULATION: {
    id: 'FORMULATION',
    name: 'Formulation',
    nameES: 'Formulación',
    description: 'Traduce el enunciado en lenguaje natural a lógica formal.',
    icon: 'FileText',
    difficulty: 'HARD',
    interactive: false,
    supportsPartialCredit: true
  },
  VALIDATION: {
    id: 'VALIDATION',
    name: 'Argument Validation',
    nameES: 'Validación de Argumentos',
    description: 'Determina si el argumento dado es lógicamente válido.',
    icon: 'CheckSquare',
    difficulty: 'HARD',
    interactive: false,
    supportsPartialCredit: true
  },
  TRUTH_TABLE: {
    id: 'TRUTH_TABLE',
    name: 'Truth Table',
    nameES: 'Tabla de Verdad',
    description: 'Completa las celdas faltantes de la tabla de verdad.',
    icon: 'Table2',
    difficulty: 'MEDIUM',
    interactive: true,
    supportsPartialCredit: true
  },
  PROOF: {
    id: 'PROOF',
    name: 'Proof Construction',
    nameES: 'Construcción de Pruebas',
    description: 'Construye una prueba paso a paso para demostrar la conclusión.',
    icon: 'ListTree',
    difficulty: 'HARD',
    interactive: true,
    supportsPartialCredit: true
  },
  NORMAL_FORM: {
    id: 'NORMAL_FORM',
    name: 'Normal Form Conversion',
    nameES: 'Conversión a Forma Normal',
    description: 'Convierte la fórmula a la forma normal solicitada (CNF/DNF/NNF).',
    icon: 'Shuffle',
    difficulty: 'MEDIUM',
    interactive: false,
    supportsPartialCredit: false
  },
  IDENTIFY_FALLACY: {
    id: 'IDENTIFY_FALLACY',
    name: 'Identify Fallacy',
    nameES: 'Identificación de Falacias',
    description: 'Identifica qué falacia lógica está presente en el argumento.',
    icon: 'AlertTriangle',
    difficulty: 'MEDIUM',
    interactive: false,
    supportsPartialCredit: false
  }
};

// ============================================================================
// CONTENT SCHEMAS FOR EACH EXERCISE TYPE
// ============================================================================

export interface MultipleChoiceContent {
  question: string;
  options: Array<{
    id: string;
    text: string;
    isFormula?: boolean; // If true, render as formula
  }>;
  allowMultiple?: boolean; // Multiple correct answers
  randomizeOrder?: boolean;
}

export interface MultipleChoiceSolution {
  correctOptionIds: string[];
  explanations?: Record<string, string>; // Optional per-option explanations
}

export interface SymbolArrangementContent {
  instruction: string;
  availableSymbols: Array<{
    id: string;
    symbol: string;
    count: number; // How many times this symbol can be used
  }>;
  targetDescription?: string; // What they should build
}

export interface SymbolArrangementSolution {
  correctFormulas: string[]; // Multiple valid arrangements
}

export interface FormulationContent {
  naturalLanguage: string; // The sentence to translate
  variables: Record<string, string>; // Variable definitions, e.g., { P: "Llueve", Q: "Hay nubes" }
  hint?: string;
}

export interface FormulationSolution {
  correctFormulas: string[]; // Multiple equivalent valid translations
}

export interface ValidationContent {
  premises: string[]; // Array of premises as formulas
  conclusion: string; // The conclusion formula
  argumentInNaturalLanguage?: string; // Optional natural language version
}

export interface ValidationSolution {
  isValid: boolean;
  explanation: string;
  counterexample?: Record<string, boolean>; // If invalid, a counterexample
}

export interface TruthTableContent {
  formula: string;
  hiddenCells: Array<{
    row: number; // Row index (0-based)
    column: string; // Column identifier (variable name or 'result')
  }>;
  showIntermediateColumns?: boolean;
}

export interface TruthTableSolution {
  // Full truth table values for verification
  values: Record<string, boolean[]>; // column name -> array of values per row
}

export interface NormalFormContent {
  formula: string;
  targetForm: 'CNF' | 'DNF' | 'NNF';
}

export interface NormalFormSolution {
  correctFormulas: string[]; // Multiple equivalent correct forms
}

export interface ProofContent {
  premises: string[];
  conclusion: string;
  allowedRules: string[]; // Which inference rules can be used
  maxSteps?: number;
}

export interface ProofSolution {
  proofSteps: Array<{
    formula: string;
    justification: string;
    lineRefs?: number[];
  }>;
}

export interface IdentifyFallacyContent {
  argument: string; // The argument text
  options: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export interface IdentifyFallacySolution {
  correctFallacyId: string;
  explanation: string;
}

// ============================================================================
// UNIFIED EXERCISE CONFIG TYPE
// ============================================================================

export type ExerciseContent =
  | { type: 'EQUIVALENCE'; formula: string }
  | { type: 'MULTIPLE_CHOICE'; data: MultipleChoiceContent }
  | { type: 'SYMBOL_ARRANGEMENT'; data: SymbolArrangementContent }
  | { type: 'FORMULATION'; data: FormulationContent }
  | { type: 'VALIDATION'; data: ValidationContent }
  | { type: 'TRUTH_TABLE'; data: TruthTableContent }
  | { type: 'PROOF'; data: ProofContent }
  | { type: 'NORMAL_FORM'; data: NormalFormContent }
  | { type: 'IDENTIFY_FALLACY'; data: IdentifyFallacyContent };

export type ExerciseSolution =
  | { type: 'EQUIVALENCE'; targetFormula: string }
  | { type: 'MULTIPLE_CHOICE'; data: MultipleChoiceSolution }
  | { type: 'SYMBOL_ARRANGEMENT'; data: SymbolArrangementSolution }
  | { type: 'FORMULATION'; data: FormulationSolution }
  | { type: 'VALIDATION'; data: ValidationSolution }
  | { type: 'TRUTH_TABLE'; data: TruthTableSolution }
  | { type: 'PROOF'; data: ProofSolution }
  | { type: 'NORMAL_FORM'; data: NormalFormSolution }
  | { type: 'IDENTIFY_FALLACY'; data: IdentifyFallacySolution };

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getExerciseTypeInfo(type: ExerciseType): ExerciseTypeInfo {
  return EXERCISE_TYPES[type];
}

export function getExerciseTypesByDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD'): ExerciseType[] {
  return Object.entries(EXERCISE_TYPES)
    .filter(([_, info]) => info.difficulty === difficulty)
    .map(([type]) => type as ExerciseType);
}

export function parseExerciseContent(type: ExerciseType, contentJson: string): ExerciseContent {
  const data = JSON.parse(contentJson);
  return { type, ...data } as ExerciseContent;
}

export function parseExerciseSolution(type: ExerciseType, solutionJson: string): ExerciseSolution {
  const data = JSON.parse(solutionJson);
  return { type, ...data } as ExerciseSolution;
}

// Generate unique option IDs
export function generateOptionId(): string {
  return Math.random().toString(36).substring(2, 10);
}
