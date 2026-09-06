"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { GalleryItem } from "@/lib/gallery";

function SortableTile({
  item,
  onDelete,
}: {
  item: GalleryItem;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const thumb =
    item.type === "video" ? (item.poster_url ?? item.url) : item.url;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-200 cursor-grab active:cursor-grabbing"
    >
      <img
        src={thumb}
        alt={item.alt}
        loading="lazy"
        className="h-full w-full object-cover pointer-events-none"
      />
      {item.type === "video" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-white text-2xl drop-shadow"
        >
          ▶
        </span>
      )}
      <button
        type="button"
        aria-label="Supprimer ce média"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (
            window.confirm(`Supprimer définitivement ce média ?\n\n${item.alt}`)
          ) {
            onDelete(item.id);
          }
        }}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </svg>
      </button>
      <span className="absolute left-2 bottom-2 rounded bg-black/50 px-1.5 py-0.5 text-[11px] text-white">
        #{item.sort_order}
      </span>
    </div>
  );
}

export default function SortableGrid({
  items,
  onReorder,
  onDelete,
}: {
  items: GalleryItem[];
  onReorder: (next: GalleryItem[]) => void;
  onDelete: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => it.id === active.id);
    const newIndex = items.findIndex((it) => it.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((it) => it.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <SortableTile key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
