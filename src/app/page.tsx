"use client";

import Link from "next/link";
import { GraduationCap, BookOpen, ArrowRight, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[var(--bg-dark)] -z-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--primary)] filter blur-[120px] opacity-20 rounded-full animate-float -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[var(--secondary)] filter blur-[100px] opacity-10 rounded-full animate-float-delay -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 -z-10 pointer-events-none" />

      <div className="container relative z-10 text-center">

        {/* Hero Headers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm text-[var(--accent)] mb-4">
            <BrainCircuit className="w-4 h-4" />
            <span>Next Gen Logic Platform</span>
          </div>

          <h1 className="text-7xl font-extrabold tracking-tight leading-tight">
            Master the Art of <br />
            <span className="text-gradient drop-shadow-2xl">Reasoning</span>
          </h1>

          <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Experience logic like never before. An immersive, interactive, and visually stunning environment designed for modern learners.
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-strech max-w-4xl mx-auto px-4">

          {/* Teacher Card */}
          <Link href="/teacher" className="group flex-1">
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="h-full glass p-8 rounded-3xl relative overflow-hidden text-left transition-all duration-300 border border-[var(--glass-border)] hover:border-[var(--primary)]"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-32 h-32 transform rotate-12" />
              </div>

              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-[var(--primary)] mb-6 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-shadow">
                <BookOpen className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">Teacher Studio</h3>
              <p className="text-[var(--text-muted)] mb-6">Create complex exercises, visualize truth tables, and manage your classroom with powerful tools.</p>

              <div className="flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
                Enter Studio <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>

          {/* Student Card */}
          <Link href="/student" className="group flex-1">
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="h-full glass p-8 rounded-3xl relative overflow-hidden text-left transition-all duration-300 border border-[var(--glass-border)] hover:border-[var(--secondary)]"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <GraduationCap className="w-32 h-32 transform -rotate-12" />
              </div>

              <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center text-[var(--secondary)] mb-6 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-shadow">
                <GraduationCap className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-bold mb-2 group-hover:text-[var(--secondary)] transition-colors">Student Hub</h3>
              <p className="text-[var(--text-muted)] mb-6">Solve interactive puzzles, track your progress, and master propositional calculus step-by-step.</p>

              <div className="flex items-center gap-2 text-sm font-bold text-[var(--secondary)]">
                Start Learning <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>

        </div>
      </div>
    </main>
  );
}
