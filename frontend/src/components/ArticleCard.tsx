type ArticleProps = {
  title: string;

  content: string;

  category?: string;
};

export default function ArticleCard({ title, content, category }: ArticleProps) {
  return (
    <div className="bg-card border-border rounded-3xl border p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="bg-accent flex h-12 w-12 items-center justify-center rounded-2xl text-2xl">
          📚
        </div>

        {category && (
          <span className="bg-primary-soft text-primary rounded-full px-3 py-1 text-xs font-semibold">
            {category}
          </span>
        )}
      </div>

      <h2 className="text-foreground mt-5 text-2xl font-bold">{title}</h2>

      <p className="text-muted-FOREGROUND mt-4 line-clamp-3 leading-relaxed">{content}</p>

      <div className="bg-primary mt-6 h-1 w-16 rounded-full" />
    </div>
  );
}
