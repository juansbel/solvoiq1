var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiContext: () => aiContext,
  clientActivities: () => clientActivities,
  clients: () => clients,
  emailTemplates: () => emailTemplates,
  insertAiContextSchema: () => insertAiContextSchema,
  insertClientActivitySchema: () => insertClientActivitySchema,
  insertClientSchema: () => insertClientSchema,
  insertEmailTemplateSchema: () => insertEmailTemplateSchema,
  insertKnowledgeAnalyticsSchema: () => insertKnowledgeAnalyticsSchema,
  insertKnowledgeArticleSchema: () => insertKnowledgeArticleSchema,
  insertKnowledgeBookmarkSchema: () => insertKnowledgeBookmarkSchema,
  insertKnowledgeCategorySchema: () => insertKnowledgeCategorySchema,
  insertKnowledgeCommentSchema: () => insertKnowledgeCommentSchema,
  insertKnowledgeRevisionSchema: () => insertKnowledgeRevisionSchema,
  insertStatisticsSchema: () => insertStatisticsSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertTeamMemberSchema: () => insertTeamMemberSchema,
  knowledgeAnalytics: () => knowledgeAnalytics,
  knowledgeArticles: () => knowledgeArticles,
  knowledgeBookmarks: () => knowledgeBookmarks,
  knowledgeCategories: () => knowledgeCategories,
  knowledgeComments: () => knowledgeComments,
  knowledgeRevisions: () => knowledgeRevisions,
  statistics: () => statistics,
  tasks: () => tasks,
  teamMembers: () => teamMembers,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Supabase auth user ID
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  assignedTeamMembers: text("assigned_team_members").array().default([]),
  kpis: jsonb("kpis").$type().default([]),
  createdAt: timestamp("created_at").defaultNow()
});
var teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Supabase auth user ID
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  position: text("position"),
  location: text("location"),
  teamMemberId: text("team_member_id"),
  skills: text("skills").array(),
  incapacidades: jsonb("incapacidades").$type().default([]),
  oneOnOneSessions: jsonb("one_on_one_sessions").$type().default([]),
  createdAt: timestamp("created_at").defaultNow()
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Supabase auth user ID
  name: text("name").notNull(),
  description: text("description").notNull(),
  suggestedDueDate: text("suggested_due_date"),
  status: text("status").notNull().default("pending"),
  // "pending" | "completed" | "in_progress"
  priority: text("priority").notNull().default("medium"),
  // "low" | "medium" | "high" | "urgent"
  category: text("category").default("general"),
  // "general" | "client" | "admin" | "marketing" | "development"
  estimatedMinutes: integer("estimated_minutes").default(30),
  timeSpent: integer("time_spent").default(0),
  // Time spent in minutes
  isAiGenerated: boolean("is_ai_generated").default(false),
  assignedTo: text("assigned_to"),
  // Team member assignment
  tags: text("tags").array(),
  // Array of tags for better organization
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Supabase auth user ID
  title: text("title").notNull(),
  body: text("body").notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var clientActivities = pgTable("client_activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Supabase auth user ID
  clientId: integer("client_id").notNull(),
  type: text("type").notNull(),
  // "log" | "meeting" | "followup"
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  // For storing additional data like attendees, dates, etc.
  createdAt: timestamp("created_at").defaultNow()
});
var statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Supabase auth user ID
  communicationsSent: integer("communications_sent").default(0),
  tasksCreated: integer("tasks_created").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
  clientsManaged: integer("clients_managed").default(0),
  teamMembers: integer("team_members").default(0),
  avgResponseTime: text("avg_response_time").default("2.3"),
  clientRetention: text("client_retention").default("94.2"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var aiContext = pgTable("ai_context", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Supabase auth user ID
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var knowledgeCategories = pgTable("knowledge_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3b82f6"),
  // hex color
  icon: varchar("icon", { length: 50 }).default("Book"),
  parentId: integer("parent_id").references(() => knowledgeCategories.id),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var knowledgeArticles = pgTable("knowledge_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt", { length: 1e3 }),
  categoryId: integer("category_id").references(() => knowledgeCategories.id),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  // draft, published, archived
  priority: varchar("priority", { length: 20 }).default("medium"),
  // low, medium, high, critical
  tags: varchar("tags", { length: 2e3 }).array(),
  // array of tags
  attachments: varchar("attachments", { length: 2e3 }).array(),
  // array of file URLs
  relatedArticles: integer("related_articles").array(),
  // array of article IDs
  viewCount: integer("view_count").default(0),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  isPublic: boolean("is_public").default(false),
  isFeatured: boolean("is_featured").default(false),
  searchKeywords: varchar("search_keywords", { length: 2e3 }),
  metadata: text("metadata"),
  // JSON string for additional data
  version: integer("version").default(1),
  publishedAt: timestamp("published_at"),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var knowledgeComments = pgTable("knowledge_comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeArticles.id).notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id").references(() => knowledgeComments.id),
  // for replies
  isResolved: boolean("is_resolved").default(false),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var knowledgeRevisions = pgTable("knowledge_revisions", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeArticles.id).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  changeDescription: varchar("change_description", { length: 1e3 }),
  version: integer("version").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var knowledgeBookmarks = pgTable("knowledge_bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  articleId: integer("article_id").references(() => knowledgeArticles.id).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var knowledgeAnalytics = pgTable("knowledge_analytics", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeArticles.id).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  // view, like, share, download, etc
  sessionId: varchar("session_id", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  referrer: varchar("referrer", { length: 500 }),
  timeSpent: integer("time_spent"),
  // seconds
  metadata: text("metadata"),
  // JSON string
  createdAt: timestamp("created_at").defaultNow()
});
var insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true
});
var insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true
});
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true
});
var insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true
});
var insertClientActivitySchema = createInsertSchema(clientActivities).omit({
  id: true,
  createdAt: true
});
var insertStatisticsSchema = createInsertSchema(statistics).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAiContextSchema = createInsertSchema(aiContext).omit({
  id: true,
  updatedAt: true
});
var insertKnowledgeCategorySchema = createInsertSchema(knowledgeCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  slug: true,
  viewCount: true,
  likes: true,
  dislikes: true,
  version: true,
  createdAt: true,
  updatedAt: true
});
var insertKnowledgeCommentSchema = createInsertSchema(knowledgeComments).omit({
  id: true,
  likes: true,
  createdAt: true,
  updatedAt: true
});
var insertKnowledgeRevisionSchema = createInsertSchema(knowledgeRevisions).omit({
  id: true,
  createdAt: true
});
var insertKnowledgeBookmarkSchema = createInsertSchema(knowledgeBookmarks).omit({
  id: true,
  createdAt: true
});
var insertKnowledgeAnalyticsSchema = createInsertSchema(knowledgeAnalytics).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
var withTimeout = async (promise, timeoutMs = 3e3) => {
  const timeoutPromise = new Promise(
    (_, reject) => setTimeout(() => reject(new Error("Database operation timed out")), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};
async function registerRoutes(app2) {
  app2.get("/api/clients", async (req, res) => {
    try {
      const clients3 = await withTimeout(storage.getClients());
      res.json(clients3);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.json([]);
    }
  });
  app2.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await withTimeout(storage.getClient(id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });
  app2.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await withTimeout(storage.createClient(clientData));
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Invalid client data" });
    }
  });
  app2.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await withTimeout(storage.updateClient(id, clientData));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Invalid client data" });
    }
  });
  app2.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await withTimeout(storage.deleteClient(id));
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });
  app2.get("/api/team-members", async (req, res) => {
    try {
      const members = await withTimeout(storage.getTeamMembers());
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });
  app2.post("/api/team-members", async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await withTimeout(storage.createTeamMember(memberData));
      res.json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(400).json({ message: "Invalid team member data" });
    }
  });
  app2.get("/api/tasks", async (req, res) => {
    try {
      const tasks3 = await withTimeout(storage.getTasks());
      res.json(tasks3);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.json([]);
    }
  });
  app2.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await withTimeout(storage.createTask(taskData));
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: "Invalid task data" });
    }
  });
  app2.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      const task = await withTimeout(storage.updateTask(id, taskData));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ message: "Invalid task data" });
    }
  });
  app2.patch("/api/tasks/:id/time", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { timeSpent } = req.body;
      if (typeof timeSpent !== "number" || timeSpent < 0) {
        return res.status(400).json({ message: "Invalid time value" });
      }
      const task = await withTimeout(storage.updateTask(id, { timeSpent }));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task time:", error);
      res.status(400).json({ message: "Failed to update task time" });
    }
  });
  app2.get("/api/email-templates", async (req, res) => {
    try {
      const templates = await withTimeout(storage.getEmailTemplates());
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });
  app2.post("/api/email-templates", async (req, res) => {
    try {
      const templateData = insertEmailTemplateSchema.parse(req.body);
      const template = await withTimeout(storage.createEmailTemplate(templateData));
      res.json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(400).json({ message: "Invalid template data" });
    }
  });
  app2.delete("/api/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await withTimeout(storage.deleteEmailTemplate(id));
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });
  app2.get("/api/clients/:id/activities", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const activities = await withTimeout(storage.getClientActivities(clientId));
      res.json(activities);
    } catch (error) {
      console.error("Error fetching client activities:", error);
      res.status(500).json({ message: "Failed to fetch client activities" });
    }
  });
  app2.post("/api/clients/:id/activities", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const activityData = insertClientActivitySchema.parse({
        ...req.body,
        clientId
      });
      const activity = await withTimeout(storage.createClientActivity(activityData));
      res.json(activity);
    } catch (error) {
      console.error("Error creating client activity:", error);
      res.status(400).json({ message: "Invalid activity data" });
    }
  });
  app2.get("/api/statistics", async (req, res) => {
    try {
      const stats = await withTimeout(storage.getStatistics());
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  app2.put("/api/statistics", async (req, res) => {
    try {
      const statsData = req.body;
      const stats = await withTimeout(storage.updateStatistics(statsData));
      res.json(stats);
    } catch (error) {
      console.error("Error updating statistics:", error);
      res.status(400).json({ message: "Invalid statistics data" });
    }
  });
  app2.get("/api/ai-context", async (req, res) => {
    try {
      let context = await withTimeout(storage.getAiContext());
      if (!context) {
        const defaultContext = {
          userId: "1",
          content: "You are a professional business assistant helping with client management, task coordination, and communication. Always maintain a professional tone and focus on practical, actionable solutions."
        };
        context = await withTimeout(storage.updateAiContext(defaultContext));
      }
      res.json(context);
    } catch (error) {
      console.error("Error fetching AI context:", error);
      res.status(500).json({ message: "Failed to fetch AI context" });
    }
  });
  app2.put("/api/ai-context", async (req, res) => {
    try {
      const contextData = insertAiContextSchema.parse(req.body);
      const context = await withTimeout(storage.updateAiContext(contextData));
      res.json(context);
    } catch (error) {
      console.error("Error updating AI context:", error);
      res.status(400).json({ message: "Invalid AI context data" });
    }
  });
  app2.post("/api/ai/rewrite-email", async (req, res) => {
    try {
      const { draftEmail } = req.body;
      const context = await withTimeout(storage.getAiContext());
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
      console.log("API Key available:", apiKey ? "Yes" : "No");
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Context: ${context?.content || ""}

Please rewrite the following email to be more professional and polished while maintaining the original intent and key information:

Draft Email:
${draftEmail}

Provide a professional version that:
- Uses appropriate business tone
- Has clear structure and formatting
- Maintains all important information
- Includes a suitable subject line
- Is ready to send to a client`
            }]
          }]
        })
      });
      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      const rewrittenEmail = data.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate response";
      const stats = await storage.getStatistics();
      await storage.updateStatistics({
        communicationsSent: (stats.communicationsSent || 0) + 1
      });
      res.json({ rewrittenEmail });
    } catch (error) {
      console.error("Rewrite email error:", error);
      res.status(500).json({ message: "Failed to rewrite email", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/ai/generate-followup", async (req, res) => {
    try {
      const { subject, notes } = req.body;
      const context = await storage.getAiContext();
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ""
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Context: ${context?.content || ""}

Generate a professional follow-up email based on the following:

Subject/Context: ${subject || "General follow-up"}
Specific Points: ${notes}

Create a well-structured follow-up email that:
- Has an appropriate subject line
- Uses professional but approachable tone
- Incorporates the specific points mentioned
- Includes next steps or calls to action
- Maintains client relationship focus`
            }]
          }]
        })
      });
      if (!response.ok) {
        throw new Error("Failed to generate follow-up");
      }
      const data = await response.json();
      const followupEmail = data.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate response";
      const stats = await storage.getStatistics();
      await storage.updateStatistics({
        communicationsSent: (stats.communicationsSent || 0) + 1
      });
      res.json({ followupEmail });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate follow-up" });
    }
  });
  app2.post("/api/ai/analyze-email", async (req, res) => {
    try {
      const { emailContent } = req.body;
      const context = await storage.getAiContext();
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ""
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Context: ${context?.content || ""}

Analyze the following client email and provide insights and actionable next steps:

Email Content:
${emailContent}

Please provide:
1. Key insights about the client's concerns, urgency level, and sentiment
2. Recommended next steps as a bulleted list
3. Communication priority level (High/Medium/Low)
4. Any potential risks or opportunities identified

Format your response clearly with sections for each point.`
            }]
          }]
        })
      });
      if (!response.ok) {
        throw new Error("Failed to analyze email");
      }
      const data = await response.json();
      const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate response";
      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze email" });
    }
  });
  app2.post("/api/ai/generate-tasks", async (req, res) => {
    try {
      const { suggestions } = req.body;
      const context = await storage.getAiContext();
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ""
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Context: ${context?.content || ""}

Based on the following suggestions or general context, generate a list of actionable tasks:

${suggestions || "Generate tasks based on the general business context"}

Please provide a JSON array of tasks with the following structure:
{
  "tasks": [
    {
      "name": "Task name",
      "description": "Detailed description",
      "suggestedDueDate": "Suggested due date"
    }
  ]
}

Generate 3-5 practical, actionable tasks that would help advance client relationships and business objectives.`
            }]
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });
      if (!response.ok) {
        throw new Error("Failed to generate tasks");
      }
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      try {
        const parsed = JSON.parse(responseText);
        const tasks3 = parsed.tasks || [];
        const createdTasks = [];
        for (const task of tasks3) {
          const createdTask = await storage.createTask({
            ...task,
            status: "pending",
            isAiGenerated: true
          });
          createdTasks.push(createdTask);
        }
        res.json({ tasks: createdTasks });
      } catch (parseError) {
        res.status(500).json({ message: "Failed to parse AI response" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to generate tasks" });
    }
  });
  app2.post("/api/ai/generate-templates", async (req, res) => {
    try {
      const { suggestions } = req.body;
      const context = await storage.getAiContext();
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ""
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Context: ${context?.content || ""}

Based on the following suggestions, generate 2-3 email templates:

${suggestions}

Please provide a JSON array of templates with the following structure:
{
  "templates": [
    {
      "title": "Template title",
      "body": "Complete email template body"
    }
  ]
}

Each template should be professional, ready-to-use, and address the suggestions provided.`
            }]
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });
      if (!response.ok) {
        throw new Error("Failed to generate templates");
      }
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      try {
        const parsed = JSON.parse(responseText);
        const templates = parsed.templates || [];
        res.json({ templates });
      } catch (parseError) {
        res.status(500).json({ message: "Failed to parse AI response" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to generate templates" });
    }
  });
  app2.post("/api/ai/generate-report", async (req, res) => {
    try {
      const { startDate, endDate, highlights } = req.body;
      const context = await storage.getAiContext();
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ""
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Context: ${context?.content || ""}

Generate a comprehensive client activity report for the period from ${startDate} to ${endDate}.

Key Activities & Highlights:
${highlights}

Create a professional report with the following sections:
1. Executive Summary
2. Key Achievements
3. Performance Metrics
4. Next Steps

The report should be well-formatted, detailed, and suitable for client presentation.`
            }]
          }]
        })
      });
      if (!response.ok) {
        throw new Error("Failed to generate report");
      }
      const data = await response.json();
      const report = data.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate response";
      const stats = await storage.getStatistics();
      await storage.updateStatistics({
        communicationsSent: (stats.communicationsSent || 0) + 1
      });
      res.json({ report });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc } from "drizzle-orm";
