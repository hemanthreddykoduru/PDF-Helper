import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Layers, 
  ArrowRight,
  ChevronLeft
} from "lucide-react";
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
import { imagesToPdf } from "@/utils/pdfHelpers";
import { formatBytes, addRecent } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/image-to-pdf")({
  head: () => ({
    meta: [
      { title: "Image to PDF — PDF Helper" },
    ],
  }),
  component: ImageToPdfTool,
});

function Tile({ 
  item, 
  onRemove 
}: { 
  item: { id: string; file: File; url: string }; 
  onRemove: () => void 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-[24px] border border-border/40 bg-white transition-all shadow-sm",
        isDragging ? "z-50 opacity-100 scale-105 shadow-2xl border-primary ring-4 ring-primary/10" : "hover:border-primary/20"
      )}
    >
      <div {...attributes} {...listeners} className="h-full w-full cursor-grab touch-none active:cursor-grabbing">
        <img src={item.url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      </div>
      
      <div className="absolute top-2 right-2 flex gap-1 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
         <button 
           onClick={(e) => { e.stopPropagation(); onRemove(); }}
           className="h-8 w-8 rounded-full bg-rose-500 text-white shadow-lg flex items-center justify-center active:scale-90"
         >
           <Trash2 className="h-4 w-4" />
         </button>
      </div>

      <div className="absolute bottom-2 left-3 right-3">
         <p className="truncate text-[8px] font-black tracking-tight text-white drop-shadow-md uppercase bg-black/40 px-1 rounded">
           {item.file.name}
         </p>
      </div>
    </div>
  );
}

function ImageToPdfTool() {
  const navigate = useNavigate();
  const [items, setItems] = useState<{ id: string; file: File; url: string; bytes: Uint8Array }[]>([]);
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "Fit">("A4");
  const [busy, setBusy] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    return () => items.forEach((i) => URL.revokeObjectURL(i.url));
  }, [items]);

  const add = async (files: File[]) => {
    if (files.length === 0) return;
    setIngesting(true);
    let successCount = 0;
    let failCount = 0;

    const newItems: typeof items = [];

    for (const f of files) {
      try {
        // Read immediately to prevent permission expiration on mobile
        const buffer = await f.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        
        newItems.push({
          id: `${Date.now()}-${Math.random()}`,
          file: f,
          bytes,
          url: URL.createObjectURL(new Blob([bytes], { type: f.type })),
        });
        successCount++;
      } catch (err) {
        console.error("File ingestion error:", err);
        failCount++;
      }
    }

    if (failCount > 0) {
      toast.error(`Failed to read ${failCount} asset(s). Try selecting from a different folder.`);
    }

    setItems((prev) => [...prev, ...newItems]);
    setIngesting(false);
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

  const build = async () => {
    if (!items.length) return;
    setBusy(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const bytes = await imagesToPdf(items.map((i) => ({ file: i.file, bytes: i.bytes })), pageSize);
      const name = `Synthesized-${Date.now().toString().slice(-6)}.pdf`;
      
      setResult({ bytes, name });
      
      await addRecent({ name, size: bytes.byteLength, operation: "Image → PDF" }, bytes);
      toast.success("Visual assets synthesized successfully.");
    } catch (err) {
      toast.error("Synthesis failed: Asset mapping error.");
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
      <div className="mx-auto max-w-4xl px-5 pt-4 pb-32">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate({ to: "/" })} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-elevated text-foreground/60 active:scale-90 transition-all">
              <ChevronLeft className="h-6 w-6" />
           </button>
           <h1 className="text-xl font-black tracking-tight uppercase">Images → PDF</h1>
        </div>

        {!result ? (
          <>
            <PageHeader 
              title="Images → PDF"
              description="High-fidelity visual synthesis engine."
              icon={<ImageIcon className="h-5 w-5" />}
            />

            {items.length === 0 ? (
              <div className="mt-8">
                <FileDropzone 
                  multiple
                  accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
                  onFiles={add}
                  label={ingesting ? "Reading Assets..." : "Drop Images to Convert"}
                  hint="Files processed locally — privacy guaranteed"
                />
              </div>
            ) : (
              <div className="mt-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Settings Interface */}
                <section className="space-y-4">
                   <h2 className="px-1 text-[10px] font-black tracking-[0.25em] text-muted-foreground/50 uppercase">Configuration</h2>
                   <div className="flex items-center gap-2 p-1 rounded-2xl bg-surface border border-border/40 overflow-x-auto no-scrollbar">
                     {(["A4", "Letter", "Fit"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setPageSize(s)}
                          className={cn(
                            "flex-1 whitespace-nowrap px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all",
                            pageSize === s ? "bg-primary text-white shadow-lg" : "text-muted-foreground/40 hover:bg-muted"
                          )}
                        >
                          {s === "Fit" ? "Fit Image" : s}
                        </button>
                     ))}
                   </div>
                </section>

                {/* Visual Grid */}
                <section className="space-y-4">
                   <h2 className="px-1 text-[10px] font-black tracking-[0.25em] text-muted-foreground/50 uppercase">Sequence Order ({items.length})</h2>
                   <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                          {items.map((it) => (
                            <Tile
                              key={it.id}
                              item={it}
                              onRemove={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                            />
                          ))}
                          
                          <button 
                            disabled={ingesting}
                            onClick={() => document.getElementById('sub-adder')?.click()}
                            className={cn(
                              "flex aspect-square flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-border/40 bg-surface/20 text-muted-foreground/20 transition-all active:scale-95",
                              ingesting ? "opacity-50 cursor-not-allowed" : "hover:border-primary/20 hover:text-primary"
                            )}
                          >
                             <Plus className={cn("h-8 w-8 mb-2", ingesting && "animate-spin")} />
                             <span className="text-[9px] font-black uppercase tracking-widest">
                               {ingesting ? "Reading..." : "Add More"}
                             </span>
                             <input 
                               id="sub-adder"
                               type="file" 
                               multiple 
                               hidden 
                               accept="image/*"
                               onChange={(e) => e.target.files && add(Array.from(e.target.files))}
                             />
                          </button>
                        </div>
                      </SortableContext>
                   </DndContext>
                </section>

                <div className="pt-10">
                    <Button 
                      onClick={build} 
                      loading={busy} 
                      disabled={ingesting}
                      className="w-full h-16 rounded-[24px] text-sm font-black tracking-widest uppercase shadow-2xl shadow-primary/20"
                    >
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Synthesize PDF
                    </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <ResultScreen 
             result={result} 
             onReset={reset} 
             operationLabel="Synthesized Master"
             successMessage="Visual Assets Consolidated"
          />
        )}
      </div>

      {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative mb-8">
             <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/5 border-t-primary" />
             <Layers className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase px-6 text-center">PDF Synthesis</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.3em] text-muted-foreground/40 uppercase">
            Mapping visual assets to structural geometry
          </p>
        </div>
      )}
    </ToolPage>
  );
}
