"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LogicType,
  LogicOperator,
  DifficultyLevel,
  ALL_OPERATORS,
  getOperatorsByType,
  LOGIC_TYPE_INFO
} from '@/lib/logic/operators';

interface OperatorReferenceProps {
  onSelectOperator?: (operator: LogicOperator) => void;
  compact?: boolean;
  filterDifficulty?: DifficultyLevel[];
  filterTypes?: LogicType[];
}

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; className: string }> = {
  BEGINNER: { label: 'Principiante', className: 'bg-emerald-500/20 text-emerald-400' },
  INTERMEDIATE: { label: 'Intermedio', className: 'bg-amber-500/20 text-amber-400' },
  ADVANCED: { label: 'Avanzado', className: 'bg-orange-500/20 text-orange-400' },
  EXPERT: { label: 'Experto', className: 'bg-rose-500/20 text-rose-400' }
};

const LOGIC_TYPES_ORDER: LogicType[] = [
  'PROPOSITIONAL',
  'FIRST_ORDER',
  'MODAL',
  'TEMPORAL',
  'DEONTIC',
  'EPISTEMIC'
];

export const OperatorReference: React.FC<OperatorReferenceProps> = ({
  onSelectOperator,
  compact = false,
  filterDifficulty,
  filterTypes
}) => {
  const [expandedTypes, setExpandedTypes] = useState<Set<LogicType>>(new Set(['PROPOSITIONAL']));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<LogicOperator | null>(null);

  const toggleType = (type: LogicType) => {
    setExpandedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const filteredTypes = filterTypes || LOGIC_TYPES_ORDER;

  const getFilteredOperators = (type: LogicType): LogicOperator[] => {
    let operators = getOperatorsByType(type);

    if (filterDifficulty && filterDifficulty.length > 0) {
      operators = operators.filter(op => filterDifficulty.includes(op.difficulty));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      operators = operators.filter(op =>
        op.name.toLowerCase().includes(query) ||
        op.nameES.toLowerCase().includes(query) ||
        op.symbol.includes(query) ||
        op.altSymbols.some(s => s.toLowerCase().includes(query)) ||
        op.description.toLowerCase().includes(query)
      );
    }

    return operators;
  };

  const handleOperatorClick = (operator: LogicOperator) => {
    setSelectedOperator(selectedOperator?.id === operator.id ? null : operator);
    onSelectOperator?.(operator);
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {ALL_OPERATORS.filter(op =>
          (!filterTypes || filterTypes.includes(op.type)) &&
          (!filterDifficulty || filterDifficulty.includes(op.difficulty))
        ).map(op => (
          <button
            key={op.id}
            onClick={() => handleOperatorClick(op)}
            className={cn(
              "px-3 py-1.5 rounded-lg font-mono text-lg transition-all",
              "bg-white/5 hover:bg-white/10 border border-white/10",
              "hover:border-[var(--primary)]/50"
            )}
            title={`${op.nameES}: ${op.description}`}
          >
            {op.symbol}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar operador..."
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all"
        />
      </div>

      {/* Logic Types Accordion */}
      <div className="space-y-3">
        {filteredTypes.map(type => {
          const typeInfo = LOGIC_TYPE_INFO[type];
          const operators = getFilteredOperators(type);
          const isExpanded = expandedTypes.has(type);

          if (operators.length === 0 && searchQuery) return null;

          return (
            <div key={type} className="glass rounded-xl overflow-hidden">
              {/* Type Header */}
              <button
                onClick={() => toggleType(type)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: typeInfo.color }}
                  />
                  <div className="text-left">
                    <h3 className="font-semibold">{typeInfo.nameES}</h3>
                    <p className="text-xs text-gray-500">{operators.length} operadores</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Operators List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-2">
                      {operators.map(op => (
                        <OperatorCard
                          key={op.id}
                          operator={op}
                          isSelected={selectedOperator?.id === op.id}
                          onClick={() => handleOperatorClick(op)}
                          color={typeInfo.color}
                        />
                      ))}
                      {operators.length === 0 && (
                        <p className="text-gray-500 text-center py-4 text-sm">
                          No hay operadores que coincidan con la búsqueda
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {searchQuery && filteredTypes.every(t => getFilteredOperators(t).length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No se encontraron operadores</p>
        </div>
      )}
    </div>
  );
};

// Individual Operator Card
interface OperatorCardProps {
  operator: LogicOperator;
  isSelected: boolean;
  onClick: () => void;
  color: string;
}

const OperatorCard: React.FC<OperatorCardProps> = ({ operator, isSelected, onClick, color }) => {
  const diffConfig = DIFFICULTY_CONFIG[operator.difficulty];

  return (
    <motion.div
      layout
      onClick={onClick}
      className={cn(
        "rounded-xl p-4 cursor-pointer transition-all border",
        isSelected
          ? "bg-white/10 border-white/20"
          : "bg-black/20 border-transparent hover:bg-white/5 hover:border-white/10"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Symbol */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-mono shrink-0"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {operator.symbol}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold">{operator.nameES}</h4>
            <span className={cn("px-2 py-0.5 rounded-full text-xs", diffConfig.className)}>
              {diffConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{operator.name}</p>

          {/* Expanded Details */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  <p className="text-sm text-gray-300">{operator.description}</p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-gray-500">Ejemplo:</span>
                    <code className="bg-black/30 px-2 py-0.5 rounded font-mono" style={{ color }}>
                      {operator.example}
                    </code>
                  </div>

                  {operator.altSymbols.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="text-gray-500">También:</span>
                      {operator.altSymbols.slice(0, 4).map((sym, i) => (
                        <code key={i} className="bg-black/30 px-2 py-0.5 rounded font-mono text-gray-400">
                          {sym}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// Simplified Symbol Palette for quick insertion
interface SymbolPaletteProps {
  onInsert: (symbol: string) => void;
  logicType?: LogicType;
  difficulty?: DifficultyLevel[];
}

export const SymbolPalette: React.FC<SymbolPaletteProps> = ({
  onInsert,
  logicType = 'PROPOSITIONAL',
  difficulty = ['BEGINNER', 'INTERMEDIATE']
}) => {
  const operators = getOperatorsByType(logicType).filter(op =>
    difficulty.includes(op.difficulty)
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {operators.map(op => (
        <button
          key={op.id}
          type="button"
          onClick={() => onInsert(op.inputSymbols[0] || op.symbol)}
          className={cn(
            "w-10 h-10 rounded-lg font-mono text-xl transition-all",
            "bg-white/5 hover:bg-white/10 border border-white/10",
            "hover:border-[var(--primary)]/50 hover:scale-105"
          )}
          title={op.nameES}
        >
          {op.symbol}
        </button>
      ))}
    </div>
  );
};

export default OperatorReference;
