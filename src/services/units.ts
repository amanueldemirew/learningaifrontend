/**
 * Units API service
 */

import { apiFetch } from "./api-client";
import { Unit, UnitCreateInput, UnitUpdate, PaginatedResponse } from "./types";

/**
 * Create a new unit
 */
export const createUnit = async (
  moduleId: number,
  data: UnitCreateInput
): Promise<Unit> => {
  return apiFetch(`units`, {
    method: "POST",
    body: JSON.stringify({
      ...data,
      module_id: moduleId,
    }),
  });
};

/**
 * Get a list of units for a module with pagination
 */
export const listUnits = async (
  courseId: number,
  moduleId: number,
  page = 1,
  size = 10
): Promise<Unit[] | PaginatedResponse<Unit>> => {
  return apiFetch(
    `units?course_id=${courseId}&module_id=${moduleId}&page=${page}&per_page=${size}`
  );
};

/**
 * Get a single unit by ID
 */
export const getUnit = async (unitId: number): Promise<Unit> => {
  return apiFetch(`units/${unitId}`);
};

/**
 * Update a unit
 */
export const updateUnit = async (
  unitId: number,
  data: UnitUpdate
): Promise<Unit> => {
  return apiFetch(`units/${unitId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * Delete a unit
 */
export const deleteUnit = async (unitId: number): Promise<void> => {
  return apiFetch(`units/${unitId}`, {
    method: "DELETE",
  });
};
