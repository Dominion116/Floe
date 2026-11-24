export function AccountSkeleton() {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">Loading your account…</span>
      <div className="h-56 animate-pulse rounded-3xl bg-mist-light" />
      <div className="h-32 animate-pulse rounded-3xl bg-mist-light" />
    </div>
  );
}
