"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, ArrowRight, AlertCircle, Loader2, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT"); // Default role
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Error en el registro");
      }
    } catch (err) {
      setError("Algo salió mal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent)] rounded-full filter blur-[150px] opacity-10 animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[var(--primary)] rounded-full filter blur-[120px] opacity-10 animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass rounded-2xl p-8 border border-[var(--glass-border)] shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Crear Cuenta</h1>
          <p className="text-[var(--text-muted)] mt-2">Únete a la comunidad de Lógica UdeA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre Completo</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--primary)] transition-colors" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                placeholder="Tu Nombre"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Correo Institucional</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--primary)] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                placeholder="usuario@udea.edu.co"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--primary)] transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Rol</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === "STUDENT" ? "bg-[var(--secondary)]/20 border-[var(--secondary)] text-white" : "bg-black/20 border-white/10 text-gray-500 hover:bg-white/5"}`}
              >
                <GraduationCap className="w-6 h-6" />
                <span className="text-sm font-bold">Estudiante</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("TEACHER")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === "TEACHER" ? "bg-[var(--primary)]/20 border-[var(--primary)] text-white" : "bg-black/20 border-white/10 text-gray-500 hover:bg-white/5"}`}
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-sm font-bold">Profesor</span>
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-premium bg-[var(--accent)] hover:bg-cyan-600 border-none justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Registrarse <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta? <Link href="/login" className="text-[var(--accent)] hover:underline">Inicia Sesión</Link>
        </div>
      </motion.div>
    </div>
  );
}
