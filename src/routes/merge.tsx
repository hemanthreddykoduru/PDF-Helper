import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Combine, GripVertical, Trash2, FileText } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { mergePdfs, getPageCount } from "@/utils/pdfHelpers";
import { downloadBlob, formatBytes, addRecent } from "@/utils/fileUtils";

export const Route = createFileRoute("/merge")({
  head: () => ({
    meta: [
      { title: "Merge PDFs — PaperKnife" },
      { name: "description", content: "Combine multiple PDFs into one, 100% in your browser." },
    ],
  }),
  component: MergeTool,
});

type Item = { id: string; file: File; pages: number | null };

function Row({ item, onRemove }: { item: Item; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <FileText className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{item.file.name}</div>
        <div className="text-xs text-muted-foreground">
          {formatBytes(item.file.size)} · {item.pages ?? "…"} pages
        </div>
      </div>
      <button
        onClick={onRemove}
        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
        aria-label="Remove file"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function MergeTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    items.forEach(async (it) => {
      if (it.pages !== null) return;
      try {
        const p = await getPageCount(it.file);
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, pages: p } : x)));
      } catch {
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, pages: 0 } : x)));
      }
    });
  }, [items]);

  const addFiles = (files: File[]) =>
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({ id: `${Date.now()}-${f.name}-${Math.random()}`, file: f, pages: null })),
    ]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIdx = prev.findIndex((i) => i.id === active.id);
      const newIdx = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const onMerge = async () => {
    if (items.length < 2) return;
    setBusy(true);
    try {
      const bytes = await mergePdfs(items.map((i) => i.file));
      downloadBlob(bytes, "merged.pdf");
      addRecent({
        name: `merged-${items.length}-files.pdf`,
        size: bytes.byteLength,
        operation: "Merge",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="Merge PDFs"
        description="Drop multiple PDFs, drag to reorder, then combine into a single file."
        icon={<Combine className="h-5 w-5" />}
      />

      <FileDropzone
        multiple
        onFiles={addFiles}
        label="Drop PDFs here"
        hint="Add as many as you need, reorder below"
      />

      {items.length > 0 && (
        <div className="mt-6 space-y-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((it) => (
                <Row
                  key={it.id}
                  item={it}
                  onRemove={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {items.length === 0
            ? "Add at least 2 PDFs to merge."
            : `${items.length} file${items.length === 1 ? "" : "s"} selected`}
        </div>
        <div className="flex gap-2">
          {items.length > 0 && (
            <Button variant="ghost" onClick={() => setItems([])}>
              Clear all
            </Button>
          )}
          <Button onClick={onMerge} loading={busy} disabled={items.length < 2}>
            Merge & download
          </Button>
        </div>
      </div>
    </ToolPage>
  );
}
