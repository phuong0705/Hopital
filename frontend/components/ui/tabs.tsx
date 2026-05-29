"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  value,
  onValueChange,
  children,
  className
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className} data-value={value}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{ activeValue?: string; onValueChange?: (value: string) => void }>, {
          activeValue: value,
          onValueChange
        });
      })}
    </div>
  );
}

export function TabsList({
  activeValue,
  onValueChange,
  children,
  className
}: {
  activeValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 rounded-lg border bg-card p-1 shadow-sm sm:flex", className)} role="tablist">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{ activeValue?: string; onValueChange?: (value: string) => void }>, {
          activeValue,
          onValueChange
        });
      })}
    </div>
  );
}

export function TabsTrigger({
  value,
  activeValue,
  onValueChange,
  children,
  className
}: {
  value: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const selected = activeValue === value;
  const handleSelect = () => onValueChange?.(value);

  return (
    <button
      aria-selected={selected}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors",
        selected ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      data-state={selected ? "active" : "inactive"}
      role="tab"
      type="button"
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
    >
      {children}
    </button>
  );
}
