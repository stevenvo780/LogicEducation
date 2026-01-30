import { Playground } from "@/components/feature/Playground";
import Link from "next/link";

export default function TeacherPage() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <header className="mb-12 flex justify-between items-center max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold mb-2">Estudio <span className="text-primary">Docente</span></h1>
          <p className="text-gray-400">Diseña ejercicios y explora estructuras lógicas.</p>
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
          ← Volver al Inicio
        </Link>
      </header>

      <main className="max-w-6xl mx-auto">
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">1</span>
            Zona de Pruebas
          </h2>
          <Playground />
        </section>

        {/* Placeholder for Exercise Creator */}
        <section className="opacity-50 pointer-events-none grayscale glass-panel p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Creador de Ejercicios</h2>
          <p>Próximamente: Crea asignaciones para tus estudiantes.</p>
        </section>
      </main>
    </div>
  );
}
