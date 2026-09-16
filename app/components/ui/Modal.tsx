// components/ui/Modal.tsx
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof SIZES;
  dismissible?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={() => dismissible && onClose()}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden",
          "rounded-t-xl border border-[#E5E5E5] bg-white sm:rounded-lg",
          SIZES[size]
        )}
      >
        {(title || dismissible) && (
          <div className="flex items-start justify-between gap-4 border-b border-[#E5E5E5] px-5 py-4">
            <div>
              {title ? (
                <h2 className="text-base font-semibold tracking-tight text-black">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-[13px] leading-5 text-black/50">
                  {description}
                </p>
              ) : null}
            </div>
            {dismissible ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 -mt-1 rounded-md p-1.5 text-black/40 transition-colors hover:bg-[#F6F6F6] hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        )}

        <div className="admin-scroll flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E5E5E5] bg-[#F6F6F6] px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}