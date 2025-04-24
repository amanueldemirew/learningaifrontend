"use client";

import { useState } from "react";
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
import { Course, CourseUpdateInput } from "@/services/types";
import {
  Edit,
  Trash,
  BookOpen,
  Lock,
  Globe,
  FileText,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourseHeaderProps {
  course: Course;
  isSubmitting: boolean;
  onUpdateCourse: (data: CourseUpdateInput) => Promise<boolean>;
  onDeleteCourse: () => Promise<void>;
  onPublish: () => Promise<void>;
  onUnpublish: () => Promise<void>;
  isGeneratingTOC: boolean;
  isPublishing: boolean;
  onGenerateTOC: () => Promise<void>;
}

export function CourseHeader({
  course,
  isSubmitting,
  onUpdateCourse,
  onDeleteCourse,
  onPublish,
  onUnpublish,
  isGeneratingTOC,
  isPublishing,
  onGenerateTOC,
}: CourseHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || "",
    thumbnail_url: course.thumbnail_url || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await onUpdateCourse({
      title: formData.title,
      description: formData.description || undefined,
      thumbnail_url: formData.thumbnail_url || undefined,
    });

    if (success) {
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="border-b bg-background">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">{course.title}</h1>
            {!course.is_published && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                Draft
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>Edit Course</DialogTitle>
                  <DialogDescription>
                    Update the course details.
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
                        required
                      />
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
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="thumbnail_url" className="text-right">
                        Thumbnail URL
                      </Label>
                      <Input
                        id="thumbnail_url"
                        name="thumbnail_url"
                        value={formData.thumbnail_url}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {course.is_published ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onUnpublish}
                disabled={isPublishing}
                className="rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              >
                <Lock className="h-4 w-4 mr-2" />
                {isPublishing ? "Unpublishing..." : "Unpublish Course"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onPublish}
                disabled={isPublishing}
                className="rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              >
                <Globe className="h-4 w-4 mr-2" />
                {isPublishing ? "Publishing..." : "Publish Course"}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={onGenerateTOC}
                  disabled={isGeneratingTOC}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isGeneratingTOC ? "Generating..." : "Generate Structure"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Course
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background/95 backdrop-blur-sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Course</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this course? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDeleteCourse}
                        className="bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <Separator />
    </div>
  );
}
