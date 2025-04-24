/**
 * Type definitions for API responses and requests
 */

export interface Course {
  id: number;
  user_id: number;
  file_id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
  username: string | null;
}

export interface CourseCreateInput {
  title: string;
  description?: string;
  thumbnail_url?: string;
  file: File;
}

export interface CourseUpdateInput {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  is_published?: boolean;
}

export interface CourseCreateByFileIdInput {
  title: string;
  description?: string;
  thumbnail_url?: string;
  file_id: number;
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string | null;
}

export interface ModuleWithUnits extends Module {
  units?: Unit[];
}

export interface ModuleCreate {
  title: string;
  description?: string;
  order?: number;
}

export interface ModuleUpdate {
  title?: string;
  description?: string;
  order?: number;
}

export interface Unit {
  id: number;
  module_id: number;
  title: string;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string | null;
}

export interface UnitCreate {
  title: string;
  description?: string;
  order?: number;
  module_id: number;
}

export interface UnitCreateInput {
  title: string;
  description?: string;
  order?: number;
}

export interface UnitUpdate {
  title?: string;
  description?: string;
  order?: number;
}

export interface Content {
  id: number;
  unit_id: number;
  title: string;
  content_type: string;
  content: string;
  order: number;
  is_ai_generated: boolean;
  ai_prompt: string | null;
  page_reference: string | null;
  metadata: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ContentCreate {
  unit_id: number;
  title: string;
  content_type: string;
  content: string;
  order?: number;
  is_ai_generated?: boolean;
  ai_prompt?: string;
  page_reference?: string;
  metadata?: string;
}

export interface ContentUpdate {
  title?: string;
  content_type?: string;
  content?: string;
  order?: number;
  is_ai_generated?: boolean;
  ai_prompt?: string;
  page_reference?: string;
  metadata?: string;
}

export interface ContentGenerationOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  system_prompt?: string;
  user_prompt?: string;
  page_reference?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
