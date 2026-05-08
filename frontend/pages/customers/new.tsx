import React from 'react';
import { Layout } from '@components/common/Layout';
import { CustomerForm } from '@components/customers/CustomerForm';
import { useAuth } from '@hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function NewCustomerPage() {
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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Customer</h1>
        <CustomerForm />
      </div>
    </Layout>
  );
}
