import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@services/api';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

interface DashboardStats {
  totalCustomers: number;
  totalUsers: number;
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
  }>;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch from customers endpoint to get count
      const customersResponse = await apiRequest<any>('GET', '/customers?page=1&pageSize=1');
      const usersResponse = await apiRequest<any>('GET', '/users?page=1&pageSize=1');

      setStats({
        totalCustomers: customersResponse?.pagination?.total ?? 0,
        totalUsers: usersResponse?.pagination?.total ?? 0,
        recentActivity: [],
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Fallback to zeros on error
      setStats({
        totalCustomers: 0,
        totalUsers: 0,
        recentActivity: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/customers">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalCustomers || 0}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <p className="text-blue-600 mt-4 hover:text-blue-800">View customers →</p>
          </div>
        </Link>

        <Link href="/users">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="text-4xl">👤</div>
            </div>
            <p className="text-blue-600 mt-4 hover:text-blue-800">Manage users →</p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/customers/new"
            className="p-4 border border-gray-300 rounded-lg hover:bg-blue-50 transition text-center"
          >
            <p className="text-lg font-semibold text-gray-900">+ Add Customer</p>
          </Link>
          <Link
            href="/users/new"
            className="p-4 border border-gray-300 rounded-lg hover:bg-green-50 transition text-center"
          >
            <p className="text-lg font-semibold text-gray-900">+ Add User</p>
          </Link>
          <Link
            href="/activity-logs"
            className="p-4 border border-gray-300 rounded-lg hover:bg-purple-50 transition text-center"
          >
            <p className="text-lg font-semibold text-gray-900">View Activity</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
