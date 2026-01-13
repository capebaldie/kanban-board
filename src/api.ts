import type { Task } from "./types";
import { v4 as uuidv4 } from "uuid";

// Simple cookie helper
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Get or Create User ID
export function getUserId() {
  let userId = getCookie("user_id");
  if (!userId) {
    userId = uuidv4();
    setCookie("user_id", userId, 365);
  }
  return userId;
}

const API_URL = "http://localhost:3000/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const userId = getUserId();
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    "x-user-id": userId,
  };
  
  const response = await fetch(`${API_URL}${url}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getTasks: async (): Promise<Task[]> => {
    return fetchWithAuth("/tasks");
  },

  createTask: async (task: Task & { columnId: string }) => {
    return fetchWithAuth("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  },

  updateTask: async (id: string, updates: Partial<{ content: string; columnId: string }>) => {
    return fetchWithAuth(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  deleteTask: async (id: string) => {
    return fetchWithAuth(`/tasks/${id}`, {
      method: "DELETE",
    });
  },
};
