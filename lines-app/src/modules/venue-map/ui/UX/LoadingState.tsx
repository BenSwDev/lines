/**
 * Loading State Component
 * Skeleton loading states for better UX
 */

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface LoadingStateProps {
  type?: "canvas" | "list" | "full";
  className?: string;
}

export function LoadingState({
  type = "canvas",
  className = ""
}: LoadingStateProps) {
  if (type === "full") {
    return (
      <div className={`flex flex-col gap-4 p-4 ${className}`}>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className={`space-y-2 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  // Canvas loading
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

