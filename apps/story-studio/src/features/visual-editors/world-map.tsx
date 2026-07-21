'use client';

import { useCanvas } from '@/hooks/use-canvas';
import { useEffect } from 'react';

interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  type?: string;
}

export function WorldMap({ locations = [] }: { locations?: Location[] }) {
  const { canvasRef, ctx } = useCanvas();

  useEffect(() => {
    if (!ctx || locations.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    locations.forEach((loc) => {
      const px = (loc.x / 100) * width;
      const py = (loc.y / 100) * height;

      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(var(--primary) / 0.8)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(loc.name, px, py - 20);

      if (loc.type) {
        ctx.fillStyle = 'hsl(var(--muted-foreground))';
        ctx.font = '9px sans-serif';
        ctx.fillText(loc.type, px, py + 28);
      }
    });
  }, [ctx, locations, canvasRef]);

  if (locations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Add locations to see the world map
      </div>
    );
  }

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
