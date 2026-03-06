import { useState, useCallback } from 'react';

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function useMultiSelect<T extends { id: string; position_x: number; position_y: number; width: number; height: number }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const selectSingle = useCallback((id: string, addToSelection = false) => {
    setSelectedIds(prev => {
      const newSet = addToSelection ? new Set(prev) : new Set<string>();
      if (prev.has(id) && addToSelection) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedIds.has(item.id));
  }, [items, selectedIds]);

  const startSelectionBox = useCallback((x: number, y: number) => {
    setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
  }, []);

  const updateSelectionBox = useCallback((x: number, y: number) => {
    setSelectionBox(prev => prev ? { ...prev, endX: x, endY: y } : null);
  }, []);

  const endSelectionBox = useCallback(() => {
    if (!selectionBox) return;

    const minX = Math.min(selectionBox.startX, selectionBox.endX);
    const maxX = Math.max(selectionBox.startX, selectionBox.endX);
    const minY = Math.min(selectionBox.startY, selectionBox.endY);
    const maxY = Math.max(selectionBox.startY, selectionBox.endY);

    const selectedItems = items.filter(item => {
      const itemRight = item.position_x + item.width;
      const itemBottom = item.position_y + item.height;

      return (
        item.position_x < maxX &&
        itemRight > minX &&
        item.position_y < maxY &&
        itemBottom > minY
      );
    });

    setSelectedIds(new Set(selectedItems.map(item => item.id)));
    setSelectionBox(null);
  }, [selectionBox, items]);

  const cancelSelectionBox = useCallback(() => {
    setSelectionBox(null);
  }, []);

  const getSelectionBoxStyle = useCallback(() => {
    if (!selectionBox) return null;

    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const width = Math.abs(selectionBox.endX - selectionBox.startX);
    const height = Math.abs(selectionBox.endY - selectionBox.startY);

    return { left, top, width, height };
  }, [selectionBox]);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    selectSingle,
    selectMultiple,
    selectAll,
    clearSelection,
    toggleSelection,
    getSelectedItems,
    selectionBox,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    cancelSelectionBox,
    getSelectionBoxStyle,
  };
}
