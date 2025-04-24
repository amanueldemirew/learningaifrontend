import { useState, useEffect, useCallback } from "react";

const SIDEBAR_STORAGE_KEY = "sidebar_state";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

export function useSidebarState(defaultOpen = true) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return defaultOpen;
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultOpen;
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const setOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setIsOpen((prev: boolean) => {
        const newValue = typeof value === "function" ? value(prev) : value;
        localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newValue));
        return newValue;
      });
    },
    []
  );

  const toggleSidebar = useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return {
    isOpen,
    setOpen,
    toggleSidebar,
    isMobileOpen,
    setMobileOpen: setIsMobileOpen,
  };
}
