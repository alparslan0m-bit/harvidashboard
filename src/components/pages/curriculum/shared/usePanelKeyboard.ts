import { useEffect } from "react";

interface PanelKeyboardOptions<T extends { id: string; name: string }> {
  isFocused: boolean;
  isCreating: boolean;
  isEditing: boolean;
  focusedId: string | null;
  items: T[];
  onCreate: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onCancelCreate: () => void;
  onCancelEdit: () => void;
  onClearFocus: () => void;
}

export function usePanelKeyboard<T extends { id: string; name: string }>({
  isFocused,
  isCreating,
  isEditing,
  focusedId,
  items,
  onCreate,
  onEdit,
  onDelete,
  onSelect,
  onCancelCreate,
  onCancelEdit,
  onClearFocus,
}: PanelKeyboardOptions<T>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;

      const key = e.key?.toLowerCase();
      if (key === "n" && !isCreating && !isEditing) {
        e.preventDefault();
        onCreate();
      } else if (key === "e" && focusedId && !isEditing) {
        e.preventDefault();
        const item = items.find((i) => i.id === focusedId);
        if (item) onEdit(item);
      } else if ((key === "delete" || key === "backspace") && focusedId) {
        e.preventDefault();
        onDelete(focusedId);
      } else if (key === "enter" && focusedId && !isEditing) {
        e.preventDefault();
        onSelect(focusedId);
      } else if (key === "escape") {
        e.preventDefault();
        if (isCreating) onCancelCreate();
        else if (isEditing) onCancelEdit();
        else onClearFocus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFocused, isCreating, isEditing, focusedId, items,
    onCreate, onEdit, onDelete, onSelect, onCancelCreate, onCancelEdit, onClearFocus,
  ]);
}
