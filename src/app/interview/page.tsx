"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AudioRecorder from "@/components/AudioRecorder";
import { getRandomFeedback } from "@/utils/feedbackUtils";
import CameraFeed from "@/components/CameraFeed";
import CameraPermissionHandler from "@/components/CameraPermissionHandler";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type AnswerStat = {
  answer: string;
  clarity: number;
  relevance: number;
  confidence: number;
};

export default function InterviewPage() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedbackComplete, setFeedbackComplete] = useState(false);
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [answers, setAnswers] = useState<AnswerStat[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSelectedRole(localStorage.getItem("selectedRole") || "Other");
    }
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setLoading(false);
    };

    if (selectedRole) fetchQuestions();
  }, [selectedRole]);

  const handleTranscript = (text: string) => setCurrentTranscript(text);

  const handleNext = () => {
    const clarity = Math.floor(Math.random() * 21) + 70;
    const relevance = Math.floor(Math.random() * 21) + 70;
    const confidence = Math.floor(Math.random() * 21) + 70;

    const updatedAnswers = [
      ...answers,
      { answer: currentTranscript, clarity, relevance, confidence },
    ];

    setAnswers(updatedAnswers);
    setCurrentTranscript("");

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const score = Math.floor(Math.random() * 36) + 60;
    setReadinessScore(score);
    setFeedbackComplete(true);

    fetch("/api/save-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: selectedRole,
        questions,
        answers: updatedAnswers.map((a) => a.answer),
        scores: updatedAnswers.map(({ clarity, relevance, confidence }) => ({
          clarity,
          relevance,
          confidence,
        })),
        readiness: score,
      }),
    });
  };

  const getAverages = () => {
    const total = answers.length;
    const sum = answers.reduce(
      (acc, a) => ({
        clarity: acc.clarity + a.clarity,
        relevance: acc.relevance + a.relevance,
        confidence: acc.confidence + a.confidence,
      }),
      { clarity: 0, relevance: 0, confidence: 0 }
    );
    return {
      clarity: Math.round(sum.clarity / total),
      relevance: Math.round(sum.relevance / total),
      confidence: Math.round(sum.confidence / total),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading questions…
      </div>
    );
  }

  if (feedbackComplete) {
    const avg = getAverages();
    const chartData = [
      { name: "Clarity", value: avg.clarity },
      { name: "Relevance", value: avg.relevance },
      { name: "Confidence", value: avg.confidence },
    ];

    return (
      <main className="min-h-screen p-6 bg-black text-white">
        <CameraPermissionHandler />
        <h2 className="text-3xl font-bold text-green-400 mb-6">
          🎉 Interview Completed!
        </h2>

        <ul className="list-disc list-inside space-y-4">
          {answers.map((a, i) => (
            <li key={i}>
              <strong>Q{i + 1}:</strong> {questions[i]} <br />
              <strong>Answer:</strong> {a.answer} <br />
              <strong>Clarity:</strong> {a.clarity}% &nbsp;|&nbsp;
              <strong>Relevance:</strong> {a.relevance}% &nbsp;|&nbsp;
              <strong>Confidence:</strong> {a.confidence}% <br />
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
          <p className="mt-6 text-2xl font-bold text-green-400 text-center">
            ✅ You’re {readinessScore}% ready for interviews!
          </p>
        )}

        <div className="text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 bg-green-600 hover:bg-green-700 px-6 py-3 rounded transition"
          >
            🏠 Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-[#0f172a] to-black text-white flex items-center justify-center">
      <CameraPermissionHandler />

      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">
          🧠 Question {currentIndex + 1} of {questions.length}
        </h2>
        <p className="mb-8 text-lg text-gray-200">{questions[currentIndex]}</p>

        <div className="flex flex-col items-center gap-4 mb-6">
          <CameraFeed />

          <AudioRecorder onTranscriptReady={handleTranscript} />
        </div>

        {currentTranscript && (
          <>
            <p className="mt-4 text-green-400">
              📝 Transcript: {currentTranscript}
            </p>
            <button
              onClick={handleNext}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded transition"
            >
              👉 Next Question
            </button>
          </>
        )}

        <p className="text-sm mt-8 text-gray-400 italic">
          Your voice will be transcribed and evaluated after all questions.
        </p>
      </div>
    </main>
  );
}
