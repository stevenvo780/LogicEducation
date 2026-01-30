import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { LogicParser } from '@/lib/logic/parser';
import { generateTruthTable } from '@/lib/logic/evaluator';

// GET /api/submissions?exerciseId=xxx - Get submissions for an exercise
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const exerciseId = request.nextUrl.searchParams.get('exerciseId');

    if (!exerciseId) {
      return NextResponse.json({ error: 'exerciseId es requerido' }, { status: 400 });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        classroom: {
          include: { students: { select: { id: true } } }
        }
      }
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Ejercicio no encontrado' }, { status: 404 });
    }

    const isTeacher = exercise.classroom.teacherId === user.id;
    const isStudent = exercise.classroom.students.some(s => s.id === user.id);

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ error: 'No tienes acceso' }, { status: 403 });
    }

    // Teachers see all submissions, students see only their own
    const submissions = await prisma.submission.findMany({
      where: {
        exerciseId,
        ...(user.role === 'STUDENT' ? { studentId: user.id } : {})
      },
      include: {
        student: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST /api/submissions - Submit answer for an exercise
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Solo estudiantes pueden enviar respuestas' }, { status: 403 });
    }

    const { exerciseId, answer } = await request.json();

    if (!exerciseId || !answer) {
      return NextResponse.json({ error: 'exerciseId y answer son requeridos' }, { status: 400 });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        classroom: {
          include: { students: { select: { id: true } } }
        }
      }
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Ejercicio no encontrado' }, { status: 404 });
    }

    const isStudent = exercise.classroom.students.some(s => s.id === user.id);
    if (!isStudent) {
      return NextResponse.json({ error: 'No estás inscrito en este curso' }, { status: 403 });
    }

    // Evaluate answer - check if student's formula is equivalent to exercise formula
    let isCorrect = false;
    let feedback = '';

    try {
      const parser = new LogicParser();
      const studentFormula = parser.parse(answer.trim());
      const correctFormula = parser.parse(exercise.formula);

      const studentTable = generateTruthTable(studentFormula);
      const correctTable = generateTruthTable(correctFormula);

      // Compare truth tables
      if (studentTable.variables.length === correctTable.variables.length &&
        studentTable.variables.every(v => correctTable.variables.includes(v))) {
        isCorrect = studentTable.rows.every((row, i) =>
          row.result === correctTable.rows[i].result
        );
      }

      feedback = isCorrect
        ? '¡Correcto! Tu fórmula es lógicamente equivalente.'
        : 'Incorrecto. Tu fórmula no produce la misma tabla de verdad.';
    } catch {
      feedback = 'Error al parsear la fórmula. Verifica la sintaxis.';
    }

    const submission = await prisma.submission.create({
      data: {
        studentId: user.id,
        exerciseId,
        status: isCorrect ? 'CORRECT' : 'INCORRECT'
      }
    });

    return NextResponse.json({
      submission,
      isCorrect,
      feedback
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
