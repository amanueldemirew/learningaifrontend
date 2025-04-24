"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="flex items-center space-x-4">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Home
      </Link>
      <Link
        href="/courses"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/courses" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Courses
      </Link>
      <Link
        href="/published-courses"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/published-courses"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Published Courses
      </Link>
      {user && (
        <Link
          href="/profile"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/profile" ? "text-primary" : "text-muted-foreground"
          )}
        >
          Profile
        </Link>
      )}
    </nav>
  );
}
