import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { 
  Settings, 
  Moon, 
  Sun, 
  Smartphone, 
  ShieldCheck, 
  HardDrive, 
  Globe, 
  Info,
  ChevronRight,
  Zap,
  Lock,
  Cpu,
  Fingerprint,
  RotateCw,
  Trash2,
  Heart,
  Bug,
  BookOpen,
  User
} from "lucide-react";
import { ToolPage } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import RazorpayButton from "@/components/RazorpayButton";
import { useTheme } from "@/components/ThemeProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/settings")({
  component: AppSettings,
});

function AppSettings() {
  const { theme, setTheme } = useTheme();
  const [haptic, setHaptic] = useState(() => localStorage.getItem("pk-haptic") !== "false");
  const [autoDownload, setAutoDownload] = useState(() => localStorage.getItem("pk-auto-download") === "true");
  const [autoWipe, setAutoWipe] = useState(() => localStorage.getItem("pk-auto-wipe") === "true");
  const [historyLimit, setHistoryLimit] = useState(() => parseInt(localStorage.getItem("pk-history-limit") || "10"));

  // Sync to localStorage
  React.useEffect(() => {
    localStorage.setItem("pk-haptic", haptic.toString());
  }, [haptic]);

  React.useEffect(() => {
    localStorage.setItem("pk-auto-download", autoDownload.toString());
  }, [autoDownload]);

  React.useEffect(() => {
    localStorage.setItem("pk-auto-wipe", autoWipe.toString());
  }, [autoWipe]);

  React.useEffect(() => {
    localStorage.setItem("pk-history-limit", historyLimit.toString());
  }, [historyLimit]);

  const triggerHaptic = async () => {
    if (haptic) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {}
    }
  };

  const Toggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
    <button 
      onClick={() => {
        onToggle();
        triggerHaptic();
      }}
      className={cn(
        "relative h-7 w-12 rounded-full transition-all duration-300",
        active ? "bg-primary" : "bg-muted-foreground/20"
      )}
    >
      <div className={cn(
        "absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-300",
        active ? "left-6" : "left-1"
      )} />
    </button>
  );

  const handleRestoreDefaults = () => {
    setTheme("system");
    setHaptic(true);
    setAutoDownload(false);
    setAutoWipe(false);
    setHistoryLimit(10);
    triggerHaptic();
  };

  const cycleHistoryLimit = () => {
     const limits = [5, 10, 20, 50];
     const currentIndex = limits.indexOf(historyLimit);
     const nextLimit = limits[(currentIndex + 1) % limits.length];
     setHistoryLimit(nextLimit);
     triggerHaptic();
  };

  const handleNukeAllData = async () => {
    try {
      // Delete IndexedDB
      const DB_NAME = "PDFHelperDB";
      const request = indexedDB.deleteDatabase(DB_NAME);
      
      request.onsuccess = () => {
        localStorage.clear();
        window.location.reload();
      };
      
      request.onerror = () => {
        // Fallback if DB deletion fails (e.g. open connections)
        localStorage.clear();
        window.location.reload();
      };
    } catch (e) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-8 pb-32">
        <header className="mb-10 flex items-center gap-4">
           <h1 className="text-3xl font-black tracking-tight">System</h1>
        </header>

        <div className="space-y-8">
          {/* Preferences Root */}
          <div className="flex items-center gap-5 rounded-[32px] bg-surface p-6 border border-border/40">
             <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Settings className="h-7 w-7" />
             </div>
             <div>
                <h2 className="text-xl font-black tracking-tight">Preferences</h2>
                <p className="text-[10px] font-black tracking-widest text-muted-foreground/40 uppercase">
                  Protocol V1.0.9 • Local
                </p>
             </div>
          </div>

          {/* Interface Section */}
          <section className="space-y-4">
            <h3 className="px-1 text-[11px] font-black tracking-[0.4em] text-muted-foreground/40 uppercase">Interface</h3>
            <div className="rounded-[32px] bg-surface border border-border/40 overflow-hidden">
               {/* Theme Picker */}
               <div className="p-4 grid grid-cols-3 gap-2 bg-muted/20">
                  {["light", "dark", "system"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setTheme(mode as any);
                        triggerHaptic();
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center py-4 rounded-2xl transition-all",
                        theme === mode ? "bg-background shadow-lg text-foreground" : "text-muted-foreground/40"
                      )}
                    >
                       {mode === "light" && <Sun className="h-5 w-5 mb-2" />}
                       {mode === "dark" && <Moon className="h-5 w-5 mb-2" />}
                       {mode === "system" && <Smartphone className="h-5 w-5 mb-2" />}
                       <span className="text-[10px] font-black tracking-widest uppercase">{mode}</span>
                    </button>
                  ))}
               </div>
               
               {/* Haptic Toggle */}
               <div className="flex items-center justify-between p-6 border-t border-border/20">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground/60">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black tracking-tight uppercase leading-tight">Haptic Feedback</div>
                      <div className="text-[10px] font-bold text-muted-foreground/40 uppercase">Tactile Response Engine</div>
                    </div>
                  </div>
                  <Toggle active={haptic} onToggle={() => setHaptic(!haptic)} />
               </div>
            </div>
          </section>

          {/* Workflow Section */}
          <section className="space-y-4">
            <h3 className="px-1 text-[11px] font-black tracking-[0.4em] text-muted-foreground/40 uppercase">Workflow</h3>
            <div className="rounded-[32px] bg-surface border border-border/40 divide-y divide-border/20">
               <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                     <div className="h-11 w-11 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground/60">
                        <HardDrive className="h-5 w-5" />
                     </div>
                     <div>
                        <div className="text-sm font-black tracking-tight uppercase leading-tight">Auto-Download</div>
                        <div className="text-[10px] font-bold text-muted-foreground/40 uppercase">Immediate Result Export</div>
                     </div>
                  </div>
                  <Toggle active={autoDownload} onToggle={() => setAutoDownload(!autoDownload)} />
               </div>
            </div>
          </section>

          {/* Privacy Section */}
          <section className="space-y-4">
            <h3 className="px-1 text-[11px] font-black tracking-[0.4em] text-muted-foreground/40 uppercase">Privacy</h3>
            <div className="rounded-[32px] bg-surface border border-border/40 divide-y divide-border/20">
               <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                     <div className="h-11 w-11 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground/60">
                        <RotateCw className="h-5 w-5" />
                     </div>
                     <div>
                        <div className="text-sm font-black tracking-tight uppercase leading-tight">Auto-Wipe History</div>
                        <div className="text-[10px] font-bold text-muted-foreground/40 uppercase">Automatic Log Destruction</div>
                     </div>
                  </div>
                  <Toggle active={autoWipe} onToggle={() => setAutoWipe(!autoWipe)} />
               </div>

               <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-11 w-11 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground/60">
                        <Menu className="h-5 w-5" />
                     </div>
                     <div>
                        <div className="text-sm font-black tracking-tight uppercase leading-tight">History Limit</div>
                        <div className="text-[10px] font-bold text-muted-foreground/40 uppercase">Files to keep</div>
                     </div>
                  </div>
                  <button 
                    onClick={cycleHistoryLimit}
                    className="bg-muted px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-primary/10 hover:text-primary transition-colors active:scale-95"
                  >
                    {historyLimit} Files
                  </button>
               </div>
            </div>
          </section>

          {/* Ecosystem Section */}
          <section className="space-y-4">
            <h3 className="px-1 text-[11px] font-black tracking-[0.4em] text-muted-foreground/40 uppercase">Ecosystem</h3>
            <div className="rounded-[32px] bg-surface border border-border/40 divide-y divide-border/20 overflow-hidden">
                {[
                  { label: "Sponsor Project", val: "Fuel Development", icon: Heart, isSponsor: true },
                  { label: "Report Issue", val: "Github Tracker", icon: Bug },
                  { label: "About PDF Helper", val: "Protocol Details", icon: Info },
                  { label: "Created by hemanthreddykoduru", val: "Official Developer", icon: User, link: "https://github.com/hemanthreddykoduru" },
                  { label: "Privacy Protocol", val: "Data Handling Spec", icon: ShieldCheck }
                ].map((item, i) => {
                  const content = (
                    <div className="flex items-center gap-4">
                      <item.icon className="h-6 w-6 text-muted-foreground/40" />
                      <div>
                        <div className="text-base font-black tracking-tight leading-tight">{item.label}</div>
                        <div className="text-[10px] font-bold text-muted-foreground/40 uppercase">{item.val}</div>
                      </div>
                    </div>
                  );

                  if ((item as any).isSponsor) {
                    return (
                      <Dialog key={i}>
                        <DialogTrigger asChild>
                          <button 
                            className="w-full flex items-center justify-between p-6 active:bg-muted/50 transition-all text-left"
                          >
                            {content}
                            <ChevronRight className="h-6 w-6 text-muted-foreground/20" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-surface border-border/40">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight">Support PDF Helper</DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                              Your support helps keep our local engines running and free for everyone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-6">
                            <RazorpayButton />
                          </div>
                        </DialogContent>
                      </Dialog>
                    );
                  }

                  return (
                    <button 
                      key={i} 
                      onClick={() => { if ((item as any).link) window.open((item as any).link, "_blank"); }}
                      className="w-full flex items-center justify-between p-6 active:bg-muted/50 transition-all text-left"
                    >
                      {content}
                      <ChevronRight className="h-6 w-6 text-muted-foreground/20" />
                    </button>
                  );
                })}
            </div>
          </section>

          {/* Danger Zone */}
          <section className="space-y-4">
            <h3 className="px-1 text-[11px] font-black tracking-[0.4em] text-destructive uppercase">Danger Zone</h3>
            <div className="rounded-[32px] bg-surface-elevated border border-destructive/20 divide-y divide-border/20 overflow-hidden shadow-[0_8px_30px_rgb(220,38,38,0.08)]">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="w-full flex items-center justify-between p-6 active:bg-muted/50 transition-all text-left">
                      <div className="flex items-center gap-4">
                        <RotateCw className="h-6 w-6 text-muted-foreground/40" />
                        <div>
                          <div className="text-base font-black tracking-tight leading-tight">Restore Defaults</div>
                          <div className="text-[10px] font-bold text-muted-foreground/40 uppercase">Reset Preferences</div>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-muted-foreground/20" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-surface border-border/40">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-black">Reset Protocol Preferences?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                        This will revert all UI settings, including theme and haptic feedback, to their factory parameters.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl border-border/40 uppercase font-black text-[10px] tracking-widest">Abort</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleRestoreDefaults}
                        className="rounded-xl bg-primary text-white uppercase font-black text-[10px] tracking-widest"
                      >
                        Execute Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="w-full flex items-center justify-between p-6 active:bg-destructive/10 transition-all text-left text-destructive">
                      <div className="flex items-center gap-4">
                        <Trash2 className="h-6 w-6" />
                        <div>
                          <div className="text-base font-black tracking-tight leading-tight">Nuke All Data</div>
                          <div className="text-[10px] font-bold text-destructive/40 uppercase">Irreversible Wipedown</div>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-surface border-destructive/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-black text-destructive tracking-tighter">Initiate Global Wipedown?</AlertDialogTitle>
                      <AlertDialogDescription className="text-[11px] font-black uppercase tracking-widest text-destructive/60 leading-relaxed">
                        CRITICAL WARNING: This action is irreversible. All processed documents, history logs, and system preferences will be permanently purged from this device.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl border-border/40 uppercase font-black text-[10px] tracking-widest">Abort Purge</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleNukeAllData}
                        className="rounded-xl bg-destructive text-white hover:bg-destructive shadow-[0_8px_20px_rgba(220,38,38,0.3)] uppercase font-black text-[10px] tracking-widest"
                      >
                        Confirm Nuke
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </section>

          <div className="pt-10 text-center opacity-30">
             <p className="text-[10px] font-black tracking-[0.3em] uppercase">Configuration Engine V1.0.9 Stable</p>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

// Map missing icons
const ImageIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const Menu = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
