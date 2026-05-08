import React from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@components/common/Layout';
import { UserForm } from '@components/users/UserForm';
import { useAuth } from '@hooks/useAuth';
import { useEffect } from 'react';

export default function EditUserPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !id) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <UserForm userId={id as string} />
      </div>
    </Layout>
  );
}
