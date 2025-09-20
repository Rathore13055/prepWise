// src/app/api/save-interview/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

// ✅ Define interview type
interface Interview {
  role: string;
  questions: string[];
  answers: string[];
  scores: number[];
  readiness: number;
  date: Date;
}

// ✅ Define user type
interface User {
  email: string;
  name: string;
  education: string;
  pastInterviews: Interview[];
}

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
    const users = db.collection<User>('users');

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

    // ✅ Push new interview safely
    const newInterview: Interview = {
      role,
      questions,
      answers,
      scores,
      readiness,
      date: new Date(),
    };

    await users.updateOne(
      { email: session.user.email },
      {
        $push: {
          pastInterviews: newInterview,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error saving interview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
