import { Formula } from './types';

/**
 * Eliminates implications and biconditionals using equivalences:
 * - A → B ≡ ¬A ∨ B
 * - A ↔ B ≡ (A → B) ∧ (B → A) ≡ (¬A ∨ B) ∧ (¬B ∨ A)
 */
export function eliminateImplications(formula: Formula): Formula {
  switch (formula.type) {
    case 'ATOM':
      return formula;
    case 'NOT':
      return { type: 'NOT', operand: eliminateImplications(formula.operand) };
    case 'BINARY':
      const left = eliminateImplications(formula.left);
      const right = eliminateImplications(formula.right);

      switch (formula.operator) {
        case 'IMPLIES':
          // A → B ≡ ¬A ∨ B
          return {
            type: 'BINARY',
            operator: 'OR',
            left: { type: 'NOT', operand: left },
            right: right
          };
        case 'IFF':
          // A ↔ B ≡ (¬A ∨ B) ∧ (¬B ∨ A)
          return {
            type: 'BINARY',
            operator: 'AND',
            left: {
              type: 'BINARY',
              operator: 'OR',
              left: { type: 'NOT', operand: left },
              right: right
            },
            right: {
              type: 'BINARY',
              operator: 'OR',
              left: { type: 'NOT', operand: right },
              right: left
            }
          };
        default:
          return { type: 'BINARY', operator: formula.operator, left, right };
      }
  }
}

/**
 * Pushes negations inward using De Morgan's laws:
 * - ¬(A ∧ B) ≡ ¬A ∨ ¬B
 * - ¬(A ∨ B) ≡ ¬A ∧ ¬B
 * - ¬¬A ≡ A
 */
export function pushNegationsInward(formula: Formula): Formula {
  switch (formula.type) {
    case 'ATOM':
      return formula;
    case 'NOT':
      const operand = formula.operand;
      switch (operand.type) {
        case 'ATOM':
          return formula; // ¬P stays as is
        case 'NOT':
          // ¬¬A ≡ A (double negation elimination)
          return pushNegationsInward(operand.operand);
        case 'BINARY':
          // De Morgan's laws
          if (operand.operator === 'AND') {
            // ¬(A ∧ B) ≡ ¬A ∨ ¬B
            return pushNegationsInward({
              type: 'BINARY',
              operator: 'OR',
              left: { type: 'NOT', operand: operand.left },
              right: { type: 'NOT', operand: operand.right }
            });
          } else if (operand.operator === 'OR') {
            // ¬(A ∨ B) ≡ ¬A ∧ ¬B
            return pushNegationsInward({
              type: 'BINARY',
              operator: 'AND',
              left: { type: 'NOT', operand: operand.left },
              right: { type: 'NOT', operand: operand.right }
            });
          }
          // Should not reach here after eliminating implications
          return formula;
      }
    case 'BINARY':
      return {
        type: 'BINARY',
        operator: formula.operator,
        left: pushNegationsInward(formula.left),
        right: pushNegationsInward(formula.right)
      };
  }
}

/**
 * Distributes OR over AND for CNF conversion:
 * A ∨ (B ∧ C) ≡ (A ∨ B) ∧ (A ∨ C)
 */
function distributeOrOverAnd(formula: Formula): Formula {
  if (formula.type !== 'BINARY' || formula.operator !== 'OR') {
    return formula;
  }

  const left = formula.left;
  const right = formula.right;

  // If right is A ∧ B, distribute: left ∨ (A ∧ B) → (left ∨ A) ∧ (left ∨ B)
  if (right.type === 'BINARY' && right.operator === 'AND') {
    return {
      type: 'BINARY',
      operator: 'AND',
      left: distributeOrOverAnd({
        type: 'BINARY',
        operator: 'OR',
        left: left,
        right: right.left
      }),
      right: distributeOrOverAnd({
        type: 'BINARY',
        operator: 'OR',
        left: left,
        right: right.right
      })
    };
  }

  // If left is A ∧ B, distribute: (A ∧ B) ∨ right → (A ∨ right) ∧ (B ∨ right)
  if (left.type === 'BINARY' && left.operator === 'AND') {
    return {
      type: 'BINARY',
      operator: 'AND',
      left: distributeOrOverAnd({
        type: 'BINARY',
        operator: 'OR',
        left: left.left,
        right: right
      }),
      right: distributeOrOverAnd({
        type: 'BINARY',
        operator: 'OR',
        left: left.right,
        right: right
      })
    };
  }

  return formula;
}

/**
 * Distributes AND over OR for DNF conversion:
 * A ∧ (B ∨ C) ≡ (A ∧ B) ∨ (A ∧ C)
 */
