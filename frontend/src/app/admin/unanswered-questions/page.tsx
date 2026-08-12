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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [status, setStatus] = useState<StatusFilter>('ALL');
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
    status !== 'ALL' ||
    dateFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    confidenceFilter !== 'ALL' ||
    sortBy !== 'NEWEST';

  const clearFilters = () => {
    setSearch('');
    setStatus('ALL');
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
      {/* This wrapper controls the page width */}
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl">
              <AlertCircle className="text-primary h-5 w-5" />
            </div>

            <div>
              <h1 className="text-foreground text-xl font-bold">Unanswered questions</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Review unanswered queries and identify knowledge base gaps that require new
                articles.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => fetchQuestions(true)}
            disabled={refreshing}
            className="h-11 rounded-xl"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {/* STAT CARDS */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Unresolved"
            value={unresolvedCount}
            icon={<AlertCircle size={18} />}
            iconClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          />

          <StatCard
            label="Resolved"
            value={resolvedCount}
            icon={<CheckCircle2 size={18} />}
            iconClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />

          <StatCard
            label="Repeated questions"
            value={repeatedCount}
            icon={<Sparkles size={18} />}
            iconClass="bg-primary/10 text-primary"
          />

          <StatCard
            label="Showing results"
            value={filteredQuestions.length}
            icon={<MessageSquare size={18} />}
            iconClass="bg-primary/10 text-primary"
          />
        </div>
        {/* SEARCH + FILTER BAR */}
        <Card className="mt-6 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search unanswered questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-xl pl-10"
              />
            </div>

            <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
              <SelectTrigger className="h-11 w-[220px] rounded-xl">
                <SelectValue />
              </SelectTrigger>

              <SelectContent align="start" sideOffset={6} className="w-[220px]">
                <SelectItem value="All Status" disabled>
                  All status
                </SelectItem>
                <SelectItem value="UNRESOLVED">Unresolved</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              className="h-11 rounded-xl"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-11 rounded-xl text-red-600"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="border-border mt-5 grid grid-cols-1 gap-4 border-t pt-5 md:grid-cols-2 xl:grid-cols-4">
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
        </Card>

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
                <Button onClick={clearFilters} className="rounded-xl">
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing
                  <span className="font-semibold text-gray-800">{filteredQuestions.length}</span>
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
                  <Card key={question.id} className="p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="bg-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                          <AlertCircle className="text-primary h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start gap-2">
                            <h2 className="text-foreground text-base leading-6 font-semibold">
                              {question.question}
                            </h2>

                            {count > 1 && (
                              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-semibold">
                                Asked {count} times
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span
                              className={
                                question.resolved ? 'badge badge-published' : 'badge badge-rejected'
                              }
                            >
                              {question.resolved ? 'Resolved' : 'Unresolved'}
                            </span>

                            <span className="badge badge-approved">{similarity.label}</span>

                            <span className="badge badge-draft">
                              {question.sessionId ? 'From chat session' : 'No session'}
                            </span>
                          </div>

                          <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                            <span>Asked {formatDate(question.askedAt)}</span>

                            {question.reason && (
                              <span>
                                <span className="text-foreground font-medium">Reason:</span>
                                {question.reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link href={`/admin/unanswered-questions/${question.id}`}>
                        <Button className="rounded-xl">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Review
                        </Button>
                      </Link>
                    </div>
                  </Card>
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
    <Card className="p-0">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
            {icon}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium">{label}</p>
          <p className="text-foreground text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
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
  onChange: (value: string | null) => void;
  options: [string, string][];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Select value={value} onValueChange={(value) => onChange(value)}>
        <SelectTrigger className="h-11 w-full rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{icon}</span>
            <SelectValue />
          </div>
        </SelectTrigger>

        <SelectContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-select-trigger-width)] min-w-[220px]"
        >
          {options.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue} disabled={optionValue === 'ALL'}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex gap-4">
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
    <Card className="py-14">
      <CardContent className="text-center">
        <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
          {icon}
        </div>

        <h2 className="text-foreground mt-5 text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
          {description}
        </p>

        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  );
}
