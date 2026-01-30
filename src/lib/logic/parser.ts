import { Formula, Connective } from './types';

type TokenType = 'ATOM' | 'LPAREN' | 'RPAREN' | 'NOT' | Connective | 'EOF';

interface Token {
  type: TokenType;
  value?: string;
  operator?: Connective; // Added optional property
  pos: number;
}

export class LogicParser {
  private tokens: Token[] = [];
  private pos = 0;

  parse(input: string): Formula {
    this.tokens = this.tokenize(input);
    this.pos = 0;
    const result = this.parseIff();
    if (this.current().type !== 'EOF') {
      throw new Error(`Unexpected token at position ${this.current().pos}: ${this.current().type}`);
    }
    return result;
  }

  private tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < input.length) {
      const char = input[i];
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      if (/[A-Za-z]/.test(char)) {
        let value = '';
        const start = i;
        while (i < input.length && /[A-Za-z0-9_]/.test(input[i])) {
          value += input[i];
          i++;
        }
        // Check for specific keywords if necessary, but here we assume all alpha are atoms
        // Let's treat 'v' as OR if it is strictly 'v', but that might conflict with var 'v'.
        // For robustness, let's require 'v' to be OR, and variables to be anything else?
        // Or better, support standard symbols only.
        // Let's treat 'v' as variable for now unless user strictly uses it as logic. 
        // Actually, 'v' is commonly OR. Let's make it OR if it's single 'v'? 
        // Risky. Let's stick to standard chars first.
        tokens.push({ type: 'ATOM', value, pos: start });
      } else if (char === '(') {
        tokens.push({ type: 'LPAREN', pos: i++ });
      } else if (char === ')') {
        tokens.push({ type: 'RPAREN', pos: i++ });
      } else if ('~¬!'.includes(char)) {
        tokens.push({ type: 'NOT', pos: i++ });
      } else if ('&^∧'.includes(char)) {
        tokens.push({ type: 'AND', operator: 'AND', pos: i++ });
      } else if ('|∨'.includes(char)) {
        tokens.push({ type: 'OR', operator: 'OR', pos: i++ });
      } else if ('→'.includes(char)) {
        tokens.push({ type: 'IMPLIES', operator: 'IMPLIES', pos: i++ });
      } else if ('↔'.includes(char)) {
        tokens.push({ type: 'IFF', operator: 'IFF', pos: i++ });
      } else if (char === '-') {
        if (input[i + 1] === '>') {
          tokens.push({ type: 'IMPLIES', operator: 'IMPLIES', pos: i });
          i += 2;
        } else {
          throw new Error(`Unknown char - at ${i}`);
        }
      } else if (char === '=') {
        if (input[i + 1] === '>') {
          tokens.push({ type: 'IMPLIES', operator: 'IMPLIES', pos: i });
          i += 2;
        } else {
          throw new Error(`Unknown char = at ${i}`);
        }
      } else if (char === '<') {
        if (input.slice(i, i + 3) === '<->' || input.slice(i, i + 3) === '<=>') {
          tokens.push({ type: 'IFF', operator: 'IFF', pos: i });
          i += 3;
        } else if (input.slice(i, i + 2) === '->') {
          // Should not happen for <
          throw new Error(`Unknown char < at ${i}`);
        } else {
          throw new Error(`Unknown char < at ${i}`);
        }
      } else {
        throw new Error(`Unknown char ${char} at ${i}`);
      }
    }
    tokens.push({ type: 'EOF', pos: i });
    return tokens;
  }

  private current(): Token {
    return this.tokens[this.pos];
  }

  private consume(type: TokenType): Token {
    if (this.current().type === type) {
      return this.tokens[this.pos++];
    }
    throw new Error(`Expected ${type} but found ${this.current().type} at ${this.current().pos}`);
  }

  // Expression grammar:
  // Iff -> Implies ( <-> Implies )*
  // Implies -> Or ( -> Or )*
  // Or -> And ( | And )*
  // And -> Not ( & Not )*
  // Not -> ~Not | AtomTerm
  // AtomTerm -> ( Iff ) | ATOM

  private parseIff(): Formula {
    let left = this.parseImplies();
    while (this.current().type === 'IFF') {
      this.pos++;
      const right = this.parseImplies();
      left = { type: 'BINARY', operator: 'IFF', left, right };
    }
    return left;
  }

  private parseImplies(): Formula {
    const left = this.parseOr();
    // Implies is often right-associative? A -> B -> C usually means A -> (B -> C).
    // But let's keep it left associative for simplicity unless standard requires otherwise.
    // Standard logic text: A -> B -> C is (A -> B) -> C or A -> (B -> C)?
    // Convention varies. Let's do right associative for Implies usually.
    // If I see -> I parse the rest as implies.
    if (this.current().type === 'IMPLIES') {
      this.pos++;
      const right = this.parseImplies(); // Recursive call for right associativity
      return { type: 'BINARY', operator: 'IMPLIES', left, right };
    }
    return left;
  }

  private parseOr(): Formula {
    let left = this.parseAnd();
    while (this.current().type === 'OR') {
      this.pos++;
      const right = this.parseAnd();
      left = { type: 'BINARY', operator: 'OR', left, right };
    }
    return left;
  }

  private parseAnd(): Formula {
    let left = this.parseNot();
    while (this.current().type === 'AND') {
      this.pos++;
      const right = this.parseNot();
      left = { type: 'BINARY', operator: 'AND', left, right };
    }
    return left;
  }

  private parseNot(): Formula {
    if (this.current().type === 'NOT') {
      this.pos++;
      return { type: 'NOT', operand: this.parseNot() };
    }
    return this.parseAtom();
  }

  private parseAtom(): Formula {
    if (this.current().type === 'LPAREN') {
      this.consume('LPAREN');
      const expr = this.parseIff();
      this.consume('RPAREN');
      return expr;
    }
    if (this.current().type === 'ATOM') {
      const token = this.consume('ATOM');
      return { type: 'ATOM', value: token.value! };
    }
    throw new Error(`Unexpected token at atom expectation: ${this.current().type} at ${this.current().pos}`);
  }
}
