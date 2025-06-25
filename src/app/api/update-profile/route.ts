import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, education } = await req.json();

  if (!name || !education) {
    return NextResponse.json(
      { error: 'Name and education are required.' },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db('interview_platform');
    const users = db.collection('users');

    await users.updateOne(
      { email: session.user.email },
      {
        $set: {
          name,
          education,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
