import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-40 bg-slate-800 p-4 rounded-lg border border-slate-700 h-[100px] shadow-xl"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass glass-hover p-4 rounded-lg cursor-grab active:cursor-grabbing group min-h-[100px] flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">
          {task.content}
        </p>
        <button className="text-slate-500 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
          <GripVertical size={16} />
        </button>
      </div>
      {task.createdAt && (
        <div className="mt-2 text-xs text-slate-500">
          {new Date(task.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
