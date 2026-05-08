import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUserStore } from '@store/userStore';
import { useUIStore } from '@store/uiStore';
import { useAuth } from '@hooks/useAuth';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

interface UserFormProps {
  userId?: string;
}

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { currentUser: formUser, isLoading, createUser, updateUser, fetchUser } =
    useUserStore();
  const { setError, setSuccess } = useUIStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member' as 'admin' | 'member',
  });

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);

  useEffect(() => {
    if (formUser) {
      setFormData({
        name: formUser.name,
        email: formUser.email,
        password: '',
        role: formUser.role,
      });
    }
  }, [formUser]);

  // Only admins can create/edit users
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>You don't have permission to perform this action</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (userId) {
        await updateUser(userId, formData);
        setSuccess('User updated successfully');
      } else {
        await createUser(formData);
        setSuccess('User created successfully');
      }
      router.push('/users');
    } catch (error: any) {
      setError(error.message || 'Failed to save user');
    }
  };

  if (isLoading && userId) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
        </div>

        {!userId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!userId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : userId ? 'Update User' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/users')}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
