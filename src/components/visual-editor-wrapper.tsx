"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  initializeVisualEditor,
  cleanupVisualEditor,
} from "@/lib/visual-editor";

interface VisualEditorWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that initializes Directus Visual Editor.
 * Only activates when the page is loaded inside the Directus Visual Editor iframe.
 */
export function VisualEditorWrapper({ children }: VisualEditorWrapperProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (document.readyState === "complete") {
      initializeVisualEditor();
    } else {
      window.addEventListener("load", initializeVisualEditor);
      return () => {
        window.removeEventListener("load", initializeVisualEditor);
        cleanupVisualEditor();
      };
    }

    return () => {
      cleanupVisualEditor();
    };
  }, [pathname]);

  return <>{children}</>;
}
