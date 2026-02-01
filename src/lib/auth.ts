import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Class Code", type: "text" },
        name: { label: "Student Name", type: "text" }
      },
      async authorize(credentials) {
        // Quick Join Flow (Code + Name)
        if (credentials?.code && credentials?.name) {
          const classroom = await prisma.classroom.findUnique({
            where: { code: credentials.code }
          });

          if (!classroom) {
            throw new Error("Código de clase no válido");
          }

          // Generate guest credentials
          const uniqueId = Math.random().toString(36).substring(2, 10);
          const timestamp = Date.now();
          const guestEmail = `guest.${timestamp}.${uniqueId}@logiceducation.local`;
          // Create a secure hash for the guest password
          const guestPassword = await hash(`${uniqueId}${timestamp}`, 10);

          // Create the guest user and enroll them
          const user = await prisma.user.create({
            data: {
              email: guestEmail,
              name: credentials.name,
              password: guestPassword,
              role: 'STUDENT',
              classroomsEnrolled: {
                connect: { id: classroom.id }
              }
            }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        // Standard Login Flow (Email + Password)
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Custom property
        };
      },
    }),
  ],
  callbacks: { // Add role to session
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      };
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
};
