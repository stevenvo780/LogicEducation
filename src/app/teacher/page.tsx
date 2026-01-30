"use client";

import { useEffect, useState } from "react";
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
  GraduationCap,
  ArrowRight
} from "lucide-react";

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  code: string;
  _count: {
    students: number;
    exercises: number;
  };
}

export default function TeacherPage() {
  const sessionData = useSession();
  const status = sessionData?.status ?? "loading";
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchClassrooms();
    }
  }, [status, router]);

  const fetchClassrooms = async () => {
    try {
      const res = await fetch("/api/classrooms");
      const data = await res.json();
      if (res.ok) {
        setClassrooms(data.classrooms || []);
      }
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-12">
      <header className="mb-12 flex justify-between items-center max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Panel <span className="text-[var(--primary)]">Docente</span>
          </h1>
          <p className="text-gray-400">
            Gestiona tus cursos y crea ejercicios para tus estudiantes
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-premium bg-[var(--primary)] hover:bg-indigo-600 border-none"
          >
            <Plus className="w-4 h-4" />
            Nuevo Curso
          </button>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-white transition-colors self-center"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {classrooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">No tienes cursos aún</h2>
            <p className="text-gray-500 mb-6">
              Crea tu primer curso para comenzar a agregar ejercicios
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-premium bg-[var(--accent)] hover:bg-cyan-600 border-none"
            >
              <Plus className="w-4 h-4" />
              Crear Primer Curso
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom, i) => (
              <motion.div
                key={classroom.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:border-[var(--primary)]/50 transition-all group cursor-pointer"
                onClick={() => router.push(`/teacher/courses/${classroom.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold group-hover:text-[var(--primary)] transition-colors">
                    {classroom.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCode(classroom.code);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono"
                    title="Copiar código"
                  >
                    {copiedCode === classroom.code ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {classroom.code}
                  </button>
                </div>

                {classroom.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {classroom.description}
                  </p>
                )}

                <div className="flex gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {classroom._count.students} estudiantes
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {classroom._count.exercises} ejercicios
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                  <span className="text-xs text-[var(--primary)] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver curso <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Course Modal */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchClassrooms();
          }}
        />
      )}
    </div>
  );
}

function CreateCourseModal({
  onClose,
  onCreated
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear el curso");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Crear Nuevo Curso</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nombre del Curso
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all"
              placeholder="Ej: Lógica Proposicional 2026-1"
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
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] transition-all resize-none h-24"
              placeholder="Descripción del curso..."
            />
          </div>

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
              disabled={loading || !name.trim()}
              className="flex-1 btn-premium bg-[var(--primary)] hover:bg-indigo-600 border-none justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Curso"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
