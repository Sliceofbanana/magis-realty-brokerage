"use client";

import { useCallback, useMemo, useState } from "react";
import type { CheckState } from "@/components/ui/Checkbox";

/**
 * Row selection for bulk actions. `selectableIds` is every row currently shown
 * that may be selected; selected ids that are no longer in it (filtered away,
 * deleted) are ignored, so `selectedIds` never holds a hidden row.
 *
 * The header checkbox: nothing/some selected -> click selects all; all
 * selected -> click clears.
 */
export function useRowSelection(selectableIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedIds = useMemo(() => selectableIds.filter((id) => selected.has(id)), [selectableIds, selected]);

  const headerState: CheckState =
    selectedIds.length === 0 ? "unchecked" : selectedIds.length === selectableIds.length ? "checked" : "indeterminate";

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected(headerState === "checked" ? new Set() : new Set(selectableIds));
  }, [headerState, selectableIds]);

  const clear = useCallback(() => setSelected(new Set()), []);

  return { selectedIds, headerState, isSelected, toggle, toggleAll, clear };
}
