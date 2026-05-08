import React, { useEffect, useState } from 'react';
import { apiRequest } from '@services/api';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

interface ActivityLog {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: string;
}

interface ActivitySummary {
  lastDays: number;
  totalActions: number;
  actionCounts: {
    [key: string]: number;
  };
}

export function ActivityLogList() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs();
    fetchSummary();
  }, [page]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<any>('GET', `/activity-logs?page=${page}&pageSize=20`);
      setLogs(response.data ?? []);
    } catch (error: any) {
      console.error('Failed to fetch logs:', error);
      setError(error.message || 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await apiRequest<any>('GET', '/activity-logs/summary?days=7');
      console.log('Full API Response Body:', response);

      if (response && response.data) {
        const raw = response.data;

        // Backend returns: { totalActivities: 24, summary: { "customer:created": 16, ... } }
        // OR new format:   { totalActions: 24, actionCounts: { created: 16, ... } }
        let totalActions = raw.totalActions ?? raw.totalActivities ?? 0;

        // Sum up counts by action type across all entity types
        let created = 0, updated = 0, deleted = 0, restored = 0;

        if (raw.actionCounts) {
          // New format: { created: 5, updated: 2, deleted: 3 }
          created  = raw.actionCounts.created  || 0;
          updated  = raw.actionCounts.updated  || 0;
          deleted  = raw.actionCounts.deleted  || 0;
          restored = raw.actionCounts.restored || 0;
        } else if (raw.summary) {
          // Old format: { "customer:created": 16, "user:created": 2, "customer:deleted": 4 }
          Object.entries(raw.summary).forEach(([key, val]: [string, any]) => {
            if (key.endsWith(':created'))  created  += val;
            if (key.endsWith(':updated'))  updated  += val;
            if (key.endsWith(':deleted'))  deleted  += val;
            if (key.endsWith(':restored')) restored += val;
          });
        }

        setSummary({
          lastDays: raw.lastDays ?? 7,
          totalActions,
          actionCounts: { created, updated, deleted, restored, assigned: 0 },
        });
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Actions (7D)</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalActions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Created</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {summary.actionCounts?.created || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Updated</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {summary.actionCounts?.updated || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Deleted</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {summary.actionCounts?.deleted || 0}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>{error ? 'Failed to load activity logs' : 'No activity logs found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Entity Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                      {log.entityType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.performedBy?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-1">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
