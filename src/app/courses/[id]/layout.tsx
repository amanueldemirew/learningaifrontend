import { ReactNode } from "react";

interface CourseLayoutProps {
  children: ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseLayout({
  children,
  params,
}: CourseLayoutProps) {
  const resolvedParams = await params;
  return <div className="p-4">{children}</div>;
}
