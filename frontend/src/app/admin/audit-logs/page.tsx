'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Calendar,
  X,
  RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';

// ==================== TYPES ====================

interface AuditUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  user: AuditUser | null;
  details: any;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Statistics {
  totalLogs: number;
  created: number;
  updated: number;
  deleted: number;
  activated: number;
  deactivated: number;
  roleChanged: number;
  searches: number;
  noResultSearches: number;
  autocompleteSearches: number;
  chatbotQuestions: number;
  clearedSearchHistory: number;
}

// ==================== HELPER FUNCTIONS ====================

const formatDate = (date: Date | string, format: string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  const pad = (n: number): string => String(n).padStart(2, '0');

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const formatMap: Record<string, string> = {
    dd: pad(d.getDate()),
    MMM: months[d.getMonth()],
    MM: pad(d.getMonth() + 1),
    yyyy: String(d.getFullYear()),
    yy: String(d.getFullYear()).slice(-2),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  };

  let result = format;
  Object.keys(formatMap).forEach((key) => {
    result = result.replace(key, formatMap[key]);
  });

  return result;
};

// ==================== ACTION CONFIGURATION ====================

const actionColors: Record<string, string> = {
  USER_CREATED: 'bg-green-100 text-green-700',
  USER_UPDATED: 'bg-blue-100 text-blue-700',
  USER_DELETED: 'bg-red-100 text-red-700',
  USER_ACTIVATED: 'bg-emerald-100 text-emerald-700',
  USER_DEACTIVATED: 'bg-gray-200 text-gray-700',
  USER_ROLE_CHANGED: 'bg-yellow-100 text-yellow-700',

  SEARCH_PERFORMED: 'bg-indigo-100 text-indigo-700',
  SEARCH_NO_RESULTS: 'bg-orange-100 text-orange-700',
  SEARCH_AUTOCOMPLETE: 'bg-purple-100 text-purple-700',
  SEARCH_HISTORY_CLEARED: 'bg-red-100 text-red-700',

  CHATBOT: 'bg-cyan-100 text-cyan-700',
};

const actionLabels: Record<string, string> = {
  USER_CREATED: 'Created',
  USER_UPDATED: 'Updated',
  USER_DELETED: 'Deleted',
  USER_ACTIVATED: 'Activated',
  USER_DEACTIVATED: 'Deactivated',
  USER_ROLE_CHANGED: 'Role Changed',

  SEARCH_PERFORMED: 'Search Performed',
  SEARCH_NO_RESULTS: 'Search - No Results',
  SEARCH_AUTOCOMPLETE: 'Autocomplete Used',
  SEARCH_HISTORY_CLEARED: 'Search History Cleared',

  CHATBOT: 'Chatbot Question',
};

const actionOptions = [
  { value: '', label: 'All Actions' },

  // User management
  { value: 'USER_CREATED', label: 'User Created' },
  { value: 'USER_UPDATED', label: 'User Updated' },
  { value: 'USER_DELETED', label: 'User Deleted' },
  { value: 'USER_ACTIVATED', label: 'User Activated' },
  { value: 'USER_DEACTIVATED', label: 'User Deactivated' },
  { value: 'USER_ROLE_CHANGED', label: 'Role Changed' },

  // Search activity
  { value: 'SEARCH_PERFORMED', label: 'Search Performed' },
  { value: 'SEARCH_NO_RESULTS', label: 'Search - No Results' },
  { value: 'SEARCH_AUTOCOMPLETE', label: 'Autocomplete Used' },
  { value: 'SEARCH_HISTORY_CLEARED', label: 'Search History Cleared' },

  // Chatbot
  { value: 'CHATBOT', label: 'Chatbot Question' },
];

const entityOptions = [
  { value: '', label: 'All Entities' },
  { value: 'User', label: 'User' },
  { value: 'KnowledgeBase', label: 'Knowledge Base' },
  { value: 'SearchLog', label: 'Search History' },
  { value: 'Chat', label: 'Chatbot' },
];

// ==================== MAIN COMPONENT ====================

