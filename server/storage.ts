import type { 
  User, InsertUser, Client, InsertClient, TeamMember, InsertTeamMember, 
  Task, InsertTask, EmailTemplate, InsertEmailTemplate, 
  ClientActivity, InsertClientActivity, Statistics, InsertStatistics,
  AiContext, InsertAiContext, KnowledgeCategory, InsertKnowledgeCategory,
  KnowledgeArticle, InsertKnowledgeArticle, KnowledgeComment, InsertKnowledgeComment,
  KnowledgeRevision, InsertKnowledgeRevision, KnowledgeBookmark, InsertKnowledgeBookmark,
  KnowledgeAnalytics, InsertKnowledgeAnalytics
} from "../shared/schema";

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
  private clients: Map<number, Client>;
  private teamMembers: Map<number, TeamMember>;
  private tasks: Map<number, Task>;
  private emailTemplates: Map<number, EmailTemplate>;
  private clientActivities: Map<number, ClientActivity[]>;
  private statistics: Statistics;
  private aiContext: AiContext | undefined;
  private knowledgeCategories: Map<number, KnowledgeCategory>;
  private knowledgeArticles: Map<number, KnowledgeArticle>;
  private knowledgeComments: Map<number, KnowledgeComment[]>;
  private knowledgeRevisions: Map<number, KnowledgeRevision[]>;
  private knowledgeBookmarks: Map<string, KnowledgeBookmark[]>;
  private knowledgeAnalytics: KnowledgeAnalytics[];
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.teamMembers = new Map();
    this.tasks = new Map();
    this.emailTemplates = new Map();
    this.clientActivities = new Map();
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
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.knowledgeCategories = new Map();
    this.knowledgeArticles = new Map();
    this.knowledgeComments = new Map();
    this.knowledgeRevisions = new Map();
    this.knowledgeBookmarks = new Map();
    this.knowledgeAnalytics = [];
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
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.currentId++;
    const newClient: Client = { 
      ...client, 
      id,
      createdAt: new Date(),
      phone: client.phone ?? null,
      notes: client.notes ?? null,
      assignedTeamMembers: client.assignedTeamMembers ?? null,
      kpis: client.kpis ? JSON.parse(JSON.stringify(client.kpis)) : []
    };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) return undefined;
    
    const updated: Client = { 
      ...existing, 
      ...client,
      kpis: client.kpis ? JSON.parse(JSON.stringify(client.kpis)) : existing.kpis
    };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = this.currentId++;
    const newMember: TeamMember = { 
      ...member, 
      id,
      createdAt: new Date(),
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

  async deleteTeamMember(id: number): Promise<boolean> {
    return this.teamMembers.delete(id);
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const newTask: Task = { 
      ...task, 
      id,
      createdAt: new Date(),
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

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    
    const updated: Task = { 
      ...existing, 
      ...task,
      completedAt: task.status === "completed" ? new Date() : existing.completedAt
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values());
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = this.currentId++;
    const newTemplate: EmailTemplate = { 
      ...template, 
      id,
      createdAt: new Date(),
      isAiGenerated: template.isAiGenerated ?? null
    };
    this.emailTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    return this.emailTemplates.delete(id);
  }

  async getClientActivities(clientId: number): Promise<ClientActivity[]> {
    return this.clientActivities.get(clientId) || [];
  }

  async createClientActivity(activity: InsertClientActivity): Promise<ClientActivity> {
    const id = this.currentId++;
    const newActivity: ClientActivity = { 
      ...activity, 
      id,
      createdAt: new Date(),
      metadata: activity.metadata ?? {}
    };
    
    const existing = this.clientActivities.get(activity.clientId) || [];
    existing.push(newActivity);
    this.clientActivities.set(activity.clientId, existing);
    
    return newActivity;
  }

  async getStatistics(): Promise<Statistics> {
    return this.statistics;
  }

  async updateStatistics(stats: Partial<InsertStatistics>): Promise<Statistics> {
    this.statistics = { 
      ...this.statistics, 
      ...stats, 
      id: this.statistics.id,
      userId: this.statistics.userId,
      updatedAt: new Date() 
    };
    return this.statistics;
  }

  async getAiContext(): Promise<AiContext | undefined> {
    return this.aiContext;
  }

  async updateAiContext(context: InsertAiContext): Promise<AiContext> {
    const newContext: AiContext = { 
      id: this.aiContext?.id || this.currentId++,
      userId: context.userId,
      content: context.content,
      updatedAt: new Date()
    };
    this.aiContext = newContext;
    return newContext;
  }

  // Knowledge Management Methods
  async getKnowledgeCategories(): Promise<KnowledgeCategory[]> {
    return Array.from(this.knowledgeCategories.values());
  }

  async getKnowledgeCategory(id: number): Promise<KnowledgeCategory | undefined> {
    return this.knowledgeCategories.get(id);
  }

  async createKnowledgeCategory(category: InsertKnowledgeCategory): Promise<KnowledgeCategory> {
    const id = this.currentId++;
    const newCategory: KnowledgeCategory = { 
      ...category, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.knowledgeCategories.set(id, newCategory);
    return newCategory;
  }

  async updateKnowledgeCategory(id: number, category: Partial<InsertKnowledgeCategory>): Promise<KnowledgeCategory | undefined> {
    const existing = this.knowledgeCategories.get(id);
    if (!existing) return undefined;
    
    const updated: KnowledgeCategory = { 
      ...existing, 
      ...category,
      updatedAt: new Date()
    };
    this.knowledgeCategories.set(id, updated);
    return updated;
  }

  async deleteKnowledgeCategory(id: number): Promise<boolean> {
    return this.knowledgeCategories.delete(id);
  }

  async getKnowledgeArticles(filters?: { categoryId?: number; status?: string; authorId?: string; search?: string }): Promise<KnowledgeArticle[]> {
    let articles = Array.from(this.knowledgeArticles.values());
    
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
    return this.knowledgeArticles.get(id);
  }

  async getKnowledgeArticleBySlug(slug: string): Promise<KnowledgeArticle | undefined> {
    return Array.from(this.knowledgeArticles.values()).find(article => article.slug === slug);
  }

  async createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const id = this.currentId++;
    const slug = this.generateSlug(article.title);
    const newArticle: KnowledgeArticle = { 
      ...article, 
      id,
      slug,
      viewCount: 0,
      likes: 0,
      dislikes: 0,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.knowledgeArticles.set(id, newArticle);
    
    // Create initial revision
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

  async updateKnowledgeArticle(id: number, article: Partial<InsertKnowledgeArticle>): Promise<KnowledgeArticle | undefined> {
    const existing = this.knowledgeArticles.get(id);
    if (!existing) return undefined;
    
    const updated: KnowledgeArticle = { 
      ...existing, 
      ...article,
      version: existing.version + 1,
      updatedAt: new Date()
    };
    
    if (article.title && article.title !== existing.title) {
      updated.slug = this.generateSlug(article.title);
    }
    
    this.knowledgeArticles.set(id, updated);
    
    // Create revision for significant changes
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

  async deleteKnowledgeArticle(id: number): Promise<boolean> {
    const deleted = this.knowledgeArticles.delete(id);
    if (deleted) {
      this.knowledgeComments.delete(id);
      this.knowledgeRevisions.delete(id);
    }
    return deleted;
  }

  async getKnowledgeComments(articleId: number): Promise<KnowledgeComment[]> {
    return Array.from(this.knowledgeComments.get(articleId) || []);
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
    const revisions = this.knowledgeRevisions.get(articleId) || [];
    return revisions.sort((a, b) => b.version - a.version);
  }

  async createKnowledgeRevision(revision: InsertKnowledgeRevision): Promise<KnowledgeRevision> {
    const id = this.currentId++;
    const newRevision: KnowledgeRevision = { 
      ...revision, 
      id,
      createdAt: new Date()
    };
    
    const revisions = this.knowledgeRevisions.get(revision.articleId) || [];
    revisions.push(newRevision);
    this.knowledgeRevisions.set(revision.articleId, revisions);
    
    return newRevision;
  }

  async getUserKnowledgeBookmarks(userId: string): Promise<KnowledgeBookmark[]> {
    return this.knowledgeBookmarks.get(userId) || [];
  }

  async createKnowledgeBookmark(bookmark: InsertKnowledgeBookmark): Promise<KnowledgeBookmark> {
    const id = this.currentId++;
    const newBookmark: KnowledgeBookmark = { 
      ...bookmark, 
      id,
      createdAt: new Date()
    };
    
    const bookmarks = this.knowledgeBookmarks.get(bookmark.userId) || [];
    bookmarks.push(newBookmark);
    this.knowledgeBookmarks.set(bookmark.userId, bookmarks);
    
    return newBookmark;
  }

  async deleteKnowledgeBookmark(userId: string, articleId: number): Promise<boolean> {
    const bookmarks = this.knowledgeBookmarks.get(userId) || [];
    const index = bookmarks.findIndex(b => b.articleId === articleId);
    if (index !== -1) {
      bookmarks.splice(index, 1);
      return true;
    }
    return false;
  }

  async trackKnowledgeAnalytics(analytics: InsertKnowledgeAnalytics): Promise<KnowledgeAnalytics> {
    const id = this.currentId++;
    const newAnalytics: KnowledgeAnalytics = { 
      ...analytics, 
      id,
      createdAt: new Date()
    };
    this.knowledgeAnalytics.push(newAnalytics);
    return newAnalytics;
  }

  async getKnowledgeAnalytics(articleId?: number, timeframe?: string): Promise<KnowledgeAnalytics[]> {
    let analytics = this.knowledgeAnalytics;
    
    if (articleId) {
      analytics = analytics.filter(a => a.articleId === articleId);
    }
    
    if (timeframe) {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (timeframe) {
        case '24h':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          return analytics;
      }
      
      analytics = analytics.filter(a => a.createdAt >= cutoffDate);
    }
    
    return analytics.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
      this.knowledgeCategories.set(id, category);
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
      this.knowledgeArticles.set(id, knowledgeArticle);
    });
  }

  private initializeData() {
    // Initialize with clean state - no sample data
    this.currentId = 1;
  }
}

export const storage = new MemStorage();