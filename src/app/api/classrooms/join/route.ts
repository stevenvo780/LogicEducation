import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/classrooms/join - Join a classroom with code
export async function POST(request: NextRequest) {
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

    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Solo estudiantes pueden unirse a cursos' }, { status: 403 });
    }

    const { code } = await request.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: 'El código es requerido' }, { status: 400 });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: {
        students: { select: { id: true } }
      }
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Código de curso inválido' }, { status: 404 });
    }

    // Check if already enrolled
    const isEnrolled = classroom.students.some(s => s.id === user.id);
    if (isEnrolled) {
      return NextResponse.json({ error: 'Ya estás inscrito en este curso' }, { status: 400 });
    }

    // Enroll student
    await prisma.classroom.update({
      where: { id: classroom.id },
      data: {
        students: {
          connect: { id: user.id }
        }
      }
    });

    return NextResponse.json({
      success: true,
      classroom: { id: classroom.id, name: classroom.name }
    });
  } catch (error) {
    console.error('Error joining classroom:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
