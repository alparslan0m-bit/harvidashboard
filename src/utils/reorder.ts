import { arrayMove } from "@dnd-kit/sortable";

export interface ReorderItem {
  id: string;
  order_index: number;
}

export interface HasId {
  id: string;
}

export function buildReorderPayload<T extends HasId>(
  items: T[],
  activeId: string | number,
  overId: string | number,
): ReorderItem[] {
  const oldIndex = items.findIndex((item) => item.id === activeId);
  const newIndex = items.findIndex((item) => item.id === overId);

  if (oldIndex === -1 || newIndex === -1) {
    return [];
  }

  const reordered = arrayMove(items, oldIndex, newIndex);
  return reordered.map((item, idx) => ({
    id: item.id,
    order_index: idx,
  }));
}
