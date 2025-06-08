import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./index";
import { wsManager } from "./websocket";
import { 
  insertClientSchema, insertTeamMemberSchema, insertTaskSchema,
  insertEmailTemplateSchema, insertClientActivitySchema, insertAiContextSchema
} from "@shared/schema";
import { insertKnowledgeArticleSchema, insertKnowledgeCommentSchema, insertKnowledgeCategorySchema } from "@shared/schema";

// Helper function with improved timeout and fallback handling
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Database operation timed out')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await withTimeout(storage.getClients());
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      // Return empty array instead of error for better UX
      res.json([]);
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
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

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = {
        ...insertClientSchema.parse(req.body),
        phone: req.body.phone || null,
        notes: req.body.notes || null,
        assignedTeamMembers: req.body.assignedTeamMembers || []
      };
      const client = await withTimeout(storage.createClient(clientData));
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = {
        ...insertClientSchema.partial().parse(req.body),
        phone: req.body.phone || null,
        notes: req.body.notes || null,
        assignedTeamMembers: req.body.assignedTeamMembers || []
      };
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

  app.delete("/api/clients/:id", async (req, res) => {
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

  // Team member routes
  app.get("/api/team-members", async (req, res) => {
    try {
      const members = await withTimeout(storage.getTeamMembers());
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post("/api/team-members", async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await withTimeout(storage.createTeamMember(memberData));
      res.json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(400).json({ message: "Invalid team member data" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await withTimeout(storage.getTasks());
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.json([]);
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await withTimeout(storage.createTask(taskData));
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
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

  app.patch("/api/tasks/:id/time", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { timeSpent } = req.body;
      
      if (typeof timeSpent !== 'number' || timeSpent < 0) {
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

  // Email template routes
  app.get("/api/email-templates", async (req, res) => {
    try {
      const templates = await withTimeout(storage.getEmailTemplates());
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.post("/api/email-templates", async (req, res) => {
    try {
      const templateData = insertEmailTemplateSchema.parse(req.body);
      const template = await withTimeout(storage.createEmailTemplate(templateData));
      res.json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(400).json({ message: "Invalid template data" });
    }
  });

  app.delete("/api/email-templates/:id", async (req, res) => {
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

  // Client activity routes
  app.get("/api/clients/:id/activities", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const activities = await withTimeout(storage.getClientActivities(clientId));
      res.json(activities);
    } catch (error) {
      console.error("Error fetching client activities:", error);
      res.status(500).json({ message: "Failed to fetch client activities" });
    }
  });

  app.post("/api/clients/:id/activities", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const activityData = insertClientActivitySchema.parse({
        ...req.body,
        clientId,
      });
      const activity = await withTimeout(storage.createClientActivity(activityData));
      res.json(activity);
    } catch (error) {
      console.error("Error creating client activity:", error);
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  // Statistics routes
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await withTimeout(storage.getStatistics());
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.put("/api/statistics", async (req, res) => {
    try {
      const statsData = req.body;
      const stats = await withTimeout(storage.updateStatistics(statsData));
      res.json(stats);
    } catch (error) {
      console.error("Error updating statistics:", error);
      res.status(400).json({ message: "Invalid statistics data" });
    }
  });

  // AI Context routes
  app.get("/api/ai-context", async (req, res) => {
    try {
      let context = await withTimeout(storage.getAiContext());
      if (!context) {
        // Create default AI context if none exists
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

  app.put("/api/ai-context", async (req, res) => {
    try {
      const contextData = insertAiContextSchema.parse(req.body);
      const context = await withTimeout(storage.updateAiContext(contextData));
      res.json(context);
    } catch (error) {
      console.error("Error updating AI context:", error);
      res.status(400).json({ message: "Invalid AI context data" });
    }
  });

  // AI-powered routes
  app.post("/api/ai/rewrite-email", async (req, res) => {
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
          "Content-Type": "application/json",
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

      // Update statistics
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

  app.post("/api/ai/generate-followup", async (req, res) => {
    try {
      const { subject, notes } = req.body;
      const context = await storage.getAiContext();
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "",
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

      // Update statistics
      const stats = await storage.getStatistics();
      await storage.updateStatistics({
        communicationsSent: (stats.communicationsSent || 0) + 1
      });

      res.json({ followupEmail });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate follow-up" });
    }
  });

  app.post("/api/ai/analyze-email", async (req, res) => {
    try {
      const { emailContent } = req.body;
      const context = await storage.getAiContext();
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "",
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

  app.post("/api/ai/generate-tasks", async (req, res) => {
    try {
      const { suggestions } = req.body;
      const context = await storage.getAiContext();
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "",
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
        const tasks = parsed.tasks || [];
        
        // Create tasks in storage
        const createdTasks = [];
        for (const task of tasks) {
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

  app.post("/api/ai/generate-templates", async (req, res) => {
    try {
      const { suggestions } = req.body;
      const context = await storage.getAiContext();
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "",
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

  app.post("/api/ai/generate-report", async (req, res) => {
    try {
      const { startDate, endDate, highlights } = req.body;
      const context = await storage.getAiContext();
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "",
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

      // Update statistics
      const stats = await storage.getStatistics();
      await storage.updateStatistics({
        communicationsSent: (stats.communicationsSent || 0) + 1
      });

      res.json({ report });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
