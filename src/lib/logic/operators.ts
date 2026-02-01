/**
 * Comprehensive Logic Operators Catalog
 * Organized by logic system type
 */

// ============================================================================
// LOGIC SYSTEM TYPES
// ============================================================================

export type LogicType =
  | 'PROPOSITIONAL'   // Basic propositional/sentential logic
  | 'MODAL'           // Necessity, Possibility
  | 'FIRST_ORDER'     // Universal/Existential quantifiers
  | 'TEMPORAL'        // Linear Temporal Logic (LTL)
  | 'DEONTIC'         // Obligation, Permission, Prohibition
  | 'EPISTEMIC';      // Knowledge, Belief

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

// ============================================================================
// OPERATOR DEFINITION
// ============================================================================

export interface LogicOperator {
  id: string;
  symbol: string;
  altSymbols: string[];       // Alternative notations users might use
  name: string;               // English name
  nameES: string;             // Spanish name
  type: LogicType;
  arity: number;              // 0=constant, 1=unary, 2=binary
  precedence: number;         // Higher = binds tighter
  description: string;        // Spanish description
  example: string;            // Example formula
  difficulty: DifficultyLevel;
  inputSymbols: string[];     // Symbols that parser should accept for this operator
}

// ============================================================================
// PROPOSITIONAL LOGIC OPERATORS
// ============================================================================

export const PROPOSITIONAL_OPERATORS: LogicOperator[] = [
  {
    id: 'NOT',
    symbol: '¬',
    altSymbols: ['~', '!', 'NOT', 'no'],
    name: 'Negation',
    nameES: 'Negación',
    type: 'PROPOSITIONAL',
    arity: 1,
    precedence: 5,
    description: 'Invierte el valor de verdad. Si P es verdadero, ¬P es falso.',
    example: '¬P',
    difficulty: 'BEGINNER',
    inputSymbols: ['~', '¬', '!']
  },
  {
    id: 'AND',
    symbol: '∧',
    altSymbols: ['&', '&&', 'AND', 'y', '^', '·'],
    name: 'Conjunction',
    nameES: 'Conjunción',
    type: 'PROPOSITIONAL',
    arity: 2,
    precedence: 4,
    description: 'Verdadero solo cuando ambos operandos son verdaderos.',
    example: 'P ∧ Q',
    difficulty: 'BEGINNER',
    inputSymbols: ['&', '^', '∧']
  },
  {
    id: 'OR',
    symbol: '∨',
    altSymbols: ['|', '||', 'OR', 'o', 'v'],
    name: 'Disjunction',
    nameES: 'Disyunción',
    type: 'PROPOSITIONAL',
    arity: 2,
    precedence: 3,
    description: 'Verdadero cuando al menos uno de los operandos es verdadero.',
    example: 'P ∨ Q',
    difficulty: 'BEGINNER',
    inputSymbols: ['|', '∨']
  },
  {
    id: 'IMPLIES',
    symbol: '→',
    altSymbols: ['->', '=>', '⊃', 'IMPLIES', 'implica'],
    name: 'Implication',
    nameES: 'Implicación',
    type: 'PROPOSITIONAL',
    arity: 2,
    precedence: 2,
    description: 'Falso solo cuando el antecedente es verdadero y el consecuente es falso.',
    example: 'P → Q',
    difficulty: 'BEGINNER',
    inputSymbols: ['->', '=>', '→']
  },
  {
    id: 'IFF',
    symbol: '↔',
    altSymbols: ['<->', '<=>', '≡', 'IFF', 'sii'],
    name: 'Biconditional',
    nameES: 'Bicondicional',
    type: 'PROPOSITIONAL',
    arity: 2,
    precedence: 1,
    description: 'Verdadero cuando ambos operandos tienen el mismo valor de verdad.',
    example: 'P ↔ Q',
    difficulty: 'BEGINNER',
    inputSymbols: ['<->', '<=>', '↔']
  },
  {
    id: 'XOR',
    symbol: '⊕',
    altSymbols: ['XOR', 'xor', '⊻'],
    name: 'Exclusive Or',
    nameES: 'Disyunción Exclusiva',
    type: 'PROPOSITIONAL',
    arity: 2,
    precedence: 3,
    description: 'Verdadero cuando exactamente uno de los operandos es verdadero.',
    example: 'P ⊕ Q',
    difficulty: 'INTERMEDIATE',
    inputSymbols: ['⊕', '⊻']
  },
  {
    id: 'NAND',
    symbol: '|',
    altSymbols: ['NAND', '↑'],
    name: 'NAND (Sheffer Stroke)',
    nameES: 'NAND (Barra de Sheffer)',
    type: 'PROPOSITIONAL',
    arity: 2,
    precedence: 4,
    description: 'Negación de la conjunción. Falso solo cuando ambos son verdaderos.',
    example: 'P | Q',
    difficulty: 'ADVANCED',
    inputSymbols: ['↑']
  },
  {
    id: 'NOR',
    symbol: '↓',
    altSymbols: ['NOR', 'v̄'],
    name: 'NOR (Peirce Arrow)',
    nameES: 'NOR (Flecha de Peirce)',
    type: 'PROPOSITIONAL',
    arity: 2,
    precedence: 3,
    description: 'Negación de la disyunción. Verdadero solo cuando ambos son falsos.',
    example: 'P ↓ Q',
    difficulty: 'ADVANCED',
    inputSymbols: ['↓']
  },
  // Constants
  {
    id: 'TRUE',
    symbol: '⊤',
    altSymbols: ['T', 'true', '1', 'V'],
    name: 'Tautology',
    nameES: 'Verum (Siempre Verdadero)',
    type: 'PROPOSITIONAL',
    arity: 0,
    precedence: 6,
    description: 'Constante que siempre es verdadera.',
    example: '⊤',
    difficulty: 'INTERMEDIATE',
    inputSymbols: ['⊤', 'T']
  },
  {
    id: 'FALSE',
    symbol: '⊥',
    altSymbols: ['F', 'false', '0'],
    name: 'Contradiction',
    nameES: 'Falsum (Siempre Falso)',
    type: 'PROPOSITIONAL',
    arity: 0,
    precedence: 6,
    description: 'Constante que siempre es falsa.',
    example: '⊥',
    difficulty: 'INTERMEDIATE',
    inputSymbols: ['⊥', 'F']
  }
];

