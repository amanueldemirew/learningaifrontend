/**
 * Courses API service
 */

import { apiFetch, createFormData } from "./api-client";
import {
  Course,
  CourseCreateInput,
  CourseUpdateInput,
  CourseCreateByFileIdInput,
  PaginatedResponse,
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
} from "./types";

/**
 * Create a new course with a file upload
 */
export const createCourse = async (
  data: CourseCreateInput
): Promise<Course> => {
  // Ensure thumbnail_url is properly formatted
  const thumbnail_url = data.thumbnail_url
    ? data.thumbnail_url.startsWith("http")
      ? data.thumbnail_url
      : `https://${data.thumbnail_url}`
    : "";

  const formData = createFormData({
    title: data.title,
    description: data.description || "",
    thumbnail_url: thumbnail_url,
    file: data.file,
  });

  return apiFetch("courses/", {
    method: "POST",
    body: formData,
  });
};

/**
 * Create a new course using an existing file ID
 */
export const createCourseByFileId = async (
  data: CourseCreateByFileIdInput
): Promise<Course> => {
  // Ensure thumbnail_url is properly formatted
  const thumbnail_url = data.thumbnail_url
    ? data.thumbnail_url.startsWith("http")
      ? data.thumbnail_url
      : `https://${data.thumbnail_url}`
    : "";

  const formData = createFormData({
    title: data.title,
    description: data.description,
    thumbnail_url: thumbnail_url,
    file_id: data.file_id,
  });

  return apiFetch("courses/by-file-id", {
    method: "POST",
    headers: {
      // Don't set Content-Type here, it will be set automatically with the boundary
    },
    body: formData,
  });
};

/**
 * Get a list of courses with pagination
 */
export const listCourses = async (
  page = 1,
  size = 10
): Promise<Course[] | PaginatedResponse<Course>> => {
  const response = await apiFetch<Course[] | PaginatedResponse<Course>>(
    `courses/?skip=${(page - 1) * size}&limit=${size}`
  );

  // Handle both array responses and paginated responses
  if (Array.isArray(response)) {
    return response;
  } else if (response && "items" in response && Array.isArray(response.items)) {
    return response;
  } else {
    console.error("Unexpected response format from courses API:", response);
    return { items: [], total: 0, page: 1, per_page: 10, total_pages: 0 };
  }
};

/**
 * Get a single course by ID
 */
export const getCourse = async (courseId: number): Promise<Course> => {
  return apiFetch(`courses/${courseId}`);
};

/**
 * Update a course
 */
