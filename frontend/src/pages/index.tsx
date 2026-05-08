import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@components/common/Layout';
import { Dashboard } from '@components/Dashboard';
import { useAuth } from '@hooks/useAuth';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}
