import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import type { Task, ColumnType } from "../types";
import { api } from "../api";

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
  const [columns, setColumns] = useState<ColumnType[]>(defaultColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    api.getTasks().then((fetchedTasks: Task[]) => {
      setColumns((prevCols) => {
        const newCols = prevCols.map((col) => ({ ...col, tasks: [] as Task[] }));
        fetchedTasks.forEach((task) => {
           const col = newCols.find((c) => c.id === task.columnId);
          if (col) {
            col.tasks.push({
              id: task.id,
              content: task.content,
              createdAt: task.createdAt,
            });
          }
        });
        return newCols;
      });
    });
  }, []);

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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      content: newTaskContent,
      createdAt: new Date().toISOString(),
    };

    // Optimistic Update
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

    // API Call
    await api.createTask({ ...newTask, columnId: "todo" });
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeColumn = findColumn(active.id as string);
    const task = activeColumn?.tasks.find((t) => t.id === active.id);
    if (task) {
        setActiveTask(task);
        setActiveColumnId(activeColumn?.id || null);
    }
  }

  function handleDragOver() {
    // Optimistic sorting disabled to ensure persistence reliability in DragEnd.
    // Visual feedback is provided by DragOverlay.
  }

  async function handleDragEnd(event: DragEndEvent) {
    console.log("HandleDragEnd called", event);
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;

    if (!overId || activeId === overId) {
      setActiveTask(null);
      setActiveColumnId(null);
      return;
    }

    const activeColumn = findColumn(activeId as string);
    const overColumn = findColumn(overId as string);

    if (!activeColumn || !overColumn) {
        setActiveTask(null); 
        setActiveColumnId(null);
        return;
    }
    
    // Always update the backend with the new column (or same column) to ensure persistence.
    // If columns are different, or we moved, update.
    console.log("Updating column to:", overColumn.id);
    try {
        await api.updateTask(activeId as string, { columnId: overColumn.id });
        console.log("API update successful");
    } catch (err) {
        console.error("API update failed:", err);
    }

    setColumns((prev) => {
        const activeTask = activeColumn.tasks.find((t) => t.id === activeId);
        if (!activeTask) return prev;

        // Remove from source
        const sourceCol = prev.find(c => c.id === activeColumn.id)!;
        const newSourceTasks = sourceCol.tasks.filter(t => t.id !== activeId);

        // Add to dest
        const destCol = prev.find(c => c.id === overColumn.id)!;
        const newDestTasks = [...destCol.tasks];
        
        // Simple append for now to test cross-column move
        if (activeColumn.id !== overColumn.id) {
             newDestTasks.push(activeTask);
        } else {
             // Reorder in same column
             const oldIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
             const newIndex = activeColumn.tasks.findIndex((t) => t.id === overId);
             return prev.map(c => {
                 if (c.id === activeColumn.id) {
                     return { ...c, tasks: arrayMove(c.tasks, oldIndex, newIndex) };
                 }
                 return c;
             });
        }

        return prev.map(c => {
            if (c.id === activeColumn.id) return { ...c, tasks: newSourceTasks };
            if (c.id === overColumn.id) return { ...c, tasks: newDestTasks };
            return c;
        });
    });

    setActiveTask(null);
    setActiveColumnId(null);
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden text-slate-50">
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
              <Column key={col.id} column={col}>
                {col.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} columnId={col.id} />
                ))}
              </Column>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard 
              task={activeTask} 
              columnId={activeColumnId!}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