// ============================================================================
// MODAL LOGIC OPERATORS
// ============================================================================

export const MODAL_OPERATORS: LogicOperator[] = [
  {
    id: 'NECESSARY',
    symbol: '□',
    altSymbols: ['[]', 'L', 'necessity', 'necesario'],
    name: 'Necessity',
    nameES: 'Necesidad',
    type: 'MODAL',
    arity: 1,
    precedence: 5,
    description: 'Es necesariamente verdadero (verdadero en todos los mundos posibles).',
    example: '□P',
    difficulty: 'ADVANCED',
    inputSymbols: ['□', '[]']
  },
  {
    id: 'POSSIBLE',
    symbol: '◇',
    altSymbols: ['<>', 'M', 'possibility', 'posible'],
    name: 'Possibility',
    nameES: 'Posibilidad',
    type: 'MODAL',
    arity: 1,
    precedence: 5,
    description: 'Es posiblemente verdadero (verdadero en al menos un mundo posible).',
    example: '◇P',
    difficulty: 'ADVANCED',
    inputSymbols: ['◇', '<>']
  }
];

// ============================================================================
// FIRST-ORDER LOGIC (PREDICATE LOGIC) OPERATORS
// ============================================================================

export const FIRST_ORDER_OPERATORS: LogicOperator[] = [
  {
    id: 'FORALL',
    symbol: '∀',
    altSymbols: ['forall', 'A', 'para todo'],
    name: 'Universal Quantifier',
    nameES: 'Cuantificador Universal',
    type: 'FIRST_ORDER',
    arity: 1, // Applies to a formula with a bound variable
    precedence: 5,
    description: 'Para todo x en el dominio, la propiedad se cumple.',
    example: '∀x P(x)',
    difficulty: 'INTERMEDIATE',
    inputSymbols: ['∀', 'A']
  },
  {
    id: 'EXISTS',
    symbol: '∃',
    altSymbols: ['exists', 'E', 'existe'],
    name: 'Existential Quantifier',
    nameES: 'Cuantificador Existencial',
    type: 'FIRST_ORDER',
    arity: 1,
    precedence: 5,
    description: 'Existe al menos un x en el dominio para el cual la propiedad se cumple.',
    example: '∃x P(x)',
    difficulty: 'INTERMEDIATE',
    inputSymbols: ['∃', 'E']
  },
  {
    id: 'EXISTS_UNIQUE',
    symbol: '∃!',
    altSymbols: ['exists!', 'E!'],
    name: 'Unique Existential',
    nameES: 'Cuantificador Existencial Único',
    type: 'FIRST_ORDER',
    arity: 1,
    precedence: 5,
    description: 'Existe exactamente un x para el cual la propiedad se cumple.',
    example: '∃!x P(x)',
    difficulty: 'ADVANCED',
    inputSymbols: ['∃!']
  },
  {
    id: 'IDENTITY',
    symbol: '=',
    altSymbols: ['==', 'equals', 'igual'],
    name: 'Identity',
    nameES: 'Identidad',
    type: 'FIRST_ORDER',
    arity: 2,
    precedence: 4,
    description: 'Los dos términos denotan el mismo objeto.',
    example: 'x = y',
    difficulty: 'INTERMEDIATE',
    inputSymbols: ['=']
  }
];

