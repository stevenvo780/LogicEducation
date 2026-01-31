"use client";

import { useEffect, useState, useRef, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TruthTable } from "@/components/logic/TruthTable";
import { AnalysisPanel } from "@/components/logic/AnalysisPanel";

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  formula: string;
  difficulty: string;
}

export default function ExercisePage({
  params
}: {
  params: Promise<{ id: string; exerciseId: string }>
}) {
  const { id: classroomId, exerciseId } = use(params);
  const sessionData = useSession();
  const status = sessionData?.status ?? "loading";
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean; feedback: string; explanation?: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchExercise();
    }
  }, [status, router, exerciseId]);

  const fetchExercise = async () => {
    try {
      const res = await fetch(`/api/classrooms/${classroomId}`);
      const data = await res.json();
      if (res.ok) {
        const ex = data.classroom.exercises.find((e: Exercise) => e.id === exerciseId);
        if (ex) {
          setExercise(ex);
        } else {
          router.push(`/student/courses/${classroomId}`);
        }
      } else {
        router.push("/student");
      }
    } catch (error) {
      console.error("Error fetching exercise:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId, answer }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ isCorrect: data.isCorrect, feedback: data.feedback, explanation: data.explanation });
      } else {
        setResult({ isCorrect: false, feedback: data.error || "Error al evaluar" });
      }
    } catch (err) {
      setResult({ isCorrect: false, feedback: "Error de conexión" });
    } finally {
      setSubmitting(false);
    }
  };

  const insertSymbol = (sym: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const newAnswer = answer.substring(0, start) + sym + answer.substring(end);
    setAnswer(newAnswer);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + sym.length, start + sym.length);
      }
    }, 10);
  };

  const getDifficultyConfig = (difficulty: string) => ({
    EASY: { label: 'Fácil', className: 'bg-emerald-500/20 text-emerald-400' },
    MEDIUM: { label: 'Medio', className: 'bg-amber-500/20 text-amber-400' },
    HARD: { label: 'Difícil', className: 'bg-rose-500/20 text-rose-400' }
  }[difficulty] || { label: difficulty, className: 'bg-gray-500/20 text-gray-400' });

  const SYMBOLS = [
    { char: '¬', key: '~' },
    { char: '∧', key: '&' },
    { char: '∨', key: '|' },
    { char: '→', key: '->' },
    { char: '↔', key: '<->' },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!exercise) return null;

  const diffConfig = getDifficultyConfig(exercise.difficulty);

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-12">
      <header className="mb-8 max-w-3xl mx-auto">
        <Link
          href={`/student/courses/${classroomId}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a ejercicios
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{exercise.title}</h1>
            {exercise.description && (
              <p className="text-gray-400">{exercise.description}</p>
            )}
          </div>
          <span className={cn("px-3 py-1 rounded-full text-sm font-medium", diffConfig.className)}>
            {diffConfig.label}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        {/* Target Formula */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase mb-3">
            Fórmula Objetivo
          </h2>
          <div className="bg-black/40 rounded-xl p-4 font-mono text-2xl text-[var(--accent)] text-center">
            {exercise.formula}
          </div>
        </div>

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-medium text-gray-400 uppercase mb-3">
            Tu Respuesta
          </h2>

          {/* Symbol Toolbar */}
          <div className="flex gap-2 flex-wrap">
            {SYMBOLS.map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => insertSymbol(s.key)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xl font-mono transition-colors"
              >
                {s.char}
              </button>
            ))}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-5 text-xl font-mono text-white placeholder-gray-600 outline-none focus:border-[var(--accent)] transition-all"
            placeholder="Escribe una fórmula equivalente..."
            spellCheck={false}
          />

          <button
            type="submit"
            disabled={submitting || !answer.trim()}
            className="w-full btn-premium bg-[var(--accent)] hover:bg-cyan-600 border-none justify-center py-4"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Respuesta
              </>
            )}
          </button>
        </form>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl p-6 flex flex-col gap-4",
              result.isCorrect
                ? "bg-emerald-500/10 border border-emerald-500/30"
                : "bg-rose-500/10 border border-rose-500/30"
            )}
          >
            <div className="flex items-start gap-4">
              {result.isCorrect ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-10 h-10 text-rose-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={cn(
                  "font-bold text-lg mb-1",
                  result.isCorrect ? "text-emerald-400" : "text-rose-400"
                )}>
                  {result.isCorrect ? "¡Correcto!" : "Incorrecto"}
                </h3>
                <p className="text-gray-400 mb-2">{result.feedback}</p>

                {result.explanation && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg text-sm text-gray-300 border-l-2 border-[var(--primary)]">
                    <span className="block font-semibold text-[var(--primary)] text-xs uppercase mb-1">Nota del profesor:</span>
                    {result.explanation}
                  </div>
                )}
              </div>
              {!result.isCorrect && (
                <button
                  onClick={() => { setResult(null); setAnswer(""); }}
                  className="btn-premium text-sm bg-white/10 hover:bg-white/20 border-none"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Hint */}
        <div className="glass rounded-2xl p-6">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 text-[var(--primary)] hover:text-indigo-400 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            {showHint ? "Ocultar pista" : "Ver tabla de verdad como pista"}
          </button>

          {showHint && (
            <div className="mt-4">
              <TruthTable formulaStr={exercise.formula} />
            </div>
          )}
        </div>

        {/* Your Answer Preview */}
        {answer.trim() && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-400 uppercase mb-3">
              Vista previa de tu respuesta
            </h2>
            <TruthTable formulaStr={answer} />
          </div>
        )}
      </main>
    </div>
  );
}
