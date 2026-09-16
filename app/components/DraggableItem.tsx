"use client";

import { Rnd } from "react-rnd";

interface position {
  x: number;
  y: number;
}

export default function DraggableItem({
  children,
  defaultPos = { x: 0, y: 0 },
  defaultSize = { width: 320, height: 300 },
}) {
  return (
    <Rnd
      default={{
        x: defaultPos.x,
        y: defaultPos.y,
        width: defaultSize.width,
        height: defaultSize.height,
      }}
      enableResizing={true}
      minWidth={200}
      minHeight={150}
      bounds="window"
      className="z-10 active:z-50 flex flex-col bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden group"
      resizeHandleClasses={{
        bottomRight:
          "cursor-se-resize bg-slate-500/50 hover:bg-blue-500 w-3 h-3 absolute bottom-0 right -0 rounded-tl",
      }}
    >
      <div className="cursor-grab active:cursor-grabbing p-2 bg-slate-900/60 text-xs text-slate-400 select-none flex justify0between items-center border-b borders-late-700">
        <span>Drag Haeder</span>
        <span className="text-[10px] opacity-60">Resize from conrdners</span>
      </div>

      <div className="p-4 flex-1 overflow-auto">{children}</div>
    </Rnd>
  );
}
