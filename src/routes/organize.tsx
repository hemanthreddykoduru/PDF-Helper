import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LayoutGrid, ChevronLeft, Save } from "lucide-react";
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
import { ResultScreen } from "@/components/ResultScreen";
import { useThumbnails } from "@/hooks/useThumbnails";
import { saveWithReorderAndRotation } from "@/utils/pdfHelpers"; // Corrected name
import { stripExtension, addRecent } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/organize")({
  component: OrganizeTool,
});

function PageTile({ it, onRemove }: { it: { id: string; page: number; dataUrl: string }; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: it.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-[3/4] overflow-hidden rounded-[20px] border-2 bg-white transition-all active:scale-[0.98]",
        isDragging ? "z-50 border-primary shadow-2xl ring-4 ring-primary/10 scale-105" : "border-border/60 hover:border-primary/40",
      )}
    >
      <div {...attributes} {...listeners} className="h-full w-full cursor-grab touch-none active:cursor-grabbing">
        <img src={it.dataUrl} alt={`Page ${it.page}`} className="h-full w-full object-cover" />
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
         <button onClick={onRemove} className="h-6 w-6 rounded-full bg-rose-500 text-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <Trash2 className="h-3 w-3" />
         </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-2 text-center">
        <span className="text-[8px] font-black tracking-wider text-white uppercase font-sans">Page {it.page}</span>
      </div>
    </div>
  );
}

import { Trash2 } from "lucide-react";

function OrganizeTool() {
  const navigate = useNavigate();
  const [fileData, setFileData] = useState<{ file: File; bytes: Uint8Array } | null>(null);
  const [items, setItems] = useState<{ id: string; page: number; dataUrl: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string } | null>(null);
  const { thumbs, loading } = useThumbnails(fileData?.bytes ?? null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Initialize items from thumbnails
  useEffect(() => {
    if (thumbs.length > 0 && items.length === 0) {
      setItems(thumbs.map(t => ({ id: `p-${t.page}`, page: t.page, dataUrl: t.dataUrl })));
    }
  }, [thumbs, items.length]);

  const onFiles = async (files: File[]) => {
    if (!files[0]) return;
    const bytes = new Uint8Array(await files[0].arrayBuffer());
    setFileData({ file: files[0], bytes });
    setItems([]);
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

  const run = async () => {
    if (!fileData || items.length === 0) return;
    setBusy(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const indices = items.map(it => it.page - 1);
      // Corrected function call and rotation parameter
      const bytes = await saveWithReorderAndRotation(fileData.file as any, indices, {});
      const name = `${stripExtension(fileData.file.name)}-reordered.pdf`;
      setResult({ bytes, name });
      await addRecent({ name, size: bytes.byteLength, operation: "Organize" }, bytes);
      toast.success("Structural re-alignment complete.");
    } catch (err) {
      console.error(err);
      toast.error("Organization failed: Geometry error.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFileData(null);
    setItems([]);
    setResult(null);
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-4xl px-5 pt-4 pb-32">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate({ to: "/" })} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-elevated text-foreground/60 active:scale-90 transition-all">
              <ChevronLeft className="h-6 w-6" />
           </button>
           <h1 className="text-xl font-black tracking-tight uppercase">Organize</h1>
        </div>

        {!result ? (
          <>
            <PageHeader
               title="Organize Document"
               description="Visual structural reordering and page management engine."
               icon={<LayoutGrid className="h-5 w-5" />}
            />

            {!fileData && (
              <div className="mt-8">
                <FileDropzone 
                  onFiles={onFiles} 
                  label="Drop PDF to Organize"
                  hint="Drag and drop pages to reorder"
                />
              </div>
            )}

            {fileData && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Visual Grid */}
                <section className="space-y-4">
                   <div className="flex items-center justify-between px-1">
                      <h2 className="text-[10px] font-black tracking-[0.25em] text-muted-foreground/50 uppercase">Structural Geometry ({items.length} pages)</h2>
                      <Button variant="ghost" size="sm" onClick={() => setFileData(null)}>Change File</Button>
                   </div>

                   {loading ? (
                       <div className="flex flex-col items-center justify-center py-20 text-center">
                         <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                         <div className="text-[10px] font-black tracking-widest text-muted-foreground/40 uppercase">
                           Initial Rendering
                         </div>
                       </div>
                    ) : (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 pb-20">
                            {items.map((it) => (
                              <PageTile
                                key={it.id}
                                it={it}
                                onRemove={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                </section>

                <div className="fixed bottom-24 left-0 right-0 z-40 px-6 lg:relative lg:bottom-0 lg:px-0">
                    <Button 
                      onClick={run} 
                      loading={busy} 
                      disabled={items.length === 0}
                      className="w-full h-16 rounded-[24px] text-sm font-black tracking-widest uppercase shadow-2xl shadow-primary/20"
                    >
                      <Save className="mr-2 h-5 w-5" />
                      Commit Structure
                    </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <ResultScreen 
             result={result} 
             onReset={reset} 
             operationLabel="Re-ordered Asset"
             successMessage="Structural Re-alignment Complete"
          />
        )}
      </div>

       {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative mb-8">
             <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/5 border-t-primary" />
             <LayoutGrid className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase px-6 text-center">Structural Re-alignment</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.3em] text-muted-foreground/40 uppercase">
            Rewriting document cross-references
          </p>
        </div>
      )}
    </ToolPage>
  );
}
