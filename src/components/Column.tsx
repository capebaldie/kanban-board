import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { ColumnType } from "../types";

interface ColumnProps {
  column: ColumnType;
  children: React.ReactNode;
}

export function Column({ column, children }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between mb-4 p-2">
        <h2 className="font-semibold text-slate-100 flex items-center gap-2">
          {column.title}
          <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full border border-slate-700">
            {column.tasks.length}
          </span>
        </h2>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-3 p-2 rounded-xl bg-slate-900/50 border border-slate-800 min-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-600 text-sm border-2 border-dashed border-slate-800 rounded-lg m-2">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}