var { clients: clients2, teamMembers: teamMembers2, tasks: tasks2, emailTemplates: emailTemplates2, clientActivities: clientActivities2, statistics: statistics2, aiContext: aiContext2 } = schema_exports;
var DrizzleStorage = class {
  db;
  constructor(databaseUrl) {
    const sql = postgres(databaseUrl, {
      max: 5,
      idle_timeout: 10,
      connect_timeout: 10,
      prepare: false,
      ssl: "require",
      transform: postgres.camel
    });
    this.db = drizzle(sql, { schema: schema_exports });
  }
  async getUser(id) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  async createUser(user) {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }
  async getClients() {
    return await this.db.select().from(clients).orderBy(desc(clients.createdAt));
  }
  async getClient(id) {
    const result = await this.db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result[0];
  }
  async createClient(client) {
    const clientData = {
      ...client,
      assignedTeamMembers: client.assignedTeamMembers ? JSON.parse(JSON.stringify(client.assignedTeamMembers)) : [],
      kpis: client.kpis ? JSON.parse(JSON.stringify(client.kpis)) : []
    };
    const result = await this.db.insert(clients2).values([clientData]).returning();
    return result[0];
  }
  async updateClient(id, client) {
    const result = await this.db.update(clients2).set(client).where(eq(clients2.id, id)).returning();
    return result[0];
  }
  async deleteClient(id) {
    const result = await this.db.delete(clients2).where(eq(clients2.id, id));
    return true;
  }
  async getTeamMembers() {
    return await this.db.select().from(teamMembers2).orderBy(desc(teamMembers2.createdAt));
  }
  async getTeamMember(id) {
    const result = await this.db.select().from(teamMembers2).where(eq(teamMembers2.id, id)).limit(1);
    return result[0];
  }
  async createTeamMember(member) {
    const memberData = {
      ...member,
      skills: member.skills ? JSON.parse(JSON.stringify(member.skills)) : [],
      incapacidades: member.incapacidades ? JSON.parse(JSON.stringify(member.incapacidades)) : [],
      oneOnOneSessions: member.oneOnOneSessions ? JSON.parse(JSON.stringify(member.oneOnOneSessions)) : []
    };
    const result = await this.db.insert(teamMembers2).values([memberData]).returning();
    return result[0];
  }
  async deleteTeamMember(id) {
    const result = await this.db.delete(teamMembers2).where(eq(teamMembers2.id, id));
    return true;
  }
  async getTasks() {
    return await this.db.select().from(tasks2).orderBy(desc(tasks2.createdAt));
  }
  async getTask(id) {
    const result = await this.db.select().from(tasks2).where(eq(tasks2.id, id)).limit(1);
    return result[0];
  }
  async createTask(task) {
    const result = await this.db.insert(tasks2).values([task]).returning();
    return result[0];
  }
  async updateTask(id, task) {
    const result = await this.db.update(tasks2).set(task).where(eq(tasks2.id, id)).returning();
    return result[0];
  }
  async deleteTask(id) {
    const result = await this.db.delete(tasks2).where(eq(tasks2.id, id));
    return true;
  }
  async getEmailTemplates() {
    return await this.db.select().from(emailTemplates2).orderBy(desc(emailTemplates2.createdAt));
  }
  async createEmailTemplate(template) {
    const result = await this.db.insert(emailTemplates2).values([template]).returning();
    return result[0];
  }
  async deleteEmailTemplate(id) {
    const result = await this.db.delete(emailTemplates2).where(eq(emailTemplates2.id, id)).returning();
    return result.length > 0;
  }
  async getClientActivities(clientId) {
    return await this.db.select().from(clientActivities2).where(eq(clientActivities2.clientId, clientId)).orderBy(desc(clientActivities2.createdAt));
  }
  async createClientActivity(activity) {
    const result = await this.db.insert(clientActivities2).values([activity]).returning();
    return result[0];
  }
  async getStatistics() {
    const result = await this.db.select().from(statistics).limit(1);
    if (result.length === 0) {
      const defaultStats = {
        userId: "1",
        communicationsSent: 0,
        tasksCreated: 0,
        tasksCompleted: 0
      };
      const created = await this.db.insert(statistics).values([defaultStats]).returning();
      return created[0];
    }
    return result[0];
  }
  async updateStatistics(stats) {
    const existing = await this.getStatistics();
    const result = await this.db.update(statistics2).set(stats).where(eq(statistics2.id, existing.id)).returning();
    return result[0];
  }
  async getAiContext() {
    const result = await this.db.select().from(aiContext2).limit(1);
    if (result.length === 0) {
      const defaultContext = {
        userId: "1",
        content: `Company: TechSolutions Inc.
Industry: Technology Solutions & Consulting
Team Size: 15-20 employees
Services: Custom software development, cloud migration, digital transformation
Tone: Professional yet approachable
Key Values: Innovation, reliability, client success
Communication Style: Clear, solution-oriented, proactive`
      };
      const created = await this.db.insert(aiContext2).values([defaultContext]).returning();
      return created[0];
    }
    return result[0];
  }
  async updateAiContext(context) {
    const existing = await this.getAiContext();
    if (existing) {
      const result = await this.db.update(aiContext2).set(context).where(eq(aiContext2.id, existing.id)).returning();
      return result[0];
    } else {
      const result = await this.db.insert(aiContext2).values([context]).returning();
      return result[0];
    }
  }
};

