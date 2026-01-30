"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Loader2,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Clock,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  teacher: { name: string | null };
  _count: {
    exercises: number;
  };
}

export default function StudentPage() {
  const sessionData = useSession();
  const status = sessionData?.status ?? "loading";
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

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
            Mis <span className="text-[var(--accent)]">Cursos</span>
          </h1>
          <p className="text-gray-400">
            Practica lógica proposicional y mejora tus habilidades
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-premium bg-[var(--accent)] hover:bg-cyan-600 border-none"
          >
            <LogIn className="w-4 h-4" />
            Unirse a Curso
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
            <h2 className="text-xl font-semibold mb-2">No estás inscrito en ningún curso</h2>
            <p className="text-gray-500 mb-6">
              Pide a tu profesor el código de acceso para unirte
            </p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-premium bg-[var(--accent)] hover:bg-cyan-600 border-none"
            >
              <LogIn className="w-4 h-4" />
              Unirse a un Curso
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
                className="glass rounded-2xl p-6 hover:border-[var(--accent)]/50 transition-all group cursor-pointer"
                onClick={() => router.push(`/student/courses/${classroom.id}`)}
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--accent)] transition-colors">
                  {classroom.name}
                </h3>

                {classroom.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {classroom.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <GraduationCap className="w-4 h-4" />
                  {classroom.teacher.name || 'Profesor'}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <BookOpen className="w-4 h-4" />
                  {classroom._count.exercises} ejercicios
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                  <span className="text-xs text-[var(--accent)] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver ejercicios <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Join Course Modal */}
      {showJoinModal && (
        <JoinCourseModal
          onClose={() => setShowJoinModal(false)}
          onJoined={() => {
            setShowJoinModal(false);
            fetchClassrooms();
          }}
        />
      )}
    </div>
  );
}

function JoinCourseModal({
  onClose,
  onJoined
}: {
  onClose: () => void;
  onJoined: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        onJoined();
      } else {
        setError(data.error || "Error al unirse al curso");
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
        <h2 className="text-2xl font-bold mb-6">Unirse a un Curso</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Código del Curso
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-2xl font-mono text-center text-white placeholder-gray-600 outline-none focus:border-[var(--accent)] transition-all tracking-widest"
              placeholder="ABC123"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Pide el código a tu profesor
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
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
              disabled={loading || code.length < 6}
              className="flex-1 btn-premium bg-[var(--accent)] hover:bg-cyan-600 border-none justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unirse"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
