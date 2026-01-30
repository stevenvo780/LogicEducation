"use client";

import { Playground } from "@/components/feature/Playground";
import { FlaskConical } from "lucide-react";
import Link from "next/link";

export default function LibraryPage() {
  return (
    <main className="min-h-screen p-8 space-y-8 bg-[#0a0b14]">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Laboratorio Lógico
            </h1>
          </div>
          <p className="text-slate-400 max-w-xl">
            Herramientas avanzadas para el análisis, simplificación y verificación de fórmulas lógicas.
            Diseñado para la enseñanza profunda del cálculo proposicional.
          </p>
        </div>

        <Link
          href="/teacher"
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
        >
          ← Volver al Panel
        </Link>
      </div>

      {/* Playground Area */}
      <Playground />
    </main>
  );
}