export const updateCourse = async (
  courseId: number,
  data: CourseUpdateInput
): Promise<Course> => {
  return apiFetch(`courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * Delete a course
 */
export const deleteCourse = async (courseId: number): Promise<void> => {
  return apiFetch(`courses/${courseId}`, {
    method: "DELETE",
  });
};

/**
 * Generate table of contents for a course
 */
export const generateCourseTOC = async (courseId: number): Promise<unknown> => {
  return apiFetch(`generate-toc?course_id=${courseId}`, {
    method: "POST",
  });
};

/**
 * Clear table of contents for a course
 */
export const clearCourseTOC = async (courseId: number): Promise<void> => {
  await apiFetch(`clear-toc?course_id=${courseId}`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
    },
  });
};

/**
 * Publish a course
 */
export const publishCourse = async (courseId: number): Promise<Course> => {
  return apiFetch(`publish?course_id=${courseId}`, {
    method: "PUT",
    headers: {
      accept: "application/json",
    },
  });
};

/**
 * Unpublish a course
 */
export const unpublishCourse = async (courseId: number): Promise<Course> => {
  return apiFetch(`unpublish?course_id=${courseId}`, {
    method: "PUT",
    headers: {
      accept: "application/json",
    },
  });
};

/**
 * Get a list of published courses
 */
export const getPublishedCourses = async (
  page = 1,
  perPage = 10
): Promise<Course[]> => {
  return apiFetch(`courses/public/courses?page=${page}&per_page=${perPage}`);
};

/**
 * Get a published course by ID
 */
export const getPublishedCourse = async (courseId: number): Promise<Course> => {
  return apiFetch(`courses/public/courses/${courseId}`);
};

/**
 * Get published courses by user ID
 */
export const getUserPublishedCourses = async (
  userId: number,
  page = 1,
  perPage = 10
): Promise<Course[]> => {
  return apiFetch(
    `courses/public/courses/user/${userId}?page=${page}&per_page=${perPage}`
  );
};

/**
 * Search published courses
 */
export const searchPublishedCourses = async (
  query: string,
  page = 1,
  perPage = 10
): Promise<Course[]> => {
  return apiFetch(
    `courses/public/courses/search?query=${encodeURIComponent(
      query
    )}&page=${page}&per_page=${perPage}`
  );
};

/**
 * Create a new module
 */
export const createModule = async (
  courseId: number,
  data: ModuleCreate
): Promise<Module> => {
  return apiFetch(`courses/public/modules?course_id=${courseId}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Update a module
 */
export const updateModule = async (
  moduleId: number,
  data: ModuleUpdate
): Promise<Module> => {
  return apiFetch(`courses/public/modules/${moduleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Delete a module
 */
export const deleteModule = async (moduleId: number): Promise<void> => {
  return apiFetch(`courses/public/modules/${moduleId}`, {
    method: "DELETE",
  });
};

/**
 * List modules for a course
 */
export const listModules = async (
  courseId: number,
  page = 1,
  perPage = 10,
  sortBy = "order",
  sortOrder = "asc",
  search?: string
): Promise<PaginatedResponse<Module>> => {
  let url = `courses/public/modules?course_id=${courseId}&page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return apiFetch(url);
};

/**
 * Create a new unit
 */
export const createUnit = async (data: UnitCreate): Promise<Unit> => {
  return apiFetch("courses/public/units", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Update a unit
 */
export const updateUnit = async (
  unitId: number,
  data: UnitUpdate
): Promise<Unit> => {
  return apiFetch(`courses/units/${unitId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Delete a unit
 */
export const deleteUnit = async (unitId: number): Promise<void> => {
  return apiFetch(`courses/public/units/${unitId}`, {
    method: "DELETE",
  });
};

/**
 * List units for a module
 */
export const listUnits = async (
  courseId: number,
  moduleId: number,
  page = 1,
  perPage = 10,
  sortBy = "order",
  sortOrder = "asc"
): Promise<PaginatedResponse<Unit>> => {
  return apiFetch(
    `courses/units?course_id=${courseId}&module_id=${moduleId}&page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`
  );
};

/**
 * Create a new content
 */
export const createContent = async (data: ContentCreate): Promise<Content> => {
  return apiFetch("contents", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Update a content
 */
export const updateContent = async (
  contentId: number,
  data: ContentUpdate
): Promise<Content> => {
  return apiFetch(`contents/${contentId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Delete a content
 */
export const deleteContent = async (contentId: number): Promise<void> => {
  return apiFetch(`contents/${contentId}`, {
    method: "DELETE",
  });
};

/**
 * Get a content by ID
 */
export const getContent = async (contentId: number): Promise<Content> => {
  return apiFetch(`courses/public/contents/${contentId}`);
};

/**
 * List contents for a unit
 */
export const listContents = async (
  unitId: number,
  page = 1,
  perPage = 10,
  sortBy = "order",
  sortOrder = "asc"
): Promise<PaginatedResponse<Content>> => {
  return apiFetch(
    `courses/public/contents/unit?unit_id=${unitId}&page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`
  );
};

/**
 * List contents for a module
 */
export const listModuleContents = async (
  moduleId: number,
  page = 1,
  perPage = 10,
  sortBy = "order",
  sortOrder = "asc"
): Promise<PaginatedResponse<Content>> => {
  return apiFetch(
    `courses/public/contents/module?module_id=${moduleId}&page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`
  );
};

/**
 * Generate content for a unit
 */
export const generateContent = async (
  unitId: number,
  options?: ContentGenerationOptions
): Promise<Content> => {
  return apiFetch(`contents/generate?unit_id=${unitId}`, {
    method: "POST",
    body: options ? JSON.stringify(options) : undefined,
    headers: options ? { "Content-Type": "application/json" } : undefined,
  });
};

/**
 * Regenerate content
 */
export const regenerateContent = async (
  contentId: number,
  options: ContentGenerationOptions
): Promise<Content> => {
  return apiFetch(`contents/${contentId}/regenerate`, {
    method: "POST",
    body: JSON.stringify(options),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Batch generate content for a module
 */
export const batchGenerateContent = async (
  moduleId: number,
  options?: ContentGenerationOptions
): Promise<unknown> => {
  return apiFetch(`batch-generate?module_id=${moduleId}`, {
    method: "POST",
    body: options ? JSON.stringify(options) : undefined,
  });
};

/**
 * Batch generate content for all modules in a course
 */
export const batchGenerateAllContent = async (
  courseId: number,
  options?: ContentGenerationOptions
): Promise<unknown> => {
  return apiFetch(`batch-generate-all?course_id=${courseId}`, {
    method: "POST",
    body: options ? JSON.stringify(options) : undefined,
  });
};

/**
 * Clear all contents for a module
 */
export const clearModuleContents = async (moduleId: number): Promise<void> => {
  await apiFetch(`clear-module-contents?module_id=${moduleId}`, {
    method: "DELETE",
  });
};
