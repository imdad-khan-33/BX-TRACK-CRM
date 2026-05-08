import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCustomerStore } from '@store/customerStore';
import { useUIStore } from '@store/uiStore';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

export function CustomerList() {
  const { customers: rawCustomers, pagination: rawPagination, isLoading, error, fetchCustomers, deleteCustomer } = useCustomerStore();
  const { setSuccess, setError } = useUIStore();
  const customers = rawCustomers ?? [];
  const pagination = rawPagination ?? { page: 1, pageSize: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCustomers(page, 10, search);
  }, [page, search, fetchCustomers]);

  const handleDelete = async (customerId: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete customer "${customerName}"? This action cannot be undone.`)) {
      try {
        await deleteCustomer(customerId);
        setSuccess(`Customer "${customerName}" deleted successfully`);
      } catch (err: any) {
        setError(err.message || 'Failed to delete customer');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <Link
          href="/customers/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Customer
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>{error ? 'Failed to load customers' : 'No customers found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-4">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(customer.id, customer.name)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
