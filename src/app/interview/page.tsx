'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AudioRecorder from '@/components/AudioRecorder';
import { getRandomFeedback } from '@/utils/feedbackUtils';
import CameraFeed from '@/components/CameraFeed';
import CameraPermissionHandler from '@/components/CameraPermissionHandler';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

type AnswerStat = {
  answer: string;
  clarity: number;
  relevance: number;
  confidence: number;
};

export default function InterviewPage() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedbackComplete, setFeedbackComplete] = useState(false);
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [answers, setAnswers] = useState<AnswerStat[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('selectedRole') || 'Other';
      setSelectedRole(role);
    }
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setLoading(false);
    };

    fetchQuestions();
  }, [selectedRole]);

  const handleTranscript = (text: string) => {
    setCurrentTranscript(text);
  };

  const handleNext = () => {
    const clarity = Math.floor(Math.random() * 21) + 70;
    const relevance = Math.floor(Math.random() * 21) + 70;
    const confidence = Math.floor(Math.random() * 21) + 70;

    const updatedAnswers = [
      ...answers,
      { answer: currentTranscript, clarity, relevance, confidence },
    ];

    setAnswers(updatedAnswers);
    setCurrentTranscript('');

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const score = Math.floor(Math.random() * 36) + 60;
      setReadinessScore(score);
      setFeedbackComplete(true);

      // Save interview to MongoDB
      fetch('/api/save-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          questions,
          answers: updatedAnswers.map((a) => a.answer),
          scores: updatedAnswers.map(({ clarity, relevance, confidence }) => ({ clarity, relevance, confidence })),
          readiness: score,
        }),
      }).then(() => {
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      });
    }
  };

  const getAverages = () => {
    const total = answers.length;
    const sum = answers.reduce(
      (acc, ans) => {
        acc.clarity += ans.clarity;
        acc.relevance += ans.relevance;
        acc.confidence += ans.confidence;
        return acc;
      },
      { clarity: 0, relevance: 0, confidence: 0 }
    );

    return {
      clarity: Math.round(sum.clarity / total),
      relevance: Math.round(sum.relevance / total),
      confidence: Math.round(sum.confidence / total),
    };
  };

  if (loading) return <div className="text-white p-4">Loading questions...</div>;

  if (feedbackComplete) {
    const avg = getAverages();

    const chartData = [
      { name: 'Clarity', value: avg.clarity },
      { name: 'Relevance', value: avg.relevance },
      { name: 'Confidence', value: avg.confidence },
    ];

    return (
      <main className="min-h-screen p-6 bg-black text-white">
        <CameraPermissionHandler />
        <h2 className="text-2xl mb-4">🎉 Interview Completed!</h2>
        <p className="mb-2">Here's a mock summary of your responses:</p>
        <ul className="list-disc list-inside space-y-4">
          {answers.map((ans, idx) => (
            <li key={idx}>
              <strong>Q{idx + 1}:</strong> {questions[idx]}<br />
              <strong>Your Answer:</strong> {ans.answer}<br />
              <strong>Clarity:</strong> {ans.clarity}%<br />
              <strong>Relevance:</strong> {ans.relevance}%<br />
              <strong>Confidence:</strong> {ans.confidence}%<br />
              <strong>Feedback:</strong> {getRandomFeedback()}
            </li>
          ))}
        </ul>

        <div className="mt-10 w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {readinessScore !== null && (
          <p className="mt-6 font-bold text-green-400">
            ✅ You’re {readinessScore}% ready for interviews!
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-black text-white flex flex-col items-center justify-center">
      <CameraPermissionHandler />
      <h2 className="text-xl font-bold mb-4">
        🗣️ Question {currentIndex + 1} of {questions.length}
      </h2>
      <p className="mb-4 max-w-xl text-center">{questions[currentIndex]}</p>

      <CameraFeed />
      <AudioRecorder onTranscriptReady={handleTranscript} />

      {currentTranscript && (
        <>
          <p className="mt-4 text-green-400">
            📝 Transcript: {currentTranscript}
          </p>
          <button
            onClick={handleNext}
            className="mt-4 bg-blue-600 px-4 py-2 rounded"
          >
            👉 Next Question
          </button>
        </>
      )}

      <p className="text-sm mt-6 text-gray-400">
        Your answer will be transcribed and evaluated in the final step.
      </p>
    </main>
  );
}
