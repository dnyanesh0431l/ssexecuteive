// components/ui/ErrorState.tsx
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#B80A0B]/20 bg-[rgba(184,10,11,0.05)] text-[#B80A0B]">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-black">Something went wrong</p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-6 text-black/50">
        {message}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}