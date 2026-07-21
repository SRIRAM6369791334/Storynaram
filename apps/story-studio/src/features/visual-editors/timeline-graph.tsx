'use client';

import { useCanvas } from '@/hooks/use-canvas';
import { useEffect } from 'react';

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
}

export function TimelineGraph({ events = [] }: { events?: TimelineEvent[] }) {
  const { canvasRef, ctx } = useCanvas();

  useEffect(() => {
    if (!ctx || events.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.5)';
    ctx.lineWidth = 2;

    const startX = 60;
    const endX = width - 60;
    const y = height / 2;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();

    const spacing = (endX - startX) / Math.max(events.length - 1, 1);
    events.forEach((event, i) => {
      const x = startX + i * spacing;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(var(--primary))';
      ctx.fill();

      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(event.title, x, y - 15);
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.font = '9px sans-serif';
      ctx.fillText(event.date, x, y + 20);
    });
  }, [ctx, events, canvasRef]);

  return (
    <div className="h-full w-full">
      {events.length === 0 ? (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          Add events to see the timeline graph
        </div>
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" />
      )}
    </div>
  );
}
