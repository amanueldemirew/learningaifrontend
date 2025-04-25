"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Module, Unit } from "@/services/types";
import { CourseContent } from "@/components/courses/CourseContent";
import { usePublicCourse } from "@/hooks/usePublicCourse";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomSidebar } from "@/components/courses/CustomSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PublicCourseLayout() {
  const params = useParams();
  const courseIdParam = params.id;
  const courseId = courseIdParam ? Number(courseIdParam) : null;

  // Initialize all state hooks before any conditional returns
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedModuleTitle, setSelectedModuleTitle] = useState<string | null>(
    null
  );
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedUnitTitle, setSelectedUnitTitle] = useState<string | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [units, setUnits] = useState<Record<number, Unit[]>>({});
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { course, loading, fetchPublicModules, fetchPublicUnits } =
    usePublicCourse(courseId || 0);

  const fetchUnitsForModule = useCallback(
    async (moduleId: number) => {
      // If units are already loaded for this module, don't fetch again
      if (units[moduleId]) {
        return;
      }

      try {
        setIsLoadingModules(true);
        setCourseError(null);
        const unitsData = await fetchPublicUnits(moduleId);
        const unitsList = unitsData.items || [];
        setUnits((prev) => ({ ...prev, [moduleId]: unitsList }));

        // If this is the selected module and there are units, select the first one
        if (selectedModuleId === moduleId && unitsList.length > 0) {
          const firstUnit = unitsList[0];
          setSelectedUnitId(firstUnit.id);
          setSelectedUnitTitle(firstUnit.title);
        } else if (selectedModuleId === moduleId && unitsList.length === 0) {
          setCourseError("This module has no units yet.");
        }
      } catch (error) {
        console.error(`Error fetching units for module ${moduleId}:`, error);
        setCourseError("Failed to load module units. Please try again later.");
      } finally {
        setIsLoadingModules(false);
      }
    },
    [units, selectedModuleId, fetchPublicUnits]
  );

  const fetchModulesWithUnits = useCallback(async () => {
    if (!courseId || !isInitialLoad) return;

    try {
      setIsLoadingModules(true);
      setCourseError(null);
      console.log("Fetching modules for course:", courseId);
      // First fetch all modules - explicitly request page 1
      const modulesData = await fetchPublicModules(1); // Start with page 1
      console.log("Modules data received:", modulesData);
      const modulesList = modulesData.items || [];
      setModules(modulesList);

      // If there are modules, select the first one by default
      if (modulesList.length > 0) {
        const firstModule = modulesList[0];
        setSelectedModuleId(firstModule.id);
        setSelectedModuleTitle(firstModule.title);

        // Fetch units for the first module
        await fetchUnitsForModule(firstModule.id);
      } else {
        console.log("No modules found for course:", courseId);
        setCourseError("This course has no modules yet.");
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      setCourseError("Failed to load course modules. Please try again later.");
    } finally {
      setIsLoadingModules(false);
      setIsInitialLoad(false);
    }
  }, [courseId, fetchPublicModules, isInitialLoad, fetchUnitsForModule]);

  useEffect(() => {
    console.log("Course data:", course);
    fetchModulesWithUnits();
  }, [fetchModulesWithUnits, course]);

  const handleModuleSelect = useCallback(
    async (moduleId: number, moduleTitle: string) => {
      setSelectedModuleId(moduleId);
      setSelectedModuleTitle(moduleTitle);

      // Fetch units for this module if not already loaded
      if (!units[moduleId]) {
        await fetchUnitsForModule(moduleId);
      } else {
        // If units are already loaded, select the first one
        const moduleUnits = units[moduleId];
        if (moduleUnits.length > 0) {
          const firstUnit = moduleUnits[0];
          setSelectedUnitId(firstUnit.id);
          setSelectedUnitTitle(firstUnit.title);
        }
      }
    },
    [units, fetchUnitsForModule]
  );

  const handleUnitSelect = useCallback(
    (unitId: number, unitTitle: string) => {
      // Find which module contains this unit
      const moduleWithUnit = modules.find(
        (module) =>
          units[module.id] &&
          units[module.id].some((unit) => unit.id === unitId)
      );

      if (moduleWithUnit) {
        // Set the module context first
        setSelectedModuleId(moduleWithUnit.id);
        setSelectedModuleTitle(moduleWithUnit.title);
      }

      // Then set the unit
      setSelectedUnitId(unitId);
      setSelectedUnitTitle(unitTitle);
    },
    [modules, units]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Add keyboard shortcut to toggle sidebar (Ctrl+B or Cmd+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar]);

  const handleNextUnit = useCallback(() => {
    if (!selectedModuleId || !selectedUnitId) return;

    // Find the current module
    const currentModule = modules.find((m) => m.id === selectedModuleId);
    if (!currentModule) return;

    // Get all units for the current module
    const moduleUnits = units[selectedModuleId] || [];
    if (moduleUnits.length === 0) return;

    // Find the current unit's index
    const currentUnitIndex = moduleUnits.findIndex(
      (u) => u.id === selectedUnitId
    );
    if (currentUnitIndex === -1) return;

    // If there's a next unit in the current module
    if (currentUnitIndex < moduleUnits.length - 1) {
      const nextUnit = moduleUnits[currentUnitIndex + 1];
      handleUnitSelect(nextUnit.id, nextUnit.title);
      return;
    }

    // If we're at the last unit of the current module, try to go to the first unit of the next module
    const currentModuleIndex = modules.findIndex(
      (m) => m.id === selectedModuleId
    );
    if (currentModuleIndex < modules.length - 1) {
      const nextModule = modules[currentModuleIndex + 1];

      // First select the next module
      handleModuleSelect(nextModule.id, nextModule.title);

      // Then fetch and select its first unit
      const fetchAndSelectFirstUnit = async () => {
        try {
          const unitsData = await fetchPublicUnits(nextModule.id);
          const nextModuleUnits = unitsData.items || [];
          if (nextModuleUnits.length > 0) {
            const firstUnit = nextModuleUnits[0];
            handleUnitSelect(firstUnit.id, firstUnit.title);
          }
        } catch (error) {
          console.error("Error fetching units for next module:", error);
        }
      };

      fetchAndSelectFirstUnit();
    }
  }, [
    modules,
    units,
    selectedModuleId,
    selectedUnitId,
    handleModuleSelect,
    handleUnitSelect,
    fetchPublicUnits,
  ]);

  const handlePreviousUnit = useCallback(() => {
    if (!selectedModuleId || !selectedUnitId) return;

    // Find the current module
    const currentModule = modules.find((m) => m.id === selectedModuleId);
    if (!currentModule) return;

    // Get all units for the current module
    const moduleUnits = units[selectedModuleId] || [];
    if (moduleUnits.length === 0) return;

    // Find the current unit's index
    const currentUnitIndex = moduleUnits.findIndex(
      (u) => u.id === selectedUnitId
    );
    if (currentUnitIndex === -1) return;

    // If there's a previous unit in the current module
    if (currentUnitIndex > 0) {
      const prevUnit = moduleUnits[currentUnitIndex - 1];
      handleUnitSelect(prevUnit.id, prevUnit.title);
      return;
    }

    // If we're at the first unit of the current module, try to go to the last unit of the previous module
    const currentModuleIndex = modules.findIndex(
      (m) => m.id === selectedModuleId
    );
    if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];

      // First select the previous module
      handleModuleSelect(prevModule.id, prevModule.title);

      // Then fetch and select its last unit
      const fetchAndSelectLastUnit = async () => {
        try {
          const unitsData = await fetchPublicUnits(prevModule.id);
          const prevModuleUnits = unitsData.items || [];
          if (prevModuleUnits.length > 0) {
            const lastUnit = prevModuleUnits[prevModuleUnits.length - 1];
            handleUnitSelect(lastUnit.id, lastUnit.title);
          }
        } catch (error) {
          console.error("Error fetching units for previous module:", error);
        }
      };

      fetchAndSelectLastUnit();
    }
  }, [
    modules,
    units,
    selectedModuleId,
    selectedUnitId,
    handleModuleSelect,
    handleUnitSelect,
    fetchPublicUnits,
  ]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNextUnit();
      } else if (e.key === "ArrowLeft") {
        handlePreviousUnit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNextUnit, handlePreviousUnit]);

  // Validate that courseId is a valid number
  if (!courseIdParam || isNaN(Number(courseIdParam))) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Course ID</h1>
          <p className="text-muted-foreground">
            The course ID provided is not valid.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !course) {
    return <PublicCourseSkeleton />;
  }

  if (courseError) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Course</h1>
          <p className="text-muted-foreground mb-4">{courseError}</p>
          <Button asChild>
            <Link href="/published-courses">Back to Published Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Course Header */}
      <div className="border-b px-6 py-6 bg-background">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          {course.description && (
            <p className="text-muted-foreground text-lg">
              {course.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-b px-6 py-3 bg-background flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSidebar}
                  className="flex items-center gap-2 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle sidebar (Ctrl+B)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="border-b px-6 py-3 bg-background">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/published-courses"
                className="hover:text-primary"
              >
                Published Courses
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
            {selectedModuleId && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-[150px] inline-block hover:text-primary">
                            {selectedModuleTitle ||
                              `Module ${selectedModuleId}`}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {selectedModuleTitle ||
                              `Module ${selectedModuleId}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
            {selectedUnitId && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-[150px] inline-block hover:text-primary">
                            {selectedUnitTitle || `Unit ${selectedUnitId}`}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{selectedUnitTitle || `Unit ${selectedUnitId}`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Custom Sidebar */}
        <CustomSidebar
          courseId={course.id}
          modules={modules.map((module) => ({
            ...module,
            units: units[module.id] || [],
          }))}
          selectedModuleId={selectedModuleId}
          selectedUnitId={selectedUnitId}
          onModuleSelect={handleModuleSelect}
          onUnitSelect={handleUnitSelect}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          isLoading={isLoadingModules}
          onRefreshModules={fetchModulesWithUnits}
          isPublic={true}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {selectedModuleId && selectedUnitId ? (
            <div className="flex flex-col h-full">
              <CourseContent
                course={course}
                selectedModuleId={selectedModuleId}
                selectedUnitId={selectedUnitId}
                onModuleSelect={handleModuleSelect}
                onUnitSelect={handleUnitSelect}
                sidebarView={false}
                onRefreshContent={fetchModulesWithUnits}
                isPublic={true}
              />
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePreviousUnit}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextUnit}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h2 className="text-3xl font-semibold mb-4">
                Welcome to {course.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Select a module and unit from the sidebar to start learning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PublicCourseSkeleton() {
  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Skeleton className="h-[500px] rounded-lg" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-[500px] rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
