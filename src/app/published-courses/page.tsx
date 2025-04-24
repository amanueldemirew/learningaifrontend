"use client";

import { useState, useEffect, useCallback } from "react";
import { Course } from "@/services/types";
import {
  getPublishedCourses,
  searchPublishedCourses,
} from "@/services/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Globe, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

export default function PublishedCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchPublishedCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPublishedCourses(page);
      setCourses(response);
      // Assuming if we get a full page of results, there might be more
      setHasMore(response.length === 10);
    } catch (error) {
      console.error("Error fetching published courses:", error);
      setError("Failed to load published courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  const searchCourses = useCallback(
    async (query: string) => {
      try {
        setIsSearching(true);
        setError(null);
        const response = await searchPublishedCourses(query, page);
        setCourses(response);
        setHasMore(response.length === 10);
      } catch (error) {
        console.error("Error searching published courses:", error);
        setError("Failed to search published courses. Please try again later.");
      } finally {
        setIsSearching(false);
      }
    },
    [page]
  );

  useEffect(() => {
    fetchPublishedCourses();
  }, [page, fetchPublishedCourses]);

  useEffect(() => {
    if (debouncedSearchQuery) {
      searchCourses(debouncedSearchQuery);
    } else {
      fetchPublishedCourses();
    }
  }, [debouncedSearchQuery, fetchPublishedCourses, searchCourses]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="container py-8 pl-8">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Published Courses</h1>
          <p className="text-muted-foreground">
            Browse and explore published courses from our community.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search published courses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading || isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="p-0">
                  <Skeleton className="h-48 w-full" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    {course.thumbnail_url ? (
                      <div className="relative h-48 w-full">
                        <Image
                          src={course.thumbnail_url}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-muted flex items-center justify-center">
                        <Globe className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="line-clamp-1">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {course.description || "No description available."}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/published-courses/${course.id}`}>
                        View Course
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button onClick={loadMore} variant="outline">
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No published courses found
            </h2>
            <p className="text-muted-foreground max-w-md">
              {searchQuery
                ? "No courses match your search criteria. Try a different search term."
                : "There are no published courses available at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
