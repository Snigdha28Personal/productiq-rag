"use client";

import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Processing customer research..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-zinc-400 space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      <span className="text-xs font-medium text-zinc-300">{message}</span>
    </div>
  );
}
