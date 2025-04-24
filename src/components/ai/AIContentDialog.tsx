import { useState, useEffect } from "react";
import { Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AIContentForm } from "@/types/ai";

interface AIContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (form: AIContentForm) => Promise<void>;
  isGenerating: boolean;
  selectedItemType?: "unit" | "module";
}

export function AIContentDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  selectedItemType = "module",
}: AIContentDialogProps) {
  const [form, setForm] = useState<AIContentForm>({
    content_type: "text",
    custom_prompt: "",
    difficulty_level: "intermediate",
    tone: "learning",
    target_audience: "student",
    include_examples: true,
    include_exercises: true,
  });

  useEffect(() => {
    if (open) {
      setForm({
        content_type: "text",
        custom_prompt: "",
        difficulty_level: "intermediate",
        tone: "learning",
        target_audience: "student",
        include_examples: true,
        include_exercises: true,
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    await onGenerate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate AI Content</DialogTitle>
          <DialogDescription>
            Generate AI content for{" "}
            {selectedItemType === "unit" ? "this unit" : "this module"}.
            Customize the generation parameters below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content_type" className="text-right">
              Content Type
            </Label>
            <Select
              value={form.content_type}
              onValueChange={(value: "text" | "code" | "quiz" | "") =>
                setForm({ ...form, content_type: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom_prompt" className="text-right">
              Custom Prompt
            </Label>
            <Textarea
              id="custom_prompt"
              value={form.custom_prompt}
              onChange={(e) =>
                setForm({
                  ...form,
                  custom_prompt: e.target.value,
                })
              }
              className="col-span-3"
              placeholder="Add any specific instructions for content generation"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="difficulty_level" className="text-right">
              Difficulty
            </Label>
            <Select
              value={form.difficulty_level}
              onValueChange={(
                value: "beginner" | "intermediate" | "advanced" | ""
              ) =>
                setForm({
                  ...form,
                  difficulty_level: value,
                })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tone" className="text-right">
              Tone
            </Label>
            <Select
              value={form.tone}
              onValueChange={(
                value: "learning" | "professional" | "casual" | ""
              ) => setForm({ ...form, tone: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="target_audience" className="text-right">
              Audience
            </Label>
            <Select
              value={form.target_audience}
              onValueChange={(
                value: "student" | "professional" | "general" | ""
              ) => setForm({ ...form, target_audience: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right"></div>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_examples"
                  checked={form.include_examples}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      include_examples: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="include_examples">Include Examples</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_exercises"
                  checked={form.include_exercises}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      include_exercises: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="include_exercises">Include Exercises</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
