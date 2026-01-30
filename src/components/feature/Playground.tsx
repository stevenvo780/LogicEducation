"use client";

import React, { useState, useRef } from 'react';
import { TruthTable } from '@/components/logic/TruthTable';
import { Sparkles, Keyboard } from 'lucide-react';
import { motion } from 'framer-motion';

const SYMEBOLS = [
  { char: '¬', label: 'NO', key: '~' },
  { char: '∧', label: 'Y', key: '&' },
  { char: '∨', label: 'O', key: '|' },
  { char: '→', label: 'IMPLICA', key: '->' },
  { char: '↔', label: 'SI_SOLO_SI', key: '<->' },
];

export const Playground = () => {
  const [formula, setFormula] = useState<string>('P -> (Q & R)');
  const inputRef = useRef<HTMLInputElement>(null);

  const insertSymbol = (sym: string) => {
    if (!inputRef.current) return;

    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;

    const newFormula = formula.substring(0, start) + sym + formula.substring(end);
    setFormula(newFormula);

    // Defer focus restoration
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + sym.length, start + sym.length);
      }
    }, 10);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Editor Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-1 overflow-hidden"
      >
        <div className="bg-[#0f111a] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Editor Lógico
            </label>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              Presiona teclas o usa la barra
            </span>
          </div>

          {/* Toolbar */}
          <div className="flex gap-2 flex-wrap pb-4 border-b border-white/5">
            {SYMEBOLS.map((s) => (
              <button
                key={s.label}
                onClick={() => insertSymbol(s.key)}
                className="btn-premium text-sm group hover:border-[var(--secondary)]"
              >
                <span className="text-[var(--secondary)] font-bold text-lg">{s.char}</span>
                <span className="text-xs text-gray-400 font-normal">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="relative group">
            <input
              ref={inputRef}
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-6 text-2xl font-mono text-white placeholder-gray-700 outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all"
              placeholder="Ingresa la fórmula..."
              spellCheck={false}
            />
          </div>

          <p className="text-xs text-gray-600 font-mono">
            Ejemplo: (A ∨ B) ∧ ¬C
          </p>
        </div>
      </motion.div>

      {/* Results Section */}
      <TruthTable formulaStr={formula} />
    </div>
  );
};
