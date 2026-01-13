import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  columnId: text('column_id').notNull(), // 'todo' | 'in-progress' | 'done'
  content: text('content').notNull(),
  userId: text('user_id').notNull(),
  createdAt: text('created_at').notNull(),
});
