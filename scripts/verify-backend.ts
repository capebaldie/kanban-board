import { api } from "../src/api";
import { getUserId } from "../src/api";

// Mock fetch for Node environment if needed, or rely on global fetch (Node 18+)
// But src/api imports Types which might be issue if not using tsx correctly with path aliases or relative imports.
// Actually, src/api uses "uuid", "types".
// Let's adjust imports for the script or ensure tsx handles it.
// Simpler: use fetch directly in script to test API endpoints.

const API_URL = "http://localhost:3000/api";
const USER_ID = "test-user-verification";

async function run() {
  console.log("Starting verification...");

  // 1. Create Task
  console.log("Creating task...");
  const task = {
    id: "test-task-1",
    columnId: "todo",
    content: "Verify Backend",
    createdAt: new Date().toISOString(),
  };
  
  await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": USER_ID },
    body: JSON.stringify(task),
  });

  // 2. Get Tasks
  console.log("Fetching tasks...");
  const res = await fetch(`${API_URL}/tasks`, {
    headers: { "x-user-id": USER_ID },
  });
  const tasks = await res.json();
  console.log("Tasks:", tasks);

  if (tasks.find((t: any) => t.id === "test-task-1")) {
    console.log("✅ Task created and fetched.");
  } else {
    console.error("❌ Task not found.");
    process.exit(1);
  }

  // 3. Update Task
  console.log("Updating task...");
  await fetch(`${API_URL}/tasks/test-task-1`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-user-id": USER_ID },
    body: JSON.stringify({ columnId: "in-progress" }),
  });

  // 4. Verify Update
  const res2 = await fetch(`${API_URL}/tasks`, {
    headers: { "x-user-id": USER_ID },
  });
  const tasks2 = await res2.json();
  const updatedTask = tasks2.find((t: any) => t.id === "test-task-1");
  if (updatedTask && updatedTask.columnId === "in-progress") {
    console.log("✅ Task updated.");
  } else {
    console.error("❌ Task update failed.");
    process.exit(1);
  }

  // 5. Delete Task
  console.log("Deleting task...");
  await fetch(`${API_URL}/tasks/test-task-1`, {
    method: "DELETE",
    headers: { "x-user-id": USER_ID },
  });
  
  const res3 = await fetch(`${API_URL}/tasks`, {
    headers: { "x-user-id": USER_ID },
  });
  const tasks3 = await res3.json();
  if (!tasks3.find((t: any) => t.id === "test-task-1")) {
    console.log("✅ Task deleted.");
  } else {
    console.error("❌ Task deletion failed.");
    process.exit(1);
  }

  console.log("🎉 All verification steps passed!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
