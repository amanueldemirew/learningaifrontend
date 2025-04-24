import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

export function Loading({
  size = "md",
  className,
  fullScreen = false,
  text,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const LoadingSpinner = (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {LoadingSpinner}
      </div>
    );
  }

  return LoadingSpinner;
}

export function LoadingPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loading size="lg" text="Loading..." />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border bg-card p-4 shadow-sm">
      <Loading size="md" text="Loading..." />
    </div>
  );
}
