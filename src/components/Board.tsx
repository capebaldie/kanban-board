import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Task, ColumnType } from "../types";

const defaultColumns: ColumnType[] = [
  {
    id: "todo",
    title: "Tasks",
    tasks: [],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [],
  },
  {
    id: "done",
    title: "Done",
    tasks: [],
  },
];

export function Board() {
  const [columns, setColumns] = useLocalStorage<ColumnType[]>(
    "kanban-board-state",
    defaultColumns
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (id: string) => {
    return columns.find(
      (col) => col.id === id || col.tasks.some((task) => task.id === id)
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      content: newTaskContent,
      createdAt: new Date().toISOString(),
    };

    setColumns((prev) => {
      return prev.map((col) => {
        if (col.id === "todo") {
          return {
            ...col,
            tasks: [newTask, ...col.tasks],
          };
        }
        return col;
      });
    });

    setNewTaskContent("");
    setIsAdding(false);
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeColumn = findColumn(active.id as string);
    const task = activeColumn?.tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeColumn = findColumn(activeId as string);
    const overColumn = findColumn(overId as string);

    if (!activeColumn || !overColumn) return;

    if (activeColumn !== overColumn) {
      setColumns((prev) => {
        const activeTask = activeColumn.tasks.find((t) => t.id === activeId);
        if (!activeTask) return prev;

        return prev.map((col) => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== activeId),
            };
          }
          if (col.id === overColumn.id) {
            const overTaskIndex = col.tasks.findIndex((t) => t.id === overId);
            const newTasks = [...col.tasks];
            const isOverColumn = over.data.current?.type === "Column";

            if (isOverColumn) {
              newTasks.push(activeTask);
            } else {
              if (overTaskIndex >= 0) {
                newTasks.splice(overTaskIndex, 0, activeTask);
              } else {
                newTasks.push(activeTask);
              }
            }
            return {
              ...col,
              tasks: newTasks,
            };
          }
          return col;
        });
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;

    if (!overId || activeId === overId) {
      setActiveTask(null);
      return;
    }

    const activeColumn = findColumn(activeId as string);
    const overColumn = findColumn(overId as string);

    if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
      setColumns((prev) => {
        return prev.map((col) => {
          if (col.id === activeColumn.id) {
            const oldIndex = col.tasks.findIndex((t) => t.id === activeId);
            const newIndex = col.tasks.findIndex((t) => t.id === overId);
            return {
              ...col,
              tasks: arrayMove(col.tasks, oldIndex, newIndex),
            };
          }
          return col;
        });
      });
    }

    setActiveTask(null);
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden text-slate-50">
      {/* Header */}
      <header className="h-16 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
            K
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Kanban
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {isAdding ? (
            <form
              onSubmit={handleAddTask}
              className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200"
            >
              <input
                autoFocus
                type="text"
                placeholder="What needs to be done?"
                className="bg-slate-800 border-none rounded-lg py-2 px-4 w-64 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                onBlur={() => !newTaskContent && setIsAdding(false)}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white px-2"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              <Plus size={18} />
              <span>New Task</span>
            </button>
          )}
        </div>
      </header>

      {/* Board Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full flex gap-8 p-8 min-w-max mx-auto justify-center">
            {columns.map((col) => (
              <Column key={col.id} column={col} />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
