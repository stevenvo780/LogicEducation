"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  ChevronDown,
  Save,
  Eye,
  Shuffle,
  Sparkles,
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ExerciseType,
  EXERCISE_TYPES,
  ExerciseTypeInfo,
  MultipleChoiceContent,
  FormulationContent,
  ValidationContent,
  TruthTableContent,
  SymbolArrangementContent,
  generateOptionId
} from '@/lib/exercises/exerciseTypes';
import { SymbolPalette } from '@/components/logic/OperatorReference';
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

    default:
      return (
        <div className="p-6 rounded-xl bg-white/5 text-gray-500 text-center">
          Editor para {type} en desarrollo...
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

export default ExerciseBuilder;
