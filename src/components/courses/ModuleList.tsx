"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash,
  Plus,
  BookOpen,
} from "lucide-react";
import {
  listModules,
  createModule,
  updateModule,
  deleteModule,
} from "@/services/modules";
import { ModuleCreate, ModuleUpdate, ModuleWithUnits } from "@/services/types";
import { toast } from "sonner";
import { UnitList } from "./UnitList";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModuleListProps {
  courseId: number;
  onModuleSelect?: (moduleId: number, moduleTitle: string) => void;
  onUnitSelect?: (unitId: number, unitTitle: string) => void;
}

export function ModuleList({
  courseId,
  onModuleSelect,
  onUnitSelect,
}: ModuleListProps) {
  const [modules, setModules] = useState<ModuleWithUnits[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleWithUnits | null>(
    null
  );
  const [expandedModules, setExpandedModules] = useState<
    Record<number, boolean>
  >({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 0,
  });

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listModules(courseId);
      setModules(response.items || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast.error("Failed to load modules");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const moduleData: ModuleCreate = {
        title: formData.title,
        description: formData.description || undefined,
        order: formData.order,
      };

      await createModule(courseId, moduleData);

      toast.success("Module created successfully");
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        order: 0,
      });
      fetchModules();
    } catch (error) {
      console.error("Error creating module:", error);
      toast.error("Failed to create module");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModule || !formData.title) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const moduleData: ModuleUpdate = {
        title: formData.title,
        description: formData.description || undefined,
        order: formData.order,
      };

      await updateModule(selectedModule.id, moduleData);

      toast.success("Module updated successfully");
      setIsEditDialogOpen(false);
      setSelectedModule(null);
      setFormData({
        title: "",
        description: "",
        order: 0,
      });
      fetchModules();
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("Failed to update module");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    try {
      await deleteModule(moduleId);
      toast.success("Module deleted successfully");
      fetchModules();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Failed to delete module");
    }
  };

  const toggleModuleExpand = (moduleId: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));

    if (!expandedModules[moduleId] && onModuleSelect) {
      onModuleSelect(
        moduleId,
        modules.find((m) => m.id === moduleId)?.title || ""
      );
      setSelectedModule(modules.find((m) => m.id === moduleId) || null);
    }
  };

  const handleEditClick = (module: ModuleWithUnits) => {
    setSelectedModule(module);
    setFormData({
      title: module.title,
      description: module.description || "",
      order: module.order,
    });
    setIsEditDialogOpen(true);
  };

  const handleModuleClick = (module: ModuleWithUnits) => {
    toggleModuleExpand(module.id);
    if (onModuleSelect) {
      onModuleSelect(module.id, module.title);
    }
  };

  return (
    <div className="space-y-1 w-full">
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-0.5">
          {modules.map((module) => (
            <div key={module.id} className="rounded-lg overflow-hidden">
              <div
                className={cn(
                  "flex items-center gap-2 px-1 py-2 cursor-pointer hover:bg-accent/50 transition-colors rounded-md",
                  selectedModule?.id === module.id && "bg-accent"
                )}
                onClick={() => handleModuleClick(module)}
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {expandedModules[module.id] ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                  <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-medium truncate">
                          {module.title}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{module.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(module);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Module</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this module? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {expandedModules[module.id] && (
                <div className="pl-3 pr-1">
                  <UnitList
                    moduleId={module.id}
                    courseId={courseId}
                    onUnitSelect={onUnitSelect}
                    nestedView={true}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Module Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-4"
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Module
      </Button>

      {/* Create Module Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Module</DialogTitle>
            <DialogDescription>
              Add a new module to your course.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Module title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Module description"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Module"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Update the module details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Module title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Module description"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
