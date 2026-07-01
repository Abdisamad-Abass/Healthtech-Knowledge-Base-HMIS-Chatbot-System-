type ArticleProps = {
  title: string;

  content: string;

  category?: string;
};

export default function ArticleCard({
  title,
  content,
  category,
}: ArticleProps) {
  return (
    <div
      className="
      bg-white
      rounded-3xl
      shadow-lg
      p-7
      border
      border-gray-100
      hover:shadow-2xl
      hover:-translate-y-1
      transition
      duration-300
      "
    >
      <div
        className="
        flex
        items-start
        justify-between
        gap-4
        "
      >
        <div
          className="
          w-12
          h-12
          rounded-2xl
          bg-blue-100
          flex
          items-center
          justify-center
          text-2xl
          "
        >
          📚
        </div>

        {category && (
          <span
            className="
            bg-blue-50
            text-blue-600
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
            "
          >
            {category}
          </span>
        )}
      </div>

      <h2
        className="
        text-2xl
        font-bold
        mt-5
        text-gray-800
        "
      >
        {title}
      </h2>

      <p
        className="
        mt-4
        text-gray-600
        leading-relaxed
        line-clamp-3
        "
      >
        {content}
      </p>

      <div
        className="
        mt-6
        h-1
        w-16
        bg-blue-600
        rounded-full
        "
      />
    </div>
  );
}
