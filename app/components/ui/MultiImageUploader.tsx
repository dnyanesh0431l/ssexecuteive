// components/ui/MultiImageUploader.tsx
"use client";

import { useCallback, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Link2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { uploadImage, validateImageFile } from "../../lib/firebase/storage";

interface MultiImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  max?: number;
}

export function MultiImageUploader({
  value,
  onChange,
  folder,
  label,
  hint,
  error,
  required,
  max = 8,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);

  const uploading = progress !== null;
  const shownError = error ?? localError;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (value.length + list.length > max) {
        setLocalError(`You can upload up to ${max} images.`);
        return;
      }
      setLocalError(null);
      setProgress(0);
      const urls: string[] = [];
      try {
        for (let i = 0; i < list.length; i++) {
          const file = list[i];
          const validationError = validateImageFile(file);
          if (validationError) {
            setLocalError(validationError);
            continue;
          }
          const url = await uploadImage(file, folder, (p) => {
            setProgress(Math.round(((i + p / 100) / list.length) * 100));
          });
          urls.push(url);
        }
        if (urls.length) onChange([...value, ...urls]);
      } catch {
        setLocalError("Upload failed. Please try again.");
      } finally {
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [folder, max, onChange, value]
  );

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setLocalError("Enter a valid URL starting with http:// or https://");
      return;
    }
    if (value.length >= max) {
      setLocalError(`You can add up to ${max} images.`);
      return;
    }
    setLocalError(null);
    onChange([...value, trimmed]);
    setUrlInput("");
  };

  return (
    <div className="w-full">
      {label ? (
        <span className="mb-1.5 block text-[13px] font-medium text-black">
          {label}
          {required ? <span className="text-[#B80A0B]"> *</span> : null}
        </span>
      ) : null}

      {value.length > 0 ? (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-md border border-[#E5E5E5] bg-[#F6F6F6]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {index === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Move left"
                  className="rounded p-1 text-white/85 hover:text-white disabled:opacity-30"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === value.length - 1}
                  aria-label="Move right"
                  className="rounded p-1 text-white/85 hover:text-white disabled:opacity-30"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label="Remove image"
                  className="rounded p-1 text-white/85 hover:text-[#FFB4B4]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-md border bg-white p-3 transition-colors",
          shownError ? "border-[#B80A0B]" : "border-[#E5E5E5]",
          dragging && "border-[#1845D6] bg-[rgba(24,69,214,0.04)]"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={uploading || value.length >= max}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 text-[12px] font-medium text-black transition-colors",
              "hover:bg-[#F6F6F6] disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            {uploading ? `Uploading ${progress ?? 0}%` : "Choose files"}
          </button>
          <span className="text-[11px] text-black/40">
            or drop images · {value.length}/{max}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setLocalError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrl();
              }
            }}
            className={cn(
              "h-8 min-w-0 flex-1 rounded-md border bg-white px-2.5 text-[12px] text-black transition-colors",
              "placeholder:text-black/35 focus:outline-none focus:ring-2",
              "border-[#E5E5E5] focus:border-[#1845D6] focus:ring-[#1845D6]/15"
            )}
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={!urlInput.trim() || value.length >= max}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#1845D6] px-2.5 text-[12px] font-medium text-white transition-colors",
              "hover:bg-[#1438B3] disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <Link2 className="h-3.5 w-3.5" />
            Add URL
          </button>
        </div>

        {shownError ? (
          <p className="mt-2 text-[11px] leading-4 text-[#B80A0B]">{shownError}</p>
        ) : hint ? (
          <p className="mt-2 text-[11px] leading-4 text-black/45">{hint}</p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) void handleFiles(files);
        }}
      />
    </div>
  );
}