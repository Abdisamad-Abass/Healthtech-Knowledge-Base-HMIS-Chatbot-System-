'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import api from '@/lib/api';

interface UnansweredQuestion {
  id: string;
  question: string;
  sessionId: string | null;
  similarity: number | null;
  reason: string | null;
  resolved: boolean;
  askedAt: string;
}

type StatusFilter = 'ALL' | 'UNRESOLVED' | 'RESOLVED';
type DateFilter = 'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS';
type TypeFilter = 'ALL' | 'REPEATED' | 'UNIQUE';
type ConfidenceFilter = 'ALL' | 'WITH_SIMILARITY' | 'WITHOUT_SIMILARITY';
type SortOption = 'NEWEST' | 'OLDEST' | 'MOST_REPEATED';

export default function UnansweredQuestionsPage() {
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('UNRESOLVED');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');

  const [showFilters, setShowFilters] = useState(false);

  const fetchQuestions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get<UnansweredQuestion[]>('/analytics/unanswered');

      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch unanswered questions', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const normalizedQuestions = useMemo(() => {
    return questions.map((item) => ({
      ...item,
      normalizedQuestion: item.question
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    }));
  }, [questions]);

  const questionFrequency = useMemo(() => {
    const frequency: Record<string, number> = {};

    normalizedQuestions.forEach((question) => {
      frequency[question.normalizedQuestion] = (frequency[question.normalizedQuestion] || 0) + 1;
    });

    return frequency;
  }, [normalizedQuestions]);

  const filteredQuestions = useMemo(() => {
    const now = new Date();

    const filtered = normalizedQuestions.filter((question) => {
      const matchesSearch = question.question.toLowerCase().includes(search.toLowerCase().trim());

      const matchesStatus =
        status === 'ALL' ||
        (status === 'RESOLVED' && question.resolved) ||
        (status === 'UNRESOLVED' && !question.resolved);

      const askedAt = new Date(question.askedAt);
      const diffInDays = (now.getTime() - askedAt.getTime()) / (1000 * 60 * 60 * 24);

      const matchesDate =
        dateFilter === 'ALL' ||
        (dateFilter === 'TODAY' && diffInDays <= 1) ||
        (dateFilter === '7_DAYS' && diffInDays <= 7) ||
        (dateFilter === '30_DAYS' && diffInDays <= 30);

      const frequency = questionFrequency[question.normalizedQuestion] || 1;

      const matchesType =
        typeFilter === 'ALL' ||
        (typeFilter === 'REPEATED' && frequency > 1) ||
        (typeFilter === 'UNIQUE' && frequency === 1);

      const matchesConfidence =
        confidenceFilter === 'ALL' ||
        (confidenceFilter === 'WITH_SIMILARITY' && question.similarity !== null) ||
        (confidenceFilter === 'WITHOUT_SIMILARITY' && question.similarity === null);

      return matchesSearch && matchesStatus && matchesDate && matchesType && matchesConfidence;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime();
      }

      if (sortBy === 'OLDEST') {
        return new Date(a.askedAt).getTime() - new Date(b.askedAt).getTime();
      }

      const aCount = questionFrequency[a.normalizedQuestion] || 1;
      const bCount = questionFrequency[b.normalizedQuestion] || 1;

      return bCount - aCount;
    });
  }, [
    normalizedQuestions,
    search,
    status,
    dateFilter,
    typeFilter,
    confidenceFilter,
    sortBy,
    questionFrequency,
  ]);

  const unresolvedCount = questions.filter((item) => !item.resolved).length;

  const resolvedCount = questions.filter((item) => item.resolved).length;

  const repeatedCount = Object.values(questionFrequency).filter((count) => count > 1).length;

  const hasActiveFilters =
    search ||
    status !== 'UNRESOLVED' ||
    dateFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    confidenceFilter !== 'ALL' ||
    sortBy !== 'NEWEST';

  const clearFilters = () => {
    setSearch('');
    setStatus('UNRESOLVED');
    setDateFilter('ALL');
    setTypeFilter('ALL');
    setConfidenceFilter('ALL');
    setSortBy('NEWEST');
  };

  const getQuestionCount = (question: UnansweredQuestion) => {
    const normalized = question.question
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return questionFrequency[normalized] || 1;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getSimilarityStatus = (similarity: number | null) => {
    if (similarity === null) {
      return {
        label: 'No match found',
        className: 'bg-gray-100 text-gray-600',
      };
    }

    const percentage = similarity * 100;

    if (percentage >= 75) {
      return {
        label: `${percentage.toFixed(1)}% match`,
        className: 'bg-green-100 text-green-700',
      };
    }

    if (percentage >= 50) {
      return {
        label: `${percentage.toFixed(1)}% match`,
        className: 'bg-yellow-100 text-yellow-700',
      };
    }

    return {
      label: `${percentage.toFixed(1)}% match`,
      className: 'bg-red-100 text-red-700',
    };
  };

  return (
    <main className="min-h-screen">
      {/* This wrapper controls the page width */}{' '}
      <div className="mx-auto w-full max-w-5xl">
        {/* HEADER */}{' '}
        <div className="flex flex-col gap-5">
          {' '}
          <div className="flex items-center gap-3">
            {' '}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
              {' '}
              <AlertCircle className="h-5 w-5 text-red-600" />{' '}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F52BA]">Unanswered Questions</h1>

              <p className="mt-1 text-sm text-gray-500">
                Review questions that need knowledge base improvement.
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchQuestions(true)}
            disabled={refreshing}
            className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        {/* STAT CARDS */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Unresolved"
            value={unresolvedCount}
            icon={<AlertCircle size={18} />}
            iconClass="bg-red-100 text-red-600"
          />

          <StatCard
            label="Resolved"
            value={resolvedCount}
            icon={<CheckCircle2 size={18} />}
            iconClass="bg-green-100 text-green-600"
          />

          <StatCard
            label="Repeated Questions"
            value={repeatedCount}
            icon={<Sparkles size={18} />}
            iconClass="bg-purple-100 text-purple-600"
          />

          <StatCard
            label="Showing Results"
            value={filteredQuestions.length}
            icon={<MessageSquare size={18} />}
            iconClass="bg-blue-100 text-blue-600"
          />
        </div>
        {/* SEARCH + FILTER BAR */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search unanswered questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pr-4 pl-10 text-sm transition outline-none focus:border-[#0F52BA] focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#0F52BA]"
            >
              <option value="UNRESOLVED">Unresolved</option>
              <option value="ALL">All Status</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <button
              onClick={() => setShowFilters((value) => !value)}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                showFilters
                  ? 'border-[#0F52BA] bg-blue-50 text-[#0F52BA]'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              <ChevronDown
                size={15}
                className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <X size={15} />
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
              <FilterSelect
                label="Time Period"
                icon={<Clock3 size={15} />}
                value={dateFilter}
                onChange={(value) => setDateFilter(value as DateFilter)}
                options={[
                  ['ALL', 'All time'],
                  ['TODAY', 'Today'],
                  ['7_DAYS', 'Last 7 days'],
                  ['30_DAYS', 'Last 30 days'],
                ]}
              />

              <FilterSelect
                label="Question Type"
                icon={<Sparkles size={15} />}
                value={typeFilter}
                onChange={(value) => setTypeFilter(value as TypeFilter)}
                options={[
                  ['ALL', 'All questions'],
                  ['REPEATED', 'Repeated questions'],
                  ['UNIQUE', 'Unique questions'],
                ]}
              />

              <FilterSelect
                label="Similarity"
                icon={<Filter size={15} />}
                value={confidenceFilter}
                onChange={(value) => setConfidenceFilter(value as ConfidenceFilter)}
                options={[
                  ['ALL', 'All similarity states'],
                  ['WITH_SIMILARITY', 'Has similarity score'],
                  ['WITHOUT_SIMILARITY', 'No similarity score'],
                ]}
              />

              <FilterSelect
                label="Sort By"
                icon={<Clock3 size={15} />}
                value={sortBy}
                onChange={(value) => setSortBy(value as SortOption)}
                options={[
                  ['NEWEST', 'Newest first'],
                  ['OLDEST', 'Oldest first'],
                  ['MOST_REPEATED', 'Most repeated first'],
                ]}
              />
            </div>
          )}
        </div>
        {/* CONTENT */}
        <div className="mt-6">
          {loading ? (
            <LoadingState />
          ) : questions.length === 0 ? (
            <EmptyState
              title="No unanswered questions"
              description="Great! The chatbot has successfully handled all recorded questions."
              icon={<CheckCircle2 className="h-12 w-12 text-green-500" />}
            />
          ) : filteredQuestions.length === 0 ? (
            <EmptyState
              title="No matching questions"
              description="Try adjusting your search or filters to find other unanswered questions."
              icon={<Search className="h-12 w-12 text-gray-400" />}
              action={
                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-[#0F52BA] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing{' '}
                  <span className="font-semibold text-gray-800">{filteredQuestions.length}</span>{' '}
                  question
                  {filteredQuestions.length !== 1 ? 's' : ''}
                </p>

                <div className="hidden items-center gap-2 text-xs text-gray-400 sm:flex">
                  <Filter size={14} />
                  Filters applied in real time
                </div>
              </div>

              {filteredQuestions.map((question) => {
                const count = getQuestionCount(question);
                const similarity = getSimilarityStatus(question.similarity);

                return (
                  <div
                    key={question.id}
                    className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start gap-2">
                            <h2 className="text-base leading-6 font-semibold break-words text-gray-800">
                              {question.question}
                            </h2>

                            {count > 1 && (
                              <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                                Asked {count} times
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge
                              className={
                                question.resolved
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }
                            >
                              {question.resolved ? 'Resolved' : 'Unresolved'}
                            </Badge>

                            <Badge className={similarity.className}>{similarity.label}</Badge>

                            {question.sessionId ? (
                              <Badge className="bg-blue-100 text-blue-700">From chat session</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-600">No session</Badge>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                            <span>Asked {formatDate(question.askedAt)}</span>

                            {question.reason && (
                              <span>
                                <span className="font-medium text-gray-700">Reason:</span>{' '}
                                {question.reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/admin/unanswered-questions/${question.id}`}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-[#0F52BA] transition hover:bg-blue-100"
                      >
                        <MessageSquare size={16} />
                        Review
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {' '}
      <div className="flex items-center justify-between">
        {' '}
        <div>
          {' '}
          <p className="text-sm text-gray-500">{label}</p>{' '}
          <p className="mt-2 text-2xl font-bold text-gray-800">{value} </p>{' '}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>{children} </span>
  );
}

function FilterSelect({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      {' '}
      <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-600">
        {icon}
        {label}{' '}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#0F52BA]"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
          {' '}
          <div className="flex gap-4">
            {' '}
            <div className="h-11 w-11 rounded-xl bg-gray-200" />
            <div className="flex-1">
              <div className="h-5 w-3/4 rounded bg-gray-200" />

              <div className="mt-4 flex gap-2">
                <div className="h-6 w-24 rounded-full bg-gray-200" />
                <div className="h-6 w-28 rounded-full bg-gray-200" />
              </div>

              <div className="mt-4 h-4 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
      {' '}
      <div className="flex justify-center">{icon}</div>
      <h2 className="mt-4 text-lg font-semibold text-gray-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{description}</p>
      {action}
    </div>
  );
}
