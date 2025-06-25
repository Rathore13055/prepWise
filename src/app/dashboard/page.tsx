'use client';

import { useEffect, useState } from 'react';

type Interview = {
  role: string;
  date: string;
  readiness: number;
};

type UserData = {
  name: string;
  email: string;
  education: string;
  pastInterviews: Interview[];
};

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [education, setEducation] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/get-user-data');
      const data = await res.json();

      const isIncomplete = !data || !data.name || !data.education;

      setUserData(data);
      setName(data?.name || '');
      setEducation(data?.education || '');
      setEditMode(isIncomplete);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    const res = await fetch('/api/update-profile', {
      method: 'POST',
      body: JSON.stringify({ name, education }),
    });

    if (res.ok) {
      const updated = { ...userData, name, education } as UserData;
      setUserData(updated);
      setEditMode(false);
    }
  };

  if (loading) {
    return <div className="text-white p-6">Loading dashboard...</div>;
  }

  if (!userData) {
    return (
      <main className="min-h-screen p-8 bg-black text-white">
        <h2 className="text-red-500">❌ Failed to load user data.</h2>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-black text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👤 Welcome, {userData.name || 'User'}</h1>
        <button
          onClick={() => {
            window.location.href = '/api/auth/signout';
          }}
          className="bg-red-600 px-4 py-2 rounded text-white"
        >
          🔓 Logout
        </button>
      </div>

      <p className="mb-2">📧 Email: {userData.email}</p>

      {editMode ? (
        <div className="mb-6">
          <label className="block mb-1">📝 Name:</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-black p-2 rounded mb-2 w-full"
          />

          <label className="block mb-1">🎓 Education:</label>
          <input
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="text-black p-2 rounded w-full"
          />

          <div className="mt-4">
            <button
              onClick={handleSave}
              className="bg-green-600 px-4 py-2 rounded mr-2"
            >
              💾 Save
            </button>
            {!(!userData.name || !userData.education) && (
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-600 px-4 py-2 rounded"
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <p className="mb-1">🎓 Education: {userData.education || 'Not Provided'}</p>
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            ✏️ Edit Profile
          </button>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">📝 Past Interviews</h2>
      {userData.pastInterviews.length === 0 ? (
        <p>No interviews found.</p>
      ) : (
        <ul className="space-y-4">
          {userData.pastInterviews.map((item, idx) => (
            <li key={idx} className="border p-4 rounded bg-gray-800">
              <p><strong>Role:</strong> {item.role}</p>
              <p><strong>Date:</strong> {new Date(item.date).toLocaleString()}</p>
              <p><strong>Readiness:</strong> {item.readiness}%</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
