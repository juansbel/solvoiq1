import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Supabase auth user ID
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").default(''),
  notes: text("notes").default(''),
  assignedTeamMembers: text("assigned_team_members").array().default([]),
  kpis: jsonb("kpis").$type<Array<{id: number, name: string, target: number, actual: number, met: boolean}>>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Supabase auth user ID
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  position: text("position"),
  location: text("location"),
  teamMemberId: text("team_member_id"),
  skills: text("skills").array(),
  incapacidades: jsonb("incapacidades").$type<Array<{id: number, startDate: string, endDate: string, reason: string}>>().default([]),
  oneOnOneSessions: jsonb("one_on_one_sessions").$type<Array<{id: number, date: string, discussionPoints: string[], actionItems: string[]}>>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Supabase auth user ID
  name: text("name").notNull(),
  description: text("description").notNull(),
  suggestedDueDate: text("suggested_due_date"),
  status: text("status").notNull().default("pending"), // "pending" | "completed" | "in_progress"
  priority: text("priority").notNull().default("medium"), // "low" | "medium" | "high" | "urgent"
  category: text("category").default("general"), // "general" | "client" | "admin" | "marketing" | "development"
  estimatedMinutes: integer("estimated_minutes").default(30),
  timeSpent: integer("time_spent").default(0), // Time spent in minutes
  isAiGenerated: boolean("is_ai_generated").default(false),
  assignedTo: text("assigned_to"), // Team member assignment
  tags: text("tags").array(), // Array of tags for better organization
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Supabase auth user ID
  title: text("title").notNull(),
  body: text("body").notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientActivities = pgTable("client_activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Supabase auth user ID
  clientId: integer("client_id").notNull(),
  type: text("type").notNull(), // "log" | "meeting" | "followup"
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For storing additional data like attendees, dates, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Supabase auth user ID
  communicationsSent: integer("communications_sent").default(0),
  tasksCreated: integer("tasks_created").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
  clientsManaged: integer("clients_managed").default(0),
  teamMembers: integer("team_members").default(0),
  avgResponseTime: text("avg_response_time").default("2.3"),
  clientRetention: text("client_retention").default("94.2"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiContext = pgTable("ai_context", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Supabase auth user ID
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Knowledge Management Tables
export const knowledgeCategories: any = pgTable("knowledge_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3b82f6"), // hex color
  icon: varchar("icon", { length: 50 }).default("Book"),
  parentId: integer("parent_id").references(() => knowledgeCategories.id),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeArticles = pgTable("knowledge_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt", { length: 1000 }),
  categoryId: integer("category_id").references(() => knowledgeCategories.id),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, published, archived
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, critical
  tags: varchar("tags", { length: 2000 }).array(), // array of tags
  attachments: varchar("attachments", { length: 2000 }).array(), // array of file URLs
  relatedArticles: integer("related_articles").array(), // array of article IDs
  viewCount: integer("view_count").default(0),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  isPublic: boolean("is_public").default(false),
  isFeatured: boolean("is_featured").default(false),
  searchKeywords: varchar("search_keywords", { length: 2000 }),
  metadata: text("metadata"), // JSON string for additional data
  version: integer("version").default(1),
  publishedAt: timestamp("published_at"),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeComments: any = pgTable("knowledge_comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeArticles.id).notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id").references(() => knowledgeComments.id), // for replies
  isResolved: boolean("is_resolved").default(false),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeRevisions = pgTable("knowledge_revisions", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeArticles.id).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  changeDescription: varchar("change_description", { length: 1000 }),
  version: integer("version").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeBookmarks = pgTable("knowledge_bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  articleId: integer("article_id").references(() => knowledgeArticles.id).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeAnalytics = pgTable("knowledge_analytics", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeArticles.id).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // view, like, share, download, etc
  sessionId: varchar("session_id", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  referrer: varchar("referrer", { length: 500 }),
  timeSpent: integer("time_spent"), // seconds
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertClientActivitySchema = createInsertSchema(clientActivities).omit({
  id: true,
  createdAt: true,
});

export const insertStatisticsSchema = createInsertSchema(statistics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiContextSchema = createInsertSchema(aiContext).omit({
  id: true,
  updatedAt: true,
});

// Knowledge Management Schemas
export const insertKnowledgeCategorySchema = createInsertSchema(knowledgeCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  slug: true,
  viewCount: true,
  likes: true,
  dislikes: true,
  version: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeCommentSchema = createInsertSchema(knowledgeComments).omit({
  id: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeRevisionSchema = createInsertSchema(knowledgeRevisions).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeBookmarkSchema = createInsertSchema(knowledgeBookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeAnalyticsSchema = createInsertSchema(knowledgeAnalytics).omit({
  id: true,
  createdAt: true,
});

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type ClientActivity = typeof clientActivities.$inferSelect;
export type InsertClientActivity = z.infer<typeof insertClientActivitySchema>;

export type Statistics = typeof statistics.$inferSelect;
export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;

export type AiContext = typeof aiContext.$inferSelect;
export type InsertAiContext = z.infer<typeof insertAiContextSchema>;

export type KnowledgeCategory = typeof knowledgeCategories.$inferSelect;
export type InsertKnowledgeCategory = z.infer<typeof insertKnowledgeCategorySchema>;

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;

export type KnowledgeComment = typeof knowledgeComments.$inferSelect;
export type InsertKnowledgeComment = z.infer<typeof insertKnowledgeCommentSchema>;

export type KnowledgeRevision = typeof knowledgeRevisions.$inferSelect;
export type InsertKnowledgeRevision = z.infer<typeof insertKnowledgeRevisionSchema>;

export type KnowledgeBookmark = typeof knowledgeBookmarks.$inferSelect;
export type InsertKnowledgeBookmark = z.infer<typeof insertKnowledgeBookmarkSchema>;

export type KnowledgeAnalytics = typeof knowledgeAnalytics.$inferSelect;
export type InsertKnowledgeAnalytics = z.infer<typeof insertKnowledgeAnalyticsSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
