"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import {
  batchGenerateModuleContent,
  ContentGenerationOptions,
} from "@/services/contents";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listModules } from "@/services/modules";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Module {
  id: number;
  title: string;
}

interface BatchContentGeneratorProps {
  courseId: number;
  defaultModuleId?: number;
  defaultModuleTitle?: string;
}

export function BatchContentGenerator({
  courseId,
  defaultModuleId,
  defaultModuleTitle,
}: BatchContentGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<number | undefined>(
    defaultModuleId
  );
  const [selectedModuleTitle, setSelectedModuleTitle] = useState<
    string | undefined
  >(defaultModuleTitle);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [options, setOptions] = useState<ContentGenerationOptions>({
    content_type: "text",
    custom_prompt: "",
    include_examples: true,
    include_exercises: true,
    difficulty_level: "intermediate",
    tone: "professional",
    target_audience: "students",
  });

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setIsLoadingModules(true);
        const modulesData = await listModules(courseId);
        setModules(modulesData.items || []);

        // If no default module is provided but modules exist, select the first one
        if (
          !defaultModuleId &&
          modulesData.items &&
          modulesData.items.length > 0
        ) {
          setSelectedModuleId(modulesData.items[0].id);
          setSelectedModuleTitle(modulesData.items[0].title);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
        toast.error("Failed to load modules");
      } finally {
        setIsLoadingModules(false);
      }
    };

    if (isOpen) {
      fetchModules();
    }
  }, [courseId, defaultModuleId, isOpen]);

  const handleModuleChange = (moduleId: string) => {
    const id = parseInt(moduleId);
    const selectedModule = modules.find((m) => m.id === id);
    setSelectedModuleId(id);
    setSelectedModuleTitle(selectedModule?.title);
  };

  const handleGenerate = async () => {
    if (!selectedModuleId) {
      toast.error("Please select a module");
      return;
    }

    try {
      setIsGenerating(true);

      // Log the options being sent to help with debugging
      console.log("Sending content generation request with options:", options);

      const response = await batchGenerateModuleContent(
        selectedModuleId,
        options
      );

      // Truncate long module titles for the toast message
      const moduleTitle = selectedModuleTitle || `Module ${selectedModuleId}`;
      const truncatedTitle =
        moduleTitle.length > 30
          ? `${moduleTitle.substring(0, 30)}...`
          : moduleTitle;

      toast.success(`Content generation started for ${truncatedTitle}`);
      setIsOpen(false);
    } catch (error) {
      console.error("Error generating content:", error);

      // Extract more detailed error information
      let errorMessage = "Failed to generate content. Please try again.";

      if (error instanceof Error) {
        // Check if the error message contains specific information
        if (error.message.includes("Failed to generate content")) {
          // Try to extract more details from the error message
          const match = error.message.match(/content\s*{([^}]*)}/);
          if (match && match[1]) {
            errorMessage = `Content generation failed: ${match[1].trim()}`;
          }
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
        >
          <Wand2 className="h-4 w-4" />
          Generate Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Generate Content</DialogTitle>
          <DialogDescription>
            Generate AI content for all units in a module.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="module" className="text-right">
              Module
            </Label>
            <Select
              value={selectedModuleId?.toString()}
              onValueChange={handleModuleChange}
              disabled={isLoadingModules}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue
                  placeholder={
                    isLoadingModules ? "Loading modules..." : "Select a module"
                  }
                >
                  {selectedModuleTitle && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-[200px] inline-block">
                            {selectedModuleTitle}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{selectedModuleTitle}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id.toString()}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-[200px] inline-block">
                            {module.title}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{module.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content_type" className="text-right">
              Content Type
            </Label>
            <Select
              value={options.content_type}
              onValueChange={(value) =>
                setOptions({ ...options, content_type: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom_prompt" className="text-right">
              Custom Prompt
            </Label>
            <Input
              id="custom_prompt"
              value={options.custom_prompt}
              onChange={(e) =>
                setOptions({ ...options, custom_prompt: e.target.value })
              }
              className="col-span-3"
              placeholder="Optional custom prompt"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="difficulty_level" className="text-right">
              Difficulty
            </Label>
            <Select
              value={options.difficulty_level}
              onValueChange={(value) =>
                setOptions({ ...options, difficulty_level: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select difficulty" />
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
              value={options.tone}
              onValueChange={(value) => setOptions({ ...options, tone: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="target_audience" className="text-right">
              Audience
            </Label>
            <Select
              value={options.target_audience}
              onValueChange={(value) =>
                setOptions({ ...options, target_audience: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="professionals">Professionals</SelectItem>
                <SelectItem value="beginners">Beginners</SelectItem>
                <SelectItem value="experts">Experts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label>Include</Label>
            </div>
            <div className="col-span-3 flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_examples"
                  checked={options.include_examples}
                  onCheckedChange={(checked) =>
                    setOptions({
                      ...options,
                      include_examples: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="include_examples">Examples</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_exercises"
                  checked={options.include_exercises}
                  onCheckedChange={(checked) =>
                    setOptions({
                      ...options,
                      include_exercises: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="include_exercises">Exercises</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleGenerate}
            disabled={isGenerating || !selectedModuleId}
            className="rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
          >
            {isGenerating ? "Generating..." : "Generate Content"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
