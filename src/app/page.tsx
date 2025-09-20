'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/select-role'); // ✅ redirect after login
    }
  }, [session, router]); // ✅ added router to dependency array

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      {!session ? (
        <>
          <h1 className="text-2xl font-bold mb-6">🎯 AI Interview Practice</h1>
          <button
            onClick={() => signIn('google')}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Sign in with Google
          </button>
        </>
      ) : (
        <p className="text-lg">Redirecting to role selection...</p>
      )}
    </main>
  );
}
