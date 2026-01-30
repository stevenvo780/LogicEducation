"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  BookOpen,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TruthTable } from "@/components/logic/TruthTable";

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  formula: string;
  difficulty: string;
  createdAt: string;
  _count: { submissions: number };
}

interface Student {
  id: string;
  name: string | null;
  email: string;
}

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  code: string;
  exercises: Exercise[];
  students: Student[];
  _count: { students: number; exercises: number };
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sessionData = useSession();
  const status = sessionData?.status ?? "loading";
  const router = useRouter();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'exercises' | 'students'>('exercises');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchClassroom();
    }
  }, [status, router, id]);

  const fetchClassroom = async () => {
    try {
      const res = await fetch(`/api/classrooms/${id}`);
      const data = await res.json();
      if (res.ok) {
        setClassroom(data.classroom);
      } else {
        router.push("/teacher");
      }
    } catch (error) {
      console.error("Error fetching classroom:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (classroom) {
      navigator.clipboard.writeText(classroom.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getDifficultyConfig = (difficulty: string) => ({
    EASY: { label: 'Fácil', className: 'bg-emerald-500/20 text-emerald-400' },
    MEDIUM: { label: 'Medio', className: 'bg-amber-500/20 text-amber-400' },
    HARD: { label: 'Difícil', className: 'bg-rose-500/20 text-rose-400' }
  }[difficulty] || { label: difficulty, className: 'bg-gray-500/20 text-gray-400' });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!classroom) return null;

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-12">
      <header className="mb-8 max-w-6xl mx-auto">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis cursos
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">{classroom.name}</h1>
            {classroom.description && (
              <p className="text-gray-400">{classroom.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 font-mono text-lg transition-colors"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {classroom.code}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span className="text-2xl font-bold text-white">{classroom._count.students}</span>
            <span>estudiantes</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-2xl font-bold text-white">{classroom._count.exercises}</span>
            <span>ejercicios</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('exercises')}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all",
              activeTab === 'exercises'
                ? "bg-[var(--primary)] text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            )}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Ejercicios
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all",
              activeTab === 'students'
                ? "bg-[var(--primary)] text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            )}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Estudiantes
          </button>

          {activeTab === 'exercises' && (
            <button
              onClick={() => setShowExerciseForm(true)}
              className="ml-auto btn-premium bg-[var(--accent)] hover:bg-cyan-600 border-none"
            >
              <Plus className="w-4 h-4" />
              Nuevo Ejercicio
            </button>
          )}
        </div>

        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <div className="space-y-4">
            {classroom.exercises.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">Sin ejercicios</h3>
                <p className="text-gray-500 mb-6">
                  Crea tu primer ejercicio de lógica para tus estudiantes
                </p>
                <button
                  onClick={() => setShowExerciseForm(true)}
                  className="btn-premium bg-[var(--accent)] hover:bg-cyan-600 border-none"
                >
                  <Plus className="w-4 h-4" />
                  Crear Ejercicio
                </button>
              </div>
            ) : (
              classroom.exercises.map((exercise, i) => {
                const diffConfig = getDifficultyConfig(exercise.difficulty);
                return (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{exercise.title}</h3>
                        {exercise.description && (
                          <p className="text-sm text-gray-500">{exercise.description}</p>
                        )}
                      </div>
                      <span className={cn("px-3 py-1 rounded-full text-xs font-medium", diffConfig.className)}>
                        {diffConfig.label}
                      </span>
                    </div>

                    <div className="bg-black/30 rounded-lg p-3 font-mono text-[var(--accent)] mb-3">
                      {exercise.formula}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{exercise._count.submissions} entregas</span>
                      <span>{new Date(exercise.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="glass rounded-2xl overflow-hidden">
            {classroom.students.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">Sin estudiantes</h3>
                <p className="text-gray-500">
                  Comparte el código <span className="font-mono text-[var(--accent)]">{classroom.code}</span> con tus estudiantes
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-400">Nombre</th>
                    <th className="text-left p-4 font-medium text-gray-400">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {classroom.students.map((student) => (
                    <tr key={student.id} className="border-t border-white/5">
                      <td className="p-4">{student.name || 'Sin nombre'}</td>
                      <td className="p-4 text-gray-500">{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* Create Exercise Modal */}
      {showExerciseForm && (
        <CreateExerciseModal
          classroomId={id}
          onClose={() => setShowExerciseForm(false)}
          onCreated={() => {
            setShowExerciseForm(false);
            fetchClassroom();
          }}
        />
      )}
    </div>
  );
}

function CreateExerciseModal({
  classroomId,
  onClose,
  onCreated
}: {
  classroomId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [explanation, setExplanation] = useState(""); // Feedback/Explanation
  const [formula, setFormula] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, explanation, formula, difficulty, classroomId }),
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear el ejercicio");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const insertSymbol = (sym: string) => {
    setFormula(prev => prev + sym);
  };

  const SYMBOLS = [
    { char: '¬', key: '~' },
    { char: '∧', key: '&' },
    { char: '∨', key: '|' },
    { char: '→', key: '->' },
    { char: '↔', key: '<->' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 w-full max-w-2xl my-8"
      >
        <h2 className="text-2xl font-bold mb-6">Crear Nuevo Ejercicio</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Título del Ejercicio
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all"
              placeholder="Ej: Simplificar usando leyes de Morgan"
              required
            />
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

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Explicación / Feedback (Opcional)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all resize-none h-20"
              placeholder="Explicación que verá el estudiante al completar el ejercicio o pedir ayuda..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Fórmula Lógica
            </label>
            <div className="flex gap-2 mb-2">
              {SYMBOLS.map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => insertSymbol(s.key)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-lg font-mono"
                >
                  {s.char}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all"
              placeholder="P -> (Q & R)"
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
                  onClick={() => setDifficulty(d.value)}
                  className={cn(
                    "flex-1 py-2 rounded-xl border border-white/10 transition-all",
                    d.className
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {formula && (
            <div>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-[var(--accent)] flex items-center gap-1 mb-2"
              >
                <ChevronRight className={cn("w-4 h-4 transition-transform", showPreview && "rotate-90")} />
                Vista Previa
              </button>
              {showPreview && (
                <div className="max-h-64 overflow-auto">
                  <TruthTable formulaStr={formula} />
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !formula.trim()}
              className="flex-1 btn-premium bg-[var(--accent)] hover:bg-cyan-600 border-none justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Ejercicio"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
