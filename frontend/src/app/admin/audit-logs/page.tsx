'use client';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Calendar,
  X,
  RefreshCw,
  Shield,
  Activity,
} from 'lucide-react';
import api from '@/lib/api';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

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
  USER_CREATED: 'badge badge-published',
  USER_UPDATED: 'badge badge-approved',
  USER_DELETED: 'badge badge-rejected',
  USER_ACTIVATED: 'badge badge-published',
  USER_DEACTIVATED: 'badge badge-draft',
  USER_ROLE_CHANGED: 'badge badge-in-review',

  SEARCH_PERFORMED: 'badge badge-submitted',
  SEARCH_NO_RESULTS: 'badge badge-rejected',
  SEARCH_AUTOCOMPLETE: 'badge badge-approved',
  SEARCH_HISTORY_CLEARED: 'badge badge-deleted',

  CHATBOT: 'badge badge-approved',
};

const roleBadge = (role?: string) => {
  switch (role) {
    case 'ADMIN':
      return 'badge badge-role-admin';
    case 'EDITOR':
      return 'badge badge-role-editor';
    case 'VIEWER':
      return 'badge badge-role-viewer';
    default:
      return 'badge badge-role-system';
  }
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
      log.user?.name ?? 'System / Unknown User',
      log.user?.role ?? '-',
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

  const renderActionBadge = (action: string) => (
    <span className={actionColors[action] || 'badge badge-draft'}>
      {actionLabels[action] || action}
    </span>
  );

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                  <Activity className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">{stat.label}</p>
                <p className="text-foreground text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="min-w-[200px] flex-1">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search by action, entity, or user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div className="min-w-[150px]">
            <Select
              value={selectedAction || null}
              onValueChange={(value) => setSelectedAction(value ?? '')}
            >
              <SelectTrigger className="w-full xl:w-[170px]">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent align="start">
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value || '__all_actions'}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Entity Filter */}
          <div className="min-w-[150px]">
            <Select
              value={selectedEntity || null}
              onValueChange={(value) => setSelectedEntity(value ?? '')}
            >
              <SelectTrigger className="w-full xl:w-[170px]">
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent align="start">
                {entityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value || '__all_entities'}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pr-4 pl-10"
              />
            </div>
            <span className="text-muted-foreground">to</span>
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pr-4 pl-10"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex items-center gap-2 px-4 py-2">
              <Search className="h-4 w-4" />
              Search
            </Button>

            <Button variant="outline" onClick={handleResetFilters}>
              Clear
            </Button>
          </div>
        </div>
      </Card>
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
      <Card className="mt-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Performed by</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(new Date(log.createdAt), 'dd MMM yyyy HH:mm')}</TableCell>

                <TableCell>{renderActionBadge(log.action)}</TableCell>

                <TableCell>{log.entity}</TableCell>

                <TableCell>{log.user?.name ?? 'Unknown User'}</TableCell>

                <TableCell>
                  <span className={roleBadge(log.user?.role)}>{log.user?.role ?? '-'}</span>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleViewDetails(log)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  };

  const renderPagination = () => {
    return (
      <div className="border-border flex items-center justify-between border-t px-6 py-4">
        <p className="text-muted-foreground text-sm">
          Showing {(pagination.page - 1) * pagination.limit + 1}-
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          logs
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <div className="text-muted-foreground px-3 text-sm">
            {pagination.page} / {pagination.totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
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
            <div className="border-info-border bg-info-bg rounded-xl border p-5">
              <h4 className="text-info mb-3 font-medium">
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
            <div className="border-success-border bg-success-bg rounded-lg border p-4">
              <h4 className="text-success mb-3 font-medium">Created User</h4>
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
            <div className="border-danger-border bg-danger-bg rounded-lg border p-4">
              <h4 className="text-danger mb-3 font-medium">Deleted User</h4>
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
            <div className="border-warning-border bg-warning-bg rounded-lg border p-4">
              <h4 className="text-warning mb-3 font-medium">Role Change</h4>
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
              className={`${isActive ? 'border-success-border bg-success-bg' : 'border-border bg-muted'} rounded-lg border p-4`}
            >
              <h4 className={`font-medium ${isActive ? 'text-success' : ''} mb-3`}>
                Status Change
              </h4>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className={`font-medium ${isActive ? 'text-success' : 'text-muted-foreground'}`}>
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

            <p className="text-foreground">The user cleared their search history.</p>

            <div className="mt-4">
              <p className="text-muted-foreground text-xs">Search Records Deleted</p>

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
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <h4 className="text-foreground mb-3 font-medium">Before</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Name</p>
                    <p className="font-medium">{details.before.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium">{details.before.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Role</p>
                    <p className="font-medium">{details.before.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Department</p>
                    <p className="font-medium">{details.before.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium">{details.before.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>

              <div className="border-border rounded-lg border bg-blue-50 p-4">
                <h4 className="text-primary mb-3 font-medium">After</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Name</p>
                    <p className="font-medium">{details.after.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium">{details.after.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Role</p>
                    <p className="font-medium">{details.after.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Department</p>
                    <p className="font-medium">{details.after.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium">{details.after.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>

            {details.updatedBy && (
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <h4 className="text-foreground mb-3 font-medium">Updated By</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Name</p>
                    <p className="font-medium">{details.updatedBy.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium">{details.updatedBy.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Role</p>
                    <p className="font-medium">{details.updatedBy.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Department</p>
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
        <div className="border-border bg-muted/40 rounded-lg border p-4">
          <h4 className="text-foreground mb-3 font-medium">Details</h4>
          <pre className="text-sm break-words whitespace-pre-wrap">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      );
    };

    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg">
          {/* Header */}
          <div className="border-border bg-card sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-foreground text-lg font-semibold">Audit log details</h2>
                <p className="text-muted-foreground text-sm">Activity record and event metadata</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedLog(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-6 overflow-y-auto p-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs">Action</p>
                <p className="text-foreground font-medium">{selectedLog.action}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Entity</p>
                <p className="text-foreground font-medium">{selectedLog.entity}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Performed by</p>
                <p className="text-foreground font-medium">
                  {selectedLog.user?.name ?? 'System / Unknown User'}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="text-foreground font-medium">{selectedLog.user?.email ?? 'N/A'}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-muted-foreground text-xs">Time</p>
                <p className="text-foreground font-medium">
                  {formatDate(new Date(selectedLog.createdAt), 'dd MMM yyyy HH:mm')}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-border border-t" />

            {/* Details */}
            {renderDetails()}
          </div>
        </Card>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl">
              <Shield className="text-primary h-5 w-5" />
            </div>

            <div>
              <h1 className="text-foreground text-lg font-bold">Audit logs</h1>
              <p className="text-muted-foreground mt-1 text-xs">
                Track user activities, security events, and system changes across the knowledge
                base.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => fetchLogs(pagination.page)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Button onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
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
