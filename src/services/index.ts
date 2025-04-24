/**
 * Services index file
 * Export all services for easier imports
 */

export * from "./api-client";
export * from "./types";

// Import modules to avoid naming conflicts
import * as coursesService from "./courses";
import * as modulesService from "./modules";
import * as unitsService from "./units";

// Re-export with namespaces
export { coursesService, modulesService, unitsService };
