import { Formula } from './types';
import { generateTruthTable, TruthAssignment } from './evaluator';

export type FormulaClassification = 'TAUTOLOGY' | 'CONTRADICTION' | 'CONTINGENT';

/**
 * Classifies a formula as tautology, contradiction, or contingent
 */
export function classifyFormula(formula: Formula): FormulaClassification {
  const { rows } = generateTruthTable(formula);

  const allTrue = rows.every(row => row.result === true);
  const allFalse = rows.every(row => row.result === false);

  if (allTrue) return 'TAUTOLOGY';
  if (allFalse) return 'CONTRADICTION';
  return 'CONTINGENT';
}

/**
 * Checks if formula is always true (valid)
 */
export function isTautology(formula: Formula): boolean {
  return classifyFormula(formula) === 'TAUTOLOGY';
}

/**
 * Checks if formula is always false (unsatisfiable)
 */
export function isContradiction(formula: Formula): boolean {
  return classifyFormula(formula) === 'CONTRADICTION';
}

/**
 * Checks if formula is satisfiable (has at least one model)
 */
export function isSatisfiable(formula: Formula): boolean {
  const { rows } = generateTruthTable(formula);
  return rows.some(row => row.result === true);
}

/**
 * Returns all satisfying assignments (models)
 */
export function getModels(formula: Formula): TruthAssignment[] {
  const { rows } = generateTruthTable(formula);
  return rows.filter(row => row.result).map(row => row.assignment);
}

/**
 * Returns all falsifying assignments (counter-models)
 */
export function getCounterModels(formula: Formula): TruthAssignment[] {
  const { rows } = generateTruthTable(formula);
  return rows.filter(row => !row.result).map(row => row.assignment);
}

/**
 * Checks if two formulas are logically equivalent
 */
export function areEquivalent(f1: Formula, f2: Formula): boolean {
  // Build biconditional and check if tautology
  const biconditional: Formula = {
    type: 'BINARY',
    operator: 'IFF',
    left: f1,
    right: f2
  };
  return isTautology(biconditional);
}

/**
 * Checks if f1 logically implies f2 (f1 → f2 is tautology)
 */
export function implies(f1: Formula, f2: Formula): boolean {
  const implication: Formula = {
    type: 'BINARY',
    operator: 'IMPLIES',
    left: f1,
    right: f2
  };
  return isTautology(implication);
}

/**
 * Extracts all subformulas from a formula
 */
export function getSubformulas(formula: Formula): Formula[] {
  const subformulas: Formula[] = [formula];

  switch (formula.type) {
    case 'ATOM':
      break;
    case 'NOT':
      subformulas.push(...getSubformulas(formula.operand));
      break;
    case 'BINARY':
      subformulas.push(...getSubformulas(formula.left));
      subformulas.push(...getSubformulas(formula.right));
      break;
  }

  return subformulas;
}

/**
 * Converts a formula to a readable string representation
 */
export function formulaToString(formula: Formula): string {
  switch (formula.type) {
    case 'ATOM':
      return formula.value;
    case 'NOT':
      const operandStr = formulaToString(formula.operand);
      return formula.operand.type === 'BINARY' ? `¬(${operandStr})` : `¬${operandStr}`;
    case 'BINARY':
      const left = formulaToString(formula.left);
      const right = formulaToString(formula.right);
      const op = {
        'AND': '∧',
        'OR': '∨',
        'IMPLIES': '→',
        'IFF': '↔'
      }[formula.operator];

      // Add parentheses for clarity
      const needsLeftParen = formula.left.type === 'BINARY' &&
        getPrecedence(formula.left.operator) < getPrecedence(formula.operator);
      const needsRightParen = formula.right.type === 'BINARY' &&
        getPrecedence(formula.right.operator) <= getPrecedence(formula.operator);

      const leftStr = needsLeftParen ? `(${left})` : left;
      const rightStr = needsRightParen ? `(${right})` : right;

      return `${leftStr} ${op} ${rightStr}`;
  }
}

function getPrecedence(op: string): number {
  switch (op) {
    case 'IFF': return 1;
    case 'IMPLIES': return 2;
    case 'OR': return 3;
    case 'AND': return 4;
    default: return 0;
  }
}

/**
 * Gets the complexity/depth of a formula
 */
export function getFormulaDepth(formula: Formula): number {
  switch (formula.type) {
    case 'ATOM':
      return 0;
    case 'NOT':
      return 1 + getFormulaDepth(formula.operand);
    case 'BINARY':
      return 1 + Math.max(getFormulaDepth(formula.left), getFormulaDepth(formula.right));
  }
}

/**
 * Counts the number of connectives in a formula
 */
export function countConnectives(formula: Formula): number {
  switch (formula.type) {
    case 'ATOM':
      return 0;
    case 'NOT':
      return 1 + countConnectives(formula.operand);
    case 'BINARY':
      return 1 + countConnectives(formula.left) + countConnectives(formula.right);
  }
}
