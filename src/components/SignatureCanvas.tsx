import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

export type SignatureCanvasHandle = {
  toPng: () => Uint8Array | null;
  clear: () => void;
  isEmpty: () => boolean;
};

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, { width?: number; height?: number }>(
  function SignatureCanvas({ width = 500, height = 200 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [empty, setEmpty] = useState(true);

    useEffect(() => {
      const c = canvasRef.current!;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = "#0f1117";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }, []);

    const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * width, y: ((e.clientY - rect.top) / rect.height) * height };
    };

    useImperativeHandle(ref, () => ({
      toPng: () => {
        if (empty) return null;
        const c = canvasRef.current!;
        const dataUrl = c.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
      },
      clear: () => {
        const c = canvasRef.current!;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        setEmpty(true);
      },
      isEmpty: () => empty,
    }));

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block w-full cursor-crosshair touch-none rounded-md border border-border bg-white"
        style={{ aspectRatio: `${width}/${height}` }}
        onPointerDown={(e) => {
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          const { x, y } = pos(e);
          const ctx = canvasRef.current!.getContext("2d")!;
          ctx.beginPath();
          ctx.moveTo(x, y);
          setDrawing(true);
          setEmpty(false);
        }}
        onPointerMove={(e) => {
          if (!drawing) return;
          const { x, y } = pos(e);
          const ctx = canvasRef.current!.getContext("2d")!;
          ctx.lineTo(x, y);
          ctx.stroke();
        }}
        onPointerUp={() => setDrawing(false)}
        onPointerLeave={() => setDrawing(false)}
      />
    );
  },
);
