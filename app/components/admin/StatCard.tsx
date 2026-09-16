// components/admin/StatCard.tsx
import { cn } from "../../lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "neutral",
  loading = false,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ReactNode;
  accent?: "neutral" | "red" | "blue";
  loading?: boolean;
}) {
  const accents = {
    neutral: "text-black/45",
    red: "text-[#B80A0B]",
    blue: "text-[#1845D6]",
  } as const;

  return (
    <div className="rounded-lg border border-[#E5E5E5] bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-black/45">
          {label}
        </p>
        <span className={cn("shrink-0", accents[accent])}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-black">
        {loading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-[#F6F6F6]" /> : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-black/45">{hint}</p> : null}
    </div>
  );
}