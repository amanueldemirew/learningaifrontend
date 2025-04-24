import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarBackdrop = React.forwardRef<
  HTMLDivElement,
  SidebarBackdropProps
>(({ className, isOpen, onClose, ...props }, ref) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity",
        isOpen ? "opacity-100" : "opacity-0",
        className
      )}
      onClick={onClose}
      {...props}
    />
  );
});

SidebarBackdrop.displayName = "SidebarBackdrop";
