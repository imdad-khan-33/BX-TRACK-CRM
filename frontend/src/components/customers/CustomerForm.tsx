import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCustomerStore } from '@store/customerStore';
import { useUserStore } from '@store/userStore';
import { useUIStore } from '@store/uiStore';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

interface CustomerFormProps {
  customerId?: string;
}

export function CustomerForm({ customerId }: CustomerFormProps) {
  const router = useRouter();
  const { currentCustomer, isLoading, createCustomer, updateCustomer, fetchCustomer } =
    useCustomerStore();
  const { users, fetchUsers } = useUserStore();
  const { setError, setSuccess } = useUIStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    assignedToUserId: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (customerId) {
      fetchCustomer(customerId);
    }
  }, [customerId, fetchCustomer]);

  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        name: currentCustomer.name,
        email: currentCustomer.email || '',
        phone: currentCustomer.phone || '',
        assignedToUserId: currentCustomer.assignedToUserId || '',
      });
    }
  }, [currentCustomer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Clean up empty strings for optional fields
      const submitData = {
        ...formData,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        assignedToUserId: formData.assignedToUserId || null,
      };

      if (customerId) {
        await updateCustomer(customerId, submitData);
        setSuccess('Customer updated successfully');
      } else {
        await createCustomer(submitData);
        setSuccess('Customer created successfully');
      }
      router.push('/customers');
    } catch (error: any) {
      setError(error.message || 'Failed to save customer');
    }
  };

  if (isLoading && customerId) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="customer@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To User
          </label>
          <select
            name="assignedToUserId"
            value={formData.assignedToUserId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a user (optional)</option>
            {(users ?? []).map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : customerId ? 'Update Customer' : 'Create Customer'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/customers')}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
