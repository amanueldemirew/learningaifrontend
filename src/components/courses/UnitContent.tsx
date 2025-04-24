"use client";

// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";
import { toast } from "sonner";
import {
  getUnitContents,
  getPublicUnitContents,
  generateContent,
  deleteContent,
  ContentGenerationOptions,
  PaginatedContentResponse,
} from "@/services/contents";
import { AIContentDialog } from "@/components/ai/AIContentDialog";
import { Button } from "@/components/ui/button";
import { Wand2, Trash2 } from "lucide-react"; // Removed Code, Copy, Check
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { cn } from "@/lib/utils";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer"; // Import the new component

// Removed CodeBlock component definition
// const CodeBlock = ({ ... }) => { ... };

interface UnitContentProps {
  unitId: number;
  isPublic?: boolean;
}

export function UnitContent({ unitId, isPublic = false }: UnitContentProps) {
  const [content, setContent] = useState<PaginatedContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the appropriate function based on whether this is a public view
      const contentData = isPublic
        ? await getPublicUnitContents(unitId)
        : await getUnitContents(unitId);

      setContent(contentData);
    } catch (error) {
      console.error("Error fetching content:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load content"
      );
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [unitId, isPublic]);

  useEffect(() => {
    if (unitId) {
      fetchContent();
    }
  }, [fetchContent, unitId]);

  const handleGenerateContent = useCallback(
    async (options: ContentGenerationOptions) => {
      try {
        setIsGenerating(true);
        if (!options.content_type) {
          options.content_type = "text";
        }
        await generateContent(unitId, options);
        await fetchContent();
        toast.success("Content generated successfully");
        setIsAIDialogOpen(false);
      } catch (err) {
        console.error("Error generating content:", err);
        toast.error("Failed to generate content. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    },
    [unitId, fetchContent]
  );

  const handleDeleteContent = useCallback(
    async (contentId: number) => {
      try {
        await deleteContent(contentId);
        toast.success("Content deleted successfully");
        await fetchContent(); // Refresh content after deletion
        // If after deletion there's no content left, handle appropriately
        // This might involve checking the fetched content length after deletion
        // For now, just refetching.
      } catch (err) {
        console.error("Error deleting content:", err);
        toast.error("Failed to delete content. Please try again.");
      }
    },
    [fetchContent] // Removed unitId dependency as it's already included in fetchContent
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mt-4" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!content?.items.length) {
    return (
      <>
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No content available for this unit
              </p>
              {!isPublic && (
                <Button
                  onClick={() => setIsAIDialogOpen(true)}
                  className="mt-4"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Content
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        {!isPublic && (
          <AIContentDialog
            open={isAIDialogOpen}
            onOpenChange={setIsAIDialogOpen}
            onGenerate={handleGenerateContent}
            isGenerating={isGenerating}
            selectedItemType="unit"
          />
        )}
      </>
    );
  }

  const currentContent = content.items[0]; // Assuming we always display the first item

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{currentContent.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              {!isPublic && <span>Order: {currentContent.order}</span>}
              {currentContent.is_ai_generated && !isPublic && (
                <Badge
                  variant="outline"
                  className="text-blue-500 border-blue-500"
                >
                  AI Generated
                </Badge>
              )}
            </div>
          </div>
          {!isPublic && (
            <div className="flex gap-2">
              <Button onClick={() => setIsAIDialogOpen(true)} variant="outline">
                <Wand2 className="mr-2 h-4 w-4" />
                Generate More
              </Button>
              <Button
                onClick={() => handleDeleteContent(currentContent.id)}
                variant="outline"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {!isPublic && (
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="content">
              <ScrollArea className="h-[calc(100vh-300px)] p-1">
                {" "}
                {/* Added padding for scrollbar */}
                <MarkdownRenderer
                  content={currentContent.content}
                  className="prose max-w-none dark:prose-invert"
                />{" "}
                {/* Use MarkdownRenderer */}
              </ScrollArea>
            </TabsContent>
            {!isPublic && (
              <TabsContent value="markdown">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                    {currentContent.content}
                  </pre>
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div>
            Last updated:{" "}
            {currentContent.updated_at
              ? new Date(currentContent.updated_at).toLocaleDateString()
              : "N/A"}
          </div>
          {!isPublic && <div>ID: {currentContent.id}</div>}
        </CardFooter>
      </Card>

      {!isPublic && (
        <AIContentDialog
          open={isAIDialogOpen}
          onOpenChange={setIsAIDialogOpen}
          onGenerate={handleGenerateContent}
          isGenerating={isGenerating}
          selectedItemType="unit"
        />
      )}
    </>
  );
}
