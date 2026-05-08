import React from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@components/common/Layout';
import { CustomerForm } from '@components/customers/CustomerForm';
import { useAuth } from '@hooks/useAuth';
import { useEffect } from 'react';

export default function EditCustomerPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
        <CustomerForm customerId={id as string} />
      </div>
    </Layout>
  );
}
