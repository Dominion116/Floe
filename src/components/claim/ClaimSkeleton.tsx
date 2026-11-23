export function ClaimSkeleton() {
  return (
    <div role="status" className="mx-auto w-full max-w-md space-y-4">
      <span className="sr-only">Loading your payment…</span>
      <div className="h-64 animate-pulse rounded-3xl bg-mist-light" />
      <div className="h-12 animate-pulse rounded-full bg-mist-light" />
      <div className="h-12 animate-pulse rounded-full bg-mist-light" />
    </div>
  );
}
