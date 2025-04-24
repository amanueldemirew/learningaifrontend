"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import { cn } from "@/lib/utils";
import { userApi } from "@/services/api";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  useApi?: boolean;
}

export function UserAvatar({
  user,
  size = "md",
  className,
  useApi = false,
}: UserAvatarProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (useApi && user?.profile_photo) {
      setIsLoading(true);
      userApi
        .getProfilePhoto()
        .then((url) => {
          setPhotoUrl(url);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading profile photo:", err);
          setIsLoading(false);
        });
    }
  }, [useApi, user]);

  if (!user) {
    return (
      <Avatar
        className={cn(
          size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10",
          className
        )}
      >
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
  }

  const initials = user.username.charAt(0).toUpperCase();
  const imageUrl = useApi ? photoUrl : user.profile_photo || "";

  return (
    <Avatar
      className={cn(
        size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10",
        className
      )}
    >
      {isLoading ? (
        <AvatarFallback>...</AvatarFallback>
      ) : (
        <>
          <AvatarImage src={imageUrl || ""} alt={user.username} />
          <AvatarFallback>{initials}</AvatarFallback>
        </>
      )}
    </Avatar>
  );
}
