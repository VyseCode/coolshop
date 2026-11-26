export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="h-12 w-64 animate-pulse rounded-2xl bg-sand" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse rounded-3xl bg-sand" />
        ))}
      </div>
    </div>
  );
}
