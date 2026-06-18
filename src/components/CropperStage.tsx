import React, { useRef } from 'react';

export interface CropState {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CropperStageProps {
  crop: CropState;
  onChange: (crop: CropState) => void;
  children: React.ReactNode;
}

const HANDLE_SIZE = 12;

type DragType = 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export function CropperStage({ crop, onChange, children }: CropperStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.PointerEvent<HTMLDivElement>, type: DragType) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = { ...crop };
    
    if (!containerRef.current) return;
    const container = containerRef.current;
    const widthPx = container.offsetWidth;
    const heightPx = container.offsetHeight;

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      
      const dx = ((moveEvent.clientX - startX) / widthPx) * 100;
      const dy = ((moveEvent.clientY - startY) / heightPx) * 100;

      const newCrop = { ...startCrop };

      if (type === 'move') {
        newCrop.x = Math.max(0, Math.min(100 - newCrop.w, startCrop.x + dx));
        newCrop.y = Math.max(0, Math.min(100 - newCrop.h, startCrop.y + dy));
      } else {
        if (type.includes('n')) {
          newCrop.y = Math.min(startCrop.y + startCrop.h - 1, Math.max(0, startCrop.y + dy));
          newCrop.h = startCrop.h + (startCrop.y - newCrop.y);
        }
        if (type.includes('s')) {
          newCrop.h = Math.max(1, startCrop.h + dy);
          if (newCrop.y + newCrop.h > 100) newCrop.h = 100 - newCrop.y;
        }
        if (type.includes('w')) {
          newCrop.x = Math.min(startCrop.x + startCrop.w - 1, Math.max(0, startCrop.x + dx));
          newCrop.w = startCrop.w + (startCrop.x - newCrop.x);
        }
        if (type.includes('e')) {
          newCrop.w = Math.max(1, startCrop.w + dx);
          if (newCrop.x + newCrop.w > 100) newCrop.w = 100 - newCrop.x;
        }
      }

      onChange(newCrop);
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none" style={{ touchAction: 'none' }}>
      {/* Background layer: The actual element (Lottie) */}
      <div className="absolute inset-0 z-0">
        {children}
      </div>

      {/* Darkened overlay outside the crop rect */}
      {/* Top */}
      <div className="absolute top-0 left-0 right-0 bg-black/60 z-10" style={{ height: `${crop.y}%` }} />
      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 z-10" style={{ top: `${crop.y + crop.h}%` }} />
      {/* Left */}
      <div className="absolute bg-black/60 z-10" style={{ top: `${crop.y}%`, bottom: `${100 - (crop.y + crop.h)}%`, left: 0, width: `${crop.x}%` }} />
      {/* Right */}
      <div className="absolute bg-black/60 z-10" style={{ top: `${crop.y}%`, bottom: `${100 - (crop.y + crop.h)}%`, right: 0, left: `${crop.x + crop.w}%` }} />

      {/* The Crop Area Box */}
      <div
        className="absolute border border-blue-500/80 z-20 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] cursor-move"
        style={{
          left: `${crop.x}%`,
          top: `${crop.y}%`,
          width: `${crop.w}%`,
          height: `${crop.h}%`,
        }}
        onPointerDown={(e) => startDrag(e, 'move')}
      >
        {/* Handles */}
        <div className="absolute left-0 top-0 cursor-nw-resize" onPointerDown={(e) => startDrag(e, 'nw')} style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, transform: 'translate(-50%, -50%)' }} />
        <div className="absolute left-1/2 top-0 cursor-n-resize" onPointerDown={(e) => startDrag(e, 'n')} style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, transform: 'translate(-50%, -50%)' }} />
        <div className="absolute right-0 top-0 cursor-ne-resize" onPointerDown={(e) => startDrag(e, 'ne')} style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, transform: 'translate(50%, -50%)' }} />
        <div className="absolute right-0 top-1/2 cursor-e-resize" onPointerDown={(e) => startDrag(e, 'e')} style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, transform: 'translate(50%, -50%)' }} />
        <div className="absolute right-0 bottom-0 cursor-se-resize" onPointerDown={(e) => startDrag(e, 'se')} style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, transform: 'translate(50%, 50%)' }} />
        <div className="absolute left-1/2 bottom-0 cursor-s-resize" onPointerDown={(e) => startDrag(e, 's')} style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, transform: 'translate(-50%, 50%)' }} />
        <div className="absolute left-0 bottom-0 cursor-sw-resize" onPointerDown={(e) => startDrag(e, 'sw')} style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, transform: 'translate(-50%, 50%)' }} />
        <div className="absolute left-0 top-1/2 cursor-w-resize" onPointerDown={(e) => startDrag(e, 'w')} style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, transform: 'translate(-50%, -50%)' }} />
        
        {/* Corner indicators for visual feedback */}
        <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-primary bg-transparent pointer-events-none" />
        <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-primary bg-transparent pointer-events-none" />
        <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-primary bg-transparent pointer-events-none" />
        <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-primary bg-transparent pointer-events-none" />

        {/* Center crosshair / dashed guidelines could go here if wanted */}
        <div className="absolute inset-0 pointer-events-none opacity-30 border border-dashed border-white/50" />
      </div>
    </div>
  );
}
