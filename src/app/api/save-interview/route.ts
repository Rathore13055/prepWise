// src/app/api/save-interview/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import type { Document } from 'mongodb'; // ✅ Added

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { role, questions, answers, scores, readiness } = body;

    if (
      !role ||
      !Array.isArray(questions) ||
      !Array.isArray(answers) ||
      !Array.isArray(scores) ||
      readiness === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid interview data.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('interview_platform');

    // ✅ Type-safe collection
    const users = db.collection<Document>('users');

    // ✅ Ensure user document exists
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

    // ✅ Push interview safely
    await users.updateOne(
  { email: session.user.email },
  {
    $push: {
      pastInterviews: {
        $each: [
          {
            role,
            questions,
            answers,
            scores,
            readiness,
            date: new Date(),
          },
        ],
      },
    } as any, // ✅ Tell TypeScript to ignore type checking here
  }
);



    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error saving interview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
