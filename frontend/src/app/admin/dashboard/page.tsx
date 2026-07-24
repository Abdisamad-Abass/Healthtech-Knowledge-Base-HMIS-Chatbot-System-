'use client';
interface SummaryAnalytics {
  totalChats: number;
  answered: number;
  unanswered: number;
  fallbackUsed: number;
  fallbackRate: string;
  averageResponseTime: number;
  averageConfidence: number;
  totalArticlesRetrieved: number;
}
interface FeedbackTrend {
  date: string;
  averageRating: string;
  totalFeedback: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}
interface AssistantUsage {
  model: string;
  _count: number;
  _avg: {
    responseTime: number | null;
    confidence: number | null;
  };
}
interface MostSearched {
  query: string;
  _count: {
    query: number;
  };
}
interface TopViewedArticle {
  id: string;
  title: string;
  views: number;
  avgRating: number;
  reviewCount: number;
}
interface RecentActivity {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;

  details?: {
    query?: string;
    email?: string;
    [key: string]: any;
  };

  user: {
    id: string;
    name: string;
    role: string;
  } | null;
}

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, CircleCheck, Timer, Star } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import { TrendingDown } from 'lucide-react';
import { FaRegCheckCircle } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa';
import { IoAlert } from 'react-icons/io5';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [summary, setSummary] = useState<SummaryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState<
    {
      day: string;
      positive: number;
      negative: number;
      averageRating: number;
      totalFeedback: number;
    }[]
  >([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [assistantUsage, setAssistantUsage] = useState<
    {
      title: string;
      count: number;
      rate: number;
      confidence: number;
      responseTime: number;
    }[]
  >([]);
  const [assistantLoading, setAssistantLoading] = useState(true);
  const [searchTrend, setSearchTrend] = useState<
    {
      id: number;
      title: string;
      queries: number;
      icon: typeof TrendingUp;
    }[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(true);

  const [topArticles, setTopArticles] = useState<TopViewedArticle[]>([]);
  const [topArticlesLoading, setTopArticlesLoading] = useState(true);

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  /* fetch summary analytics */
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/analytics/summary');
        setSummary(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  /* fetch feedback trends */
  useEffect(() => {
    const fetchFeedbackTrends = async () => {
      try {
        const { data } = await api.get<FeedbackTrend[]>('/analytics/feedback-trends');

        const chartData = data.map((item) => ({
          day: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),

          positive: item.fiveStar + item.fourStar,

          negative: item.oneStar + item.twoStar + item.threeStar,

          averageRating: Number(item.averageRating),

          totalFeedback: item.totalFeedback,
        }));

        setFeedbackData(chartData);
      } catch (error) {
        console.error(error);
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchFeedbackTrends();
  }, []);

  /* fetch assistant usage */
  useEffect(() => {
    const fetchAssistantUsage = async () => {
      try {
        const { data } = await api.get<AssistantUsage[]>('/analytics/assistant-usage');

        const totalChats = data.reduce((sum, model) => sum + model._count, 0);

        const usage = data.map((model) => ({
          title: model.model,
          count: model._count,

          // Percentage usage
          rate: totalChats > 0 ? (model._count / totalChats) * 100 : 0,

          confidence: (model._avg.confidence ?? 0) * 100,

          responseTime: model._avg.responseTime ?? 0,
        }));

        setAssistantUsage(usage);
      } catch (error) {
        console.error(error);
      } finally {
        setAssistantLoading(false);
      }
    };

    fetchAssistantUsage();
  }, []);

  /* Fetch Most Searched */
  useEffect(() => {
    const fetchMostSearched = async () => {
      try {
        const { data } = await api.get<MostSearched[]>('/analytics/most-searched');

        const searches = data.map((item, index) => ({
          id: index + 1,
          title: item.query,
          queries: item._count.query,
          icon: TrendingUp,
        }));

        setSearchTrend(searches);
      } catch (error) {
        console.error(error);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchMostSearched();
  }, []);
  /* Fetch Top Performing Articles */
  useEffect(() => {
    const fetchTopArticles = async () => {
      try {
        const { data } = await api.get<TopViewedArticle[]>('/analytics/top-viewed');

        setTopArticles(data);
      } catch (error) {
        console.error(error);
      } finally {
        setTopArticlesLoading(false);
      }
    };

    fetchTopArticles();
  }, []);
  /* fetch recent activities */
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data } = await api.get<RecentActivity[]>('/analytics/recent-activities');

        setActivities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatActivity = (activity: RecentActivity) => {
    const user = activity.user?.name ?? 'System';
    const role = activity.user?.role ?? 'SYSTEM';

    switch (activity.action) {
      case 'USER_LOGIN':
        return {
          title: `${user} logged into the system`,
          state: 'Authentication',
          role,
        };

      case 'USER_CREATED':
        return {
          title: `${user} created a new user`,
          state: 'User Management',
          role,
        };

      case 'USER_UPDATED':
        return {
          title: `${user} updated a user`,
          state: 'User Management',
          role,
        };

      case 'USER_DELETED':
        return {
          title: `${user} deleted a user`,
          state: 'User Management',
          role,
        };

      case 'USER_ACTIVATED':
        return {
          title: `${user} activated a user account`,
          state: 'User Management',
          role,
        };

      case 'USER_DEACTIVATED':
        return {
          title: `${user} deactivated a user account`,
          state: 'User Management',
          role,
        };

      case 'ARTICLE_CREATED':
        return {
          title: `${user} created an article`,
          state: 'Knowledge Base',
          role,
        };

      case 'ARTICLE_UPDATED':
        return {
          title: `${user} updated an article`,
          state: 'Knowledge Base',
          role,
        };

      case 'ARTICLE_PUBLISHED':
        return {
          title: `${user} published an article`,
          state: 'Knowledge Base',
          role,
        };

      case 'SEARCH_PERFORMED':
        return {
          title: `${user} searched "${activity.details?.query ?? ''}"`,
          state: 'Search',
          role,
        };

      default:
        return {
          title: `${user} ${activity.action.replaceAll('_', ' ').toLowerCase()}`,
          state: activity.entity,
          role,
        };
    }
  };

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // update every minute

    return () => clearInterval(interval);
  }, []);
  const timeAgo = (date: string) => {
    const seconds = Math.floor((now - new Date(date).getTime()) / 1000);

    const intervals = [
      { label: 'year', value: 31536000 },
      { label: 'month', value: 2592000 },
      { label: 'day', value: 86400 },
      { label: 'hour', value: 3600 },
      { label: 'minute', value: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.value);

      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  };
  const roleStyles: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    EDITOR: 'bg-green-100 text-green-700',
    VIEWER: 'bg-purple-100 text-purple-700',
    SYSTEM: 'bg-gray-100 text-gray-700',
  };

  const cards = [
    {
      title: 'Total Chats',
      icon: MessageSquare,
      number: loading ? '...' : (summary?.totalChats ?? 0),
      rate: summary?.fallbackRate ?? '0%',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      rateBg: 'bg-blue-100',
      rateColor: 'text-blue-700',
    },
    {
      title: 'Answered Rate',
      icon: CircleCheck,
      number: loading ? '...' : (summary?.answered ?? 0),
      rate:
        summary && summary.totalChats > 0
          ? `${((summary.answered / summary.totalChats) * 100).toFixed(1)}%`
          : '0%',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      rateBg: 'bg-green-100',
      rateColor: 'text-green-700',
    },
    {
      title: 'Unanswered',
      icon: IoAlert,
      number: loading ? '...' : (summary?.unanswered ?? 0),
      rate:
        summary && summary.totalChats > 0
          ? `${((summary.unanswered / summary.totalChats) * 100).toFixed(1)}%`
          : '0%',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      rateBg: 'bg-red-100',
      rateColor: 'text-red-700',
    },
    {
      title: 'Avg Response Time',
      icon: Timer,
      number: loading
        ? '...'
        : summary
          ? `${(summary.averageResponseTime / 1000).toFixed(2)} s`
          : '0 s',
      rate: summary ? `${(summary.averageConfidence * 100).toFixed(0)}%` : '0%',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      rateBg: 'bg-orange-100',
      rateColor: 'text-orange-700',
    },
  ];
  const activities1 = [
    {
      title: "M. Thompson edited 'HIPAA Protocols'",
      icon: Timer,
      time: '2 mins ago',
      state: 'current update',
    },
    {
      title: 'System created new account for Dr. V. Rao',
      icon: Timer,
      time: '15 min ago',
      state: 'User management',
    },
    {
      title: 'Security Alert: Multiple failed logins from IP 192.168.1.1',
      icon: Timer,
      time: '1 hr ago',
      state: 'System Alert',
    },
    {
      title: 'Security Alert: Multiple failed logins from IP 192.168.1.1',
      icon: Timer,
      time: '1 hr ago',
      state: 'System Alert',
    },
    {
      title: 'Security Alert: Multiple failed logins from IP 192.168.1.1',
      icon: Timer,
      time: '1 hr ago',
      state: 'System Alert',
    },
  ];

  const models = [
    { title: 'Llama-3.1-8b', rate: 62 },
    { title: 'GPT-4o Mini', rate: 32 },
    { title: 'Greetings (Static)', rate: 10 },
    { title: 'Fallback Handler', rate: 4 },
  ];
  const searchTrend1 = [
    { id: 1, title: 'COVID-19 Booster Protocol', icon: TrendingUp, queries: '2,410' },
    { id: 2, title: 'Billing dispute form', icon: TrendingDown, queries: '1,810' },
    { id: 3, title: 'Doctor referral status', icon: TrendingDown, queries: '1,330' },
  ];
  const topPerformed = [
    { title: 'Post-Operative Sepsis Protocol', rate: 4.9, Views: '4.2k', Helpfulness: '98%' },
    { title: 'Pediatric Asthma Management', rate: 4.8, Views: '3.8k', Helpfulness: '96%' },
    { title: 'Telemedicine Liability Guidelines', rate: 4.7, Views: '3.1k', Helpfulness: '94%' },
  ];
  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-[#0F52BA]">System Dashboard</h1>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="rounded-xl border px-2 py-1">Last 30 days</button>
          <button className="rounded-xl bg-blue-500 px-2 py-1">Export Data</button>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="mt-5">
        {/* Card Content */}
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <Link
              href={card.title === 'Unanswered' ? '/admin/unanswered-questions' : '#'}
              key={index}
              className={`card ${
                card.title === 'Unanswered'
                  ? 'cursor-pointer transition hover:-translate-y-1 hover:shadow-lg'
                  : ''
              }`}
            >
              {/* icon */}
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${card.iconBg}`}>
                  <card.icon className={card.iconColor} />
                </div>
                {/* Rate */}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${card.rateBg} ${card.rateColor}`}
                >
                  {card.rate}
                </span>
              </div>
              {/* title and number */}
              <div className="mt-3 flex flex-col">
                <p className="font-medium text-gray-500">{card.title}</p>
                <span className="text-lg font-bold">{card.number}</span>
              </div>
            </Link>
          ))}
        </div>

        {/*Feedback and Recent */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {/*feedback trend*/}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-lg font-bold">Feedback Trends</h1>
                <p className="text-xs text-gray-500">
                  Star ratings distribution over the last 30 days
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-green-500"></span>
                  <span className="text-gray-600">Rating 4–5</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400"></span>
                  <span className="text-gray-600">Rating 1-3</span>
                </div>
              </div>
            </div>
            {/* Chart Placeholder */}

            <div className="mt-6 h-[320px] rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
              {feedbackLoading ? (
                <p>Loading feedback...</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={feedbackData}>
                    <defs>
                      <linearGradient id="positive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
                      </linearGradient>

                      <linearGradient id="negative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" />

                    <XAxis
                      dataKey="day"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;

                        const data = payload[0].payload;

                        return (
                          <div className="rounded-xl border bg-white p-4 shadow-xl">
                            <p className="font-semibold">{label}</p>

                            <p className="text-green-600">Positive: {data.positive}</p>

                            <p className="text-red-600">Negative: {data.negative}</p>

                            <p className="flex items-center gap-2">
                              Avg Rating: <FaStar size={18} className="text-yellow-500" />{' '}
                              <span className="text-lg font-medium">{data.averageRating}</span>
                            </p>

                            <p>Feedback: {data.totalFeedback}</p>
                          </div>
                        );
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="positive"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fill="url(#positive)"
                      activeDot={{ r: 6 }}
                    />

                    <Area
                      type="monotone"
                      dataKey="negative"
                      stroke="#ef4444"
                      strokeWidth={3}
                      fill="url(#negative)"
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/*Recent Activity  */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">Recent Activity</h1>
                <p className="text-sm text-gray-500">Latest system events</p>
              </div>
              <button className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-100">
                View All
              </button>
            </div>

            {/* */}
            <div className="mt-6 h-[300px] overflow-y-auto pr-2">
              {activityLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                activities.map((activity, index) => {
                  const item = formatActivity(activity);

                  return (
                    <div key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {index !== activities.length - 1 && (
                        <div className="absolute top-10 left-[19px] h-full w-[2px] bg-blue-400" />
                      )}

                      <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Timer className="h-5 w-5 text-blue-600" />
                      </div>

                      <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="font-medium text-gray-800">{item.title}</p>

                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {timeAgo(activity.createdAt)}
                          </span>

                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            {item.state}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              roleStyles[item.role] ?? 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Assistant Usage by Model and search insights*/}
        <div className="mt-2 grid grid-cols-2 gap-3">
          {/* Assistant Usage by Model */}
          <div className="card">
            <div className="mb-5">
              <h1 className="text-xl font-bold">Assistant Usage by Model</h1>

              <p className="text-sm text-gray-500">Distribution of chatbot requests</p>
            </div>

            {assistantLoading ? (
              <p>Loading...</p>
            ) : (
              assistantUsage.map((model) => (
                <div key={model.title} className="mb-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold">{model.title}</h2>

                      <p className="text-xs text-gray-500">{model.count} requests</p>
                    </div>

                    <span className="font-bold text-blue-600">{model.rate.toFixed(1)}%</span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-700"
                      style={{
                        width: `${model.rate}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Confidence: {model.confidence.toFixed(0)}%</span>

                    <span>{(model.responseTime / 1000).toFixed(2)} s</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* search Insights */}
          <div className="card">
            <div className="mb-5">
              <h1 className="text-xl font-bold">Search Insights</h1>

              <p className="text-sm text-gray-500">Most searched keywords by users</p>
            </div>
            <div className="h-[300px] overflow-y-auto pr-2">
              {searchLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : searchTrend.length === 0 ? (
                <p className="text-sm text-gray-500">No search analytics available.</p>
              ) : (
                <div className="space-y-3">
                  {searchTrend.map((trend) => (
                    <div
                      key={trend.id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 p-3 transition hover:bg-blue-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          #{trend.id}
                        </div>

                        <div>
                          <h2 className="font-medium">{trend.title}</h2>

                          <p className="text-xs text-gray-500">Search keyword</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <trend.icon size={18} className="text-green-500" />

                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                          {trend.queries}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Performing Articles */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Top Performing Articles</h1>
            <button className="rounded-xl bg-blue-500 px-2 py-1">View All Articles</button>
          </div>
          {/* cards */}
          <div className="mt-2 grid grid-cols-3 gap-2">
            {topArticlesLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : topArticles.length === 0 ? (
              <p className="text-gray-500">No published articles found.</p>
            ) : (
              topArticles.map((article) => (
                <div key={article.id} className="card transition hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-lg font-semibold">{article.title}</h2>

                    <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1">
                      <Star size={16} className="fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{Number(article.avgRating).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Views</p>
                      <p className="text-lg font-bold text-blue-600">
                        {article.views.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Reviews</p>
                      <p className="text-lg font-bold">{article.reviewCount}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {Number(article.avgRating).toFixed(1)}/5
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-1 flex justify-between text-xs">
                      <span>Performance</span>
                      <span>{Number(article.avgRating).toFixed(1)}/5</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${(article.avgRating / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
