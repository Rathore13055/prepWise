import { connectToDatabase } from '../../../../lib/mongodb';
import Interview from '../../../../models/interview';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file received' }, { status: 400 });
    }

    // Simulate processing
    const transcript = 'This is a fake transcript from your recorded audio.';
    const feedback = 'Try answering with more clarity and avoid long pauses. Great job overall!';

    await connectToDatabase();
    const saved = await Interview.create({ transcript, feedback });

    return NextResponse.json(saved, { status: 200 });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