// ============================================================================
// TEMPORAL LOGIC OPERATORS (LTL)
// ============================================================================

export const TEMPORAL_OPERATORS: LogicOperator[] = [
  {
    id: 'ALWAYS',
    symbol: 'G',
    altSymbols: ['□', 'always', 'siempre', 'globally'],
    name: 'Globally (Always)',
    nameES: 'Siempre (Globalmente)',
    type: 'TEMPORAL',
    arity: 1,
    precedence: 5,
    description: 'La propiedad es verdadera ahora y en todos los estados futuros.',
    example: 'G P',
    difficulty: 'EXPERT',
    inputSymbols: ['G']
  },
  {
    id: 'EVENTUALLY',
    symbol: 'F',
    altSymbols: ['◇', 'eventually', 'eventualmente', 'finally'],
    name: 'Finally (Eventually)',
    nameES: 'Eventualmente (Finalmente)',
    type: 'TEMPORAL',
    arity: 1,
    precedence: 5,
    description: 'La propiedad será verdadera en algún estado futuro.',
    example: 'F P',
    difficulty: 'EXPERT',
    inputSymbols: ['F']
  },
  {
    id: 'NEXT',
    symbol: 'X',
    altSymbols: ['○', 'next', 'siguiente'],
    name: 'Next',
    nameES: 'Siguiente',
    type: 'TEMPORAL',
    arity: 1,
    precedence: 5,
    description: 'La propiedad es verdadera en el siguiente estado.',
    example: 'X P',
    difficulty: 'EXPERT',
    inputSymbols: ['X', '○']
  },
  {
    id: 'UNTIL',
    symbol: 'U',
    altSymbols: ['until', 'hasta'],
    name: 'Until',
    nameES: 'Hasta',
    type: 'TEMPORAL',
    arity: 2,
    precedence: 2,
    description: 'P es verdadero hasta que Q se hace verdadero.',
    example: 'P U Q',
    difficulty: 'EXPERT',
    inputSymbols: ['U']
  },
  {
    id: 'RELEASE',
    symbol: 'R',
    altSymbols: ['release', 'liberar'],
    name: 'Release',
    nameES: 'Liberación',
    type: 'TEMPORAL',
    arity: 2,
    precedence: 2,
    description: 'Q es verdadero hasta e incluyendo cuando P se hace verdadero.',
    example: 'P R Q',
    difficulty: 'EXPERT',
    inputSymbols: ['R']
  }
];

// ============================================================================
// DEONTIC LOGIC OPERATORS
// ============================================================================

export const DEONTIC_OPERATORS: LogicOperator[] = [
  {
    id: 'OBLIGATORY',
    symbol: 'O',
    altSymbols: ['OB', 'obligatorio', 'must'],
    name: 'Obligatory',
    nameES: 'Obligatorio',
    type: 'DEONTIC',
    arity: 1,
    precedence: 5,
    description: 'Es obligatorio que se cumpla esta propiedad.',
    example: 'O P',
    difficulty: 'ADVANCED',
    inputSymbols: ['O']
  },
  {
    id: 'PERMITTED',
    symbol: 'P',
    altSymbols: ['PE', 'permitido', 'may'],
    name: 'Permitted',
    nameES: 'Permitido',
    type: 'DEONTIC',
    arity: 1,
    precedence: 5,
    description: 'Está permitido que se cumpla esta propiedad.',
    example: 'P φ',
    difficulty: 'ADVANCED',
    inputSymbols: ['P']
  },
  {
    id: 'FORBIDDEN',
    symbol: 'F',
    altSymbols: ['FB', 'prohibido', 'must not'],
    name: 'Forbidden',
    nameES: 'Prohibido',
    type: 'DEONTIC',
    arity: 1,
    precedence: 5,
    description: 'Está prohibido que se cumpla esta propiedad (equivale a O¬φ).',
    example: 'F P',
    difficulty: 'ADVANCED',
    inputSymbols: ['F']
  }
];

