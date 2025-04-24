"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Copy, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Define types for the parameters
interface GenerationParams {
  length?: string;
  style?: string;
  difficulty?: string;
  audience?: string;
  count?: number;
  include_solutions?: boolean;
  format?: string;
  [key: string]: string | number | boolean | undefined;
}

interface AIContentGeneratorProps {
  unitId: number;
  moduleId: number;
  unitTitle: string;
}

// API functions
const generateSummary = async (unitId: number, params: GenerationParams) => {
  const response = await fetch(`/api/v1/ai/generate/summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      unit_id: unitId,
      ...params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate summary");
  }

  return response.json();
};

const generateExample = async (unitId: number, params: GenerationParams) => {
  const response = await fetch(`/api/v1/ai/generate/example`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      unit_id: unitId,
      ...params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate examples");
  }

  return response.json();
};

const generateExercise = async (unitId: number, params: GenerationParams) => {
  const response = await fetch(`/api/v1/ai/generate/exercise`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      unit_id: unitId,
      ...params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate exercises");
  }

  return response.json();
};

const batchGenerateContent = async (moduleId: number, types: string[]) => {
  const response = await fetch(
    `/api/v1/ai/generate/batch?module_id=${moduleId}&generation_types=${types.join(
      ","
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to start batch generation");
  }

  return response.json();
};

export default function AIContentGenerator({
  unitId,
  moduleId,
  unitTitle,
}: AIContentGeneratorProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Summary parameters
  const [summaryLength, setSummaryLength] = useState("medium");
  const [summaryStyle, setSummaryStyle] = useState("academic");
  const [summaryDifficulty, setSummaryDifficulty] = useState("intermediate");
  const [summaryAudience, setSummaryAudience] = useState("students");

  // Example parameters
  const [exampleCount, setExampleCount] = useState(3);
  const [exampleDifficulty, setExampleDifficulty] = useState("intermediate");
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [exampleFormat, setExampleFormat] = useState("markdown");

  // Exercise parameters
  const [exerciseCount, setExerciseCount] = useState(5);
  const [exerciseDifficulty, setExerciseDifficulty] = useState("intermediate");
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [exerciseFormat, setExerciseFormat] = useState("markdown");

  // Batch generation parameters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "summary",
    "example",
    "exercise",
  ]);

  useEffect(() => {
    return () => {
      // Clean up WebSocket connection on component unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = (id: string) => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    const ws = new WebSocket(
      `ws://${window.location.host}/api/v1/ai/ws/generation/${id}`
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setStatus(data.message);

      if (data.status === "completed" || data.status === "failed") {
        setIsBatchGenerating(false);
        if (data.status === "completed") {
          toast.success("Batch generation completed successfully");
        } else {
          toast.error(`Batch generation failed: ${data.message}`);
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Error connecting to generation service");
      setIsBatchGenerating(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    wsRef.current = ws;
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSummary(unitId, {
        length: summaryLength,
        style: summaryStyle,
        difficulty_level: summaryDifficulty,
        target_audience: summaryAudience,
      });

      setGeneratedContent(result.data.content.content);
      toast.success("Summary generated successfully");
    } catch (error) {
      toast.error(
        `Error generating summary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExample = async () => {
    setIsGenerating(true);
    try {
      const result = await generateExample(unitId, {
        count: exampleCount,
        difficulty_level: exampleDifficulty,
        include_solutions: includeSolutions,
        format: exampleFormat,
      });

      setGeneratedContent(result.data.content.content);
      toast.success("Examples generated successfully");
    } catch (error) {
      toast.error(
        `Error generating examples: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExercise = async () => {
    setIsGenerating(true);
    try {
      const result = await generateExercise(unitId, {
        count: exerciseCount,
        difficulty_level: exerciseDifficulty,
        include_answer_key: includeAnswerKey,
        format: exerciseFormat,
      });

      setGeneratedContent(result.data.content.content);
      toast.success("Exercises generated successfully");
    } catch (error) {
      toast.error(
        `Error generating exercises: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchGenerate = async () => {
    setIsBatchGenerating(true);
    setProgress(0);
    setStatus("Starting batch generation...");

    try {
      const result = await batchGenerateContent(moduleId, selectedTypes);
      connectWebSocket(result.data.batch_id);
      toast.success("Batch generation started");
    } catch (error) {
      toast.error(
        `Error starting batch generation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setIsBatchGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Content copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${unitTitle}-${activeTab}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Content Generator</CardTitle>
            <CardDescription>
              Generate AI-powered content for {unitTitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="example">Examples</TabsTrigger>
                <TabsTrigger value="exercise">Exercises</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="summary-length">Length</Label>
                  <Select
                    value={summaryLength}
                    onValueChange={setSummaryLength}
                  >
                    <SelectTrigger id="summary-length">
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary-style">Style</Label>
                  <Select value={summaryStyle} onValueChange={setSummaryStyle}>
                    <SelectTrigger id="summary-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="conversational">
                        Conversational
                      </SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary-difficulty">Difficulty Level</Label>
                  <Select
                    value={summaryDifficulty}
                    onValueChange={setSummaryDifficulty}
                  >
                    <SelectTrigger id="summary-difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary-audience">Target Audience</Label>
                  <Select
                    value={summaryAudience}
                    onValueChange={setSummaryAudience}
                  >
                    <SelectTrigger id="summary-audience">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="professionals">
                        Professionals
                      </SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Summary"
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="example" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="example-count">Number of Examples</Label>
                  <Input
                    id="example-count"
                    type="number"
                    min={1}
                    max={10}
                    value={exampleCount}
                    onChange={(e) => setExampleCount(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="example-difficulty">Difficulty Level</Label>
                  <Select
                    value={exampleDifficulty}
                    onValueChange={setExampleDifficulty}
                  >
                    <SelectTrigger id="example-difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-solutions"
                    checked={includeSolutions}
                    onCheckedChange={setIncludeSolutions}
                  />
                  <Label htmlFor="include-solutions">Include Solutions</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="example-format">Format</Label>
                  <Select
                    value={exampleFormat}
                    onValueChange={setExampleFormat}
                  >
                    <SelectTrigger id="example-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="latex">LaTeX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerateExample}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Examples"
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="exercise" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exercise-count">Number of Exercises</Label>
                  <Input
                    id="exercise-count"
                    type="number"
                    min={1}
                    max={10}
                    value={exerciseCount}
                    onChange={(e) => setExerciseCount(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exercise-difficulty">Difficulty Level</Label>
                  <Select
                    value={exerciseDifficulty}
                    onValueChange={setExerciseDifficulty}
                  >
                    <SelectTrigger id="exercise-difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-answer-key"
                    checked={includeAnswerKey}
                    onCheckedChange={setIncludeAnswerKey}
                  />
                  <Label htmlFor="include-answer-key">Include Answer Key</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exercise-format">Format</Label>
                  <Select
                    value={exerciseFormat}
                    onValueChange={setExerciseFormat}
                  >
                    <SelectTrigger id="exercise-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="latex">LaTeX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerateExercise}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Exercises"
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batch Generation</CardTitle>
            <CardDescription>
              Generate multiple types of content for all units in this module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Content Types</Label>
              <div className="flex flex-wrap gap-2">
                {["summary", "example", "exercise"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`batch-${type}`}
                      checked={selectedTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes([...selectedTypes, type]);
                        } else {
                          setSelectedTypes(
                            selectedTypes.filter((t) => t !== type)
                          );
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={`batch-${type}`} className="capitalize">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {isBatchGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{status}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <Button
              onClick={handleBatchGenerate}
              disabled={isBatchGenerating || selectedTypes.length === 0}
              className="w-full"
            >
              {isBatchGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Batch Generate Content"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              {activeTab === "summary" && "Summary of the unit content"}
              {activeTab === "example" && "Examples related to the unit"}
              {activeTab === "exercise" && "Exercises for practice"}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyToClipboard}
              disabled={!generatedContent}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              disabled={!generatedContent}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-8rem)] overflow-auto">
          {generatedContent ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {generatedContent}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>Generated content will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
