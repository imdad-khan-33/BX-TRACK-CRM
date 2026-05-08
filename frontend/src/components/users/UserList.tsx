import React, { useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@store/userStore';
import { useAuth } from '@hooks/useAuth';
import { useUIStore } from '@store/uiStore';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

export function UserList() {
  const { user: currentUser } = useAuth();
  const { users: rawUsers, pagination: rawPagination, isLoading, error, fetchUsers, deleteUser } = useUserStore();
  const { setSuccess, setError } = useUIStore();
  const users = rawUsers ?? [];
  const pagination = rawPagination ?? { page: 1, pageSize: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      setError('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await deleteUser(userId);
        setSuccess(`User "${userName}" deleted successfully`);
      } catch (err: any) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  // Only admins can view user list
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>You don't have permission to view this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <Link
          href="/users/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add User
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>{error ? 'Failed to load users' : 'No users found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-4">
                      <Link
                        href={`/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </Link>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
