export type Task = {
  id: string;
  content: string;
  createdAt?: string;
};

export type ColumnType = {
  id: "todo" | "in-progress" | "done";
  title: string;
  tasks: Task[];
};
