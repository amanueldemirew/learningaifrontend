/**
 * Modules API service
 */

import { apiFetch } from "./api-client";
import { Module, ModuleCreate, ModuleUpdate, PaginatedResponse } from "./types";

/**
 * Create a new module
 */
export const createModule = async (
  courseId: number,
  data: ModuleCreate
): Promise<Module> => {
  return apiFetch(`modules/?course_id=${courseId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Get a list of modules for a course with pagination
 */
export const listModules = async (
  courseId: number,
  page = 1,
  size = 10
): Promise<PaginatedResponse<Module>> => {
  return apiFetch(
    `modules?course_id=${courseId}&page=${page}&per_page=${size}`
  );
};

/**
 * Get a single module by ID
 */
export const getModule = async (moduleId: number): Promise<Module> => {
  return apiFetch(`modules/${moduleId}`);
};

/**
 * Update a module
 */
export const updateModule = async (
  moduleId: number,
  data: ModuleUpdate
): Promise<Module> => {
  return apiFetch(`modules/${moduleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * Delete a module
 */
export const deleteModule = async (moduleId: number): Promise<void> => {
  return apiFetch(`modules/${moduleId}`, {
    method: "DELETE",
  });
};
