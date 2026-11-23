interface StatCardProps {
  label: string;
  value: string;
  note: string;
}

/** Render inside a <dl>. */
export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div className="well min-w-0 p-4 sm:p-6">
      <dt className="type-help">{label}</dt>
      <dd>
        <span className="type-figure block mt-2 text-[1.75rem] lg:text-4xl [overflow-wrap:anywhere]">
          {value}
        </span>
        <span className="type-help block mt-2">{note}</span>
      </dd>
    </div>
  );
}
