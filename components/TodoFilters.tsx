"use client";

import { Button } from "@/components/ui/button";

type Filter = "all" | "active" | "completed";

type TodoFiltersProps = {
  currentFilter: Filter;
  onFilterChange: (filter: Filter) => void;
};

export function TodoFilters({
  currentFilter,
  onFilterChange,
}: TodoFiltersProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant={currentFilter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
        aria-current={currentFilter === "all" ? "page" : undefined}
      >
        All
      </Button>
      <Button
        variant={currentFilter === "active" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("active")}
        aria-current={currentFilter === "active" ? "page" : undefined}
      >
        Active
      </Button>
      <Button
        variant={currentFilter === "completed" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("completed")}
        aria-current={currentFilter === "completed" ? "page" : undefined}
      >
        Completed
      </Button>
    </div>
  );
}
