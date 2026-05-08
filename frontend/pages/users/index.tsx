import React from 'react';
import { Layout } from '@components/common/Layout';
import { UserList } from '@components/users/UserList';
import { useAuth } from '@hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function UsersPage() {
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
      <UserList />
    </Layout>
  );
}
