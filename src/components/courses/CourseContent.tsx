"use client";

import { Course } from "@/services/types";
import { UnitContent } from "./UnitContent";
import { ModuleList } from "./ModuleList";
import { AddUnitDialog } from "./AddUnitDialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface CourseContentProps {
  course: Course;
  selectedModuleId: number | null;
  selectedUnitId: number | null;
  onModuleSelect?: (moduleId: number, moduleTitle: string) => void;
  onUnitSelect?: (unitId: number, unitTitle: string) => void;
  sidebarView?: boolean;
  onRefreshContent?: () => void;
  isPublic?: boolean;
  isGeneratingTOC?: boolean;
  onGenerateTOC?: () => Promise<void>;
}

export function CourseContent({
  course,
  selectedModuleId,
  selectedUnitId,
  onModuleSelect,
  onUnitSelect,
  sidebarView = false,
  onRefreshContent,
  isPublic = false,
  isGeneratingTOC = false,
  onGenerateTOC,
}: CourseContentProps) {
  // If sidebarView is true, only show the module list
  if (sidebarView) {
    return (
      <div className="space-y-4 w-full">
        <div className="w-full">
          <h3 className="text-sm font-medium mb-2">Course Content</h3>
          <ModuleList
            courseId={course.id}
            onModuleSelect={onModuleSelect}
            onUnitSelect={onUnitSelect}
          />
        </div>
      </div>
    );
  }

  // If no module or unit is selected, show a message
  if (!selectedModuleId || !selectedUnitId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Welcome to {course.title}
        </h2>
        <p className="text-muted-foreground max-w-md">
          Select a module and unit from the sidebar to start learning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Unit Content</h2>
          <p className="text-muted-foreground">
            View and manage content for this unit
          </p>
        </div>
        {!isPublic && (
          <div className="flex gap-2">
            {onRefreshContent && (
              <AddUnitDialog
                courseId={course.id}
                moduleId={selectedModuleId}
                onUnitAdded={onRefreshContent}
              />
            )}
            {onGenerateTOC && (
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateTOC}
                disabled={isGeneratingTOC}
                className="rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isGeneratingTOC ? "Generating..." : "Generate Structure"}
              </Button>
            )}
          </div>
        )}
      </div>

      <UnitContent unitId={selectedUnitId} isPublic={isPublic} />
    </div>
  );
}
