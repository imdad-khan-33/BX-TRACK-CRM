import React from 'react';
import { Layout } from '@components/common/Layout';
import { ActivityLogList } from '@components/activity-logs/ActivityLogList';
import { useAuth } from '@hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ActivityLogsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <ActivityLogList />
    </Layout>
  );
}
