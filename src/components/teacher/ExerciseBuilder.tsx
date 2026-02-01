"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  X,
  Eye,
  Sparkles,
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ExerciseType,
  EXERCISE_TYPES,
  MultipleChoiceContent,
  FormulationContent,
  ValidationContent,
  TruthTableContent,
  SymbolArrangementContent,
  NormalFormContent,
  IdentifyFallacyContent,
  ProofContent,
  generateOptionId
} from '@/lib/exercises/exerciseTypes';
import { TruthTable } from '@/components/logic/TruthTable';

interface ExerciseBuilderProps {
  classroomId: string;
  onClose: () => void;
  onCreated: () => void;
  initialData?: {
    type: ExerciseType;
    title: string;
    description?: string;
    content: unknown;
    solution: unknown;
  };
}

type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

// ============================================================================
// MAIN BUILDER COMPONENT
// ============================================================================

export const ExerciseBuilder: React.FC<ExerciseBuilderProps> = ({
  classroomId,
  onClose,
  onCreated,
  initialData
}) => {
  // Basic fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [exerciseType, setExerciseType] = useState<ExerciseType>(
    initialData?.type || 'MULTIPLE_CHOICE'
  );

  // Type-specific content
  const [content, setContent] = useState<unknown>(initialData?.content || {});
  const [solution, setSolution] = useState<unknown>(initialData?.solution || {});

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const typeInfo = EXERCISE_TYPES[exerciseType];

  // Handle type change
  const handleTypeChange = (newType: ExerciseType) => {
    setExerciseType(newType);
    setContent({});
    setSolution({});
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          explanation,
          type: exerciseType,
          content: JSON.stringify(content),
          solution: JSON.stringify(solution),
          difficulty,
          classroomId
        })
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al crear el ejercicio');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[var(--accent)]" />
            Crear Ejercicio
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exercise Type Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-400">
              Tipo de Ejercicio
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(EXERCISE_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTypeChange(key as ExerciseType)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    exerciseType === key
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  )}
                >
                  <div className="font-medium text-sm">{info.nameES}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {info.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Título del Ejercicio
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all"
                placeholder="Ej: Leyes de De Morgan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Dificultad
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'EASY', label: 'Fácil', className: 'data-[active=true]:bg-emerald-500/30 data-[active=true]:border-emerald-500' },
                  { value: 'MEDIUM', label: 'Medio', className: 'data-[active=true]:bg-amber-500/30 data-[active=true]:border-amber-500' },
                  { value: 'HARD', label: 'Difícil', className: 'data-[active=true]:bg-rose-500/30 data-[active=true]:border-rose-500' }
                ].map(d => (
                  <button
                    key={d.value}
                    type="button"
                    data-active={difficulty === d.value}
                    onClick={() => setDifficulty(d.value as DifficultyLevel)}
                    className={cn(
                      "flex-1 py-3 rounded-xl border border-white/10 transition-all",
                      d.className
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all resize-none h-20"
              placeholder="Instrucciones para el estudiante..."
            />
          </div>

          {/* Type-Specific Content Editor */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                📝
              </span>
              Contenido: {typeInfo.nameES}
            </h3>

            <TypeSpecificEditor
              type={exerciseType}
              content={content}
              solution={solution}
              onContentChange={setContent}
              onSolutionChange={setSolution}
            />
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Explicación / Feedback (Opcional)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all resize-none h-20"
              placeholder="Explicación que verá el estudiante al completar el ejercicio..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Ocultar' : 'Vista Previa'}
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 btn-premium bg-[var(--accent)] hover:bg-cyan-600 border-none justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Ejercicio'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============================================================================
// TYPE-SPECIFIC EDITORS
// ============================================================================

interface TypeSpecificEditorProps {
  type: ExerciseType;
  content: unknown;
  solution: unknown;
  onContentChange: (content: unknown) => void;
  onSolutionChange: (solution: unknown) => void;
}

const TypeSpecificEditor: React.FC<TypeSpecificEditorProps> = ({
  type,
  content,
  solution,
  onContentChange,
  onSolutionChange
}) => {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return (
        <MultipleChoiceEditor
          content={content as MultipleChoiceContent}
          solution={solution}
          onContentChange={onContentChange}
          onSolutionChange={onSolutionChange}
        />
      );

    case 'FORMULATION':
      return (
        <FormulationEditor
          content={content as FormulationContent}
          solution={solution}
          onContentChange={onContentChange}
          onSolutionChange={onSolutionChange}
        />
      );

    case 'VALIDATION':
      return (
        <ValidationEditor
          content={content as ValidationContent}
          solution={solution}
          onContentChange={onContentChange}
          onSolutionChange={onSolutionChange}
        />
      );

    case 'EQUIVALENCE':
      return (
        <EquivalenceEditor
          content={content}
          solution={solution}
          onContentChange={onContentChange}
          onSolutionChange={onSolutionChange}
        />
      );

    case 'TRUTH_TABLE':
      return (
        <TruthTableEditor
          content={content as TruthTableContent}
          solution={solution}
          onContentChange={onContentChange}
          onSolutionChange={onSolutionChange}
        />
      );

    case 'SYMBOL_ARRANGEMENT':
      return (
        <SymbolArrangementEditor
          content={content as SymbolArrangementContent}
          solution={solution}
          onContentChange={onContentChange}
          onSolutionChange={onSolutionChange}
        />
      );

    case 'NORMAL_FORM':
      return (
        <NormalFormEditor
          content={content as NormalFormContent}
          solution={solution}
          onContentChange={onContentChange}
          onSolutionChange={onSolutionChange}
        />
      );

    case 'IDENTIFY_FALLACY':
      return (
        <IdentifyFallacyEditor
          content={content as IdentifyFallacyContent}
          solution={solution}
          onContentChange={onContentChange}
          onSolutionChange={onSolutionChange}
        />
      );

    case 'PROOF':
      return (
        <ProofEditor
          content={content as ProofContent}
          solution={solution}
          onContentChange={onContentChange}
          onSolutionChange={onSolutionChange}
        />
      );

    default:
      return (
        <div className="p-6 rounded-xl bg-white/5 text-gray-500 text-center">
          Tipo de ejercicio no soportado.
        </div>
      );
  }
};

// ============================================================================
// MULTIPLE CHOICE EDITOR
// ============================================================================

const MultipleChoiceEditor: React.FC<{
  content: MultipleChoiceContent;
  solution: unknown;
  onContentChange: (content: unknown) => void;
  onSolutionChange: (solution: unknown) => void;
}> = ({ content, solution, onContentChange, onSolutionChange }) => {
  const [question, setQuestion] = useState(content?.question || '');
  const [options, setOptions] = useState<Array<{ id: string; text: string; isFormula?: boolean }>>(
    content?.options || [
      { id: generateOptionId(), text: '' },
      { id: generateOptionId(), text: '' },
      { id: generateOptionId(), text: '' },
      { id: generateOptionId(), text: '' }
    ]
  );
  const [correctIds, setCorrectIds] = useState<Set<string>>(
    new Set((solution as { correctOptionIds?: string[] })?.correctOptionIds || [])
  );
  const [allowMultiple, setAllowMultiple] = useState(content?.allowMultiple || false);

  // Update parent state
  React.useEffect(() => {
    onContentChange({
      question,
      options,
      allowMultiple,
      randomizeOrder: true
    });
    onSolutionChange({
      correctOptionIds: Array.from(correctIds)
    });
  }, [question, options, correctIds, allowMultiple]);

  const addOption = () => {
    setOptions([...options, { id: generateOptionId(), text: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
    setCorrectIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleCorrect = (id: string) => {
    setCorrectIds(prev => {
      const newSet = new Set(prev);
      if (allowMultiple) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        newSet.clear();
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Pregunta
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all resize-none h-20"
          placeholder="¿Cuál de las siguientes fórmulas es una tautología?"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="allowMultiple"
          checked={allowMultiple}
          onChange={(e) => setAllowMultiple(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <label htmlFor="allowMultiple" className="text-sm text-gray-400">
          Permitir múltiples respuestas correctas
        </label>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-400">
          Opciones (marca las correctas)
        </label>
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleCorrect(option.id)}
              className={cn(
                "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                correctIds.has(option.id)
                  ? "border-emerald-500 bg-emerald-500/20"
                  : "border-white/20 hover:border-white/40"
              )}
            >
              {correctIds.has(option.id) && <Check className="w-4 h-4 text-emerald-400" />}
            </button>
            <span className="text-gray-600 font-mono w-6">{String.fromCharCode(65 + index)}.</span>
            <input
              type="text"
              value={option.text}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = { ...option, text: e.target.value };
                setOptions(newOptions);
              }}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all font-mono"
              placeholder="Escribe la opción..."
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                className="text-gray-600 hover:text-rose-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="text-sm text-[var(--accent)] hover:text-cyan-300 flex items-center gap-1 mt-2"
        >
          <Plus className="w-4 h-4" />
          Agregar opción
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// EQUIVALENCE EDITOR
// ============================================================================

const EquivalenceEditor: React.FC<{
  content: unknown;
  solution: unknown;
  onContentChange: (content: unknown) => void;
  onSolutionChange: (solution: unknown) => void;
}> = ({ content, solution, onContentChange, onSolutionChange }) => {
  const [formula, setFormula] = useState((content as { formula?: string })?.formula || '');

  React.useEffect(() => {
    onContentChange({ formula });
    onSolutionChange({ targetFormula: formula });
  }, [formula]);

  const insertSymbol = (sym: string) => {
    setFormula(prev => prev + sym);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Fórmula Objetivo
        </label>
        <p className="text-xs text-gray-500 mb-3">
          El estudiante debe escribir una fórmula lógicamente equivalente a esta.
        </p>
        <div className="flex gap-2 mb-2">
          {['¬', '∧', '∨', '→', '↔', '(', ')'].map(sym => (
            <button
              key={sym}
              type="button"
              onClick={() => insertSymbol(sym)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-lg font-mono"
            >
              {sym}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all"
          placeholder="P → (Q ∧ R)"
        />
      </div>

      {formula && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Vista previa de la tabla de verdad:</p>
          <div className="max-h-48 overflow-auto rounded-xl border border-white/10">
            <TruthTable formulaStr={formula} />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FORMULATION EDITOR
// ============================================================================

const FormulationEditor: React.FC<{
  content: FormulationContent;
  solution: unknown;
  onContentChange: (content: unknown) => void;
  onSolutionChange: (solution: unknown) => void;
}> = ({ content, solution, onContentChange, onSolutionChange }) => {
  const [naturalLanguage, setNaturalLanguage] = useState(content?.naturalLanguage || '');
  const [variables, setVariables] = useState<Array<{ key: string; value: string }>>(
    Object.entries(content?.variables || {}).map(([key, value]) => ({ key, value })) ||
    [{ key: 'P', value: '' }, { key: 'Q', value: '' }]
  );
  const [correctFormulas, setCorrectFormulas] = useState<string[]>(
    (solution as { correctFormulas?: string[] })?.correctFormulas || ['']
  );
  const [hint, setHint] = useState(content?.hint || '');

  React.useEffect(() => {
    const varsObj: Record<string, string> = {};
    variables.forEach(v => {
      if (v.key.trim()) varsObj[v.key.trim()] = v.value;
    });
    onContentChange({
      naturalLanguage,
      variables: varsObj,
      hint
    });
    onSolutionChange({
      correctFormulas: correctFormulas.filter(f => f.trim())
    });
  }, [naturalLanguage, variables, correctFormulas, hint]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Enunciado en Lenguaje Natural
        </label>
        <textarea
          value={naturalLanguage}
          onChange={(e) => setNaturalLanguage(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all resize-none h-20"
          placeholder="Si llueve, entonces el suelo está mojado."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Variables Proposicionales
        </label>
        <div className="space-y-2">
          {variables.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={v.key}
                onChange={(e) => {
                  const newVars = [...variables];
                  newVars[i] = { ...v, key: e.target.value };
                  setVariables(newVars);
                }}
                className="w-16 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-center"
                placeholder="P"
              />
              <span className="text-gray-500">=</span>
              <input
                type="text"
                value={v.value}
                onChange={(e) => {
                  const newVars = [...variables];
                  newVars[i] = { ...v, value: e.target.value };
                  setVariables(newVars);
                }}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                placeholder="Significado de la variable"
              />
              {variables.length > 1 && (
                <button
                  type="button"
                  onClick={() => setVariables(variables.filter((_, j) => j !== i))}
                  className="text-gray-600 hover:text-rose-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setVariables([...variables, { key: '', value: '' }])}
            className="text-sm text-[var(--accent)] hover:text-cyan-300 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Agregar variable
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Fórmulas Correctas (una por línea)
        </label>
        <textarea
          value={correctFormulas.join('\n')}
          onChange={(e) => setCorrectFormulas(e.target.value.split('\n'))}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all resize-none h-24"
          placeholder="P → Q&#10;¬P ∨ Q"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Pista (opcional)
        </label>
        <input
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all"
          placeholder="Recuerda que 'si... entonces' se representa con →"
        />
      </div>
    </div>
  );
};

// ============================================================================
// VALIDATION EDITOR
// ============================================================================

const ValidationEditor: React.FC<{
  content: ValidationContent;
  solution: unknown;
  onContentChange: (content: unknown) => void;
  onSolutionChange: (solution: unknown) => void;
}> = ({ content, solution, onContentChange, onSolutionChange }) => {
  const [premises, setPremises] = useState<string[]>(content?.premises || ['', '']);
  const [conclusion, setConclusion] = useState(content?.conclusion || '');
  const [naturalLanguage, setNaturalLanguage] = useState(content?.argumentInNaturalLanguage || '');
  const [isValid, setIsValid] = useState((solution as { isValid?: boolean })?.isValid ?? true);
  const [explanation, setExplanation] = useState((solution as { explanation?: string })?.explanation || '');

  React.useEffect(() => {
    onContentChange({
      premises: premises.filter(p => p.trim()),
      conclusion,
      argumentInNaturalLanguage: naturalLanguage || undefined
    });
    onSolutionChange({
      isValid,
      explanation
    });
  }, [premises, conclusion, naturalLanguage, isValid, explanation]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Argumento en Lenguaje Natural (opcional)
        </label>
        <textarea
          value={naturalLanguage}
          onChange={(e) => setNaturalLanguage(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all resize-none h-20"
          placeholder="Todos los hombres son mortales. Sócrates es hombre. Por lo tanto, Sócrates es mortal."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Premisas (fórmulas lógicas)
        </label>
        <div className="space-y-2">
          {premises.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-600 font-mono w-6">{i + 1}.</span>
              <input
                type="text"
                value={p}
                onChange={(e) => {
                  const newP = [...premises];
                  newP[i] = e.target.value;
                  setPremises(newP);
                }}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                placeholder="P → Q"
              />
              {premises.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPremises(premises.filter((_, j) => j !== i))}
                  className="text-gray-600 hover:text-rose-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPremises([...premises, ''])}
            className="text-sm text-[var(--accent)] hover:text-cyan-300 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Agregar premisa
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Conclusión
        </label>
        <input
          type="text"
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all"
          placeholder="Q"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-400">
          ¿Es válido el argumento?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsValid(true)}
            className={cn(
              "px-4 py-2 rounded-lg border transition-all",
              isValid
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                : "border-white/10 text-gray-500"
            )}
          >
            Válido
          </button>
          <button
            type="button"
            onClick={() => setIsValid(false)}
            className={cn(
              "px-4 py-2 rounded-lg border transition-all",
              !isValid
                ? "border-rose-500 bg-rose-500/20 text-rose-400"
                : "border-white/10 text-gray-500"
            )}
          >
            Inválido
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Explicación
        </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all resize-none h-20"
          placeholder={isValid ? "El argumento es válido por Modus Ponens..." : "Contraejemplo: cuando P=V, Q=F..."}
        />
      </div>
    </div>
  );
};

// ============================================================================
// TRUTH TABLE EDITOR
// ============================================================================

const TruthTableEditor: React.FC<{
  content: TruthTableContent;
  solution: unknown;
  onContentChange: (content: unknown) => void;
  onSolutionChange: (solution: unknown) => void;
}> = ({ content, solution, onContentChange, onSolutionChange }) => {
  const [formula, setFormula] = useState(content?.formula || '');
  const [hiddenCells, setHiddenCells] = useState(content?.hiddenCells || []);

  React.useEffect(() => {
    onContentChange({
      formula,
      hiddenCells
    });
    // Solution is auto-generated from formula
    onSolutionChange({
      values: {} // Would be populated by evaluator
    });
  }, [formula, hiddenCells]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Fórmula
        </label>
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all"
          placeholder="P ∧ Q → R"
        />
      </div>

      {formula && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">
            Vista previa (las celdas ocultas se definirán aquí):
          </p>
          <div className="max-h-64 overflow-auto rounded-xl border border-white/10">
            <TruthTable formulaStr={formula} />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            💡 En una versión futura podrás hacer clic en las celdas para marcarlas como ocultas.
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SYMBOL ARRANGEMENT EDITOR
// ============================================================================

const SymbolArrangementEditor: React.FC<{
  content: SymbolArrangementContent;
  solution: unknown;
  onContentChange: (content: unknown) => void;
  onSolutionChange: (solution: unknown) => void;
}> = ({ content, onContentChange, onSolutionChange }) => {
  const [instruction, setInstruction] = useState(content?.instruction || '');
  const [targetDescription, setTargetDescription] = useState(content?.targetDescription || '');
  const [symbols, setSymbols] = useState<Array<{ id: string; symbol: string; count: number }>>(
    content?.availableSymbols || [
      { id: '1', symbol: 'P', count: 1 },
      { id: '2', symbol: 'Q', count: 1 },
      { id: '3', symbol: '→', count: 1 }
    ]
  );
  const [correctFormulas, setCorrectFormulas] = useState<string[]>(
    (onSolutionChange as unknown as { correctFormulas?: string[] })?.correctFormulas || ['']
  );

  React.useEffect(() => {
    onContentChange({
      instruction,
      availableSymbols: symbols,
      targetDescription
    });
    onSolutionChange({
      correctFormulas: correctFormulas.filter(f => f.trim())
    });
  }, [instruction, symbols, targetDescription, correctFormulas, onContentChange, onSolutionChange]);

  const addSymbol = () => {
    setSymbols([...symbols, { id: generateOptionId(), symbol: '', count: 1 }]);
  };

  const removeSymbol = (id: string) => {
    if (symbols.length <= 1) return;
    setSymbols(symbols.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Instrucción
        </label>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition-all resize-none h-20"
          placeholder="Arrastra los símbolos para formar la fórmula correcta..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Descripción del Objetivo
        </label>
        <input
          type="text"
          value={targetDescription}
          onChange={(e) => setTargetDescription(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition-all"
          placeholder="Forma el condicional 'Si P entonces Q'"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Símbolos Disponibles
        </label>
        <div className="space-y-2">
          {symbols.map((sym, i) => (
            <div key={sym.id} className="flex items-center gap-2">
              <input
                type="text"
                value={sym.symbol}
                onChange={(e) => {
                  const newSymbols = [...symbols];
                  newSymbols[i] = { ...sym, symbol: e.target.value };
                  setSymbols(newSymbols);
                }}
                className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-center"
                placeholder="∧"
              />
              <span className="text-gray-500">×</span>
              <input
                type="number"
                min="1"
                max="10"
                value={sym.count}
                onChange={(e) => {
                  const newSymbols = [...symbols];
                  newSymbols[i] = { ...sym, count: parseInt(e.target.value) || 1 };
                  setSymbols(newSymbols);
                }}
                className="w-16 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-center"
              />
              {symbols.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSymbol(sym.id)}
                  className="text-gray-600 hover:text-rose-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSymbol}
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Agregar símbolo
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Fórmulas Correctas (una por línea)
        </label>
        <textarea
          value={correctFormulas.join('\n')}
          onChange={(e) => setCorrectFormulas(e.target.value.split('\n'))}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-gray-600 outline-none focus:border-cyan-500 transition-all resize-none h-24"
          placeholder="P → Q"
        />
      </div>
    </div>
  );
};

// ============================================================================
// NORMAL FORM EDITOR
// ============================================================================

const NormalFormEditor: React.FC<{
  content: NormalFormContent;
  solution: unknown;
  onContentChange: (content: unknown) => void;
  onSolutionChange: (solution: unknown) => void;
}> = ({ content, onContentChange, onSolutionChange }) => {
  const [formula, setFormula] = useState(content?.formula || '');
  const [targetForm, setTargetForm] = useState<'CNF' | 'DNF' | 'NNF'>(content?.targetForm || 'CNF');
  const [correctFormulas, setCorrectFormulas] = useState<string[]>(['']);

  React.useEffect(() => {
    onContentChange({
      formula,
      targetForm
    });
    onSolutionChange({
      correctFormulas: correctFormulas.filter(f => f.trim())
    });
  }, [formula, targetForm, correctFormulas, onContentChange, onSolutionChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Fórmula Original
        </label>
        <div className="flex gap-2 mb-2">
          {['¬', '∧', '∨', '→', '↔', '(', ')'].map(sym => (
            <button
              key={sym}
              type="button"
              onClick={() => setFormula(prev => prev + sym)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-lg font-mono"
            >
              {sym}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-gray-600 outline-none focus:border-cyan-500 transition-all"
          placeholder="P → (Q ∨ R)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Forma Normal Objetivo
        </label>
        <div className="flex gap-2">
          {[
            { value: 'CNF', label: 'CNF (Conjuntiva)', desc: '(A ∨ B) ∧ (C ∨ D)' },
            { value: 'DNF', label: 'DNF (Disyuntiva)', desc: '(A ∧ B) ∨ (C ∧ D)' },
            { value: 'NNF', label: 'NNF (Negación)', desc: 'Negaciones solo en átomos' }
          ].map(form => (
            <button
              key={form.value}
              type="button"
              onClick={() => setTargetForm(form.value as 'CNF' | 'DNF' | 'NNF')}
              className={cn(
                "flex-1 p-3 rounded-xl border text-left transition-all",
                targetForm === form.value
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-white/10 hover:border-white/30"
              )}
            >
              <div className="font-medium text-sm">{form.label}</div>
              <div className="text-xs text-gray-500 mt-1 font-mono">{form.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Respuestas Correctas (una por línea)
        </label>
        <textarea
          value={correctFormulas.join('\n')}
          onChange={(e) => setCorrectFormulas(e.target.value.split('\n'))}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-gray-600 outline-none focus:border-cyan-500 transition-all resize-none h-24"
          placeholder="(¬P ∨ Q) ∧ (¬P ∨ R)"
        />
      </div>
    </div>
  );
};

// ============================================================================
// IDENTIFY FALLACY EDITOR
// ============================================================================

const COMMON_FALLACIES = [
  { id: 'ad_hominem', name: 'Ad Hominem', description: 'Atacar a la persona en lugar del argumento' },
  { id: 'strawman', name: 'Hombre de Paja', description: 'Distorsionar el argumento del oponente' },
  { id: 'false_dichotomy', name: 'Falsa Dicotomía', description: 'Presentar solo dos opciones cuando hay más' },
  { id: 'slippery_slope', name: 'Pendiente Resbaladiza', description: 'Afirmar sin evidencia que una acción llevará a consecuencias extremas' },
  { id: 'circular_reasoning', name: 'Razonamiento Circular', description: 'Usar la conclusión como premisa' },
  { id: 'appeal_to_authority', name: 'Argumento de Autoridad', description: 'Apelar a una autoridad no relevante' },
  { id: 'appeal_to_emotion', name: 'Apelación a la Emoción', description: 'Usar emociones en lugar de razones' },
  { id: 'hasty_generalization', name: 'Generalización Apresurada', description: 'Sacar conclusiones de pocos casos' },
  { id: 'red_herring', name: 'Pista Falsa', description: 'Introducir un tema irrelevante' },
  { id: 'tu_quoque', name: 'Tu Quoque', description: 'Responder a una crítica con otra crítica' },
  { id: 'affirming_consequent', name: 'Afirmación del Consecuente', description: 'Si P→Q y Q, concluir P' },
  { id: 'denying_antecedent', name: 'Negación del Antecedente', description: 'Si P→Q y ¬P, concluir ¬Q' }
];

const IdentifyFallacyEditor: React.FC<{
  content: IdentifyFallacyContent;
  solution: unknown;
  onContentChange: (content: unknown) => void;
  onSolutionChange: (solution: unknown) => void;
}> = ({ content, onContentChange, onSolutionChange }) => {
  const [argument, setArgument] = useState(content?.argument || '');
  const [options, setOptions] = useState<Array<{ id: string; name: string; description: string }>>(
    content?.options || COMMON_FALLACIES.slice(0, 4)
  );
  const [correctId, setCorrectId] = useState<string>(
    (onSolutionChange as unknown as { correctFallacyId?: string })?.correctFallacyId || ''
  );
  const [explanation, setExplanation] = useState('');

  React.useEffect(() => {
    onContentChange({
      argument,
      options
    });
    onSolutionChange({
      correctFallacyId: correctId,
      explanation
    });
  }, [argument, options, correctId, explanation, onContentChange, onSolutionChange]);

  const addFallacyOption = (fallacy: typeof COMMON_FALLACIES[0]) => {
    if (options.find(o => o.id === fallacy.id)) return;
    setOptions([...options, fallacy]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
    if (correctId === id) setCorrectId('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Argumento con Falacia
        </label>
        <textarea
          value={argument}
          onChange={(e) => setArgument(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition-all resize-none h-24"
          placeholder="Juan dice que debemos cuidar el medio ambiente, pero él conduce un auto que contamina mucho, así que su argumento no vale..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Opciones de Falacia (marca la correcta)
        </label>
        <div className="space-y-2 mb-3">
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCorrectId(option.id)}
                className={cn(
                  "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                  correctId === option.id
                    ? "border-emerald-500 bg-emerald-500/20"
                    : "border-white/20 hover:border-white/40"
                )}
              >
                {correctId === option.id && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
              <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="font-medium text-sm">{option.name}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="text-gray-600 hover:text-rose-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 w-full">Agregar falacia:</span>
          {COMMON_FALLACIES.filter(f => !options.find(o => o.id === f.id)).slice(0, 6).map(fallacy => (
            <button
              key={fallacy.id}
              type="button"
              onClick={() => addFallacyOption(fallacy)}
              className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
            >
              + {fallacy.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Explicación
        </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition-all resize-none h-20"
          placeholder="Se comete la falacia Tu Quoque porque..."
        />
      </div>
    </div>
  );
};

// ============================================================================
// PROOF EDITOR
// ============================================================================

const INFERENCE_RULES = [
  { id: 'mp', name: 'Modus Ponens', formula: 'P, P→Q ⊢ Q' },
  { id: 'mt', name: 'Modus Tollens', formula: 'P→Q, ¬Q ⊢ ¬P' },
  { id: 'hs', name: 'Silogismo Hipotético', formula: 'P→Q, Q→R ⊢ P→R' },
  { id: 'ds', name: 'Silogismo Disyuntivo', formula: 'P∨Q, ¬P ⊢ Q' },
  { id: 'add', name: 'Adición', formula: 'P ⊢ P∨Q' },
  { id: 'simp', name: 'Simplificación', formula: 'P∧Q ⊢ P' },
  { id: 'conj', name: 'Conjunción', formula: 'P, Q ⊢ P∧Q' },
  { id: 'abs', name: 'Absorción', formula: 'P→Q ⊢ P→(P∧Q)' },
  { id: 'dn', name: 'Doble Negación', formula: 'P ⊣⊢ ¬¬P' },
  { id: 'dem', name: 'De Morgan', formula: '¬(P∧Q) ⊣⊢ ¬P∨¬Q' },
  { id: 'com', name: 'Conmutación', formula: 'P∧Q ⊣⊢ Q∧P' },
  { id: 'assoc', name: 'Asociación', formula: '(P∧Q)∧R ⊣⊢ P∧(Q∧R)' },
  { id: 'dist', name: 'Distribución', formula: 'P∧(Q∨R) ⊣⊢ (P∧Q)∨(P∧R)' },
  { id: 'impl', name: 'Implicación Material', formula: 'P→Q ⊣⊢ ¬P∨Q' },
  { id: 'exp', name: 'Exportación', formula: '(P∧Q)→R ⊣⊢ P→(Q→R)' },
  { id: 'taut', name: 'Tautología', formula: 'P ⊣⊢ P∨P' }
];

const ProofEditor: React.FC<{
  content: ProofContent;
  solution: unknown;
  onContentChange: (content: unknown) => void;
  onSolutionChange: (solution: unknown) => void;
}> = ({ content, onContentChange, onSolutionChange }) => {
  const [premises, setPremises] = useState<string[]>(content?.premises || ['', '']);
  const [conclusion, setConclusion] = useState(content?.conclusion || '');
  const [allowedRules, setAllowedRules] = useState<string[]>(
    content?.allowedRules || INFERENCE_RULES.slice(0, 6).map(r => r.id)
  );
  const [maxSteps, setMaxSteps] = useState(content?.maxSteps || 10);
  const [proofSteps, setProofSteps] = useState<Array<{ formula: string; justification: string }>>([
    { formula: '', justification: '' }
  ]);

  React.useEffect(() => {
    onContentChange({
      premises: premises.filter(p => p.trim()),
      conclusion,
      allowedRules,
      maxSteps
    });
    onSolutionChange({
      proofSteps: proofSteps.filter(s => s.formula.trim())
    });
  }, [premises, conclusion, allowedRules, maxSteps, proofSteps, onContentChange, onSolutionChange]);

  const toggleRule = (ruleId: string) => {
    setAllowedRules(prev =>
      prev.includes(ruleId)
        ? prev.filter(r => r !== ruleId)
        : [...prev, ruleId]
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Premisas
        </label>
        <div className="space-y-2">
          {premises.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-600 font-mono w-6">{i + 1}.</span>
              <input
                type="text"
                value={p}
                onChange={(e) => {
                  const newP = [...premises];
                  newP[i] = e.target.value;
                  setPremises(newP);
                }}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                placeholder="P → Q"
              />
              {premises.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPremises(premises.filter((_, j) => j !== i))}
                  className="text-gray-600 hover:text-rose-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPremises([...premises, ''])}
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Agregar premisa
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Conclusión a Demostrar
        </label>
        <input
          type="text"
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-gray-600 outline-none focus:border-cyan-500 transition-all"
          placeholder="Q"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Reglas de Inferencia Permitidas
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-black/20">
          {INFERENCE_RULES.map(rule => (
            <button
              key={rule.id}
              type="button"
              onClick={() => toggleRule(rule.id)}
              className={cn(
                "p-2 rounded-lg border text-left text-xs transition-all",
                allowedRules.includes(rule.id)
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-white/10 hover:border-white/30 opacity-50"
              )}
            >
              <div className="font-medium">{rule.name}</div>
              <div className="text-gray-500 font-mono text-[10px]">{rule.formula}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Máximo de Pasos: {maxSteps}
        </label>
        <input
          type="range"
          min="3"
          max="20"
          value={maxSteps}
          onChange={(e) => setMaxSteps(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Prueba de Ejemplo (Opcional)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Proporciona una prueba de ejemplo para guiar la calificación.
        </p>
        <div className="space-y-2">
          {proofSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-600 font-mono w-6">{premises.length + i + 1}.</span>
              <input
                type="text"
                value={step.formula}
                onChange={(e) => {
                  const newSteps = [...proofSteps];
                  newSteps[i] = { ...step, formula: e.target.value };
                  setProofSteps(newSteps);
                }}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                placeholder="Q"
              />
              <input
                type="text"
                value={step.justification}
                onChange={(e) => {
                  const newSteps = [...proofSteps];
                  newSteps[i] = { ...step, justification: e.target.value };
                  setProofSteps(newSteps);
                }}
                className="w-32 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="MP 1,2"
              />
              {proofSteps.length > 1 && (
                <button
                  type="button"
                  onClick={() => setProofSteps(proofSteps.filter((_, j) => j !== i))}
                  className="text-gray-600 hover:text-rose-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setProofSteps([...proofSteps, { formula: '', justification: '' }])}
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Agregar paso
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseBuilder;
