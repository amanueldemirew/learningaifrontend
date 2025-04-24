"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Handle hydration mismatch by only rendering client-side content after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Auth Status */}
          <div className="flex justify-between items-center mb-8">
            <div>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-32" />
                </div>
              ) : user ? (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${user.username}.png`}
                          alt={user.username}
                        />
                        <AvatarFallback>
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        Welcome, {user.username}!
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${user.username}.png`}
                          alt={user.username}
                        />
                        <AvatarFallback>
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">
                          {user.username}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex items-center pt-1">
                          <Badge variant="outline" className="text-xs">
                            Student
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <p className="text-muted-foreground">
                  Please log in to continue
                </p>
              )}
            </div>
            <div>
              {isClient && user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : isClient ? (
                <Link href="/login">
                  <Button variant="default" size="sm">
                    Login
                  </Button>
                </Link>
              ) : (
                <Skeleton className="h-9 w-20" />
              )}
            </div>
          </div>

          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Welcome to Learning AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore interactive courses on artificial intelligence, machine
              learning, and data science. Learn at your own pace with our
              comprehensive curriculum.
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="featured" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="featured">Featured Courses</TabsTrigger>
              <TabsTrigger value="recent">Recently Added</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>
            <TabsContent value="featured">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CourseCard
                  title="Introduction to Machine Learning"
                  description="Learn the fundamentals of machine learning algorithms and their applications."
                  badge="Beginner"
                />
                <CourseCard
                  title="Deep Learning with Neural Networks"
                  description="Explore deep learning architectures and build your own neural networks."
                  badge="Intermediate"
                />
                <CourseCard
                  title="Natural Language Processing"
                  description="Master techniques for processing and understanding human language."
                  badge="Advanced"
                />
              </div>
            </TabsContent>
            <TabsContent value="recent">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CourseCard
                  title="Computer Vision Fundamentals"
                  description="Learn how to process and analyze visual data using computer vision techniques."
                  badge="New"
                />
                <CourseCard
                  title="Reinforcement Learning"
                  description="Understand how agents learn to make decisions through interaction with environments."
                  badge="New"
                />
                <CourseCard
                  title="AI Ethics and Responsible AI"
                  description="Explore the ethical considerations and responsible practices in AI development."
                  badge="New"
                />
              </div>
            </TabsContent>
            <TabsContent value="popular">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CourseCard
                  title="Python for Data Science"
                  description="Master Python programming for data analysis and visualization."
                  badge="Popular"
                />
                <CourseCard
                  title="TensorFlow and PyTorch"
                  description="Learn to build and deploy models using popular deep learning frameworks."
                  badge="Popular"
                />
                <CourseCard
                  title="AI for Business"
                  description="Understand how AI can transform business processes and decision-making."
                  badge="Popular"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-none">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <Sparkles className="h-12 w-12 text-primary" />
                  <h2 className="text-2xl font-bold">
                    Ready to start learning?
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Join our community of learners and start your AI journey
                    today.
                  </p>
                  <Link href="/courses">
                    <Button size="lg" className="mt-4">
                      Browse All Courses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Course Card Component
function CourseCard({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="h-48 bg-muted relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
        <div className="absolute top-3 right-3 z-20">
          <Badge variant="secondary">{badge}</Badge>
        </div>
        <div className="absolute bottom-3 left-3 z-20">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="ghost" className="w-full justify-between">
          View Course
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
