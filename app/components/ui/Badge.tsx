import type { ContactStatus } from "../../lib/types";
import { CONTACT_STATUS_LABEL } from "../../lib/types";
import { cn } from "../../lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 tracking-wide",
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_STYLES: Record<ContactStatus, string> = {
  new: "border-[#1845D6]/25 bg-[rgba(24,69,214,0.07)] text-[#1845D6]",
  contacted: "border-[#E5E5E5] bg-[#F6F6F6] text-black",
  closed: "border-[#E5E5E5] bg-white text-black/45",
};

export function StatusBadge({ status }: { status: ContactStatus }) {
  return (
    <Badge className={STATUS_STYLES[status] ?? STATUS_STYLES.closed}>
      {CONTACT_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
