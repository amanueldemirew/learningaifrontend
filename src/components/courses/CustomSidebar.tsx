"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  FileText,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Unit, ModuleWithUnits } from "@/services/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { AddModuleDialog } from "./AddModuleDialog";
import { AddUnitDialog } from "./AddUnitDialog";

interface CustomSidebarProps {
  courseId: number;
  modules: ModuleWithUnits[];
  selectedModuleId: number | null;
  selectedUnitId: number | null;
  onModuleSelect: (moduleId: number, moduleTitle: string) => void;
  onUnitSelect: (unitId: number, unitTitle: string) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoading?: boolean;
  onRefreshModules?: () => void;
  isPublic?: boolean;
}

export function CustomSidebar({
  courseId,
  modules,
  selectedModuleId,
  selectedUnitId,
  onModuleSelect,
  onUnitSelect,
  sidebarOpen,
  toggleSidebar,
  isLoading = false,
  onRefreshModules,
  isPublic = false,
}: CustomSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<number[]>([]);

  // Auto-expand the module that contains the selected unit
  useEffect(() => {
    if (selectedUnitId && selectedModuleId) {
      setExpandedModules((prev) => {
        if (!prev.includes(selectedModuleId)) {
          return [...prev, selectedModuleId];
        }
        return prev;
      });
    }
  }, [selectedUnitId, selectedModuleId]);

  const toggleModuleExpand = useCallback((moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  }, []);

  const handleModuleClick = useCallback(
    (module: ModuleWithUnits) => {
      toggleModuleExpand(module.id);
      onModuleSelect(module.id, module.title);
    },
    [onModuleSelect, toggleModuleExpand]
  );

  const handleUnitClick = useCallback(
    (unit: Unit, moduleTitle: string) => {
      // First select the module to ensure breadcrumb includes module
      onModuleSelect(unit.module_id, moduleTitle);
      // Then select the unit
      onUnitSelect(unit.id, unit.title);
    },
    [onModuleSelect, onUnitSelect]
  );

  return (
    <>
      {/* Persistent button when sidebar is hidden */}
      {!sidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 rounded-full h-10 w-10 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          onClick={toggleSidebar}
        >
          <PanelLeftOpen className="h-4 w-4 text-primary" />
        </Button>
      )}

      <div
        className={cn(
          "transition-all duration-300 ease-in-out relative",
          sidebarOpen ? "w-96" : "w-0"
        )}
      >
        <div
          className={cn(
            "h-full border-r bg-background/80 backdrop-blur-sm",
            sidebarOpen ? "block" : "hidden"
          )}
        >
          <ScrollArea className="h-full">
            <div className="py-4 pr-4 pl-2 w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Course Content</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {modules.length} Modules
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={toggleSidebar}
                        >
                          <PanelLeftClose className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Hide sidebar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {!isPublic && onRefreshModules && (
                    <AddModuleDialog
                      courseId={courseId}
                      onModuleAdded={onRefreshModules}
                    />
                  )}
                </div>
              </div>

              <Separator className="mb-4" />

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <div className="pl-4 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {modules.map((module) => (
                    <div key={module.id} className="space-y-1">
                      <div
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent/70 transition-colors",
                          selectedModuleId === module.id && "bg-accent/80"
                        )}
                        onClick={() => handleModuleClick(module)}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-medium truncate max-w-[200px]">
                                  {module.title}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{module.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {module.units?.length || 0}
                          </Badge>
                          {expandedModules.includes(module.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {expandedModules.includes(module.id) && (
                        <div className="pl-6 space-y-1">
                          {!isPublic && onRefreshModules && (
                            <div className="mb-2">
                              <AddUnitDialog
                                courseId={courseId}
                                moduleId={module.id}
                                onUnitAdded={onRefreshModules}
                              />
                            </div>
                          )}
                          {module.units && module.units.length > 0 ? (
                            module.units.map((unit) => (
                              <div
                                key={unit.id}
                                className={cn(
                                  "flex items-center p-2 rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
                                  selectedUnitId === unit.id && "bg-accent/70"
                                )}
                                onClick={() =>
                                  handleUnitClick(unit, module.title)
                                }
                              >
                                <FileText className="h-3 w-3 text-muted-foreground mr-2 flex-shrink-0" />
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-sm truncate max-w-[220px]">
                                        {unit.title}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{unit.title}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground p-2">
                              No units yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {modules.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No modules yet. Add a module to get started.
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
