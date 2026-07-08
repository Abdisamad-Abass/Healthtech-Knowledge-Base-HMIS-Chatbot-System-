type ArticleProps = {
  title: string;

  content: string;

  category?: string;
};

export default function ArticleCard({ title, content, category }: ArticleProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
          📚
        </div>

        {category && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {category}
          </span>
        )}
      </div>

      <h2 className="mt-5 text-2xl font-bold text-gray-800">{title}</h2>

      <p className="mt-4 line-clamp-3 leading-relaxed text-gray-600">{content}</p>

      <div className="mt-6 h-1 w-16 rounded-full bg-blue-600" />
    </div>
  );
}
