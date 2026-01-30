export type Connective = 'AND' | 'OR' | 'IMPLIES' | 'IFF';

export type FormulaType = 'ATOM' | 'NOT' | 'BINARY';

export interface AtomFormula {
  type: 'ATOM';
  value: string; // The propositional variable, e.g., "P", "Q"
}

export interface NotFormula {
  type: 'NOT';
  operand: Formula;
}

export interface BinaryFormula {
  type: 'BINARY';
  operator: Connective;
  left: Formula;
  right: Formula;
}

export type Formula = AtomFormula | NotFormula | BinaryFormula;

export const CONNECTIVE_SYMBOLS: Record<Connective | 'NOT', string> = {
  AND: '∧',
  OR: '∨',
  NOT: '¬',
  IMPLIES: '→',
  IFF: '↔',
};
