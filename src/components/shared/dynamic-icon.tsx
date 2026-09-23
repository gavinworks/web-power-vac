"use client";

import { Icon } from "@iconify/react";

interface DynamicIconProps {
  name: string;
  className?: string;
}

// Convert PascalCase to kebab-case (e.g., "ArrowRight" -> "arrow-right", "Share2" -> "share-2")
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .replace(/(\d)([a-zA-Z])/g, "$1-$2")
    .toLowerCase();
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  if (!name) return null;

  // Convert PascalCase icon name to Iconify Lucide format
  const iconName = `lucide:${toKebabCase(name)}`;

  return <Icon icon={iconName} className={className} />;
}
