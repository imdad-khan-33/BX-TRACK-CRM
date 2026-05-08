import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import { useAuth } from '@hooks/useAuth';

export function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (path: string) => router.pathname === path;

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Customers', path: '/customers', icon: '👥' },
    { label: 'Users', path: '/users', icon: '👤', adminOnly: true },
    { label: 'Activity Logs', path: '/activity-logs', icon: '📋' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">CRM</h1>
        <p className="text-sm text-gray-500 mt-1">{user?.name || 'Guest'}</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') {
            return null;
          }

          return (
            <Link
              key={item.path}
              href={item.path}
              className={clsx(
                'block px-6 py-3 text-gray-700 hover:bg-gray-50 border-l-4 transition',
                isActive(item.path)
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-transparent'
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-6 border-t">
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