export default function AuditLogs() {
  // State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [statistics, setStatistics] = useState<Statistics>({
    totalLogs: 0,
    created: 0,
    updated: 0,
    deleted: 0,
    activated: 0,
    deactivated: 0,
    roleChanged: 0,
    searches: 0,
    noResultSearches: 0,
    autocompleteSearches: 0,
    chatbotQuestions: 0,
    clearedSearchHistory: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==================== FETCH FUNCTIONS ====================

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          limit: 20,
        };

        if (search) params.search = search;
        if (selectedAction) params.action = selectedAction;
        if (selectedEntity) params.entity = selectedEntity;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get('/users/audit/logs', { params });
        setLogs(response.data.logs);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setLoading(false);
      }
    },
    [search, selectedAction, selectedEntity, startDate, endDate],
  );

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.get('/users/audit/logs/summary');
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  }, []);

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, [fetchLogs, fetchStatistics]);

  // ==================== HANDLERS ====================

  const handleSearch = () => {
    fetchLogs(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedAction('');
    setSelectedEntity('');
    setStartDate('');
    setEndDate('');
    fetchLogs(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLogs(newPage);
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    // Simple CSV export
    const headers = ['Date', 'Action', 'Entity', 'Performed By', 'Role', 'Details'];
    const rows = logs.map((log) => [
      formatDate(new Date(log.createdAt), 'dd MMM yyyy HH:mm'),
      log.action,
      log.entity,
      log.user.name,
      log.user.role,
      JSON.stringify(log.details).substring(0, 100) + '...',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderActionBadge = (action: string) => {
    const colorClass = actionColors[action] || 'bg-gray-100 text-gray-700';
    const label = actionLabels[action] || action;
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}>{label}</span>
    );
  };

  const renderStatistics = () => {
    const stats = [
      { label: 'Total Logs', value: statistics.totalLogs, color: 'bg-blue-500' },
      { label: 'Created', value: statistics.created, color: 'bg-green-500' },
      { label: 'Updated', value: statistics.updated, color: 'bg-blue-400' },
      { label: 'Deleted', value: statistics.deleted, color: 'bg-red-500' },
      { label: 'Searches', value: statistics.searches, color: 'bg-indigo-500' },
      { label: 'No Results', value: statistics.noResultSearches, color: 'bg-orange-500' },
      { label: 'Chatbot Questions', value: statistics.chatbotQuestions, color: 'bg-cyan-500' },
    ];

    return (
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
            <div className={`h-1 w-full ${stat.color} mt-2 rounded`} />
          </div>
        ))}
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="min-w-[200px] flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search by action, entity, or user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div className="min-w-[150px]">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Entity Filter */}
          <div className="min-w-[150px]">
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {entityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading audit logs...</p>
        </div>
      );
    }

    if (logs.length === 0) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center shadow">
          <p className="text-gray-600">No audit logs found</p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Performed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {formatDate(new Date(log.createdAt), 'dd MMM yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{renderActionBadge(log.action)}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {log.entity}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {log.user?.name ?? 'Unknown User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                      {log.user?.role ?? '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    return (
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
          entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.page || pagination.page <= 1}
            className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1">
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.page || pagination.page >= pagination.totalPages}
            className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // ==================== MODAL ====================

  const renderModal = () => {
    if (!selectedLog) return null;

    const renderDetails = () => {
      const { details, action } = selectedLog;

      // SEARCH ACTIVITY

      if (
        action === 'SEARCH_PERFORMED' ||
        action === 'SEARCH_NO_RESULTS' ||
        action === 'SEARCH_AUTOCOMPLETE'
      ) {
        return (
          <div className="space-y-4">
            {/* Exact search term */}
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5">
              <h4 className="mb-3 font-medium text-indigo-800">
                {action === 'SEARCH_AUTOCOMPLETE' ? 'Autocomplete Query' : 'Exact Search Query'}
              </h4>

              <div className="rounded-md border border-indigo-200 bg-white p-4">
                <p className="text-lg font-semibold break-words text-gray-900">
                  "{details?.query || 'N/A'}"
                </p>
              </div>
            </div>

            {/* Search metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Search Type</p>
                <p className="font-medium">{details?.searchType || 'N/A'}</p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  {action === 'SEARCH_AUTOCOMPLETE' ? 'Suggestions Returned' : 'Results Found'}
                </p>

                <p className="font-medium">
                  {details?.resultCount ?? details?.suggestionsReturned ?? 0}
                </p>
              </div>

              {details?.totalResults !== undefined && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Total Results</p>
                  <p className="font-medium">{details.totalResults}</p>
                </div>
              )}

              {details?.page !== undefined && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Page</p>
                  <p className="font-medium">{details.page}</p>
                </div>
              )}
            </div>

            {/* Search filters */}
            {details?.filters && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 font-medium text-gray-700">Search Filters</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-medium">{details.filters.category || 'All'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium">{details.filters.type || 'All'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Product</p>
                    <p className="font-medium">{details.filters.product || 'All'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* No results message */}
            {action === 'SEARCH_NO_RESULTS' && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="font-medium text-orange-800">
                  No results were found for this search query.
                </p>
              </div>
            )}
          </div>
        );
      }

      if (action === 'USER_CREATED') {
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="mb-3 font-medium text-green-800">Created User</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{details.createdUser?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{details.createdUser?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="font-medium">{details.createdUser?.role || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium">{details.createdUser?.department || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (action === 'USER_DELETED') {
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 className="mb-3 font-medium text-red-800">Deleted User</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{details.deletedUser?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{details.deletedUser?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="font-medium">{details.deletedUser?.role || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium">{details.deletedUser?.department || 'N/A'}</p>
                </div>
              </div>
            </div>
            {details.deletedBy && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 font-medium text-gray-800">Deleted By</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{details.deletedBy.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{details.deletedBy.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium">{details.deletedBy.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium">{details.deletedBy.department || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      if (action === 'USER_ROLE_CHANGED') {
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="mb-3 font-medium text-yellow-800">Role Change</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Old Role</p>
                  <p className="font-medium">{details.oldRole || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">New Role</p>
                  <p className="font-medium text-yellow-700">{details.newRole || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (action === 'USER_ACTIVATED' || action === 'USER_DEACTIVATED') {
        const isActive = action === 'USER_ACTIVATED';
        return (
          <div className="space-y-4">
            <div
              className={`${isActive ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'} rounded-lg border p-4`}
            >
              <h4 className={`font-medium ${isActive ? 'text-emerald-800' : 'text-gray-800'} mb-3`}>
                Status Change
              </h4>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className={`font-medium ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        );
      }
      // CHATBOT QUESTION
      if (action === 'CHATBOT') {
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-5">
              <h4 className="mb-3 font-medium text-cyan-800">Exact Question Asked</h4>

              <div className="rounded-md border border-cyan-200 bg-white p-4">
                <p className="text-lg leading-relaxed font-medium text-gray-900">
                  "{details?.question || 'N/A'}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Confidence</p>
                <p className="font-medium">{details?.confidence || 'N/A'}</p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Session ID</p>
                <p className="font-medium break-all">{selectedLog.entityId || 'N/A'}</p>
              </div>
            </div>
          </div>
        );
      }
      // SEARCH HISTORY CLEARED
      if (action === 'SEARCH_HISTORY_CLEARED') {
        return (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5">
            <h4 className="mb-3 font-medium text-red-800">Search History Cleared</h4>

            <p className="text-gray-700">The user cleared their search history.</p>

            <div className="mt-4">
              <p className="text-xs text-gray-500">Search Records Deleted</p>

              <p className="text-2xl font-bold text-red-700">{details?.totalDeleted ?? 0}</p>
            </div>
          </div>
        );
      }
      // USER_UPDATED or any other with before/after
      if (details.before && details.after) {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 font-medium text-gray-700">Before</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{details.before.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{details.before.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium">{details.before.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium">{details.before.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium">{details.before.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-3 font-medium text-blue-700">After</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{details.after.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{details.after.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium">{details.after.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium">{details.after.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium">{details.after.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>

            {details.updatedBy && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 font-medium text-gray-700">Updated By</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{details.updatedBy.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{details.updatedBy.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium">{details.updatedBy.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium">{details.updatedBy.department || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      // Fallback for any other action
      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 font-medium text-gray-700">Details</h4>
          <pre className="text-sm break-words whitespace-pre-wrap">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      );
    };

    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4">
            <h2 className="text-xl font-semibold">Audit Log Details</h2>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedLog(null);
              }}
              className="rounded p-1 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Action</p>
                <p className="font-medium">{selectedLog.action}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Entity</p>
                <p className="font-medium">{selectedLog.entity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Performed By</p>
                <p className="font-medium">{selectedLog.user?.name ?? 'System / Unknown User'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{selectedLog.user?.email ?? 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-medium">
                  {formatDate(new Date(selectedLog.createdAt), 'dd MMM yyyy HH:mm')}
                </p>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Details */}
            {renderDetails()}
          </div>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track all user activities and system changes</p>
        </div>

        {/* Statistics */}
        {renderStatistics()}

        {/* Filters */}
        {renderFilters()}

        {/* Table */}
        {renderTable()}

        {/* Pagination */}
        {!loading && logs.length > 0 && renderPagination()}

        {/* Modal */}
        {isModalOpen && renderModal()}
      </div>
    </div>
  );
}
