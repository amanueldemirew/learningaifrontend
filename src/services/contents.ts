export interface Content {
  id: number;
  title: string;
  content_type: string;
  content: string;
  order: number;
  is_ai_generated: boolean;
  ai_prompt: string;
  page_reference: string;
  content_metadata: {
    content_type: string;
    custom_prompt: string;
    include_examples: boolean;
    include_exercises: boolean;
    difficulty_level: string;
    tone: string;
    target_audience: string;
  };
  unit_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface PaginatedContentResponse {
  items: Content[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

import { apiFetch } from "./api-client";

/**
 * Get content for a specific unit
 */
export const getUnitContents = async (
  unitId: number,
  page = 1,
  perPage = 10,
  sortBy = "order",
  sortOrder = "asc"
): Promise<PaginatedContentResponse> => {
  return apiFetch(
    `contents/unit?unit_id=${unitId}&page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`
  );
};

/**
 * Get content for a specific unit in a published course
 */
export const getPublicUnitContents = async (
  unitId: number,
  page = 1,
  perPage = 10,
  sortBy = "order",
  sortOrder = "asc"
): Promise<PaginatedContentResponse> => {
  return apiFetch(
    `courses/public/units/${unitId}/contents?page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`
  );
};

export interface ContentGenerationOptions {
  content_type: string;
  custom_prompt?: string;
  difficulty_level?: string;
  tone?: string;
  target_audience?: string;
  include_examples?: boolean;
  include_exercises?: boolean;
}

/**
 * Generate AI content for a unit
 */
export const generateContent = async (
  unitId: number,
  options: ContentGenerationOptions
): Promise<Content> => {
  return apiFetch(`contents/generate?unit_id=${unitId}`, {
    method: "POST",
    body: JSON.stringify(options),
  });
};

/**
 * Regenerate AI content for existing content
 */
export const regenerateContent = async (
  contentId: number,
  options: ContentGenerationOptions
): Promise<Content> => {
  return apiFetch(`contents/${contentId}/regenerate`, {
    method: "POST",
    body: JSON.stringify(options),
  });
};

/**
 * Delete a specific content
 */
export const deleteContent = async (contentId: number): Promise<void> => {
  return apiFetch(`contents/${contentId}`, {
    method: "DELETE",
  });
};

/**
 * Batch generate content for all units in a module
 */
export const batchGenerateModuleContent = async (
  moduleId: number,
  options: ContentGenerationOptions
): Promise<{ message: string }> => {
  return apiFetch(`contents/batch-generate?module_id=${moduleId}`, {
    method: "POST",
    body: JSON.stringify(options),
  });
};