// ============================================================================
// EPISTEMIC LOGIC OPERATORS
// ============================================================================

export const EPISTEMIC_OPERATORS: LogicOperator[] = [
  {
    id: 'KNOWS',
    symbol: 'K',
    altSymbols: ['knows', 'sabe'],
    name: 'Knows',
    nameES: 'Sabe',
    type: 'EPISTEMIC',
    arity: 1,
    precedence: 5,
    description: 'El agente sabe que la proposición es verdadera.',
    example: 'K_a P',
    difficulty: 'EXPERT',
    inputSymbols: ['K']
  },
  {
    id: 'BELIEVES',
    symbol: 'B',
    altSymbols: ['believes', 'cree'],
    name: 'Believes',
    nameES: 'Cree',
    type: 'EPISTEMIC',
    arity: 1,
    precedence: 5,
    description: 'El agente cree que la proposición es verdadera.',
    example: 'B_a P',
    difficulty: 'EXPERT',
    inputSymbols: ['B']
  }
];

// ============================================================================
// COMBINED CATALOG
// ============================================================================

export const ALL_OPERATORS: LogicOperator[] = [
  ...PROPOSITIONAL_OPERATORS,
  ...MODAL_OPERATORS,
  ...FIRST_ORDER_OPERATORS,
  ...TEMPORAL_OPERATORS,
  ...DEONTIC_OPERATORS,
  ...EPISTEMIC_OPERATORS
];

// Helper functions
export function getOperatorsByType(type: LogicType): LogicOperator[] {
  return ALL_OPERATORS.filter(op => op.type === type);
}

export function getOperatorsByDifficulty(difficulty: DifficultyLevel): LogicOperator[] {
  return ALL_OPERATORS.filter(op => op.difficulty === difficulty);
}

export function getOperatorById(id: string): LogicOperator | undefined {
  return ALL_OPERATORS.find(op => op.id === id);
}

export function getOperatorBySymbol(symbol: string): LogicOperator | undefined {
  return ALL_OPERATORS.find(op =>
    op.symbol === symbol ||
    op.altSymbols.includes(symbol) ||
    op.inputSymbols.includes(symbol)
  );
}

// Display symbol mappings for the UI
export const CONNECTIVE_SYMBOLS: Record<string, string> = {
  AND: '∧',
  OR: '∨',
  NOT: '¬',
  IMPLIES: '→',
  IFF: '↔',
  XOR: '⊕',
  NAND: '↑',
  NOR: '↓',
  NECESSARY: '□',
  POSSIBLE: '◇',
  FORALL: '∀',
  EXISTS: '∃',
  TRUE: '⊤',
  FALSE: '⊥'
};

// Logic type metadata for UI
export const LOGIC_TYPE_INFO: Record<LogicType, { name: string; nameES: string; description: string; color: string }> = {
  PROPOSITIONAL: {
    name: 'Propositional Logic',
    nameES: 'Lógica Proposicional',
    description: 'Lógica básica con proposiciones y conectivos. Fundamento de todo razonamiento formal.',
    color: 'var(--primary)'
  },
  MODAL: {
    name: 'Modal Logic',
    nameES: 'Lógica Modal',
    description: 'Extiende la lógica proposicional con operadores de necesidad y posibilidad.',
    color: 'var(--secondary)'
  },
  FIRST_ORDER: {
    name: 'First-Order Logic',
    nameES: 'Lógica de Primer Orden',
    description: 'Permite cuantificar sobre objetos: "para todo" y "existe".',
    color: 'var(--accent)'
  },
  TEMPORAL: {
    name: 'Temporal Logic',
    nameES: 'Lógica Temporal',
    description: 'Razona sobre el tiempo: siempre, eventualmente, hasta.',
    color: '#f59e0b'
  },
  DEONTIC: {
    name: 'Deontic Logic',
    nameES: 'Lógica Deóntica',
    description: 'Lógica de obligaciones, permisos y prohibiciones.',
    color: '#ec4899'
  },
  EPISTEMIC: {
    name: 'Epistemic Logic',
    nameES: 'Lógica Epistémica',
    description: 'Razona sobre conocimiento y creencias de agentes.',
    color: '#8b5cf6'
  }
};
