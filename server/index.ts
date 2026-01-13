import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db';
import { tasks } from './schema';
import { eq, and } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

// Ensure DB is set up (simple migration for now, or just force push)
// In a real app we'd use drizzle-kit migrate. For this quick setup we can trust the file creation or run a migrate script.
// Let's try to run migrations on startup or just let the user run a command. 
// For simplicity in a "small todo app", I'll add a helper to ensure table exists or just assume migration script runs.

const app = new Hono();

app.use('/*', cors({
  origin: (origin) => {
    return origin && origin.startsWith('http://localhost') ? origin : 'http://localhost:5173';
  },
  credentials: true,
}));

// Middleware to get user ID from cookie or header
// We'll trust the frontend to send a custom header 'x-user-id' for now as it's easier than parsing cookies on server without cookie middleware setup
// PRO-TIP: Hono has a cookie helper.
import { getCookie, setCookie } from 'hono/cookie'

app.use('*', async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  const userId = getCookie(c, 'user_id') || c.req.header('x-user-id');
  console.log('User ID:', userId);
  if (!userId) {
    // If no user ID, we can't persist effectively.
    // Ideally frontend generates it.
    console.warn('No User ID found in request');
  }
  await next();
});

app.get('/api/tasks', async (c) => {
  const userId = c.req.header('x-user-id') || getCookie(c, 'user_id');
  if (!userId) return c.json({ error: 'User ID required' }, 400);

  const userTasks = await db.select().from(tasks).where(eq(tasks.userId, userId));
  return c.json(userTasks);
});

app.post('/api/tasks', async (c) => {
  const userId = c.req.header('x-user-id') || getCookie(c, 'user_id');
  if (!userId) return c.json({ error: 'User ID required' }, 400);

  const body = await c.req.json();
  const { id, columnId, content, createdAt } = body;

  await db.insert(tasks).values({
    id,
    columnId,
    content,
    userId,
    createdAt: createdAt || new Date().toISOString(),
  });

  return c.json({ success: true });
});

app.put('/api/tasks/:id', async (c) => {
  const userId = c.req.header('x-user-id') || getCookie(c, 'user_id');
  if (!userId) return c.json({ error: 'User ID required' }, 400);
  
  const id = c.req.param('id');
  const body = await c.req.json();
  const { columnId, content } = body;

  const updateData: any = {};
  if (columnId !== undefined) updateData.columnId = columnId;
  if (content !== undefined) updateData.content = content;

  await db.update(tasks)
    .set(updateData)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

  return c.json({ success: true });
});

app.delete('/api/tasks/:id', async (c) => {
  const userId = c.req.header('x-user-id') || getCookie(c, 'user_id');
  if (!userId) return c.json({ error: 'User ID required' }, 400);
  
  const id = c.req.param('id');
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

  return c.json({ success: true });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
