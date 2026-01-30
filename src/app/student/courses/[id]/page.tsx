"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  status: string;
  createdAt: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  formula: string;
  difficulty: string;
  submissions: Submission[];
}

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  teacher: { name: string | null };
  exercises: Exercise[];
}

export default function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sessionData = useSession();
  const status = sessionData?.status ?? "loading";
  const router = useRouter();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);

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
        router.push("/student");
      }
    } catch (error) {
      console.error("Error fetching classroom:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyConfig = (difficulty: string) => ({
    EASY: { label: 'Fácil', className: 'bg-emerald-500/20 text-emerald-400' },
    MEDIUM: { label: 'Medio', className: 'bg-amber-500/20 text-amber-400' },
    HARD: { label: 'Difícil', className: 'bg-rose-500/20 text-rose-400' }
  }[difficulty] || { label: difficulty, className: 'bg-gray-500/20 text-gray-400' });

  const getExerciseStatus = (exercise: Exercise) => {
    if (exercise.submissions.length === 0) {
      return { status: 'pending', icon: Clock, label: 'Pendiente', className: 'text-gray-400' };
    }
    const lastSubmission = exercise.submissions[0];
    if (lastSubmission.status === 'CORRECT') {
      return { status: 'correct', icon: CheckCircle2, label: 'Completado', className: 'text-emerald-400' };
    }
    return { status: 'incorrect', icon: XCircle, label: 'Incorrecto', className: 'text-rose-400' };
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!classroom) return null;

  const completedCount = classroom.exercises.filter(e =>
    e.submissions.some(s => s.status === 'CORRECT')
  ).length;
  const progressPercent = classroom.exercises.length > 0
    ? Math.round((completedCount / classroom.exercises.length) * 100)
    : 0;

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-12">
      <header className="mb-8 max-w-4xl mx-auto">
        <Link
          href="/student"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis cursos
        </Link>

        <h1 className="text-4xl font-bold mb-2">{classroom.name}</h1>
        {classroom.description && (
          <p className="text-gray-400 mb-4">{classroom.description}</p>
        )}

        <div className="flex items-center gap-2 text-gray-400 mb-6">
          <GraduationCap className="w-5 h-5" />
          <span>{classroom.teacher.name || 'Profesor'}</span>
        </div>

        {/* Progress Bar */}
        <div className="glass rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Tu progreso</span>
            <span className="text-sm font-medium text-[var(--accent)]">
              {completedCount}/{classroom.exercises.length} ejercicios
            </span>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--accent)]" />
          Ejercicios
        </h2>

        {classroom.exercises.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">Sin ejercicios aún</h3>
            <p className="text-gray-500">
              El profesor aún no ha agregado ejercicios a este curso
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classroom.exercises.map((exercise, i) => {
              const diffConfig = getDifficultyConfig(exercise.difficulty);
              const statusConfig = getExerciseStatus(exercise);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "glass rounded-xl p-5 cursor-pointer group transition-all",
                    statusConfig.status === 'correct'
                      ? "border-emerald-500/20 hover:border-emerald-500/40"
                      : "hover:border-[var(--accent)]/50"
                  )}
                  onClick={() => router.push(`/student/courses/${id}/exercises/${exercise.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className={cn("w-5 h-5", statusConfig.className)} />
                        <h3 className="font-semibold group-hover:text-[var(--accent)] transition-colors">
                          {exercise.title}
                        </h3>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs", diffConfig.className)}>
                          {diffConfig.label}
                        </span>
                      </div>

                      {exercise.description && (
                        <p className="text-sm text-gray-500 ml-8">{exercise.description}</p>
                      )}
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
