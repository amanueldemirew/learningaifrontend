import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarResizeHandleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right";
  onWidthChange?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export const SidebarResizeHandle = React.forwardRef<
  HTMLDivElement,
  SidebarResizeHandleProps
>(
  (
    {
      className,
      side = "left",
      onWidthChange,
      minWidth = 200,
      maxWidth = 400,
      ...props
    },
    ref
  ) => {
    const [isResizing, setIsResizing] = React.useState(false);
    const startX = React.useRef(0);
    const startWidth = React.useRef(0);

    const handleMouseDown = React.useCallback(
      (e: React.MouseEvent) => {
        setIsResizing(true);
        startX.current = e.clientX;
        startWidth.current = e.currentTarget.parentElement?.offsetWidth || 0;
        document.body.style.cursor =
          side === "left" ? "ew-resize" : "ew-resize";
        document.body.style.userSelect = "none";
      },
      [side]
    );

    const handleMouseMove = React.useCallback(
      (e: MouseEvent) => {
        if (!isResizing) return;

        const delta =
          side === "left"
            ? e.clientX - startX.current
            : startX.current - e.clientX;

        const newWidth = Math.min(
          Math.max(startWidth.current + delta, minWidth),
          maxWidth
        );

        const target = e.currentTarget as HTMLElement;
        if (target && target.parentElement) {
          target.parentElement.style.width = `${newWidth}px`;
        }

        if (onWidthChange) {
          onWidthChange(newWidth);
        }
      },
      [isResizing, side, minWidth, maxWidth, onWidthChange]
    );

    const handleMouseUp = React.useCallback(() => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }, []);

    React.useEffect(() => {
      if (isResizing) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      }
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-1 -translate-x-1/2 cursor-ew-resize transition-colors sm:block",
          side === "left" ? "right-0" : "left-0",
          "hover:bg-sidebar-border focus:bg-sidebar-border",
          isResizing && "bg-sidebar-border",
          className
        )}
        onMouseDown={handleMouseDown}
        {...props}
      />
    );
  }
);

SidebarResizeHandle.displayName = "SidebarResizeHandle";
