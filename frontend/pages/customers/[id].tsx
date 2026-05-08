import React from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@components/common/Layout';
import { CustomerDetail } from '@components/customers/CustomerDetail';
import { useAuth } from '@hooks/useAuth';
import { useEffect } from 'react';

export default function CustomerDetailPage() {
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
      <CustomerDetail customerId={id as string} />
    </Layout>
  );
}
