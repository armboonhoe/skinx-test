export default function PostsLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="skeleton h-6 w-24 rounded-full" />
        <div className="skeleton h-10 w-64 rounded-lg" />
        <div className="skeleton h-4 w-40 rounded" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-7 rounded-full"
            style={{ width: `${60 + (i * 17) % 50}px` }}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <li
            key={i}
            className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card"
          >
            <div className="skeleton mb-3 h-5 w-3/4 rounded" />
            <div className="skeleton mb-4 h-4 w-1/2 rounded" />
            <div className="flex gap-1.5">
              <div className="skeleton h-5 w-14 rounded-full" />
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton h-5 w-12 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
