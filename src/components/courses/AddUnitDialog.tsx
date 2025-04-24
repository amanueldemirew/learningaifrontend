"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createUnit, deleteUnit, listUnits } from "@/services/units";
import { Unit, UnitCreate } from "@/services/types";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddUnitDialogProps {
  courseId: number;
  moduleId: number;
  onUnitAdded: () => void;
}

export function AddUnitDialog({
  courseId,
  moduleId,
  onUnitAdded,
}: AddUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState<UnitCreate>({
    title: "",
    description: "",
    order: 1,
    module_id: moduleId,
  });

  const fetchUnits = useCallback(async () => {
    try {
      const response = await listUnits(courseId, moduleId);
      if (Array.isArray(response)) {
        setUnits(response);
      } else if (response && Array.isArray(response.items)) {
        setUnits(response.items);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Failed to load units");
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    if (open) {
      fetchUnits();
    }
  }, [open, fetchUnits]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.title) {
        toast.error("Title is required");
        return;
      }

      try {
        setIsSubmitting(true);
        await createUnit(moduleId, formData);
        toast.success("Unit added successfully");
        setOpen(false);
        setFormData({
          title: "",
          description: "",
          order: 1,
          module_id: moduleId,
        });
        onUnitAdded();
      } catch (error) {
        console.error("Error adding unit:", error);
        toast.error("Failed to add unit");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, moduleId, onUnitAdded]
  );

  const handleDeleteUnit = useCallback(
    async (unitId: number) => {
      try {
        await deleteUnit(unitId);
        toast.success("Unit deleted successfully");
        fetchUnits(); // Refresh the unit list
        onUnitAdded(); // Notify parent component
      } catch (error) {
        console.error("Error deleting unit:", error);
        toast.error("Failed to delete unit");
      }
    },
    [fetchUnits, onUnitAdded]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Manage Unit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Add New Unit</DialogTitle>
          <DialogDescription>
            Create a new unit for this module. You can add content to the unit
            later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Unit title"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order" className="text-right">
                Order
              </Label>
              <Select
                value={formData.order?.toString() || "0"}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, order: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">First</SelectItem>
                  <SelectItem value={units.length.toString()}>Last</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Brief description of the unit"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
            >
              {isSubmitting ? "Adding..." : "Add Unit"}
            </Button>
          </DialogFooter>
        </form>

        {/* Unit List with Delete Buttons */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Existing Units</h3>
          <div className="space-y-2">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center justify-between p-2 rounded-md border hover:bg-muted/50"
              >
                <div className="flex-1">
                  <p className="font-medium">{unit.title}</p>
                  {unit.description && (
                    <p className="text-sm text-muted-foreground">
                      {unit.description}
                    </p>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background/95 backdrop-blur-sm">
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
                        className="bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
