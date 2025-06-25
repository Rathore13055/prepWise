'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectRolePage() {
  const [role, setRole] = useState('');
  const [manualRole, setManualRole] = useState('');
  const router = useRouter();

  const finalRole = role === 'other' ? manualRole.trim() : role;

  const handleStart = () => {
    if (finalRole) {
      sessionStorage.setItem('selectedRole', finalRole);
      router.push('/interview');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">🧑‍💼 Select or Enter Your Job Role</h1>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="text-black px-4 py-2 mb-4 rounded w-80"
      >
        <option value="">-- Choose a role --</option>
        <option value="software-engineer">Software Engineer</option>
        <option value="product-manager">Product Manager</option>
        <option value="data-analyst">Data Analyst</option>
        <option value="ux-designer">UX Designer</option>
        <option value="marketing-specialist">Marketing Specialist</option>
        <option value="other">Other (Type Manually)</option>
      </select>

      {role === 'other' && (
        <input
          type="text"
          placeholder="Enter your custom role"
          value={manualRole}
          onChange={(e) => setManualRole(e.target.value)}
          className="text-black px-4 py-2 mb-4 rounded w-80"
        />
      )}

      <button
        onClick={handleStart}
        disabled={!finalRole}
        className="bg-green-600 px-4 py-2 rounded disabled:opacity-50"
      >
        Start Interview
      </button>
    </main>
  );
}
