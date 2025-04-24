import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CourseNotFound() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <p className="text-gray-500 mb-6">
          The course you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
        <Button asChild>
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    </div>
  );
}
