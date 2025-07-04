"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectRolePage() {
  const [role, setRole] = useState("");
  const [manualRole, setManualRole] = useState("");
  const router = useRouter();

  const finalRole = role === "other" ? manualRole.trim() : role;

  const handleStart = () => {
    if (finalRole) {
      localStorage.setItem("selectedRole", finalRole);
      router.push("/interview");
    }
  };

  const goToDashboard = () => router.push("/dashboard");

  return (
    <main
      style={{
        backgroundImage:
          "url('https://png.pngtree.com/thumb_back/fh260/background/20220217/pngtree-yellow-lovely-wind-news-interview-illustration-background-image_950455.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative min-h-screen flex items-center justify-center text-white p-4 before:absolute before:inset-0 before:bg-black/60 before:z-[-1]"
    >
      <div className="bg-zinc-800/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-6">
          🧑‍💼 Select or Enter Your Job Role
        </h1>

        {/* Role dropdown */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            Choose a Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Select a role --</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="UX Designer">UX Designer</option>
            <option value="Marketing Specialist">Marketing Specialist</option>
            <option value="other">Other (Type Manually)</option>
          </select>
        </div>

        {/* Custom role input */}
        {role === "other" && (
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">
              Custom Role
            </label>
            <input
              type="text"
              placeholder="Enter your custom role"
              value={manualRole}
              onChange={(e) => setManualRole(e.target.value)}
              className="w-full p-3 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Buttons */}
        <button
          onClick={handleStart}
          disabled={!finalRole}
          className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white py-3 rounded mb-3 disabled:opacity-50"
        >
          🎙️ Start Interview
        </button>

        <button
          onClick={goToDashboard}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white py-3 rounded"
        >
          📊 Go to Dashboard
        </button>
      </div>
    </main>
  );
}
