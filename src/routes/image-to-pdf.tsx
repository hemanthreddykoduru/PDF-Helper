import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Image as ImageIcon, GripVertical, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { imagesToPdf } from "@/utils/pdfHelpers";
import { downloadBlob, addRecent } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/image-to-pdf")({
  head: () => ({
    meta: [
      { title: "Image to PDF — PaperKnife" },
      { name: "description", content: "Convert JPG, PNG, or WEBP images into a PDF." },
    ],
  }),
  component: ImageToPdf,
});

type Item = { id: string; file: File; url: string };

function Tile({ item, onRemove }: { item: Item; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-white",
        isDragging && "opacity-60",
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab touch-none active:cursor-grabbing">
        <img src={item.url} alt={item.file.name} className="block h-40 w-full object-cover" />
      </div>
      <div className="flex items-center justify-between gap-1 border-t border-border bg-surface px-2 py-1">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate text-[11px]">{item.file.name}</span>
        <button onClick={onRemove} className="rounded p-1 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ImageToPdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "Fit">("A4");
  const [busy, setBusy] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(
    () => () => {
      items.forEach((i) => URL.revokeObjectURL(i.url));
    },
    [items],
  );

  const add = (files: File[]) =>
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        url: URL.createObjectURL(f),
      })),
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

  const build = async () => {
    if (!items.length) return;
    setBusy(true);
    try {
      const bytes = await imagesToPdf(items.map((i) => i.file), pageSize);
      downloadBlob(bytes, "images.pdf");
      addRecent({ name: "images.pdf", size: bytes.byteLength, operation: "Image → PDF" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="Image to PDF"
        description="Combine JPG, PNG or WEBP into a single PDF. Drag to reorder."
        icon={<ImageIcon className="h-5 w-5" />}
      />

      <FileDropzone
        multiple
        accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
        onFiles={add}
        label="Drop images here"
        hint="JPG, PNG, WEBP"
      />

      {items.length > 0 && (
        <>
          <div className="mt-5 mb-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Page size:</label>
            {(["A4", "Letter", "Fit"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setPageSize(s)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium",
                  pageSize === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface hover:border-primary/50",
                )}
              >
                {s === "Fit" ? "Fit to image" : s}
              </button>
            ))}
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((it) => (
                  <Tile
                    key={it.id}
                    item={it}
                    onRemove={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setItems([])}>
              Clear
            </Button>
            <Button onClick={build} loading={busy}>
              Convert to PDF
            </Button>
          </div>
        </>
      )}
    </ToolPage>
  );
}
