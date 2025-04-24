"use client";

import { ReactNode } from "react";
import { SEO } from "@/components/seo";
import { ErrorBoundary, ErrorMessage } from "@/components/ui/error-boundary";
import { Loading } from "@/components/ui/loading";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

export function PageLayout({
  children,
  title,
  description,
  isLoading = false,
  error = null,
  className = "",
}: PageLayoutProps) {
  return (
    <ErrorBoundary>
      <SEO title={title} description={description} />

      <div className={`container py-6 ${className}`}>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage
            title="Error"
            message={error.message || "Something went wrong"}
          />
        ) : (
          children
        )}
      </div>
    </ErrorBoundary>
  );
}

export function SectionLayout({
  children,
  title,
  description,
  className = "",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={`py-8 ${className}`}>
      <div className="container">
        {(title || description) && (
          <div className="mb-8 text-center">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="mt-2 text-lg text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function CardLayout({
  children,
  title,
  description,
  className = "",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border bg-card p-6 shadow-sm ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-semibold">{title}</h3>}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
