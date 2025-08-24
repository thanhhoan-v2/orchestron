"use client";

import { useEffect } from "react";

interface KeyboardHandlerProps {
  onSearchOpen: () => void;
  onDailyDev: () => void;
  onNewBookmark: () => void;
  onNewReminder: () => void;
}

export function KeyboardHandler({
  onSearchOpen,
  onDailyDev,
  onNewBookmark,
  onNewReminder,
}: KeyboardHandlerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if no input element is focused and no modifier keys except for specific cases
      const target = event.target as HTMLElement;
      const isInputFocused = 
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      // Don't handle shortcuts when typing in inputs, unless it's a command palette action
      if (isInputFocused && !event.metaKey && !event.ctrlKey) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "c":
          if (event.ctrlKey && !event.metaKey && !isInputFocused) {
            event.preventDefault();
            onSearchOpen();
          }
          break;
        case "d":
          if (!event.metaKey && !event.ctrlKey && !isInputFocused) {
            event.preventDefault();
            onDailyDev();
          }
          break;
        case "2":
          if (!event.metaKey && !event.ctrlKey && !isInputFocused) {
            event.preventDefault();
            onNewBookmark();
          }
          break;
        case "3":
          if (!event.metaKey && !event.ctrlKey && !isInputFocused) {
            event.preventDefault();
            onNewReminder();
          }
          break;
        case "escape":
          // This will be handled by individual modals
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSearchOpen, onDailyDev, onNewBookmark, onNewReminder]);

  return null; // This component doesn't render anything
}
