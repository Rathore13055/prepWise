'use client';

import { ReactNode } from 'react';
import { SessionProvider as NextAuthProvider } from 'next-auth/react';
import type { Session } from 'next-auth'; // ✅ Import from 'next-auth', not 'next-auth/react'

interface SessionProviderProps {
  children: ReactNode;
  session?: Session | null;
}

export default function SessionProvider({ children, session }: SessionProviderProps) {
  return <NextAuthProvider session={session}>{children}</NextAuthProvider>;
}
