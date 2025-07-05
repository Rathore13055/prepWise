"use client";

import { useEffect, useState } from "react";

type Interview = {
  role: string;
  questions: string[];
  answers: string[];
  scores: number[];
  readiness: number;
  date: string;
};

type UserData = {
  name: string;
  email: string;
  education: string;
  pastInterviews: Interview[];
};

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [sortOption, setSortOption] = useState<"date" | "readiness">("date");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [education, setEducation] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/get-user-data");
      const data = await res.json();

      const isIncomplete = !data || !data.name || !data.education;

      setUserData(data);
      setName(data?.name || "");
      setEducation(data?.education || "");
      setEditMode(isIncomplete);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    const res = await fetch("/api/update-profile", {
      method: "POST",
      body: JSON.stringify({ name, education }),
    });

    if (res.ok) {
      const updated = { ...userData, name, education } as UserData;
      setUserData(updated);
      setEditMode(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
        <span className="ml-4 text-xl font-medium">Loading Dashboard...</span>
      </div>
    );
  }

  if (!userData) {
    return (
      <main className="min-h-screen p-8 bg-black text-white">
        <h2 className="text-red-500 text-xl font-bold">
          ❌ Failed to load user data.
        </h2>
      </main>
    );
  }

  const uniqueRoles = Array.from(
    new Set(userData.pastInterviews.map((i) => i.role))
  );

  let filteredInterviews =
    filterRole === "All"
      ? userData.pastInterviews
      : userData.pastInterviews.filter((i) => i.role === filterRole);

  if (sortOption === "date") {
    filteredInterviews.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } else {
    filteredInterviews.sort((a, b) => b.readiness - a.readiness);
  }

  return (
    <main className="min-h-screen p-6 md:p-12 text-white bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            👤 Welcome, {userData.name || "User"}
          </h1>
          <button
            onClick={() => (window.location.href = "/api/auth/signout")}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition"
          >
            🔓 Logout
          </button>
        </div>

        <p className="mb-4 text-gray-300">📧 Email: {userData.email}</p>

        {editMode ? (
          <div className="mb-6">
            <label className="block mb-1">📝 Name:</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-white bg-gray-800 p-2 rounded mb-2 w-full"
            />
            <label className="block mb-1">🎓 Education:</label>
            <input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="text-white bg-gray-800 p-2 rounded w-full"
            />
            <div className="mt-4">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mr-2"
              >
                💾 Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <p className="mb-1 text-gray-200">
              🎓 Education: {userData.education || "Not Provided"}
            </p>
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              ✏️ Edit Profile
            </button>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4 mt-6">📝 Past Interviews</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">🔍 Filter by Role:</label>
            <select
              className="text-black px-4 py-2 rounded w-full"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="All">All</option>
              {uniqueRoles.map((role, idx) => (
                <option key={idx} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">📊 Sort by:</label>
            <select
              className="text-black px-4 py-2 rounded w-full"
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value as "date" | "readiness")
              }
            >
              <option value="date">📅 Most Recent</option>
              <option value="readiness">🔥 Highest Readiness</option>
            </select>
          </div>
        </div>

        {filteredInterviews.length === 0 ? (
          <p className="text-center text-gray-400 italic mt-4">
            No interviews found for this role.
          </p>
        ) : (
          <ul className="space-y-4">
            {filteredInterviews.map((item, idx) => (
              <li
                key={idx}
                className="p-4 rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-md hover:shadow-xl transition"
              >
                <p>
                  <strong>👔 Role:</strong> {item.role}
                </p>
                <p>
                  <strong>📅 Date:</strong>{" "}
                  {new Date(item.date).toLocaleString()}
                </p>
                <p>
                  <strong>🔥 Readiness:</strong> {item.readiness}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
