'use client';

import { useCanvas } from '@/hooks/use-canvas';
import { useEffect } from 'react';

interface CharacterNode {
  id: string;
  name: string;
  role?: string;
}

interface Relationship {
  source: string;
  target: string;
  label?: string;
}

export function CharacterGraph({
  characters = [],
  relationships = [],
}: {
  characters?: CharacterNode[];
  relationships?: Relationship[];
}) {
  const { canvasRef, ctx } = useCanvas();

  useEffect(() => {
    if (!ctx || characters.length === 0) return;
    const { width, height } = canvasRef.current!;
    ctx.clearRect(0, 0, width, height);

    const angleStep = (Math.PI * 2) / characters.length;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 40;

    const positions = characters.map((_, i) => ({
      x: cx + radius * Math.cos(angleStep * i - Math.PI / 2),
      y: cy + radius * Math.sin(angleStep * i - Math.PI / 2),
    }));

    const charIds = characters.map((c) => c.id);
    for (const rel of relationships) {
      const si = charIds.indexOf(rel.source);
      const ti = charIds.indexOf(rel.target);
      if (si === -1 || ti === -1) continue;
      ctx.beginPath();
      ctx.moveTo(positions[si].x, positions[si].y);
      ctx.lineTo(positions[ti].x, positions[ti].y);
      ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.3)';
      ctx.stroke();

      if (rel.label) {
        const mx = (positions[si].x + positions[ti].x) / 2;
        const my = (positions[si].y + positions[ti].y) / 2;
        ctx.fillStyle = 'hsl(var(--muted-foreground))';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(rel.label, mx, my - 4);
      }
    }

    characters.forEach((char, i) => {
      const { x, y } = positions[i];
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(var(--primary))';
      ctx.fill();
      ctx.fillStyle = 'hsl(var(--primary-foreground))';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(char.name.charAt(0), x, y + 3);
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '10px sans-serif';
      ctx.fillText(char.name, x, y + 36);
    });
  }, [ctx, characters, relationships, canvasRef]);

  if (characters.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Add characters to see the relationship graph
      </div>
    );
  }

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
