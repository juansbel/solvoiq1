import type { 
  User, InsertUser, Client, InsertClient, TeamMember, InsertTeamMember, 
  Task, InsertTask, EmailTemplate, InsertEmailTemplate, 
  ClientActivity, InsertClientActivity, Statistics, InsertStatistics,
  AiContext, InsertAiContext, KnowledgeCategory, InsertKnowledgeCategory,
  KnowledgeArticle, InsertKnowledgeArticle, KnowledgeComment, InsertKnowledgeComment,
  KnowledgeRevision, InsertKnowledgeRevision, KnowledgeBookmark, InsertKnowledgeBookmark,
  KnowledgeAnalytics, InsertKnowledgeAnalytics
} from "../shared/schema";
import { IStorage } from "./interfaces";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client management
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Team management
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  deleteTeamMember(id: number): Promise<boolean>;

  // Task management
  getTasks(): Promise<Task[]>;
  getTasksByClientId(clientId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Email template management
  getEmailTemplates(): Promise<EmailTemplate[]>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  deleteEmailTemplate(id: number): Promise<boolean>;

  // Client activity management
  getClientActivities(clientId: number): Promise<ClientActivity[]>;
  createClientActivity(activity: InsertClientActivity): Promise<ClientActivity>;

  // Statistics management
  getStatistics(): Promise<Statistics>;
  updateStatistics(stats: Partial<InsertStatistics>): Promise<Statistics>;

  // AI Context management
  getAiContext(): Promise<AiContext | undefined>;
  updateAiContext(context: InsertAiContext): Promise<AiContext>;

  // Knowledge Management
  getKnowledgeCategories(): Promise<KnowledgeCategory[]>;
  getKnowledgeCategory(id: number): Promise<KnowledgeCategory | undefined>;
  createKnowledgeCategory(category: InsertKnowledgeCategory): Promise<KnowledgeCategory>;
  updateKnowledgeCategory(id: number, category: Partial<InsertKnowledgeCategory>): Promise<KnowledgeCategory | undefined>;
  deleteKnowledgeCategory(id: number): Promise<boolean>;

  getKnowledgeArticles(filters?: { categoryId?: number; status?: string; authorId?: string; search?: string }): Promise<KnowledgeArticle[]>;
  getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined>;
  getKnowledgeArticleBySlug(slug: string): Promise<KnowledgeArticle | undefined>;
  createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle>;
  updateKnowledgeArticle(id: number, article: Partial<InsertKnowledgeArticle>): Promise<KnowledgeArticle | undefined>;
  deleteKnowledgeArticle(id: number): Promise<boolean>;

  getKnowledgeComments(articleId: number): Promise<KnowledgeComment[]>;
  createKnowledgeComment(comment: InsertKnowledgeComment): Promise<KnowledgeComment>;
  updateKnowledgeComment(id: number, comment: Partial<InsertKnowledgeComment>): Promise<KnowledgeComment | undefined>;
  deleteKnowledgeComment(id: number): Promise<boolean>;

  getKnowledgeRevisions(articleId: number): Promise<KnowledgeRevision[]>;
  createKnowledgeRevision(revision: InsertKnowledgeRevision): Promise<KnowledgeRevision>;

  getUserKnowledgeBookmarks(userId: string): Promise<KnowledgeBookmark[]>;
  createKnowledgeBookmark(bookmark: InsertKnowledgeBookmark): Promise<KnowledgeBookmark>;
  deleteKnowledgeBookmark(userId: string, articleId: number): Promise<boolean>;

  trackKnowledgeAnalytics(analytics: InsertKnowledgeAnalytics): Promise<KnowledgeAnalytics>;
  getKnowledgeAnalytics(articleId?: number, timeframe?: string): Promise<KnowledgeAnalytics[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Client[] = [];
  private teamMembers: TeamMember[] = [];
  private tasks: Task[] = [];
  private emailTemplates: EmailTemplate[] = [];
  private clientActivities: ClientActivity[] = [];
  private clientMeetings: ClientMeeting[] = [];
  private clientFollowups: ClientFollowup[] = [];
  private knowledgeArticles: KnowledgeArticle[] = [];
  private knowledgeCategories: KnowledgeCategory[] = [];
  private knowledgeComments: Map<number, KnowledgeComment[]> = new Map();
  private knowledgeRevisions: KnowledgeRevision[] = [];
  private knowledgeBookmarks: KnowledgeBookmark[] = [];
  private knowledgeAnalytics: KnowledgeAnalytics[] = [];
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.initializeData();
    this.initializeKnowledgeData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const userArray = Array.from(this.users.values());
    for (const user of userArray) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getClients(): Promise<Client[]> {
    return this.clients;
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.find(c => c.id === id);
  }

  async createClient(client: Omit<Client, "id" | "createdAt">): Promise<Client> {
    const newClient: Client = {
      ...client,
      id: Date.now(),
      createdAt: new Date(),
      phone: client.phone || null,
      notes: client.notes || null,
      assignedTeamMembers: client.assignedTeamMembers || [],
      kpis: client.kpis || []
    };
    this.clients.push(newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<Client>): Promise<Client> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Client not found");
    
    const updatedClient = {
      ...this.clients[index],
      ...client,
      phone: client.phone || this.clients[index].phone,
      notes: client.notes || this.clients[index].notes,
      assignedTeamMembers: client.assignedTeamMembers || this.clients[index].assignedTeamMembers,
      kpis: client.kpis || this.clients[index].kpis
    };
    
    this.clients[index] = updatedClient;
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.clients.splice(index, 1);
    return true;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    return this.teamMembers;
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.find(m => m.id === id);
  }

  async createTeamMember(member: Omit<TeamMember, "id" | "createdAt">): Promise<TeamMember> {
    const newMember: TeamMember = {
      ...member,
      id: Date.now(),
      createdAt: new Date(),
      position: member.position || null,
      location: member.location || null,
      teamMemberId: member.teamMemberId || null,
      skills: member.skills || [],
      incapacidades: member.incapacidades || [],
      oneOnOneSessions: member.oneOnOneSessions || []
    };
    this.teamMembers.push(newMember);
    return newMember;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    const index = this.teamMembers.findIndex(m => m.id === id);
    if (index === -1) return false;

    this.teamMembers.splice(index, 1);
    return true;
  }

  async getTasks(): Promise<Task[]> {
    return this.tasks;
  }

  async getTasksByClientId(clientId: number): Promise<Task[]> {
    return this.tasks.filter(t => t.assignedTo === clientId);
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.find(t => t.id === id);
  }

  async createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: Date.now(),
      createdAt: new Date(),
      status: task.status || "pending",
      suggestedDueDate: task.suggestedDueDate || null,
      priority: task.priority || "medium",
      category: task.category || null,
      estimatedMinutes: task.estimatedMinutes || 30,
      timeSpent: task.timeSpent || 0,
      assignedTo: task.assignedTo || null,
      tags: task.tags || [],
      isAiGenerated: task.isAiGenerated || false,
      completedAt: task.completedAt || null
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Task not found");
    
    const updatedTask = {
      ...this.tasks[index],
      ...task,
      status: task.status || this.tasks[index].status,
      suggestedDueDate: task.suggestedDueDate || this.tasks[index].suggestedDueDate,
      priority: task.priority || this.tasks[index].priority,
      category: task.category || this.tasks[index].category,
      estimatedMinutes: task.estimatedMinutes || this.tasks[index].estimatedMinutes,
      timeSpent: task.timeSpent || this.tasks[index].timeSpent,
      assignedTo: task.assignedTo || this.tasks[index].assignedTo,
      tags: task.tags || this.tasks[index].tags,
      isAiGenerated: task.isAiGenerated || this.tasks[index].isAiGenerated,
      completedAt: task.completedAt || this.tasks[index].completedAt
    };
    
    this.tasks[index] = updatedTask;
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.tasks.splice(index, 1);
    return true;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return this.emailTemplates;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = this.currentId++;
    const newTemplate: EmailTemplate = { 
      ...template, 
      id,
      createdAt: new Date(),
      isAiGenerated: template.isAiGenerated ?? null
    };
    this.emailTemplates.push(newTemplate);
    return newTemplate;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    const index = this.emailTemplates.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.emailTemplates.splice(index, 1);
    return true;
  }

  async getClientActivities(clientId: number): Promise<ClientActivity[]> {
    return this.clientActivities.filter(a => a.clientId === clientId);
  }

  async createClientActivity(activity: InsertClientActivity): Promise<ClientActivity> {
    const id = this.currentId++;
    const newActivity: ClientActivity = { 
      ...activity, 
      id,
      createdAt: new Date(),
      metadata: activity.metadata ?? {}
    };
    
    this.clientActivities.push(newActivity);
    
    return newActivity;
  }

  async getStatistics(): Promise<Statistics> {
    return {
      id: 1,
      userId: "1",
      communicationsSent: 0,
      tasksCreated: 0,
      tasksCompleted: 0,
      clientsManaged: 0,
      teamMembers: 0,
      avgResponseTime: "0",
      clientRetention: "0",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateStatistics(stats: Partial<InsertStatistics>): Promise<Statistics> {
    return { 
      id: 1,
      userId: "1",
      communicationsSent: 0,
      tasksCreated: 0,
      tasksCompleted: 0,
      clientsManaged: 0,
      teamMembers: 0,
      avgResponseTime: "0",
      clientRetention: "0",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getAiContext(): Promise<AiContext | undefined> {
    return undefined;
  }

  async updateAiContext(context: InsertAiContext): Promise<AiContext> {
    return {
      id: 1,
      userId: context.userId,
      content: context.content,
      updatedAt: new Date()
    };
  }

  // Knowledge Management Methods
  async getKnowledgeCategories(): Promise<KnowledgeCategory[]> {
    return this.knowledgeCategories;
  }

  async getKnowledgeCategory(id: number): Promise<KnowledgeCategory | undefined> {
    return this.knowledgeCategories.find(c => c.id === id);
  }

  async createKnowledgeCategory(category: InsertKnowledgeCategory): Promise<KnowledgeCategory> {
    const id = this.currentId++;
    const newCategory: KnowledgeCategory = { 
      ...category, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.knowledgeCategories.push(newCategory);
    return newCategory;
  }

  async updateKnowledgeCategory(id: number, category: Partial<InsertKnowledgeCategory>): Promise<KnowledgeCategory | undefined> {
    const index = this.knowledgeCategories.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    const updated: KnowledgeCategory = { 
      ...this.knowledgeCategories[index], 
      ...category,
      updatedAt: new Date()
    };
    this.knowledgeCategories[index] = updated;
    return updated;
  }

  async deleteKnowledgeCategory(id: number): Promise<boolean> {
    const index = this.knowledgeCategories.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.knowledgeCategories.splice(index, 1);
    return true;
  }

  async getKnowledgeArticles(filters?: { categoryId?: number; status?: string; authorId?: string; search?: string }): Promise<KnowledgeArticle[]> {
    let articles = this.knowledgeArticles;
    
    if (filters) {
      if (filters.categoryId) {
        articles = articles.filter(article => article.categoryId === filters.categoryId);
      }
      if (filters.status) {
        articles = articles.filter(article => article.status === filters.status);
      }
      if (filters.authorId) {
        articles = articles.filter(article => article.authorId === filters.authorId);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        articles = articles.filter(article => 
          article.title.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.searchKeywords?.toLowerCase().includes(searchLower) ||
          article.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
    }
    
    return articles.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined> {
    return this.knowledgeArticles.find(a => a.id === id);
  }

  async getKnowledgeArticleBySlug(slug: string): Promise<KnowledgeArticle | undefined> {
    return this.knowledgeArticles.find(a => a.slug === slug);
  }

  async createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const slug = this.generateSlug(article.title);
    const newArticle: KnowledgeArticle = {
      ...article,
      id: Date.now(),
      slug,
      viewCount: 0,
      likes: 0,
      dislikes: 0,
      version: 1,
      metadata: article.metadata || null,
      attachments: article.attachments || [],
      relatedArticles: article.relatedArticles || [],
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.knowledgeArticles.push(newArticle);
    return newArticle;
  }

  async updateKnowledgeArticle(id: number, article: Partial<InsertKnowledgeArticle>): Promise<KnowledgeArticle | undefined> {
    const index = this.knowledgeArticles.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    
    const updated: KnowledgeArticle = { 
      ...this.knowledgeArticles[index], 
      ...article,
      version: this.knowledgeArticles[index].version + 1,
      updatedAt: new Date()
    };
    
    if (article.title && article.title !== this.knowledgeArticles[index].title) {
      updated.slug = this.generateSlug(article.title);
    }
    
    this.knowledgeArticles[index] = updated;
    
    // Create revision for significant changes
    if (article.content || article.title) {
      await this.createKnowledgeRevision({
        articleId: id,
        title: updated.title,
        content: updated.content,
        authorId: article.authorId || this.knowledgeArticles[index].authorId,
        changeDescription: "Content updated",
        version: updated.version
      });
    }
    
    return updated;
  }

  async deleteKnowledgeArticle(id: number): Promise<boolean> {
    const index = this.knowledgeArticles.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.knowledgeComments.delete(id);
    this.knowledgeRevisions.delete(id);
    this.knowledgeArticles.splice(index, 1);
    return true;
  }

  async getKnowledgeComments(articleId: number): Promise<KnowledgeComment[]> {
    return this.knowledgeComments.get(articleId) || [];
  }

  async createKnowledgeComment(comment: InsertKnowledgeComment): Promise<KnowledgeComment> {
    const id = this.currentId++;
    const newComment: KnowledgeComment = { 
      ...comment, 
      id,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const comments = this.knowledgeComments.get(comment.articleId) || [];
    comments.push(newComment);
    this.knowledgeComments.set(comment.articleId, comments);
    
    return newComment;
  }

  async updateKnowledgeComment(id: number, comment: Partial<InsertKnowledgeComment>): Promise<KnowledgeComment | undefined> {
    // Find comment across all articles
    for (const [articleId, comments] of this.knowledgeComments.entries()) {
      const commentIndex = comments.findIndex(c => c.id === id);
      if (commentIndex !== -1) {
        const updated = { ...comments[commentIndex], ...comment, updatedAt: new Date() };
        comments[commentIndex] = updated;
        return updated;
      }
    }
    return undefined;
  }

  async deleteKnowledgeComment(id: number): Promise<boolean> {
    for (const [articleId, comments] of this.knowledgeComments.entries()) {
      const commentIndex = comments.findIndex(c => c.id === id);
      if (commentIndex !== -1) {
        comments.splice(commentIndex, 1);
        return true;
      }
    }
    return false;
  }

  async getKnowledgeRevisions(articleId: number): Promise<KnowledgeRevision[]> {
    const revisions = this.knowledgeRevisions.filter(r => r.articleId === articleId);
    return revisions.sort((a, b) => b.version - a.version);
  }

  async createKnowledgeRevision(revision: InsertKnowledgeRevision): Promise<KnowledgeRevision> {
    const id = this.currentId++;
    const newRevision: KnowledgeRevision = { 
      ...revision, 
      id,
      createdAt: new Date()
    };
    
    this.knowledgeRevisions.push(newRevision);
    
    return newRevision;
  }

  async getUserKnowledgeBookmarks(userId: string): Promise<KnowledgeBookmark[]> {
    return this.knowledgeBookmarks.filter(b => b.userId === userId);
  }

  async createKnowledgeBookmark(bookmark: InsertKnowledgeBookmark): Promise<KnowledgeBookmark> {
    const id = this.currentId++;
    const newBookmark: KnowledgeBookmark = { 
      ...bookmark, 
      id,
      createdAt: new Date()
    };
    
    this.knowledgeBookmarks.push(newBookmark);
    
    return newBookmark;
  }

  async deleteKnowledgeBookmark(userId: string, articleId: number): Promise<boolean> {
    const index = this.knowledgeBookmarks.findIndex(b => b.userId === userId && b.articleId === articleId);
    if (index !== -1) {
      this.knowledgeBookmarks.splice(index, 1);
      return true;
    }
    return false;
  }

  async trackKnowledgeAnalytics(analytics: InsertKnowledgeAnalytics): Promise<KnowledgeAnalytics> {
    const newAnalytics: KnowledgeAnalytics = {
      ...analytics,
      id: Date.now(),
      metadata: analytics.metadata || null,
      timeSpent: analytics.timeSpent || null,
      sessionId: analytics.sessionId || null,
      ipAddress: analytics.ipAddress || null,
      userAgent: analytics.userAgent || null,
      referrer: analytics.referrer || null,
      createdAt: new Date()
    };
    this.knowledgeAnalytics.push(newAnalytics);
    return newAnalytics;
  }

  async getKnowledgeAnalytics(articleId?: number, timeframe?: string): Promise<KnowledgeAnalytics[]> {
    let analytics = [...this.knowledgeAnalytics];
    
    if (articleId) {
      analytics = analytics.filter(a => a.articleId === articleId);
    }
    
    if (timeframe) {
      const now = new Date();
      const timeframes = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };
      
      const cutoff = new Date(now.getTime() - (timeframes[timeframe as keyof typeof timeframes] || 0));
      analytics = analytics.filter(a => a.createdAt && a.createdAt > cutoff);
    }
    
    return analytics.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  private initializeKnowledgeData() {
    // Create default categories
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

    categories.forEach(cat => {
      const id = this.currentId++;
      const category: KnowledgeCategory = {
        ...cat,
        id,
        parentId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.knowledgeCategories.push(category);
    });

    // Create sample articles
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
        publishedAt: new Date()
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
        publishedAt: new Date()
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
- TÜV certification for technical products
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
        publishedAt: new Date()
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
        publishedAt: new Date()
      }
    ];

    sampleArticles.forEach(article => {
      const id = this.currentId++;
      const slug = this.generateSlug(article.title);
      const knowledgeArticle: KnowledgeArticle = {
        ...article,
        id,
        slug,
        viewCount: Math.floor(Math.random() * 100),
        likes: Math.floor(Math.random() * 20),
        dislikes: Math.floor(Math.random() * 3),
        version: 1,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        updatedAt: new Date()
      };
      this.knowledgeArticles.push(knowledgeArticle);
    });
  }

  private initializeData() {
    // Initialize with clean state - no sample data
    this.currentId = 1;
  }
}

export const storage = new MemStorage();