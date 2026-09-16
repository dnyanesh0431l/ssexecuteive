"use client";

import { useCallback, useRef, useState } from "react";
import { Link2, Loader2, Trash2, UploadCloud } from "lucide-react";
import { cn } from "../../lib/utils";
import { uploadImage, validateImageFile } from "../../lib/firebase/storage";

type Mode = "upload" | "url";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  folder,
  label,
  hint,
  error,
  required,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("upload");
  const [progress, setProgress] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);

  const uploading = progress !== null;
  const displayUrl = preview ?? value;
  const shownError = error ?? localError;

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }

      setLocalError(null);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setProgress(0);

      try {
        const url = await uploadImage(file, folder, setProgress);
        onChange(url);
      } catch {
        setLocalError("Upload failed. Please check your connection and try again.");
      } finally {
        setProgress(null);
        setPreview(null);
        URL.revokeObjectURL(objectUrl);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [folder, onChange]
  );

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setLocalError("Enter a valid URL starting with http:// or https://");
      return;
    }
    setLocalError(null);
    onChange(trimmed);
    setUrlInput("");
  };

  const clear = () => {
    onChange("");
    setLocalError(null);
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

      <div
        className={cn(
          "flex items-start gap-3 rounded-md border bg-white p-3 transition-colors",
          shownError ? "border-[#B80A0B]" : "border-[#E5E5E5]",
          dragging && "border-[#1845D6] bg-[rgba(24,69,214,0.04)]"
        )}
      >
        {/* Preview thumbnail */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-[#E5E5E5] bg-[#F6F6F6]">
          {displayUrl ? (
            <>
              {/* eslint-disable-next-line ../..next/next/no-img-element */}
              <img
                src={displayUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-black/25">
              <UploadCloud className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                mode === "upload"
                  ? "bg-[#F6F6F6] text-black"
                  : "text-black/45 hover:text-black"
              )}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                mode === "url"
                  ? "bg-[#F6F6F6] text-black"
                  : "text-black/45 hover:text-black"
              )}
            >
              Image URL
            </button>
          </div>

          {mode === "upload" ? (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) void handleFile(file);
              }}
              className="mt-1.5 flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-2.5 text-[12px] font-medium text-black transition-colors",
                  "hover:bg-[#F6F6F6] disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                {displayUrl ? "Replace" : "Choose file"}
              </button>

              {uploading ? (
                <span className="text-[11px] font-medium text-black/60">
                  Uploading {progress ?? 0}%
                </span>
              ) : (
                <span className="text-[11px] text-black/40">
                  or drop an image here
                </span>
              )}
            </div>
          ) : (
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(event) => {
                  setUrlInput(event.target.value);
                  setLocalError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyUrl();
                  }
                }}
                className={cn(
                  "h-8 min-w-0 flex-1 rounded-md border bg-white px-2.5 text-[12px] text-black transition-colors",
                  "placeholder:text-black/35 focus:outline-none focus:ring-2",
                  localError
                    ? "border-[#B80A0B] focus:border-[#B80A0B] focus:ring-[#B80A0B]/15"
                    : "border-[#E5E5E5] focus:border-[#1845D6] focus:ring-[#1845D6]/15"
                )}
              />
              <button
                type="button"
                onClick={applyUrl}
                disabled={!urlInput.trim()}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#1845D6] px-2.5 text-[12px] font-medium text-white transition-colors",
                  "hover:bg-[#1438B3] disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <Link2 className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          )}

          {shownError ? (
            <p className="mt-1.5 text-[11px] leading-4 text-[#B80A0B]">
              {shownError}
            </p>
          ) : hint ? (
            <p className="mt-1.5 text-[11px] leading-4 text-black/45">{hint}</p>
          ) : null}
        </div>

        {/* Remove */}
        {displayUrl && !uploading ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Remove image"
            className="shrink-0 rounded p-1.5 text-black/35 transition-colors hover:bg-[#F6F6F6] hover:text-[#B80A0B]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}