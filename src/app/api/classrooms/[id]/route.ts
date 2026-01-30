import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/classrooms/[id] - Get classroom details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const classroom = await prisma.classroom.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        students: { select: { id: true, name: true, email: true } },
        exercises: {
          include: {
            _count: { select: { submissions: true } },
            submissions: user.role === 'STUDENT' ? {
              where: { studentId: user.id }
            } : undefined
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { students: true, exercises: true } }
      }
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    // Check access
    const isTeacher = classroom.teacherId === user.id;
    const isStudent = classroom.students.some(s => s.id === user.id);

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ error: 'No tienes acceso a este curso' }, { status: 403 });
    }

    return NextResponse.json({
      classroom,
      isTeacher,
      isStudent
    });
  } catch (error) {
    console.error('Error fetching classroom:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PUT /api/classrooms/[id] - Update classroom (teacher only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const classroom = await prisma.classroom.findUnique({
      where: { id }
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    if (classroom.teacherId !== user.id) {
      return NextResponse.json({ error: 'Solo el profesor puede editar este curso' }, { status: 403 });
    }

    const { name, description } = await request.json();

    const updated = await prisma.classroom.update({
      where: { id },
      data: {
        name: name?.trim() || classroom.name,
        description: description?.trim() || classroom.description
      }
    });

    return NextResponse.json({ classroom: updated });
  } catch (error) {
    console.error('Error updating classroom:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE /api/classrooms/[id] - Delete classroom (teacher only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const classroom = await prisma.classroom.findUnique({
      where: { id }
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    if (classroom.teacherId !== user.id) {
      return NextResponse.json({ error: 'Solo el profesor puede eliminar este curso' }, { status: 403 });
    }

    // Delete all related data first
    await prisma.submission.deleteMany({
      where: { exercise: { classroomId: id } }
    });

    await prisma.exercise.deleteMany({
      where: { classroomId: id }
    });

    await prisma.classroom.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
