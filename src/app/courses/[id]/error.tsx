"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CourseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Course error:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
        <p className="text-gray-500 mb-6">
          {error.message || "An error occurred while loading the course."}
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => router.push("/courses")}>
            Back to Courses
          </Button>
        </div>
      </div>
    </div>
  );
}
