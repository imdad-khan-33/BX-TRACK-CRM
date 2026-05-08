import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@hooks/useAuth';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('imdadkhanr9@gmail.com');
  const [password, setPassword] = useState('password123');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">CRM System</h1>
        <p className="text-center text-gray-600 mb-8">Multi-Tenant Customer Management</p>

        {(error || localError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error || localError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700">🏢 Microsoft (Org 1)</p>
            <p>
              <strong>Admin:</strong> imdadkhanr9@gmail.com / password123
            </p>
            <p>
              <strong>Member:</strong> alice@acme.com / password123
            </p>
            <p>
              <strong>Member:</strong> bob@acme.com / password123
            </p>
            <p className="font-semibold text-gray-700 mt-2">🏢 Tech Startup Inc (Org 2)</p>
            <p>
              <strong>Admin:</strong> sarah@techstartup.com / password123
            </p>
            <p>
              <strong>Member:</strong> charlie@techstartup.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
