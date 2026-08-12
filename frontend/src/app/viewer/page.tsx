'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Bookmark,
  Clock,
  FileText,
  FlaskConical,
  Search,
  Shield,
  Star,
  Stethoscope,
  Wrench,
  Activity,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const featuredArticles = [
  {
    title: 'Patient registration workflow',
    category: 'Patient management',
    description: 'Complete guide to registering a new patient in the HMIS system.',
    rating: '4.9',
    time: '6 min read',
  },
  {
    title: 'Laboratory order processing',
    category: 'Laboratory',
    description: 'Best practices for lab requests, specimen handling, and result verification.',
    rating: '4.8',
    time: '8 min read',
  },
  {
    title: 'Login and access troubleshooting',
    category: 'Troubleshooting',
    description: 'Resolve the most common authentication and account access issues.',
    rating: '4.7',
    time: '5 min read',
  },
];

const categories = [
  {
    title: 'Patient management',
    description: 'Registration, admission, discharge, and patient records.',
    count: '24 articles',
    icon: Stethoscope,
  },
  {
    title: 'Clinical modules',
    description: 'Laboratory, pharmacy, radiology, and outpatient workflows.',
    count: '18 articles',
    icon: FlaskConical,
  },
  {
    title: 'Compliance & security',
    description: 'Data privacy, audit logs, and security procedures.',
    count: '12 articles',
    icon: Shield,
  },
  {
    title: 'Troubleshooting',
    description: 'Login issues, errors, connectivity, and system recovery.',
    count: '15 articles',
    icon: Wrench,
  },
  {
    title: 'Billing & finance',
    description: 'Invoices, insurance claims, payments, and reconciliation.',
    count: '10 articles',
    icon: FileText,
  },
  {
    title: 'System administration',
    description: 'User roles, permissions, configuration, and maintenance.',
    count: '9 articles',
    icon: Activity,
  },
];

export default function ViewerHomePage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-6 lg:px-8">
        {/* Hero section */}
        <section className="border-border from-accent via-background to-primary/5 overflow-hidden rounded-3xl border bg-gradient-to-br">
          <div className="p-8 md:p-12">
            <div className="max-w-3xl space-y-6">
              <div className="border-border bg-card text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                Knowledge base
              </div>

              <div className="space-y-3">
                <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
                  Find answers instantly
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg">
                  Search clinical protocols, HMIS guides, troubleshooting articles, and product
                  documentation.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Search the knowledge base</Label>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
                  <Input
                    className="h-12 rounded-xl pl-11"
                    placeholder="Search articles, SOPs, FAQs, or troubleshooting guides..."
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  'Patient management',
                  'Pharmacy',
                  'Laboratory',
                  'Billing',
                  'System administration',
                ].map((chip) => (
                  <Button key={chip} variant="outline" size="sm" className="rounded-full">
                    {chip}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Quick access */}
        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-foreground text-2xl font-semibold">Quick access</h2>

            <div className="w-full sm:w-56">
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filter content" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All content</SelectItem>
                  <SelectItem value="articles">Articles</SelectItem>
                  <SelectItem value="guides">Guides</SelectItem>
                  <SelectItem value="sops">SOPs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="group">
              <CardContent className="p-6">
                <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-foreground text-lg font-semibold">Articles</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Browse all published knowledge base articles.
                </p>
                <Button variant="ghost" className="text-primary hover:bg-primary/5 mt-4 px-0">
                  Browse articles
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group">
              <CardContent className="p-6">
                <div className="bg-info-bg text-info mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-foreground text-lg font-semibold">Ask the assistant</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Get instant answers from the KB chatbot.
                </p>
                <Button variant="ghost" className="text-primary hover:bg-primary/5 mt-4 px-0">
                  Open chatbot
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group">
              <CardContent className="p-6">
                <div className="bg-success-bg text-success mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Bookmark className="h-6 w-6" />
                </div>
                <h3 className="text-foreground text-lg font-semibold">Bookmarks</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Continue reading your saved articles.
                </p>
                <Button variant="ghost" className="text-primary hover:bg-primary/5 mt-4 px-0">
                  View bookmarks
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group">
              <CardContent className="p-6">
                <div className="bg-secondary text-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-foreground text-lg font-semibold">Recent activity</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Return to recently viewed content.
                </p>
                <Button variant="ghost" className="text-primary hover:bg-primary/5 mt-4 px-0">
                  View history
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
        {/* Featured articles */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-2xl font-semibold">Featured articles</h2>

            <Button variant="ghost" className="text-primary hover:bg-primary/5">
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <Card key={article.title} className="group h-full">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge label={article.category} />

                    <div className="text-warning flex items-center gap-1 text-sm font-medium">
                      <Star className="fill-warning h-4 w-4" />
                      {article.rating}
                    </div>
                  </div>

                  <CardTitle className="text-foreground text-xl">{article.title}</CardTitle>

                  <CardDescription className="text-muted-foreground">
                    {article.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="mt-auto flex items-center justify-between">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {article.time}
                  </div>

                  <Button>
                    Read article
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        {/* Categories */}
        <section className="space-y-5">
          <h2 className="text-foreground text-2xl font-semibold">Browse by category</h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Card key={category.title} className="group h-full">
                  <CardContent className="p-6">
                    <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-foreground text-lg font-semibold">{category.title}</h3>

                    <p className="text-muted-foreground mt-2 text-sm">{category.description}</p>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-muted-foreground text-sm font-medium">
                        {category.count}
                      </span>

                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                        Explore
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
        {/* Continue reading + chatbot */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Continue reading */}
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Continue reading</CardTitle>

                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                  View history
                </Button>
              </div>

              <CardDescription className="text-muted-foreground">
                Pick up where you left off.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {[
                ['Patient registration workflow', '5 min left'],
                ['Pharmacy dispensing SOP', '8 min left'],
                ['Laboratory order processing', '3 min left'],
              ].map(([title, time]) => (
                <div
                  key={title}
                  className="border-border bg-background hover:border-primary/30 hover:bg-accent/40 flex items-center justify-between rounded-xl border p-4 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-foreground font-medium">{title}</p>

                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      {time}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-primary hover:bg-primary/5"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chatbot */}
          <Card className="border-border from-accent via-background to-primary/5 h-full bg-gradient-to-br">
            <CardHeader className="space-y-4">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                <Bot className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <CardTitle className="text-foreground text-2xl">Need a quick answer?</CardTitle>

                <CardDescription className="text-muted-foreground text-base">
                  Ask the knowledge base assistant any question about the HMIS, clinical workflows,
                  or troubleshooting procedures.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button className="w-full" size="lg">
                Open chatbot
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="border-border bg-card rounded-xl border p-4">
                <p className="text-foreground mb-3 text-sm font-semibold">Popular questions</p>

                <div className="space-y-3">
                  {[
                    'How do I register a new patient?',
                    'How do I reset a user password?',
                    'What is the laboratory result workflow?',
                  ].map((question) => (
                    <div
                      key={question}
                      className="border-border hover:bg-accent/40 rounded-lg border p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-foreground text-sm">{question}</p>

                        <ChevronRight className="text-muted-foreground h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="badge border-border bg-accent text-primary">
      <span className="badge-dot bg-primary" />
      {label}
    </span>
  );
}
