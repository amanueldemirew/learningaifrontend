import { useState, useEffect, useCallback } from "react";
import {
  getCourse,
  updateCourse,
  deleteCourse,
  generateCourseTOC,
  clearCourseTOC,
  publishCourse,
  unpublishCourse,
  getPublishedCourses,
  getPublishedCourse,
  getUserPublishedCourses,
  searchPublishedCourses,
  createModule,
  updateModule,
  deleteModule,
  listModules,
  createUnit,
  updateUnit,
  deleteUnit,
  listUnits,
  createContent,
  updateContent,
  deleteContent,
  listContents,
  getContent,
  generateContent,
  regenerateContent,
  batchGenerateContent,
  batchGenerateAllContent,
  clearModuleContents,
  listModuleContents,
} from "@/services/courses";
import {
  Course,
  CourseUpdateInput,
  Module,
  ModuleCreate,
  ModuleUpdate,
  Unit,
  UnitCreate,
  UnitUpdate,
  Content,
  ContentCreate,
  ContentUpdate,
  ContentGenerationOptions,
  PaginatedResponse,
} from "@/services/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useCourse(courseId: number) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTOC, setIsGeneratingTOC] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const router = useRouter();

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const courseData = await getCourse(courseId);
      setCourse(courseData);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId, fetchCourse]);

  const handleUpdateCourse = async (data: CourseUpdateInput) => {
    if (!data.title) {
      toast.error("Title is required");
      return false;
    }

    try {
      setIsSubmitting(true);
      await updateCourse(courseId, data);
      toast.success("Course updated successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted successfully");
      router.push("/courses");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const handleGenerateTOC = async () => {
    try {
      setIsGeneratingTOC(true);
      await generateCourseTOC(courseId);
      toast.success("Table of contents generated successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error generating table of contents:", error);
      toast.error("Failed to generate table of contents");
      return false;
    } finally {
      setIsGeneratingTOC(false);
    }
  };

  const handleClearTOC = async () => {
    try {
      await clearCourseTOC(courseId);
      toast.success("Table of contents cleared successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error clearing table of contents:", error);
      toast.error("Failed to clear table of contents");
      return false;
    }
  };

  const handlePublishCourse = async () => {
    try {
      if (typeof courseId !== "number" || isNaN(courseId)) {
        toast.error("Invalid course ID");
        return false;
      }

      setIsPublishing(true);
      await publishCourse(courseId);
      toast.success("Course published successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error publishing course:", error);
      toast.error("Failed to publish course");
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublishCourse = async () => {
    try {
      setIsPublishing(true);
      await unpublishCourse(courseId);
      toast.success("Course unpublished successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error unpublishing course:", error);
      toast.error("Failed to unpublish course");
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  // Module management
  const handleCreateModule = async (moduleData: ModuleCreate) => {
    try {
      setIsSubmitting(true);
      await createModule(courseId, moduleData);
      toast.success("Module created successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error creating module:", error);
      toast.error("Failed to create module");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateModule = async (
    moduleId: number,
    moduleData: ModuleUpdate
  ) => {
    try {
      setIsSubmitting(true);
      await updateModule(moduleId, moduleData);
      toast.success("Module updated successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("Failed to update module");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    try {
      await deleteModule(moduleId);
      toast.success("Module deleted successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Failed to delete module");
      return false;
    }
  };

  const handleListModules = async (
    page = 1,
    perPage = 10,
    sortBy = "order",
    sortOrder = "asc",
    search?: string
  ): Promise<PaginatedResponse<Module>> => {
    try {
      return await listModules(
        courseId,
        page,
        perPage,
        sortBy,
        sortOrder,
        search
      );
    } catch (error) {
      console.error("Error listing modules:", error);
      toast.error("Failed to list modules");
      return { items: [], total: 0, page, per_page: perPage, total_pages: 0 };
    }
  };

  // Unit management
  const handleCreateUnit = async (unitData: UnitCreate) => {
    try {
      setIsSubmitting(true);
      await createUnit(unitData);
      toast.success("Unit created successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error creating unit:", error);
      toast.error("Failed to create unit");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUnit = async (unitId: number, unitData: UnitUpdate) => {
    try {
      setIsSubmitting(true);
      await updateUnit(unitId, unitData);
      toast.success("Unit updated successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error updating unit:", error);
      toast.error("Failed to update unit");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    try {
      await deleteUnit(unitId);
      toast.success("Unit deleted successfully");
      fetchCourse();
      return true;
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error("Failed to delete unit");
      return false;
    }
  };

  const handleListUnits = async (
    moduleId: number,
    page = 1,
    perPage = 10,
    sortBy = "order",
    sortOrder = "asc"
  ): Promise<PaginatedResponse<Unit>> => {
    try {
      return await listUnits(
        courseId,
        moduleId,
        page,
        perPage,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Error listing units:", error);
      toast.error("Failed to list units");
      return { items: [], total: 0, page, per_page: perPage, total_pages: 0 };
    }
  };

  // Content management
  const handleCreateContent = async (contentData: ContentCreate) => {
    try {
      setIsSubmitting(true);
      await createContent(contentData);
      toast.success("Content created successfully");
      return true;
    } catch (error) {
      console.error("Error creating content:", error);
      toast.error("Failed to create content");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateContent = async (
    contentId: number,
    contentData: ContentUpdate
  ) => {
    try {
      setIsSubmitting(true);
      await updateContent(contentId, contentData);
      toast.success("Content updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Failed to update content");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContent = async (contentId: number) => {
    try {
      await deleteContent(contentId);
      toast.success("Content deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
      return false;
    }
  };

  const handleGetContent = async (
    contentId: number
  ): Promise<Content | null> => {
    try {
      return await getContent(contentId);
    } catch (error) {
      console.error("Error getting content:", error);
      toast.error("Failed to get content");
      return null;
    }
  };

  const handleListContents = async (
    unitId: number,
    page = 1,
    perPage = 10,
    sortBy = "order",
    sortOrder = "asc"
  ): Promise<PaginatedResponse<Content>> => {
    try {
      return await listContents(unitId, page, perPage, sortBy, sortOrder);
    } catch (error) {
      console.error("Error listing contents:", error);
      toast.error("Failed to list contents");
      return { items: [], total: 0, page, per_page: perPage, total_pages: 0 };
    }
  };

  const handleListModuleContents = async (
    moduleId: number,
    page = 1,
    perPage = 10,
    sortBy = "order",
    sortOrder = "asc"
  ): Promise<PaginatedResponse<Content>> => {
    try {
      return await listModuleContents(
        moduleId,
        page,
        perPage,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Error listing module contents:", error);
      toast.error("Failed to list module contents");
      return { items: [], total: 0, page, per_page: perPage, total_pages: 0 };
    }
  };

  // Content generation
  const handleGenerateContent = async (
    unitId: number,
    options?: ContentGenerationOptions
  ) => {
    try {
      setIsGeneratingContent(true);
      await generateContent(unitId, options);
      toast.success("Content generated successfully");
      return true;
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
      return false;
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleRegenerateContent = async (
    contentId: number,
    options: ContentGenerationOptions
  ) => {
    try {
      setIsGeneratingContent(true);
      await regenerateContent(contentId, options);
      toast.success("Content regenerated successfully");
      return true;
    } catch (error) {
      console.error("Error regenerating content:", error);
      toast.error("Failed to regenerate content");
      return false;
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleBatchGenerateContent = async (
    moduleId: number,
    options?: ContentGenerationOptions
  ) => {
    try {
      setIsGeneratingContent(true);
      await batchGenerateContent(moduleId, options);
      toast.success("Content generation started");
      return true;
    } catch (error) {
      console.error("Error starting batch content generation:", error);
      toast.error("Failed to start content generation");
      return false;
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleBatchGenerateAllContent = async (
    options?: ContentGenerationOptions
  ) => {
    try {
      setIsGeneratingContent(true);
      await batchGenerateAllContent(courseId, options);
      toast.success("Content generation started for all modules");
      return true;
    } catch (error) {
      console.error("Error starting batch content generation:", error);
      toast.error("Failed to start content generation");
      return false;
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleClearModuleContents = async (moduleId: number) => {
    try {
      await clearModuleContents(moduleId);
      toast.success("Module contents cleared successfully");
      return true;
    } catch (error) {
      console.error("Error clearing module contents:", error);
      toast.error("Failed to clear module contents");
      return false;
    }
  };

  // Published courses
  const handleGetPublishedCourses = async (
    skip = 0,
    limit = 10
  ): Promise<Course[]> => {
    try {
      return await getPublishedCourses(skip, limit);
    } catch (error) {
      console.error("Error getting published courses:", error);
      toast.error("Failed to get published courses");
      return [];
    }
  };

  const handleGetPublishedCourse = async (
    courseId: number
  ): Promise<Course | null> => {
    try {
      return await getPublishedCourse(courseId);
    } catch (error) {
      console.error("Error getting published course:", error);
      toast.error("Failed to get published course");
      return null;
    }
  };

  const handleGetUserPublishedCourses = async (
    userId: number,
    skip = 0,
    limit = 10
  ): Promise<Course[]> => {
    try {
      return await getUserPublishedCourses(userId, skip, limit);
    } catch (error) {
      console.error("Error getting user published courses:", error);
      toast.error("Failed to get user published courses");
      return [];
    }
  };

  const handleSearchPublishedCourses = async (
    query: string,
    skip = 0,
    limit = 10
  ): Promise<Course[]> => {
    try {
      return await searchPublishedCourses(query, skip, limit);
    } catch (error) {
      console.error("Error searching published courses:", error);
      toast.error("Failed to search published courses");
      return [];
    }
  };

  return {
    course,
    loading,
    isSubmitting,
    isGeneratingTOC,
    isPublishing,
    isGeneratingContent,
    fetchCourse,
    updateCourse: handleUpdateCourse,
    deleteCourse: handleDeleteCourse,
    generateTOC: handleGenerateTOC,
    clearTOC: handleClearTOC,
    publishCourse: handlePublishCourse,
    unpublishCourse: handleUnpublishCourse,
    // Module management
    createModule: handleCreateModule,
    updateModule: handleUpdateModule,
    deleteModule: handleDeleteModule,
    listModules: handleListModules,
    // Unit management
    createUnit: handleCreateUnit,
    updateUnit: handleUpdateUnit,
    deleteUnit: handleDeleteUnit,
    listUnits: handleListUnits,
    // Content management
    createContent: handleCreateContent,
    updateContent: handleUpdateContent,
    deleteContent: handleDeleteContent,
    getContent: handleGetContent,
    listContents: handleListContents,
    listModuleContents: handleListModuleContents,
    // Content generation
    generateContent: handleGenerateContent,
    regenerateContent: handleRegenerateContent,
    batchGenerateContent: handleBatchGenerateContent,
    batchGenerateAllContent: handleBatchGenerateAllContent,
    clearModuleContents: handleClearModuleContents,
    // Published courses
    getPublishedCourses: handleGetPublishedCourses,
    getPublishedCourse: handleGetPublishedCourse,
    getUserPublishedCourses: handleGetUserPublishedCourses,
    searchPublishedCourses: handleSearchPublishedCourses,
  };
}
