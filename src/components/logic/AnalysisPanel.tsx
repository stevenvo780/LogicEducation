"use client";

import React, { useMemo } from 'react';
import { LogicParser } from '@/lib/logic/parser';
import {
  classifyFormula,
  isSatisfiable,
  getModels,
  getSubformulas,
  formulaToString,
  getFormulaDepth,
  countConnectives,
  FormulaClassification
} from '@/lib/logic/analyzer';
import { toCNF, toDNF, toNNF } from '@/lib/logic/normalForms';
import { getVariables } from '@/lib/logic/evaluator';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Binary,
  GitBranch,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisPanelProps {
  formulaStr: string;
}

const ClassificationBadge: React.FC<{ classification: FormulaClassification }> = ({ classification }) => {
  const config = {
    'TAUTOLOGY': {
      icon: CheckCircle2,
      label: 'Tautología',
      description: 'Siempre verdadera',
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    'CONTRADICTION': {
      icon: XCircle,
      label: 'Contradicción',
      description: 'Siempre falsa',
      className: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    },
    'CONTINGENT': {
      icon: HelpCircle,
      label: 'Contingencia',
      description: 'Depende de las variables',
      className: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    }
  }[classification];

  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-xl border",
      config.className
    )}>
      <Icon className="w-8 h-8" />
      <div>
        <div className="font-bold text-lg">{config.label}</div>
        <div className="text-sm opacity-75">{config.description}</div>
      </div>
    </div>
  );
};

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ formulaStr }) => {
  const analysis = useMemo(() => {
    try {
      if (!formulaStr.trim()) return null;

      const parser = new LogicParser();
      const formula = parser.parse(formulaStr);

      const classification = classifyFormula(formula);
      const satisfiable = isSatisfiable(formula);
      const models = getModels(formula);
      const subformulas = getSubformulas(formula);
      const variables = Array.from(getVariables(formula)).sort();
      const depth = getFormulaDepth(formula);
      const connectiveCount = countConnectives(formula);

      // Normal forms
      const cnf = toCNF(formula);
      const dnf = toDNF(formula);
      const nnf = toNNF(formula);

      return {
        formula,
        classification,
        satisfiable,
        models: models.slice(0, 5), // Limit to 5 models for display
        totalModels: models.length,
        subformulas: subformulas.map(sf => ({
          formula: sf,
          str: formulaToString(sf)
        })),
        variables,
        depth,
        connectiveCount,
        cnfStr: formulaToString(cnf),
        dnfStr: formulaToString(dnf),
        nnfStr: formulaToString(nnf),
        error: null
      };
    } catch (e: unknown) {
      return { error: (e as Error).message };
    }
  }, [formulaStr]);

  if (!analysis) return null;

  if (analysis.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
      >
        <AlertTriangle className="w-5 h-5" />
        <span className="font-mono text-sm">{analysis.error}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Classification */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-[var(--accent)]">
          <Sparkles className="w-5 h-5" />
          Clasificación
        </h3>
        <ClassificationBadge classification={analysis.classification!} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--primary)]">{analysis.variables?.length}</div>
            <div className="text-xs text-gray-500 uppercase">Variables</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--secondary)]">{analysis.connectiveCount}</div>
            <div className="text-xs text-gray-500 uppercase">Conectivos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--accent)]">{analysis.depth}</div>
            <div className="text-xs text-gray-500 uppercase">Profundidad</div>
          </div>
        </div>
      </div>

      {/* Models */}
      {analysis.classification === 'CONTINGENT' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            Modelos Satisfacientes ({analysis.totalModels})
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.models?.map((model, idx) => (
              <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 font-mono text-sm">
                {Object.entries(model).map(([v, val]) => (
                  <span key={v} className="mr-2">
                    <span className="text-gray-400">{v}=</span>
                    <span className={val ? 'text-emerald-400' : 'text-rose-400'}>{val ? 'V' : 'F'}</span>
                  </span>
                ))}
              </div>
            ))}
            {analysis.totalModels! > 5 && (
              <div className="text-gray-500 text-sm self-center">
                +{analysis.totalModels! - 5} más...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Normal Forms */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-[var(--primary)]">
          <Binary className="w-5 h-5" />
          Formas Normales
        </h3>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500 uppercase mb-1">Forma Normal Negada (NNF)</div>
            <div className="bg-black/30 rounded-lg p-3 font-mono text-sm text-gray-300 break-all">
              {analysis.nnfStr}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase mb-1">Forma Normal Conjuntiva (CNF)</div>
            <div className="bg-black/30 rounded-lg p-3 font-mono text-sm text-indigo-300 break-all">
              {analysis.cnfStr}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase mb-1">Forma Normal Disyuntiva (DNF)</div>
            <div className="bg-black/30 rounded-lg p-3 font-mono text-sm text-cyan-300 break-all">
              {analysis.dnfStr}
            </div>
          </div>
        </div>
      </div>

      {/* Subformulas */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-[var(--secondary)]">
          <GitBranch className="w-5 h-5" />
          Subfórmulas ({analysis.subformulas?.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.subformulas?.map((sf, idx) => (
            <div
              key={idx}
              className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1.5 font-mono text-sm text-purple-300"
            >
              {sf.str}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
