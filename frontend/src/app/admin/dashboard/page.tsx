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

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    ADMIN: 'bg-danger-BG text-status-REJECTED',
    EDITOR: 'bg-success-BG text-status-PUBLISHED',
    VIEWER: 'bg-purple-100 text-purple-700',
    SYSTEM: 'bg-muted text-foreground',
  };

  const cards = [
    {
      title: 'Total Chats',
      icon: MessageSquare,
      number: loading ? '...' : (summary?.totalChats ?? 0),
      rate: summary?.fallbackRate ?? '0%',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      rateBg: 'bg-primary/10',
      rateColor: 'text-primary',
    },
    {
      title: 'Answered Rate',
      icon: CircleCheck,
      number: loading ? '...' : (summary?.answered ?? 0),
      rate:
        summary && summary.totalChats > 0
          ? `${((summary.answered / summary.totalChats) * 100).toFixed(1)}%`
          : '0%',
      iconBg: 'bg-success-BG',
      iconColor: 'text-status-PUBLISHED',
      rateBg: 'bg-success-BG',
      rateColor: 'text-status-PUBLISHED',
    },
    {
      title: 'Unanswered',
      icon: IoAlert,
      number: loading ? '...' : (summary?.unanswered ?? 0),
      rate:
        summary && summary.totalChats > 0
          ? `${((summary.unanswered / summary.totalChats) * 100).toFixed(1)}%`
          : '0%',
      iconBg: 'bg-danger-BG',
      iconColor: 'text-status-REJECTED',
      rateBg: 'bg-danger-BG',
      rateColor: 'text-status-REJECTED',
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
          <h1 className="text-lg font-bold">System Dashboard</h1>
          <p className="text-muted-foreground text-xs">
            Live view of chatbot performance and content health.
          </p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="rounded-xl border px-2 py-1">Last 30 days</button>
          <Button className="bg-primary rounded-xl px-2 py-1">Export Data</Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="mt-5">
        {/* Card Content */}
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const content = (
              <Card
                className={
                  card.title === 'Unanswered'
                    ? 'h-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-sm'
                    : 'h-full'
                }
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg p-2 ${card.iconBg}`}>
                      <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${card.rateBg} ${card.rateColor}`}
                    >
                      {card.rate}
                    </span>
                  </div>

                  <div className="mt-1">
                    <p className="text-lg font-bold tracking-tight">{card.number}</p>
                    <p className="text-card-FOREGROUND0 text-xs font-medium">{card.title}</p>
                  </div>
                </CardContent>
              </Card>
            );

            return card.title === 'Unanswered' ? (
              <Link href="/admin/unanswered-questions" key={index} className="block">
                {content}
              </Link>
            ) : (
              <div key={index}>{content}</div>
            );
          })}
        </div>

        {/*Feedback and Recent */}
        <div className="mt-5 grid grid-cols-[7fr_3fr] gap-3">
          {/*feedback trend*/}
          <Card className="px-2 py-1">
            <CardHeader className="flex flex-row justify-between">
              <div className="flex flex-col">
                <CardTitle className="text-base">Feedback Trends</CardTitle>
                <CardDescription className="text-card-FOREGROUND0 text-xs">
                  Star ratings distribution over the last 30 days
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-primary h-3 w-3 rounded-full"></span>
                  <span className="text-muted-foreground text-xs">Rating 4–5</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="border-border h-0.5 w-4 border-t-2 border-dashed"></span>
                  <span className="text-muted-foreground text-xs">Rating 1–3</span>
                </div>
              </div>
            </CardHeader>
            {/* Chart Placeholder */}

            <CardContent className="mt-6 h-[320px] rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 p-2">
              {feedbackLoading ? (
                <p>Loading feedback...</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={feedbackData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#155EEF" stopOpacity={0.32} />
                        <stop offset="60%" stopColor="#155EEF" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#155EEF" stopOpacity={0.02} />
                      </linearGradient>

                      <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.16} />
                        <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} stroke="#E9EEF7" strokeDasharray="4 6" />

                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                    />

                    <Tooltip
                      cursor={{ stroke: '#CBD5E1', strokeDasharray: '4 4' }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;

                        const data = payload[0].payload;

                        return (
                          <div className="border-border bg-card rounded-2xl border p-4 shadow-2xl">
                            <p className="text-foreground text-sm font-semibold">{label}</p>

                            <div className="mt-3 space-y-2 text-sm">
                              <div className="flex justify-between gap-8">
                                <span className="text-muted-foreground">Positive</span>
                                <span className="text-primary font-semibold">{data.positive}</span>
                              </div>

                              <div className="flex justify-between gap-8">
                                <span className="text-muted-foreground">Negative</span>
                                <span className="text-muted-foreground font-semibold">
                                  {data.negative}
                                </span>
                              </div>

                              <div className="border-border my-2 border-t" />

                              <div className="flex justify-between gap-8">
                                <span className="text-muted-foreground">Average rating</span>
                                <span className="text-foreground font-semibold">
                                  {data.averageRating.toFixed(1)}
                                </span>
                              </div>

                              <div className="flex justify-between gap-8">
                                <span className="text-muted-foreground">Feedback</span>
                                <span className="text-foreground font-semibold">
                                  {data.totalFeedback}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />

                    {/* Positive line - primary blue */}
                    <Area
                      type="monotone"
                      dataKey="positive"
                      stroke="#155EEF"
                      strokeWidth={3}
                      fill="url(#positiveGradient)"
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: '#155EEF',
                        stroke: '#FFFFFF',
                        strokeWidth: 2,
                      }}
                    />

                    {/* Negative line - dotted */}
                    <Area
                      type="monotone"
                      dataKey="negative"
                      stroke="#94A3B8"
                      strokeWidth={2.5}
                      strokeDasharray="6 6"
                      fill="url(#negativeGradient)"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: '#94A3B8',
                        stroke: '#FFFFFF',
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/*Recent Activity  */}
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <div>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription className="text-xs">Latest system events</CardDescription>
              </div>
              <button className="bg-accent text-primary hover:bg-primary/15 rounded-lg px-3 py-1 text-xs font-medium transition">
                View All
              </button>
            </CardHeader>

            {/* */}
            <CardContent className="mt-6 h-[300px] overflow-y-auto pr-2">
              {activityLoading ? (
                <p className="text-card-FOREGROUND0 text-sm">Loading...</p>
              ) : (
                activities.map((activity, index) => {
                  const item = formatActivity(activity);

                  return (
                    <div key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {/* Timeline connector - starts BELOW the icon */}
                      {index !== activities.length - 1 && (
                        <div className="bg-primary/10 absolute top-10 left-[19px] h-full w-[2px]" />
                      )}
                      {/* Timeline icon */}
                      <div className="bg-primary/15 z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                        <Timer className="text-primary h-5 w-5" />
                      </div>
                      {/* Activity card */}
                      <div className="border-border bg-card flex-1 rounded-xl border p-4 shadow-sm">
                        <p className="text-foreground text-sm font-medium">{item.title}</p>
                        {/* Time */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-card-FOREGROUND0 text-xs">
                            {timeAgo(activity.createdAt)}
                          </span>
                          {/* State */}
                          <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
                            {item.state}
                          </span>
                          {/* Role */}
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              roleStyles[item.role] ?? 'bg-muted text-foreground'
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
            </CardContent>
          </Card>
        </div>

        {/* Assistant Usage by Model and search insights*/}
        <div className="mt-2 grid grid-cols-2 gap-3">
          {/* Assistant Usage by Model */}
          <div className="card">
            <div className="mb-5">
              <h1 className="text-base font-semibold">Assistant Usage by Model</h1>

              <p className="text-muted-foreground text-xs">Distribution of chatbot requests</p>
            </div>

            {assistantLoading ? (
              <p>Loading...</p>
            ) : (
              assistantUsage.map((model) => {
                const getModelStyle = (title: string) => {
                  const t = title.toLowerCase();

                  if (t.includes('llama') || t.includes('rag')) {
                    return {
                      track: 'bg-primary-soft',
                      bar: 'from-[#155EEF] to-[#4C8DFF]',
                      pill: 'bg-accent text-primary',
                      accent: 'text-primary',
                    };
                  }

                  if (t.includes('greeting')) {
                    return {
                      track: 'bg-teal-50',
                      bar: 'from-[#0F9B8E] to-[#2DD4BF]',
                      pill: 'bg-teal-100 text-teal-700',
                      accent: 'text-teal-700',
                    };
                  }

                  return {
                    track: 'bg-amber-50',
                    bar: 'from-[#F59E0B] to-[#FBBF24]',
                    pill: 'bg-amber-100 text-amber-700',
                    accent: 'text-amber-700',
                  };
                };

                const style = getModelStyle(model.title);

                return (
                  <div
                    key={model.title}
                    className="border-border mb-1 rounded-2xl border bg-gradient-to-br from-white to-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h2 className="text-foreground text-sm font-semibold">{model.title}</h2>
                        <p className="text-card-FOREGROUND0 text-xs">{model.count} requests</p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${style.pill}`}
                      >
                        {model.rate.toFixed(1)}%
                      </span>
                    </div>

                    <div className={`h-2.5 w-full overflow-hidden rounded-full ${style.track}`}>
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-700`}
                        style={{ width: `${model.rate}%` }}
                      />
                    </div>

                    <div className="mt-3 flex justify-between text-xs">
                      <span className="text-card-FOREGROUND0">
                        Confidence:
                        <span className={`ml-1 font-semibold ${style.accent}`}>
                          {model.confidence.toFixed(0)}%
                        </span>
                      </span>

                      <span className="text-card-FOREGROUND0">
                        {(model.responseTime / 1000).toFixed(2)} s
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* search Insights */}
          <div className="card">
            <div className="mb-5">
              <h1 className="text-base font-semibold">Search Insights</h1>

              <p className="text-muted-foreground text-xs">Most searched keywords by users</p>
            </div>
            <div className="h-[300px] overflow-y-auto pr-2">
              {searchLoading ? (
                <p className="text-card-FOREGROUND0 text-sm">Loading...</p>
              ) : searchTrend.length === 0 ? (
                <p className="text-card-FOREGROUND0 text-sm">No search analytics available.</p>
              ) : (
                <div className="space-y-3">
                  {searchTrend.map((trend) => (
                    <div
                      key={trend.id}
                      className="hover:bg-accent border-border flex items-center justify-between rounded-xl border p-3 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm">
                          #{trend.id}
                        </div>

                        <div>
                          <h2 className="text-sm font-medium">{trend.title}</h2>

                          <p className="text-card-FOREGROUND0 text-xs">Search keyword</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <trend.icon size={18} className="text-success0" />

                        <span className="bg-success-BG text-status-PUBLISHED rounded-full px-3 py-1 text-sm font-semibold">
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
            <h1 className="text-base font-semibold">Top Performing Articles</h1>
            <Button className="bg-primary px-2 py-1">View All Articles</Button>
          </div>
          {/* cards */}
          <div className="mt-2 grid grid-cols-3 gap-2">
            {topArticlesLoading ? (
              <p className="text-card-FOREGROUND0">Loading...</p>
            ) : topArticles.length === 0 ? (
              <p className="text-card-FOREGROUND0">No published articles found.</p>
            ) : (
              topArticles.map((article, index) => {
                const performance = (article.avgRating / 5) * 100;

                const getArticleStyle = (i: number) => {
                  if (i === 0) {
                    return {
                      border: 'border-blue-100',
                      bg: 'from-blue-50 via-white to-slate-50',
                      pill: 'bg-accent text-primary',
                      gradient: 'from-[#155EEF] via-[#4C8DFF] to-[#0F9B8E]',
                      accent: 'text-primary',
                    };
                  }

                  if (i === 1) {
                    return {
                      border: 'border-teal-100',
                      bg: 'from-teal-50 via-white to-slate-50',
                      pill: 'bg-teal-100 text-teal-700',
                      gradient: 'from-[#0F9B8E] via-[#2DD4BF] to-[#155EEF]',
                      accent: 'text-teal-700',
                    };
                  }

                  return {
                    border: 'border-amber-100',
                    bg: 'from-amber-50 via-white to-slate-50',
                    pill: 'bg-amber-100 text-amber-700',
                    gradient: 'from-[#F59E0B] via-[#FBBF24] to-[#155EEF]',
                    accent: 'text-amber-700',
                  };
                };

                const style = getArticleStyle(index);

                return (
                  <div
                    key={article.id}
                    className={`rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-foreground line-clamp-2 text-sm font-semibold">
                        {article.title}
                      </h2>

                      <div className={`rounded-full px-3 py-1 text-xs font-semibold ${style.pill}`}>
                        ⭐ {Number(article.avgRating).toFixed(1)}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-card-FOREGROUND0 text-xs">Views</p>
                        <p className={`text-lg font-bold ${style.accent}`}>
                          {article.views.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-card-FOREGROUND0 text-xs">Reviews</p>
                        <p className="text-foreground text-lg font-bold">{article.reviewCount}</p>
                      </div>

                      <div>
                        <p className="text-card-FOREGROUND0 text-xs">Rating</p>
                        <p className="text-foreground text-lg font-bold">
                          {Number(article.avgRating).toFixed(1)}/5
                        </p>
                      </div>
                    </div>

                    <div className="bg-card/70 border-border/60 mt-2 rounded-xl border p-4 backdrop-blur-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-muted-FOREGROUND text-xs font-medium">
                          Performance score
                        </span>

                        <span className={`text-sm font-semibold ${style.accent}`}>
                          {performance.toFixed(0)}%
                        </span>
                      </div>

                      <div className="bg-secondary h-2.5 overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${style.gradient}`}
                          style={{ width: `${performance}%` }}
                        />
                      </div>

                      <div className="text-card-FOREGROUND0 mt-3 flex items-center justify-between text-xs">
                        <span>Reader satisfaction</span>
                        <span className="font-medium">{article.reviewCount} reviews</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
