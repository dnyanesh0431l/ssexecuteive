// components/ui/EmptyState.tsx
import { cn } from "../../lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E5] bg-[#F6F6F6] text-black/40">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-medium text-black">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-6 text-black/50">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}