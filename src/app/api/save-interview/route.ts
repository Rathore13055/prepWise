// File: src/app/api/save-interview/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MongoClient } from 'mongodb';

// Ensure we reuse the client for hot reloads in dev
let client: MongoClient;
const uri = process.env.MONGODB_URI!;
const options = {};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
const clientPromise = global._mongoClientPromise;

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

    await users.updateOne(
    { email: session.user.email },
    {
        $setOnInsert: {
        email: session.user.email,
        name: session.user.name || '',
        education: '',
        pastInterviews: [],
        },
        $push: {
        pastInterviews: {
            role,
            questions,
            answers,
            scores,
            readiness,
            date: new Date(),
        },
        } as any, // 👈 Fix type error here
    },
    { upsert: true }
    );


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error saving interview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
