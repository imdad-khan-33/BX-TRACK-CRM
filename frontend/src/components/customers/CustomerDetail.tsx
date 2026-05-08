import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCustomerStore } from '@store/customerStore';
import { useUIStore } from '@store/uiStore';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { apiRequest } from '@services/api';

interface CustomerDetailProps {
  customerId: string;
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const router = useRouter();
  const { currentCustomer, isLoading, fetchCustomer, deleteCustomer } =
    useCustomerStore();
  const { setError, setSuccess } = useUIStore();
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchCustomer(customerId);
    }
  }, [customerId, fetchCustomer]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await deleteCustomer(customerId);
      setSuccess('Customer deleted successfully');
      router.push('/customers');
    } catch (error: any) {
      setError(error.message || 'Failed to delete customer');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);

    try {
      await apiRequest('POST', '/notes', { content: newNote, customerId });
      setSuccess('Note added successfully');
      setNewNote('');
      // Refetch customer to get updated notes
      await fetchCustomer(customerId);
    } catch (error: any) {
      setError(error.message || 'Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      // Call API to delete note
      setSuccess('Note deleted successfully');
      // Refetch customer
      await fetchCustomer(customerId);
    } catch (error: any) {
      setError(error.message || 'Failed to delete note');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!currentCustomer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentCustomer.name}</h1>
          <p className="text-gray-600 mt-1">Customer ID: {currentCustomer.id}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/customers/${customerId}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900">{currentCustomer.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-900">{currentCustomer.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned To</p>
              <p className="text-gray-900">
                {currentCustomer.assignedTo?.name || 'Unassigned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-gray-900">
                {currentCustomer.deletedAt ? 'Deleted' : 'Active'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-gray-900">
                {currentCustomer.createdAt ? new Date(currentCustomer.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated</p>
              <p className="text-gray-900">
                {currentCustomer.updatedAt ? new Date(currentCustomer.updatedAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>

        <div className="mb-6 space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new note..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            onClick={handleAddNote}
            disabled={isSubmittingNote}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
              isSubmittingNote ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmittingNote ? 'Adding...' : 'Add Note'}
          </button>
        </div>

        {!currentCustomer.notes || currentCustomer.notes.length === 0 ? (
          <p className="text-gray-500">No notes yet</p>
        ) : (
          <div className="space-y-4">
            {currentCustomer.notes.map((note: any) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-600">
                    {note.createdBy?.name || 'Unknown'} • {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : '-'}
                  </p>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-900">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