function distributeAndOverOr(formula: Formula): Formula {
  if (formula.type !== 'BINARY' || formula.operator !== 'AND') {
    return formula;
  }

  const left = formula.left;
  const right = formula.right;

  // If right is A ∨ B, distribute: left ∧ (A ∨ B) → (left ∧ A) ∨ (left ∧ B)
  if (right.type === 'BINARY' && right.operator === 'OR') {
    return {
      type: 'BINARY',
      operator: 'OR',
      left: distributeAndOverOr({
        type: 'BINARY',
        operator: 'AND',
        left: left,
        right: right.left
      }),
      right: distributeAndOverOr({
        type: 'BINARY',
        operator: 'AND',
        left: left,
        right: right.right
      })
    };
  }

  // If left is A ∨ B, distribute: (A ∨ B) ∧ right → (A ∧ right) ∨ (B ∧ right)
  if (left.type === 'BINARY' && left.operator === 'OR') {
    return {
      type: 'BINARY',
      operator: 'OR',
      left: distributeAndOverOr({
        type: 'BINARY',
        operator: 'AND',
        left: left.left,
        right: right
      }),
      right: distributeAndOverOr({
        type: 'BINARY',
        operator: 'AND',
        left: left.right,
        right: right
      })
    };
  }

  return formula;
}

/**
 * Recursively applies CNF transformation
 */
function toCNFRecursive(formula: Formula): Formula {
  if (formula.type === 'ATOM' || formula.type === 'NOT') {
    return formula;
  }

  if (formula.type === 'BINARY') {
    const left = toCNFRecursive(formula.left);
    const right = toCNFRecursive(formula.right);

    const combined: Formula = { type: 'BINARY', operator: formula.operator, left, right };

    if (formula.operator === 'OR') {
      return distributeOrOverAnd(combined);
    }

    return combined;
  }

  return formula;
}

/**
 * Recursively applies DNF transformation
 */
function toDNFRecursive(formula: Formula): Formula {
  if (formula.type === 'ATOM' || formula.type === 'NOT') {
    return formula;
  }

  if (formula.type === 'BINARY') {
    const left = toDNFRecursive(formula.left);
    const right = toDNFRecursive(formula.right);

    const combined: Formula = { type: 'BINARY', operator: formula.operator, left, right };

    if (formula.operator === 'AND') {
      return distributeAndOverOr(combined);
    }

    return combined;
  }

  return formula;
}

/**
 * Converts a formula to Conjunctive Normal Form (CNF)
 * CNF is a conjunction of disjunctions: (A ∨ B) ∧ (C ∨ D) ∧ ...
 */
export function toCNF(formula: Formula): Formula {
  // Step 1: Eliminate implications and biconditionals
  let result = eliminateImplications(formula);

  // Step 2: Push negations inward (NNF)
  result = pushNegationsInward(result);

  // Step 3: Distribute OR over AND
  result = toCNFRecursive(result);

  return result;
}

/**
 * Converts a formula to Disjunctive Normal Form (DNF)
 * DNF is a disjunction of conjunctions: (A ∧ B) ∨ (C ∧ D) ∨ ...
 */
export function toDNF(formula: Formula): Formula {
  // Step 1: Eliminate implications and biconditionals
  let result = eliminateImplications(formula);

  // Step 2: Push negations inward (NNF)
  result = pushNegationsInward(result);

  // Step 3: Distribute AND over OR
  result = toDNFRecursive(result);

  return result;
}

/**
 * Converts a formula to Negation Normal Form (NNF)
 * NNF has negations only applied to atoms
 */
export function toNNF(formula: Formula): Formula {
  let result = eliminateImplications(formula);
  result = pushNegationsInward(result);
  return result;
}

/**
 * Simple type for clauses in CNF/DNF representation
 */
export type Literal = { variable: string; negated: boolean };
export type Clause = Literal[];

/**
 * Extracts clauses from a CNF formula
 */
export function extractCNFClauses(formula: Formula): Clause[] {
  const cnf = toCNF(formula);
  return extractConjuncts(cnf).map(clause => extractLiteralsFromDisjunction(clause));
}

/**
 * Extracts clauses from a DNF formula
 */
export function extractDNFClauses(formula: Formula): Clause[] {
  const dnf = toDNF(formula);
  return extractDisjuncts(dnf).map(clause => extractLiteralsFromConjunction(clause));
}

function extractConjuncts(formula: Formula): Formula[] {
  if (formula.type === 'BINARY' && formula.operator === 'AND') {
    return [...extractConjuncts(formula.left), ...extractConjuncts(formula.right)];
  }
  return [formula];
}

function extractDisjuncts(formula: Formula): Formula[] {
  if (formula.type === 'BINARY' && formula.operator === 'OR') {
    return [...extractDisjuncts(formula.left), ...extractDisjuncts(formula.right)];
  }
  return [formula];
}

function extractLiteralsFromDisjunction(formula: Formula): Literal[] {
  if (formula.type === 'ATOM') {
    return [{ variable: formula.value, negated: false }];
  }
  if (formula.type === 'NOT' && formula.operand.type === 'ATOM') {
    return [{ variable: formula.operand.value, negated: true }];
  }
  if (formula.type === 'BINARY' && formula.operator === 'OR') {
    return [...extractLiteralsFromDisjunction(formula.left), ...extractLiteralsFromDisjunction(formula.right)];
  }
  return [];
}

function extractLiteralsFromConjunction(formula: Formula): Literal[] {
  if (formula.type === 'ATOM') {
    return [{ variable: formula.value, negated: false }];
  }
  if (formula.type === 'NOT' && formula.operand.type === 'ATOM') {
    return [{ variable: formula.operand.value, negated: true }];
  }
  if (formula.type === 'BINARY' && formula.operator === 'AND') {
    return [...extractLiteralsFromConjunction(formula.left), ...extractLiteralsFromConjunction(formula.right)];
  }
  return [];
}
