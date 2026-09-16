// components/admin/contact/StatusSelect.tsx
"use client";

import { Loader2 } from "lucide-react";
import { CONTACT_STATUSES, CONTACT_STATUS_LABEL } from "../../lib/types";
import type { ContactStatus } from "../../lib/types";

export function StatusSelect({
  value,
  onChange,
  disabled,
  loading,
}: {
  value: ContactStatus;
  onChange: (status: ContactStatus) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        disabled={disabled || loading}
        aria-label="Change status"
        onChange={(event) => onChange(event.target.value as ContactStatus)}
        className="h-8 appearance-none rounded-md border border-[#E5E5E5] bg-white pl-3 pr-8 text-[12px] font-medium text-black transition-colors hover:bg-[#F6F6F6] focus:border-[#1845D6] focus:outline-none focus:ring-2 focus:ring-[#1845D6]/15 disabled:opacity-60"
      >
        {CONTACT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {CONTACT_STATUS_LABEL[status]}
          </option>
        ))}
      </select>
      {loading ? (
        <Loader2 className="pointer-events-none absolute right-2.5 h-3 w-3 animate-spin text-black/40" />
      ) : (
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-2.5 h-3 w-3 text-black/40"
          fill="currentColor"
        >
          <path d="M5.25 7.5 10 12.25 14.75 7.5z" />
        </svg>
      )}
    </div>
  );
}