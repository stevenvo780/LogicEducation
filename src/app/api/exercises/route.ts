import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/exercises?classroomId=xxx - List exercises for a classroom
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

    const classroomId = request.nextUrl.searchParams.get('classroomId');

    if (!classroomId) {
      return NextResponse.json({ error: 'classroomId es requerido' }, { status: 400 });
    }

    // Check access to classroom
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: { select: { id: true } }
      }
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    const isTeacher = classroom.teacherId === user.id;
    const isStudent = classroom.students.some(s => s.id === user.id);

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ error: 'No tienes acceso a este curso' }, { status: 403 });
    }

    const exercises = await prisma.exercise.findMany({
      where: { classroomId },
      include: {
        _count: { select: { submissions: true } },
        submissions: user.role === 'STUDENT' ? {
          where: { studentId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 1
        } : undefined
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST /api/exercises - Create new exercise (teachers only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Solo profesores pueden crear ejercicios' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      explanation,
      formula, // Legacy field
      difficulty,
      classroomId,
      type,     // New field: exercise type
      content,  // New field: JSON content
      solution  // New field: JSON solution
    } = body;

    // Validate required fields
    if (!title || !classroomId) {
      return NextResponse.json({ error: 'Título y classroomId son requeridos' }, { status: 400 });
    }

    // For legacy format, require formula
    // For new format, require type and content
    const isNewFormat = type && content;
    const isLegacyFormat = formula && !type;

    if (!isNewFormat && !isLegacyFormat) {
      return NextResponse.json({
        error: 'Debe proporcionar: (formula) para formato legacy, o (type + content) para nuevo formato'
      }, { status: 400 });
    }

    // Verify teacher owns the classroom
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId }
    });

    if (!classroom || classroom.teacherId !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso para agregar ejercicios a este curso' }, { status: 403 });
    }

    // Build the exercise data
    const exerciseData: {
      title: string;
      description: string | null;
      explanation: string | null;
      type: string;
      content: string;
      solution: string;
      formula: string | null;
      difficulty: string;
      classroomId: string;
    } = {
      title: title.trim(),
      description: description?.trim() || null,
      explanation: explanation?.trim() || null,
      type: type || 'EQUIVALENCE',
      content: typeof content === 'string' ? content : JSON.stringify(content || {}),
      solution: typeof solution === 'string' ? solution : JSON.stringify(solution || {}),
      formula: formula?.trim() || null,
      difficulty: difficulty || 'MEDIUM',
      classroomId
    };

    // For legacy format, extract formula into content if needed
    if (isLegacyFormat && !content) {
      exerciseData.content = JSON.stringify({ formula: formula.trim() });
    }

    const exercise = await prisma.exercise.create({
      data: exerciseData
    });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
