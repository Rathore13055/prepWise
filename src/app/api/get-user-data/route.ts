// src/app/api/get-user-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json(null, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('interview_platform');
    const users = db.collection('users');

    let user = await users.findOne({ email: session.user.email });

    // If user doesn't exist, create one with default fields
    if (!user) {
      await users.insertOne({
        email: session.user.email,
        name: '',
        education: '',
        pastInterviews: [],
      });

      user = await users.findOne({ email: session.user.email });
    }

    if (!user) {
      return NextResponse.json(null, { status: 500 });
    }

    const { name, email, education, pastInterviews } = user;

    return NextResponse.json({
      name,
      email,
      education,
      pastInterviews: pastInterviews || [],
    });
  } catch (err) {
    console.error('Failed to fetch user data:', err);
    return NextResponse.json(null, { status: 500 });
  }
}
