'use client';

import { useCanvas } from '@/hooks/use-canvas';
import { useEffect } from 'react';

interface SceneNode {
  id: string;
  title: string;
  chapter: number;
  duration?: number;
}

export function CompositionGraph({ scenes = [] }: { scenes?: SceneNode[] }) {
  const { canvasRef, ctx } = useCanvas();

  useEffect(() => {
    if (!ctx || scenes.length === 0) return;
    const { width, height } = canvasRef.current!;
    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const nodeW = 120;
    const nodeH = 40;
    const gapX = 30;
    const gapY = 50;

    const chapters = new Map<number, SceneNode[]>();
    for (const s of scenes) {
      const arr = chapters.get(s.chapter) ?? [];
      arr.push(s);
      chapters.set(s.chapter, arr);
    }
    const sortedChapters = [...chapters.entries()].sort(([a], [b]) => a - b);

    const totalW = sortedChapters.length * (nodeW + gapX) + padding * 2;
    const maxH = Math.max(...sortedChapters.map(([, sc]) => sc.length));
    const totalH = maxH * (nodeH + gapY) + padding * 2;

    canvasRef.current!.width = Math.max(totalW, width);
    canvasRef.current!.height = Math.max(totalH, height);

    sortedChapters.forEach(([chapter, sc], ci) => {
      const startX = padding + ci * (nodeW + gapX);
      const colCenter = startX + nodeW / 2;

      sc.forEach((scene, si) => {
        const y = padding + si * (nodeH + gapY);

        if (si > 0) {
          const prevY = padding + (si - 1) * (nodeH + gapY);
          ctx.beginPath();
          ctx.moveTo(colCenter, prevY + nodeH);
          ctx.lineTo(colCenter, y);
          ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.3)';
          ctx.stroke();
        }

        if (ci > 0) {
          const prevX = padding + (ci - 1) * (nodeW + gapX) + nodeW;
          ctx.beginPath();
          ctx.moveTo(prevX, y + nodeH / 2);
          ctx.lineTo(startX, y + nodeH / 2);
          ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.2)';
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.fillStyle = 'hsl(var(--card))';
        ctx.strokeStyle = 'hsl(var(--border))';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(startX, y, nodeW, nodeH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'hsl(var(--foreground))';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(scene.title.length > 16 ? scene.title.slice(0, 16) + '...' : scene.title, startX + nodeW / 2, y + nodeH / 2 + 3);
      });

      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Ch. ${chapter}`, colCenter, sortedChapters[ci][1].length * (nodeH + gapY) + padding + 20);
    });
  }, [ctx, scenes, canvasRef]);

  if (scenes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Add scenes to see the composition graph
      </div>
    );
  }

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
