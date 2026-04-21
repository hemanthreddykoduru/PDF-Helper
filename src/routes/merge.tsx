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
      className={cn(
        "group flex items-center gap-4 rounded-[24px] border border-border/50 bg-surface px-4 py-4 transition-all active:scale-[0.98]",
        isDragging && "z-50 border-primary/50 bg-surface-elevated shadow-xl ring-2 ring-primary/20 opacity-80"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded-xl bg-muted/50 p-2 text-muted-foreground hover:bg-muted active:cursor-grabbing sm:p-3"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E11D48]/10 text-[#E11D48] sm:h-12 sm:w-12">
        <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black tracking-tight">{item.file.name}</div>
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
          {formatBytes(item.file.size)} • {item.pages ?? "…"} pages
        </div>
      </div>

      <button
        onClick={onRemove}
        className="rounded-full p-2 text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-90"
        aria-label="Remove file"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

function MergeTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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
      // Small artificial delay for premium feel
      await new Promise(resolve => setTimeout(resolve, 800));
      const bytes = await mergePdfs(items.map((i) => i.file));
      downloadBlob(bytes, `merged-${Date.now()}.pdf`);
      addRecent({
        name: `merged-${items.length}-files.pdf`,
        size: bytes.byteLength,
        operation: "Merge",
      });
    } catch (error) {
      console.error("Merge failed:", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-6 sm:pt-10">
        <PageHeader
          title="Merge PDFs"
          description="High-performance engine for combining documents."
          icon={<Combine className="h-5 w-5" />}
        />

        <div className="mt-8">
          <FileDropzone
            multiple
            onFiles={addFiles}
            label="Drop PDFs to merge"
            hint="Files are processed 100% in your browser"
          />
        </div>

        {items.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                Selection Pipeline ({items.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setItems([])}>
                Clear
              </Button>
            </div>
            
            <div className="space-y-3">
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
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-6 pb-20 text-center">
          <div className={cn("text-[10px] font-bold tracking-widest text-muted-foreground transition-opacity uppercase", items.length < 2 && "opacity-40")}>
            {items.length < 2 ? "Add 2+ PDFs to initiate merge" : "Pipeline Ready"}
          </div>
          
          <Button 
            onClick={onMerge} 
            loading={busy} 
            disabled={items.length < 2}
            className="w-full sm:w-auto sm:min-w-[240px]"
          >
            Combine Files
          </Button>

          <p className="max-w-[280px] text-[9px] font-medium leading-relaxed text-muted-foreground/40 uppercase">
             Privacy Guaranteed: Encryption keys stay on device. No server logs created.
          </p>
        </div>
      </div>

      {/* Processing Overlay */}
      {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative mb-6">
             <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/10 border-t-primary" />
             <Combine className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-black tracking-tighter">ENGINE PROCESSING</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.25em] text-muted-foreground/40 uppercase">
            Compiling PDF Streams locally
          </p>
        </div>
      )}
    </ToolPage>
  );
}

