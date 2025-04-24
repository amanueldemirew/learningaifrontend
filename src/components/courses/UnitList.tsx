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
  DialogTrigger,
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
import { Edit, Trash, Plus, FileText } from "lucide-react";
import {
  listUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "@/services/units";
import { Unit, UnitCreate, UnitUpdate } from "@/services/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UnitListProps {
  moduleId: number;
  courseId: number;
  onUnitSelect?: (unitId: number, unitTitle: string) => void;
  nestedView?: boolean;
}

export function UnitList({
  moduleId,
  courseId,
  onUnitSelect,
  nestedView = false,
}: UnitListProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 0,
  });
  const router = useRouter();

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listUnits(courseId, moduleId);
      if (Array.isArray(response)) {
        setUnits(response);
      } else if (response && Array.isArray(response.items)) {
        setUnits(response.items);
      } else {
        setUnits([]);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Failed to load units");
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

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
      const unitData: UnitCreate = {
        title: formData.title,
        description: formData.description || undefined,
        order: formData.order,
        module_id: moduleId,
      };

      await createUnit(moduleId, unitData);

      toast.success("Unit created successfully");
      setIsEditDialogOpen(false);
      setFormData({ title: "", description: "", order: 0 });
      fetchUnits();
    } catch (error) {
      console.error("Error creating unit:", error);
      toast.error("Failed to create unit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUnit || !formData.title) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const unitData: UnitUpdate = {
        title: formData.title,
        description: formData.description || undefined,
        order: formData.order,
      };

      await updateUnit(selectedUnit.id, unitData);

      toast.success("Unit updated successfully");
      setIsEditDialogOpen(false);
      setSelectedUnit(null);
      setFormData({ title: "", description: "", order: 0 });
      fetchUnits();
    } catch (error) {
      console.error("Error updating unit:", error);
      toast.error("Failed to update unit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    try {
      await deleteUnit(unitId);
      toast.success("Unit deleted successfully");
      fetchUnits();
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error("Failed to delete unit");
    }
  };

  const handleUnitClick = (unitId: number) => {
    if (onUnitSelect) {
      const unit = units.find((u) => u.id === unitId);
      if (unit) {
        // Pass the unit information to the parent
        onUnitSelect(unitId, unit.title || "");
      }
    }

    // Only navigate if not in nested view (accordion)
    if (!nestedView) {
      router.push(`/courses/${courseId}/modules/${moduleId}/units/${unitId}`);
    }
  };

  return (
    <div className="space-y-1">
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-8 bg-muted rounded animate-pulse w-full",
                nestedView && "ml-2"
              )}
            />
          ))}
        </div>
      ) : units.length === 0 ? (
        <div
          className={cn(
            "text-center py-2 text-sm text-muted-foreground",
            nestedView && "ml-2"
          )}
        >
          No units yet
        </div>
      ) : (
        units.map((unit) => (
          <div
            key={unit.id}
            className={cn(
              "group flex items-center justify-between px-1 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
              selectedUnit?.id === unit.id && "bg-accent",
              nestedView && "ml-0"
            )}
            onClick={() => handleUnitClick(unit.id)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-medium truncate">
                      {unit.title}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{unit.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUnit(unit);
                  setFormData({
                    title: unit.title,
                    description: unit.description || "",
                    order: unit.order || 0,
                  });
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Unit</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this unit? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteUnit(unit.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))
      )}

      {/* Create Unit Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Managing Unit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Unit</DialogTitle>
            <DialogDescription>
              Add a new unit to this module.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Unit Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Unit title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Select
                  value={formData.order.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, order: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">First</SelectItem>
                    <SelectItem value={units.length.toString()}>
                      Last
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Unit description"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Unit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Unit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>Update the unit details.</DialogDescription>
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
                  placeholder="Unit title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-order">Order</Label>
                <Select
                  value={formData.order.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, order: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">First</SelectItem>
                    <SelectItem value={(units.length + 1).toString()}>
                      Last
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Unit description"
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