// server/storage.ts
var MemStorage = class {
  users;
  clients;
  teamMembers;
  tasks;
  emailTemplates;
  clientActivities;
  statistics;
  aiContext;
  knowledgeCategories;
  knowledgeArticles;
  knowledgeComments;
  knowledgeRevisions;
  knowledgeBookmarks;
  knowledgeAnalytics;
  currentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.clients = /* @__PURE__ */ new Map();
    this.teamMembers = /* @__PURE__ */ new Map();
    this.tasks = /* @__PURE__ */ new Map();
    this.emailTemplates = /* @__PURE__ */ new Map();
    this.clientActivities = /* @__PURE__ */ new Map();
    this.statistics = {
      id: 1,
      userId: "1",
      communicationsSent: 0,
      tasksCreated: 0,
      tasksCompleted: 0,
      clientsManaged: 0,
      teamMembers: 0,
      avgResponseTime: "0",
      clientRetention: "0",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.knowledgeCategories = /* @__PURE__ */ new Map();
    this.knowledgeArticles = /* @__PURE__ */ new Map();
    this.knowledgeComments = /* @__PURE__ */ new Map();
    this.knowledgeRevisions = /* @__PURE__ */ new Map();
    this.knowledgeBookmarks = /* @__PURE__ */ new Map();
    this.knowledgeAnalytics = [];
    this.currentId = 1;
    this.initializeData();
    this.initializeKnowledgeData();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    const userArray = Array.from(this.users.values());
    for (const user of userArray) {
      if (user.username === username) {
        return user;
      }
    }
    return void 0;
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getClients() {
    return Array.from(this.clients.values());
  }
  async getClient(id) {
    return this.clients.get(id);
  }
  async createClient(client) {
    const id = this.currentId++;
    const newClient = {
      ...client,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      phone: client.phone ?? null,
      notes: client.notes ?? null,
      assignedTeamMembers: client.assignedTeamMembers ?? null,
      kpis: client.kpis ? JSON.parse(JSON.stringify(client.kpis)) : []
    };
    this.clients.set(id, newClient);
    return newClient;
  }
  async updateClient(id, client) {
    const existing = this.clients.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...client,
      kpis: client.kpis ? JSON.parse(JSON.stringify(client.kpis)) : existing.kpis
    };
    this.clients.set(id, updated);
    return updated;
  }
  async deleteClient(id) {
    return this.clients.delete(id);
  }
  async getTeamMembers() {
    return Array.from(this.teamMembers.values());
  }
  async getTeamMember(id) {
    return this.teamMembers.get(id);
  }
  async createTeamMember(member) {
    const id = this.currentId++;
    const newMember = {
      ...member,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      position: member.position ?? null,
      location: member.location ?? null,
      teamMemberId: member.teamMemberId ?? null,
      skills: member.skills ?? null,
      incapacidades: member.incapacidades ? JSON.parse(JSON.stringify(member.incapacidades)) : [],
      oneOnOneSessions: member.oneOnOneSessions ? JSON.parse(JSON.stringify(member.oneOnOneSessions)) : []
    };
    this.teamMembers.set(id, newMember);
    return newMember;
  }
  async deleteTeamMember(id) {
    return this.teamMembers.delete(id);
  }
  async getTasks() {
    return Array.from(this.tasks.values());
  }
  async getTask(id) {
    return this.tasks.get(id);
  }
  async createTask(task) {
    const id = this.currentId++;
    const newTask = {
      ...task,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      status: task.status || "pending",
      priority: task.priority || "medium",
      suggestedDueDate: task.suggestedDueDate ?? null,
      category: task.category ?? null,
      estimatedMinutes: task.estimatedMinutes ?? null,
      timeSpent: task.timeSpent ?? null,
      assignedTo: task.assignedTo ?? null,
      tags: task.tags ?? null,
      dueDate: task.dueDate ?? null,
      completedAt: task.completedAt ?? null,
      isAiGenerated: task.isAiGenerated ?? null
    };
    this.tasks.set(id, newTask);
    return newTask;
  }
  async updateTask(id, task) {
    const existing = this.tasks.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...task,
      completedAt: task.status === "completed" ? /* @__PURE__ */ new Date() : existing.completedAt
    };
    this.tasks.set(id, updated);
    return updated;
  }
  async deleteTask(id) {
    return this.tasks.delete(id);
  }
  async getEmailTemplates() {
    return Array.from(this.emailTemplates.values());
  }
  async createEmailTemplate(template) {
    const id = this.currentId++;
    const newTemplate = {
      ...template,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      isAiGenerated: template.isAiGenerated ?? null
    };
    this.emailTemplates.set(id, newTemplate);
    return newTemplate;
  }
  async deleteEmailTemplate(id) {
    return this.emailTemplates.delete(id);
  }
  async getClientActivities(clientId) {
    return this.clientActivities.get(clientId) || [];
  }
  async createClientActivity(activity) {
    const id = this.currentId++;
    const newActivity = {
      ...activity,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      metadata: activity.metadata ?? {}
    };
    const existing = this.clientActivities.get(activity.clientId) || [];
    existing.push(newActivity);
    this.clientActivities.set(activity.clientId, existing);
    return newActivity;
  }
  async getStatistics() {
    return this.statistics;
  }
  async updateStatistics(stats) {
    this.statistics = {
      ...this.statistics,
      ...stats,
      id: this.statistics.id,
      userId: this.statistics.userId,
      updatedAt: /* @__PURE__ */ new Date()
    };
    return this.statistics;
  }
  async getAiContext() {
    return this.aiContext;
  }
  async updateAiContext(context) {
    const newContext = {
      id: this.aiContext?.id || this.currentId++,
      userId: context.userId,
      content: context.content,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.aiContext = newContext;
    return newContext;
  }
  // Knowledge Management Methods
  async getKnowledgeCategories() {
    return Array.from(this.knowledgeCategories.values());
  }
  async getKnowledgeCategory(id) {
    return this.knowledgeCategories.get(id);
  }
  async createKnowledgeCategory(category) {
    const id = this.currentId++;
    const newCategory = {
      ...category,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.knowledgeCategories.set(id, newCategory);
    return newCategory;
  }
  async updateKnowledgeCategory(id, category) {
    const existing = this.knowledgeCategories.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...category,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.knowledgeCategories.set(id, updated);
    return updated;
  }
  async deleteKnowledgeCategory(id) {
    return this.knowledgeCategories.delete(id);
  }
  async getKnowledgeArticles(filters) {
    let articles = Array.from(this.knowledgeArticles.values());
    if (filters) {
      if (filters.categoryId) {
        articles = articles.filter((article) => article.categoryId === filters.categoryId);
      }
      if (filters.status) {
        articles = articles.filter((article) => article.status === filters.status);
      }
      if (filters.authorId) {
        articles = articles.filter((article) => article.authorId === filters.authorId);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        articles = articles.filter(
          (article) => article.title.toLowerCase().includes(searchLower) || article.content.toLowerCase().includes(searchLower) || article.searchKeywords?.toLowerCase().includes(searchLower) || article.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }
    }
    return articles.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  async getKnowledgeArticle(id) {
    return this.knowledgeArticles.get(id);
  }
  async getKnowledgeArticleBySlug(slug) {
    return Array.from(this.knowledgeArticles.values()).find((article) => article.slug === slug);
  }
  async createKnowledgeArticle(article) {
    const id = this.currentId++;
    const slug = this.generateSlug(article.title);
    const newArticle = {
      ...article,
      id,
      slug,
      viewCount: 0,
      likes: 0,
      dislikes: 0,
      version: 1,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.knowledgeArticles.set(id, newArticle);
    await this.createKnowledgeRevision({
      articleId: id,
      title: article.title,
      content: article.content,
      authorId: article.authorId,
      changeDescription: "Initial creation",
      version: 1
    });
    return newArticle;
  }
  async updateKnowledgeArticle(id, article) {
    const existing = this.knowledgeArticles.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...article,
      version: existing.version + 1,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (article.title && article.title !== existing.title) {
      updated.slug = this.generateSlug(article.title);
    }
    this.knowledgeArticles.set(id, updated);
    if (article.content || article.title) {
      await this.createKnowledgeRevision({
        articleId: id,
        title: updated.title,
        content: updated.content,
        authorId: article.authorId || existing.authorId,
        changeDescription: "Content updated",
        version: updated.version
      });
    }
    return updated;
  }
  async deleteKnowledgeArticle(id) {
    const deleted = this.knowledgeArticles.delete(id);
    if (deleted) {
      this.knowledgeComments.delete(id);
      this.knowledgeRevisions.delete(id);
    }
    return deleted;
  }
  async getKnowledgeComments(articleId) {
    return Array.from(this.knowledgeComments.get(articleId) || []);
  }
  async createKnowledgeComment(comment) {
    const id = this.currentId++;
    const newComment = {
      ...comment,
      id,
      likes: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const comments = this.knowledgeComments.get(comment.articleId) || [];
    comments.push(newComment);
    this.knowledgeComments.set(comment.articleId, comments);
    return newComment;
  }
  async updateKnowledgeComment(id, comment) {
    for (const [articleId, comments] of this.knowledgeComments.entries()) {
      const commentIndex = comments.findIndex((c) => c.id === id);
      if (commentIndex !== -1) {
        const updated = { ...comments[commentIndex], ...comment, updatedAt: /* @__PURE__ */ new Date() };
        comments[commentIndex] = updated;
        return updated;
      }
    }
    return void 0;
  }
  async deleteKnowledgeComment(id) {
    for (const [articleId, comments] of this.knowledgeComments.entries()) {
      const commentIndex = comments.findIndex((c) => c.id === id);
      if (commentIndex !== -1) {
        comments.splice(commentIndex, 1);
        return true;
      }
    }
    return false;
  }
  async getKnowledgeRevisions(articleId) {
    const revisions = this.knowledgeRevisions.get(articleId) || [];
    return revisions.sort((a, b) => b.version - a.version);
  }
  async createKnowledgeRevision(revision) {
    const id = this.currentId++;
    const newRevision = {
      ...revision,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    const revisions = this.knowledgeRevisions.get(revision.articleId) || [];
    revisions.push(newRevision);
    this.knowledgeRevisions.set(revision.articleId, revisions);
    return newRevision;
  }
  async getUserKnowledgeBookmarks(userId) {
    return this.knowledgeBookmarks.get(userId) || [];
  }
  async createKnowledgeBookmark(bookmark) {
    const id = this.currentId++;
    const newBookmark = {
      ...bookmark,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    const bookmarks = this.knowledgeBookmarks.get(bookmark.userId) || [];
    bookmarks.push(newBookmark);
    this.knowledgeBookmarks.set(bookmark.userId, bookmarks);
    return newBookmark;
  }
  async deleteKnowledgeBookmark(userId, articleId) {
    const bookmarks = this.knowledgeBookmarks.get(userId) || [];
    const index = bookmarks.findIndex((b) => b.articleId === articleId);
    if (index !== -1) {
      bookmarks.splice(index, 1);
      return true;
    }
    return false;
  }
  async trackKnowledgeAnalytics(analytics) {
    const id = this.currentId++;
    const newAnalytics = {
      ...analytics,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.knowledgeAnalytics.push(newAnalytics);
    return newAnalytics;
  }
  async getKnowledgeAnalytics(articleId, timeframe) {
    let analytics = this.knowledgeAnalytics;
    if (articleId) {
      analytics = analytics.filter((a) => a.articleId === articleId);
    }
    if (timeframe) {
      const now = /* @__PURE__ */ new Date();
      let cutoffDate;
      switch (timeframe) {
        case "24h":
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
          break;
        case "7d":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
          break;
        case "30d":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
          break;
        default:
          return analytics;
      }
      analytics = analytics.filter((a) => a.createdAt >= cutoffDate);
    }
    return analytics.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  generateSlug(title) {
    return title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 100);
  }
  initializeKnowledgeData() {
    const categories = [
      {
        name: "Workflows & Processes",
        description: "Standard operating procedures and workflow documentation",
        color: "#3b82f6",
        icon: "Workflow",
        sortOrder: 1
      },
      {
        name: "Policies & Compliance",
        description: "Company policies, compliance guidelines, and regulatory information",
        color: "#ef4444",
        icon: "Shield",
        sortOrder: 2
      },
      {
        name: "Country-Specific Processes",
        description: "Regional procedures and country-specific requirements",
        color: "#10b981",
        icon: "Globe",
        sortOrder: 3
      },
      {
        name: "Proof of Concepts",
        description: "Technical proofs of concept and experimental procedures",
        color: "#f59e0b",
        icon: "Lightbulb",
        sortOrder: 4
      },
      {
        name: "Training & Onboarding",
        description: "Training materials and onboarding procedures",
        color: "#8b5cf6",
        icon: "GraduationCap",
        sortOrder: 5
      },
      {
        name: "Technical Documentation",
        description: "API documentation, technical guides, and system information",
        color: "#06b6d4",
        icon: "Code",
        sortOrder: 6
      }
    ];
    categories.forEach((cat) => {
      const id = this.currentId++;
      const category = {
        ...cat,
        id,
        parentId: null,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.knowledgeCategories.set(id, category);
    });
    const sampleArticles = [
      {
        title: "Client Onboarding Workflow",
        content: `# Client Onboarding Workflow

## Overview
This document outlines the standard process for onboarding new clients to ensure consistent service delivery and proper documentation.

## Pre-Onboarding Steps
1. **Initial Contact Review**
   - Verify client contact information
   - Confirm service requirements
   - Check compliance requirements

2. **Documentation Preparation**
   - Prepare service agreements
   - Set up client folders
   - Create project timelines

## Onboarding Process
### Week 1: Setup
- Welcome call with client
- System access provisioning
- Initial requirements gathering

### Week 2: Configuration
- System configuration based on requirements
- Initial training sessions
- Documentation review

### Week 3: Testing
- User acceptance testing
- Issue resolution
- Final configuration adjustments

### Week 4: Go-Live
- Production deployment
- Final training
- Handover to support team

## Post-Onboarding
- 30-day check-in call
- Performance review
- Feedback collection
- Process optimization

## Key Contacts
- Project Manager: [Contact Info]
- Technical Lead: [Contact Info]
- Account Manager: [Contact Info]

## Related Documents
- Service Level Agreement Template
- Client Requirements Checklist
- Training Materials Library`,
        excerpt: "Complete workflow for onboarding new clients with step-by-step procedures and timelines.",
        categoryId: 1,
        authorId: "1",
        status: "published",
        priority: "high",
        tags: ["onboarding", "workflow", "client-management", "process"],
        searchKeywords: "client onboarding workflow process setup configuration",
        isPublic: false,
        isFeatured: true,
        publishedAt: /* @__PURE__ */ new Date()
      },
      {
        title: "Data Privacy and GDPR Compliance Policy",
        content: `# Data Privacy and GDPR Compliance Policy

## Purpose
This policy ensures our organization complies with GDPR and other data protection regulations.

## Scope
This policy applies to all employees, contractors, and third parties who process personal data.

## Data Processing Principles
1. **Lawfulness, Fairness, and Transparency**
2. **Purpose Limitation**
3. **Data Minimization**
4. **Accuracy**
5. **Storage Limitation**
6. **Integrity and Confidentiality**
7. **Accountability**

## Data Subject Rights
- Right to be informed
- Right of access
- Right to rectification
- Right to erasure
- Right to restrict processing
- Right to data portability
- Right to object
- Rights related to automated decision making

## Data Breach Response
1. **Detection and Assessment** (within 24 hours)
2. **Containment and Investigation** (within 48 hours)
3. **Notification to Authorities** (within 72 hours)
4. **Communication to Data Subjects** (without undue delay)

## Compliance Monitoring
- Monthly privacy audits
- Quarterly training sessions
- Annual policy reviews
- Continuous risk assessments`,
        excerpt: "Comprehensive GDPR compliance policy covering data protection principles and breach response procedures.",
        categoryId: 2,
        authorId: "1",
        status: "published",
        priority: "critical",
        tags: ["gdpr", "privacy", "compliance", "data-protection", "policy"],
        searchKeywords: "gdpr data privacy compliance policy regulation",
        isPublic: false,
        isFeatured: true,
        publishedAt: /* @__PURE__ */ new Date()
      },
      {
        title: "EU Market Entry Process",
        content: `# EU Market Entry Process

## Overview
Guidelines for entering European Union markets, including regulatory requirements and compliance procedures.

## Regulatory Framework
### Key Regulations
- CE Marking requirements
- REACH compliance for chemicals
- Medical Device Regulation (MDR)
- General Product Safety Directive

## Market Entry Steps
1. **Market Research**
   - Competitive analysis
   - Regulatory landscape review
   - Consumer behavior studies

2. **Regulatory Compliance**
   - Product certification
   - Documentation preparation
   - Testing requirements

3. **Distribution Strategy**
   - Partner selection
   - Logistics setup
   - Pricing strategy

## Country-Specific Requirements
### Germany
- T\xDCV certification for technical products
- WEEE compliance for electronics
- Packaging ordinance compliance

### France
- AFNOR standards compliance
- French language requirements
- Import duty considerations

### Netherlands
- Dutch safety standards
- Environmental regulations
- VAT registration requirements

## Documentation Checklist
- [ ] CE marking documentation
- [ ] Product safety reports
- [ ] Import/export licenses
- [ ] Insurance certificates
- [ ] Quality management certificates`,
        excerpt: "Complete guide for entering EU markets with regulatory requirements and country-specific procedures.",
        categoryId: 3,
        authorId: "1",
        status: "published",
        priority: "medium",
        tags: ["eu", "market-entry", "compliance", "international", "regulation"],
        searchKeywords: "eu europe market entry regulatory compliance international",
        isPublic: false,
        publishedAt: /* @__PURE__ */ new Date()
      },
      {
        title: "AI-Powered Customer Service POC",
        content: `# AI-Powered Customer Service Proof of Concept

## Objective
Evaluate the feasibility of implementing AI chatbots for first-level customer support.

## Technology Stack
- **NLP Engine**: OpenAI GPT-4
- **Integration Platform**: Microsoft Bot Framework
- **Analytics**: Azure Application Insights
- **Knowledge Base**: Custom FAQ database

## Implementation Plan
### Phase 1: Foundation (Weeks 1-2)
- Set up development environment
- Create knowledge base
- Develop basic conversation flows

### Phase 2: Integration (Weeks 3-4)
- Integrate with existing CRM
- Implement escalation workflows
- Add analytics tracking

### Phase 3: Testing (Weeks 5-6)
- Internal testing
- Limited beta with select customers
- Performance optimization

## Success Criteria
- **Response Accuracy**: >85%
- **Resolution Rate**: >70% for Tier 1 issues
- **Customer Satisfaction**: >4.0/5.0
- **Response Time**: <30 seconds

## Risk Assessment
### Technical Risks
- API rate limiting
- Integration complexity
- Data privacy concerns

### Business Risks
- Customer acceptance
- Training requirements
- Maintenance overhead

## Results Summary
- Achieved 87% response accuracy
- 73% resolution rate for Tier 1 issues
- 4.2/5.0 customer satisfaction
- Average response time: 12 seconds

## Recommendations
1. Proceed with full implementation
2. Focus on additional training data
3. Implement multi-language support
4. Develop advanced escalation logic`,
        excerpt: "Proof of concept results for AI-powered customer service implementation with technology stack and performance metrics.",
        categoryId: 4,
        authorId: "1",
        status: "published",
        priority: "medium",
        tags: ["ai", "poc", "customer-service", "chatbot", "automation"],
        searchKeywords: "ai artificial intelligence poc proof concept chatbot customer service",
        isPublic: false,
        publishedAt: /* @__PURE__ */ new Date()
      }
    ];
    sampleArticles.forEach((article) => {
      const id = this.currentId++;
      const slug = this.generateSlug(article.title);
      const knowledgeArticle = {
        ...article,
        id,
        slug,
        viewCount: Math.floor(Math.random() * 100),
        likes: Math.floor(Math.random() * 20),
        dislikes: Math.floor(Math.random() * 3),
        version: 1,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1e3),
        // Random date within last 30 days
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.knowledgeArticles.set(id, knowledgeArticle);
    });
  }
  initializeData() {
    this.currentId = 1;
  }
};
var storage2 = new MemStorage();

// server/websocket.ts
import { WebSocketServer, WebSocket } from "ws";
var WebSocketManager = class {
  wss = null;
  clients = /* @__PURE__ */ new Set();
  initialize(server) {
    this.wss = new WebSocketServer({
      server,
      path: "/api/ws"
      // Use dedicated path to avoid conflicts with Vite
    });
    this.wss.on("connection", (ws) => {
      console.log("WebSocket client connected");
      this.clients.add(ws);
      this.sendToClient(ws, {
        type: "notification",
        data: {
          title: "Connected",
          message: "Real-time updates enabled"
        },
        timestamp: Date.now()
      });
      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });
      ws.on("close", () => {
        console.log("WebSocket client disconnected");
        this.clients.delete(ws);
      });
      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.clients.delete(ws);
      });
    });
    console.log("WebSocket server initialized");
  }
  handleClientMessage(ws, message) {
    switch (message.type) {
      case "ping":
        this.sendToClient(ws, {
          type: "notification",
          data: { title: "Pong", message: "Connection active" },
          timestamp: Date.now()
        });
        break;
      case "subscribe":
        console.log("Client subscribed to:", message.data);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }
  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
  broadcast(message) {
    const messageString = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      } else {
        this.clients.delete(client);
      }
    });
    console.log(`Broadcasted ${message.type} to ${this.clients.size} clients`);
  }
  // Notify clients about task updates
  notifyTaskUpdate(taskId, action) {
    this.broadcast({
      type: "task_update",
      data: {
        taskId,
        action,
        title: "Task Updated",
        message: `Task ${action} successfully`,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }
  // Notify clients about client updates
  notifyClientUpdate(clientId, action) {
    this.broadcast({
      type: "client_update",
      data: {
        clientId,
        action,
        title: "Client Updated",
        message: `Client ${action} successfully`,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }
  // Notify clients about team member updates
  notifyTeamUpdate(memberId, action) {
    this.broadcast({
      type: "team_update",
      data: {
        memberId,
        action,
        title: "Team Updated",
        message: `Team member ${action} successfully`,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }
  // Send general notifications
  sendNotification(title, message, priority = "medium") {
    this.broadcast({
      type: "notification",
      data: {
        title,
        message,
        priority,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }
  // Send business intelligence alerts
  sendBusinessAlert(type, data) {
    this.broadcast({
      type: "notification",
      data: {
        title: `Business Alert: ${type.replace("_", " ")}`,
        message: data.message,
        alertType: type,
        metrics: data.metrics,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }
  getConnectionCount() {
    return this.clients.size;
  }
  close() {
    this.clients.forEach((client) => {
      client.close();
    });
    this.clients.clear();
    if (this.wss) {
      this.wss.close();
    }
  }
};
var wsManager = new WebSocketManager();
function startPerformanceMonitoring() {
  setInterval(async () => {
    try {
      const stats = await storage.getStatistics();
      const clients3 = await storage.getClients();
      const tasks3 = await storage.getTasks();
      const teamMembers3 = await storage.getTeamMembers();
      const completionRate = stats.tasksCreated && stats.tasksCreated > 0 && stats.tasksCompleted !== null ? stats.tasksCompleted / stats.tasksCreated * 100 : 0;
      const totalRevenue = clients3.reduce((sum, client) => {
        return sum + (client.kpis?.reduce((kpiSum, kpi) => {
          return kpiSum + (typeof kpi.actual === "number" ? kpi.actual : 0);
        }, 0) || 0);
      }, 0);
      const urgentTasks = tasks3.filter(
        (task) => task.priority === "high" || task.priority === "critical"
      ).length;
      const clientHealthScores = clients3.map((client) => {
        const kpis = client.kpis || [];
        const metKpis = kpis.filter((kpi) => kpi.met).length;
        return kpis.length > 0 ? metKpis / kpis.length * 100 : 100;
      });
      const avgClientHealth = clientHealthScores.length > 0 ? clientHealthScores.reduce((sum, score) => sum + score, 0) / clientHealthScores.length : 100;
      if (completionRate < 70 && stats.tasksCreated && stats.tasksCreated > 0) {
        wsManager.sendBusinessAlert("task_completion", {
          message: `Task completion rate is ${completionRate.toFixed(1)}% - below target threshold`,
          metrics: { completionRate, totalTasks: tasks3.length }
        });
      }
      if (urgentTasks > 3) {
        wsManager.sendBusinessAlert("task_completion", {
          message: `${urgentTasks} urgent tasks require immediate attention`,
          metrics: { urgentTasks, totalTasks: tasks3.length }
        });
      }
      if (avgClientHealth < 75 && clients3.length > 0) {
        wsManager.sendBusinessAlert("client_health", {
          message: `Average client health is ${avgClientHealth.toFixed(1)}% - review needed`,
          metrics: { avgClientHealth, totalClients: clients3.length }
        });
      }
      if (totalRevenue > 5e4) {
        wsManager.sendBusinessAlert("revenue", {
          message: `Revenue milestone reached: $${totalRevenue.toLocaleString()}`,
          metrics: { totalRevenue, clientCount: clients3.length }
        });
      }
    } catch (error) {
      console.error("Performance monitoring error:", error);
    }
  }, 3e4);
}

// server/index.ts
import dotenv from "dotenv";
dotenv.config();
var storage;
if (process.env.DATABASE_URL) {
  storage = new DrizzleStorage(process.env.DATABASE_URL);
  console.log("Using database storage");
} else {
  storage = new MemStorage();
  console.log("Using in-memory storage (no DATABASE_URL provided)");
}
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  wsManager.initialize(server);
  startPerformanceMonitoring();
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist/public" });
    });
  }
  const port = 5e3;
  server.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
})();
export {
  storage
};
