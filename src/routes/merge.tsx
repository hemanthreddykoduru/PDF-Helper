import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Combine, GripVertical, Trash2, FileText, ChevronLeft } from "lucide-react";
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
import { ResultScreen } from "@/components/ResultScreen";
import { mergePdfs, getPageCount } from "@/utils/pdfHelpers";
import { formatBytes, addRecent } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/merge")({
  component: MergeTool,
});

type Item = { id: string; file: File; bytes: Uint8Array; pages: number | null };

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
      
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12">
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
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    items.forEach(async (it) => {
      if (it.pages !== null) return;
      try {
        const p = await getPageCount(it.bytes);
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, pages: p } : x)));
      } catch {
        setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, pages: 0 } : x)));
      }
    });
  }, [items]);

  const addFiles = async (files: File[]) => {
    const newItems = await Promise.all(
      files.map(async (f) => ({
        id: `${Date.now()}-${f.name}-${Math.random()}`,
        file: f,
        bytes: new Uint8Array(await f.arrayBuffer()),
        pages: null,
      }))
    );
    setItems((prev) => [...prev, ...newItems]);
  };

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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const bytes = await mergePdfs(items.map((i) => i.bytes) as any);
      const name = `merged-${Date.now().toString().slice(-6)}.pdf`;
      
      setResult({ bytes, name });
      
      await addRecent({
        name,
        size: bytes.byteLength,
        operation: "Merge",
      }, bytes);
      
      toast.success("PDF streams merged successfully.");
    } catch (error) {
      console.error("Merge failed:", error);
      toast.error("Merge failure: Local stream interrupted.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setItems([]);
    setResult(null);
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-4 pb-32">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate({ to: "/" })} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-elevated text-foreground/60 active:scale-90 transition-all">
              <ChevronLeft className="h-6 w-6" />
           </button>
           <h1 className="text-xl font-black tracking-tight uppercase">Merge PDFs</h1>
        </div>

        {!result ? (
          <>
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
              />
            </div>

            {items.length > 0 && (
              <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                className="w-full h-14 rounded-2xl shadow-lg"
              >
                Combine Files
              </Button>
            </div>
          </>
        ) : (
          <ResultScreen 
            result={result} 
            onReset={reset} 
            operationLabel="Merged Master"
            successMessage="PDF Streams Consolidated"
          />
        )}
      </div>

      {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative mb-8">
             <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/5 border-t-primary" />
             <Combine className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase">ENGINE PROCESSING</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.3em] text-muted-foreground/40 uppercase">
            Compiling PDF Streams locally
          </p>
        </div>
      )}
    </ToolPage>
  );
}
