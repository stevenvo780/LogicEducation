import { Formula } from './types';

export type TruthAssignment = Record<string, boolean>;

export function getVariables(formula: Formula): Set<string> {
  switch (formula.type) {
    case 'ATOM':
      return new Set([formula.value]);
    case 'NOT':
      return getVariables(formula.operand);
    case 'BINARY':
      const leftVars = getVariables(formula.left);
      const rightVars = getVariables(formula.right);
      return new Set([...leftVars, ...rightVars]);
  }
}

export function evaluate(formula: Formula, assignment: TruthAssignment): boolean {
  switch (formula.type) {
    case 'ATOM':
      return !!assignment[formula.value];
    case 'NOT':
      return !evaluate(formula.operand, assignment);
    case 'BINARY':
      const left = evaluate(formula.left, assignment);
      const right = evaluate(formula.right, assignment);
      switch (formula.operator) {
        case 'AND': return left && right;
        case 'OR': return left || right;
        case 'IMPLIES': return !left || right;
        case 'IFF': return left === right;
      }
  }
}

export function generateTruthTable(formula: Formula): { variables: string[], rows: { assignment: TruthAssignment, result: boolean }[] } {
  const variables = Array.from(getVariables(formula)).sort();
  const numRows = Math.pow(2, variables.length);
  const rows = [];

  for (let i = 0; i < numRows; i++) {
    const assignment: TruthAssignment = {};
    for (let j = 0; j < variables.length; j++) {
      // Create assignment based on bitmask, most significant bit first or last.
      // Here: variable 0 corresponds to the highest bit (standard convention usually T T, T F, F T, F F)
      // Actually standard usually alternates last variable fastest.
      // Let's use: variables[j] is true if the j-th bit is 1.
      // To match T T T, T T F order, we might want to iterate backwards.
      // Let's stick to a simple mapping first:
      // const truthValue = !((i >> (variables.length - 1 - j)) & 1); // unused
      // Wait, standard binary counting 00, 01, 10, 11 corresponds to F F, F T, T F, T T.
      // Usually truth tables start with T T.
      // Let's make 0 = True, 1 = False ? No that's confusing.
      // Let's just do binary counting: 1 = True, 0 = False.
      // And evaluating i from 2^n - 1 down to 0 gives T T ... down to F F.

      const val = ((numRows - 1 - i) >> (variables.length - 1 - j)) & 1;
      assignment[variables[j]] = val === 1;
    }
    const result = evaluate(formula, assignment);
    rows.push({ assignment, result });
  }

  return { variables, rows };
}
