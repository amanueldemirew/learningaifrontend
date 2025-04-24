"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ModuleWithUnits } from "@/services/types";
import { CourseHeader } from "@/components/courses/CourseHeader";
import { CourseContent } from "@/components/courses/CourseContent";
import { useCourse } from "@/hooks/useCourse";
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
import { BatchContentGenerator } from "@/components/courses/BatchContentGenerator";

export function CourseLayout() {
  const params = useParams();
  const courseIdParam = params.id;
  const courseId = courseIdParam ? Number(courseIdParam) : null;

  const {
    course,
    loading,
    isSubmitting,
    isGeneratingTOC,
    isPublishing,
    updateCourse,
    deleteCourse,
    generateTOC,
    publishCourse,
    unpublishCourse,
  } = useCourse(courseId || 0);

  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedModuleTitle, setSelectedModuleTitle] = useState<string | null>(
    null
  );
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedUnitTitle, setSelectedUnitTitle] = useState<string | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modules, setModules] = useState<ModuleWithUnits[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [modulesError, setModulesError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    if (!courseId) return;

    try {
      setIsLoadingModules(true);
      setModulesError(null);

      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(`/api/courses/${courseId}/modules`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch modules");
      }

      const data = await response.json();
      setModules(data);
    } catch (error) {
      setModulesError(
        error instanceof Error ? error.message : "Failed to fetch modules"
      );
    } finally {
      setIsLoadingModules(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchModules();
    }
  }, [courseId, fetchModules]);

  const handleModuleSelect = useCallback((moduleId: number, title: string) => {
    setSelectedModuleId(moduleId);
    setSelectedModuleTitle(title);
    setSelectedUnitId(null);
    setSelectedUnitTitle(null);
  }, []);

  const handleUnitSelect = useCallback((unitId: number, title: string) => {
    setSelectedUnitId(unitId);
    setSelectedUnitTitle(title);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!courseId) return;
    await deleteCourse();
  }, [courseId, deleteCourse]);

  const handlePublish = useCallback(async () => {
    if (!courseId) return;
    await publishCourse();
  }, [courseId, publishCourse]);

  const handleUnpublish = useCallback(async () => {
    if (!courseId) return;
    await unpublishCourse();
  }, [courseId, unpublishCourse]);

  const handleGenerateTOC = useCallback(async () => {
    if (!course) return;

    try {
      await generateTOC();
    } catch (error) {
      console.error("Error generating TOC:", error);
    }
  }, [course, generateTOC]);

  // Add keyboard shortcut to toggle sidebar (Ctrl+B or Cmd+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    return null; // The loading or not-found component will be shown
  }

  return (
    <div className="flex flex-col h-screen">
      {modulesError && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {modulesError}
        </div>
      )}
      {/* Course Header */}
      <CourseHeader
        course={course}
        isSubmitting={isSubmitting}
        onUpdateCourse={updateCourse}
        onDeleteCourse={handleDelete}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        isGeneratingTOC={isGeneratingTOC}
        isPublishing={isPublishing}
        onGenerateTOC={handleGenerateTOC}
      />

      {/* Action Buttons */}
      <div className="border-b px-4 py-2 bg-background flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
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
        <div className="flex items-center gap-2">
          {course && (
            <BatchContentGenerator
              courseId={course.id}
              defaultModuleId={selectedModuleId ?? undefined}
              defaultModuleTitle={selectedModuleTitle ?? undefined}
            />
          )}
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="border-b px-4 py-2 bg-background">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
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
                          <span className="truncate max-w-[150px] inline-block">
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
                          <span className="truncate max-w-[150px] inline-block">
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
          modules={modules}
          selectedModuleId={selectedModuleId}
          selectedUnitId={selectedUnitId}
          onModuleSelect={handleModuleSelect}
          onUnitSelect={handleUnitSelect}
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isLoading={isLoadingModules}
          onRefreshModules={fetchModules}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {selectedModuleId && selectedUnitId ? (
            <CourseContent
              course={course}
              selectedModuleId={selectedModuleId}
              selectedUnitId={selectedUnitId}
              isGeneratingTOC={isGeneratingTOC}
              onGenerateTOC={handleGenerateTOC}
              onModuleSelect={handleModuleSelect}
              onUnitSelect={handleUnitSelect}
              sidebarView={false}
              onRefreshContent={fetchModules}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome to {course.title}
              </h2>
              <p className="text-muted-foreground max-w-md">
                Select a module and unit from the sidebar to start learning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
