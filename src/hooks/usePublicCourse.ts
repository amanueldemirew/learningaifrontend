import { useState, useEffect, useCallback } from "react";
import {
  Course,
  Module,
  Unit,
  Content,
  PaginatedResponse,
} from "@/services/types";
import { toast } from "sonner";
import { apiFetch } from "@/services/api-client";

/**
 * Hook for fetching public course data without authentication
 */
export function usePublicCourse(courseId: number) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const courseData = await apiFetch<Course>(
        `courses/public/courses/${courseId}`
      );
      setCourse(courseData);
    } catch (error) {
      console.error("Error fetching public course:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load course"
      );
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchPublicCourse();
    }
  }, [courseId, fetchPublicCourse]);

  const fetchPublicModules = async (
    page = 1,
    perPage = 10,
    sortBy = "order",
    sortOrder = "asc"
  ): Promise<PaginatedResponse<Module>> => {
    try {
      return await apiFetch(
        `courses/public/courses/${courseId}/modules?page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`
      );
    } catch (error) {
      console.error("Error fetching public modules:", error);
      toast.error("Failed to load modules");
      throw error;
    }
  };

  const fetchPublicUnits = async (
    moduleId: number,
    page = 1,
    perPage = 10,
    sortBy = "order",
    sortOrder = "asc"
  ): Promise<PaginatedResponse<Unit>> => {
    try {
      return await apiFetch(
        `courses/public/modules/${moduleId}/units?page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`
      );
    } catch (error) {
      console.error("Error fetching public units:", error);
      toast.error("Failed to load units");
      throw error;
    }
  };

  const fetchPublicContents = async (
    unitId: number,
    page = 1,
    perPage = 10,
    sortBy = "order",
    sortOrder = "asc"
  ): Promise<PaginatedResponse<Content>> => {
    try {
      return await apiFetch(
        `courses/public/units/${unitId}/contents?page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`
      );
    } catch (error) {
      console.error("Error fetching public contents:", error);
      toast.error("Failed to load contents");
      throw error;
    }
  };

  const fetchPublicContent = async (contentId: number): Promise<Content> => {
    try {
      return await apiFetch(`courses/public/contents/${contentId}`);
    } catch (error) {
      console.error("Error fetching public content:", error);
      toast.error("Failed to load content");
      throw error;
    }
  };

  return {
    course,
    loading,
    error,
    fetchPublicCourse,
    fetchPublicModules,
    fetchPublicUnits,
    fetchPublicContents,
    fetchPublicContent,
  };
}
