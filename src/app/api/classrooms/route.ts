import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/classrooms - List classrooms for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        classroomsOwned: {
          include: {
            _count: {
              select: { students: true, exercises: true }
            }
          }
        },
        classroomsEnrolled: {
          include: {
            teacher: { select: { name: true } },
            _count: {
              select: { exercises: true }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Return different data based on role
    if (user.role === 'TEACHER') {
      return NextResponse.json({
        classrooms: user.classroomsOwned,
        role: 'TEACHER'
      });
    } else {
      return NextResponse.json({
        classrooms: user.classroomsEnrolled,
        role: 'STUDENT'
      });
    }
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST /api/classrooms - Create new classroom (teachers only)
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
      return NextResponse.json({ error: 'Solo profesores pueden crear cursos' }, { status: 403 });
    }

    const { name, description } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // Generate unique join code
    const code = generateJoinCode();

    const classroom = await prisma.classroom.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        code,
        teacherId: user.id
      }
    });

    return NextResponse.json({ classroom }, { status: 201 });
  } catch (error) {
    console.error('Error creating classroom:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
