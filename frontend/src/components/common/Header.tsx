import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@hooks/useAuth';

export function Header() {
  const router = useRouter();
  const { user } = useAuth();

  const getPageTitle = () => {
    const pathname = router.pathname;
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/customers')) return 'Customers';
    if (pathname.startsWith('/users')) return 'Users';
    if (pathname.startsWith('/activity-logs')) return 'Activity Logs';
    return 'CRM';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h2>
          <p className="text-sm text-gray-500 mt-1">{user?.organizationId}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
