"use client";

import { Suspense } from "react";
import { PublicCourseLayout } from "@/components/courses/PublicCourseLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublishedCoursePage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Skeleton className="h-[500px] rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <Skeleton className="h-[500px] rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PublicCourseLayout />
    </Suspense>
  );
}
