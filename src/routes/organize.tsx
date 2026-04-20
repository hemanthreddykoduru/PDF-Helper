import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
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
import { useThumbnails } from "@/hooks/useThumbnails";
import { saveWithReorderAndRotation, type RotatePlan } from "@/utils/pdfHelpers";
import { downloadBlob, stripExtension, addRecent } from "@/utils/fileUtils";

export const Route = createFileRoute("/organize")({
  head: () => ({
    meta: [
      { title: "Rotate & Reorder Pages — PaperKnife" },
      { name: "description", content: "Rotate and rearrange PDF pages with drag-and-drop." },
    ],
  }),
  component: OrganizeTool,
});

type Item = { id: string; originalIndex: number; dataUrl: string };

function Thumb({
  item,
  rotation,
  onRotate,
}: {
  item: Item;
  rotation: number;
  onRotate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative overflow-hidden rounded-lg border border-border bg-white ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <div
          className="flex items-center justify-center bg-white p-2"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <img src={item.dataUrl} alt="" className="max-h-48 w-auto" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-surface px-2 py-1">
        <span className="text-[11px] font-medium text-foreground">Page {item.originalIndex + 1}</span>
        <button
          onClick={onRotate}
          className="rounded p-1 hover:bg-muted"
          aria-label="Rotate"
        >
          <RotateCw className="h-3.5 w-3.5 text-primary" />
        </button>
      </div>
    </div>
  );
}

function OrganizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [rotations, setRotations] = useState<RotatePlan>({});
  const [busy, setBusy] = useState(false);
  const { thumbs, loading } = useThumbnails(file);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    if (thumbs.length && items.length === 0) {
      setItems(thumbs.map((t) => ({ id: `p${t.page}`, originalIndex: t.page - 1, dataUrl: t.dataUrl })));
    }
  }, [thumbs, items.length]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIdx = prev.findIndex((i) => i.id === active.id);
      const newIdx = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const rotate = (originalIndex: number) =>
    setRotations((r) => {
      const next = (((r[originalIndex] ?? 0) + 90) % 360) as 0 | 90 | 180 | 270;
      return { ...r, [originalIndex]: next };
    });

  const save = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const order = items.map((i) => i.originalIndex);
      const bytes = await saveWithReorderAndRotation(file, order, rotations);
      const name = `${stripExtension(file.name)}-organized.pdf`;
      downloadBlob(bytes, name);
      addRecent({ name, size: bytes.byteLength, operation: "Rotate & reorder" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="Rotate & Reorder"
        description="Drag pages to rearrange, click the arrow to rotate 90°."
        icon={<RotateCw className="h-5 w-5" />}
      />

      {!file && <FileDropzone onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <span className="truncate font-medium">{file.name}</span>
            <button
              onClick={() => {
                setFile(null);
                setItems([]);
                setRotations({});
              }}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Change file
            </button>
          </div>

          {loading && <div className="py-10 text-center text-muted-foreground">Rendering pages…</div>}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((it) => (
                  <Thumb
                    key={it.id}
                    item={it}
                    rotation={rotations[it.originalIndex] ?? 0}
                    onRotate={() => rotate(it.originalIndex)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-6 flex justify-end">
            <Button onClick={save} loading={busy} disabled={!items.length}>
              Save as new PDF
            </Button>
          </div>
        </>
      )}
    </ToolPage>
  );
}
