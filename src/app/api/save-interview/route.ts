// src/app/api/save-interview/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { role, questions, answers, scores, readiness } = body;

    const client = await clientPromise;
    const db = client.db('interview_platform');
    const users = db.collection('users');

    // 1. Ensure user document exists
    await users.updateOne(
      { email: session.user.email },
      {
        $setOnInsert: {
          email: session.user.email,
          name: session.user.name || '',
          education: '',
          pastInterviews: [],
        },
      },
      { upsert: true }
    );

    // 2. Push interview entry (cast to `any` to avoid TS conflict)
    await users.updateOne(
      { email: session.user.email },
      {
        $push: {
          pastInterviews: {
            role,
            questions,
            answers,
            scores,
            readiness,
            date: new Date(),
          },
        } as any,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error saving interview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
