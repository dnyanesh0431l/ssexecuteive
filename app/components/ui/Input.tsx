// components/ui/Input.tsx
"use client";

import { forwardRef, useId } from "react";
import { cn } from "../../lib/utils";

const FIELD_BASE =
  "w-full rounded-md border bg-white text-sm text-black transition-colors " +
  "placeholder:text-black/35 focus:outline-none focus:ring-2 " +
  "disabled:cursor-not-allowed disabled:bg-[#F6F6F6] disabled:text-black/50";

const FIELD_NORMAL =
  "border-[#E5E5E5] focus:border-[#1845D6] focus:ring-[#1845D6]/15";

const FIELD_INVALID =
  "border-[#B80A0B] focus:border-[#B80A0B] focus:ring-[#B80A0B]/15";

interface FieldShellProps {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FieldShell({ id, label, error, hint, required, children }: FieldShellProps) {
  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={id}
          className="mb-1.5 block text-[13px] font-medium text-black"
        >
          {label}
          {required ? <span className="text-[#B80A0B]"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs leading-5 text-[#B80A0B]">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-black/45">{hint}</p>
      ) : null}
    </div>
  );
}

interface CommonProps {
  label?: string;
  error?: string;
  hint?: string;
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    CommonProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, required, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(
          FIELD_BASE,
          error ? FIELD_INVALID : FIELD_NORMAL,
          "h-10 px-3",
          className
        )}
        {...props}
      />
    </FieldShell>
  );
});

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    CommonProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, required, ...props }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <FieldShell
        id={inputId}
        label={label}
        error={error}
        hint={hint}
        required={required}
      >
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(
            FIELD_BASE,
            error ? FIELD_INVALID : FIELD_NORMAL,
            "min-h-[104px] resize-y px-3 py-2.5 leading-6",
            className
          )}
          {...props}
        />
      </FieldShell>
    );
  }
);

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    CommonProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, id, required, children, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <select
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(
          FIELD_BASE,
          error ? FIELD_INVALID : FIELD_NORMAL,
          "h-10 px-3 pr-8",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
});