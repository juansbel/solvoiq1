import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc } from "drizzle-orm";
import * as schema from "../shared/schema";
const { clients, teamMembers, tasks, emailTemplates, clientActivities, statistics, aiContext } = schema;
import type { IStorage } from "./storage";
import type {
  User,
  InsertUser,
  Client,
  InsertClient,
  TeamMember,
  InsertTeamMember,
  Task,
  InsertTask,
  EmailTemplate,
  InsertEmailTemplate,
  ClientActivity,
  InsertClientActivity,
  Statistics,
  InsertStatistics,
  AiContext,
  InsertAiContext,
} from "../shared/schema";

export class DrizzleStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private sql: ReturnType<typeof postgres>;

  constructor(databaseUrl: string) {
    this.sql = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 20,
      prepare: false,
      ssl: {
        rejectUnauthorized: false
      },
      transform: postgres.camel,
      onnotice: () => {},
      onparameter: () => {},
      debug: process.env.NODE_ENV === 'development',
      connection: {
        application_name: 'solvoiq_app',
        statement_timeout: 30000,
      }
    });

    this.db = drizzle(this.sql, { schema });
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.sql`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }

  async shutdown(): Promise<void> {
    try {
      await this.sql.end();
    } catch (error) {
      console.error('Error during database shutdown:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async getClients(): Promise<Client[]> {
    return await this.db.select().from(schema.clients).orderBy(desc(schema.clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const result = await this.db.select().from(schema.clients).where(eq(schema.clients.id, id)).limit(1);
    return result[0];
  }

  async createClient(client: InsertClient): Promise<Client> {
    const clientData = {
      ...client,
      assignedTeamMembers: client.assignedTeamMembers ? JSON.parse(JSON.stringify(client.assignedTeamMembers)) : [],
      kpis: client.kpis ? JSON.parse(JSON.stringify(client.kpis)) : []
    };
    const result = await this.db.insert(clients).values([clientData]).returning();
    return result[0];
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const result = await this.db.update(clients).set(client as any).where(eq(clients.id, id)).returning();
    return result[0];
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await this.db.delete(clients).where(eq(clients.id, id));
    return true;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    return await this.db.select().from(teamMembers).orderBy(desc(teamMembers.createdAt));
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const result = await this.db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
    return result[0];
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const memberData = {
      ...member,
      skills: member.skills ? JSON.parse(JSON.stringify(member.skills)) : [],
      incapacidades: member.incapacidades ? JSON.parse(JSON.stringify(member.incapacidades)) : [],
      oneOnOneSessions: member.oneOnOneSessions ? JSON.parse(JSON.stringify(member.oneOnOneSessions)) : []
    };
    const result = await this.db.insert(teamMembers).values([memberData]).returning();
    return result[0];
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    const result = await this.db.delete(teamMembers).where(eq(teamMembers.id, id));
    return true;
  }

  async getTasks(): Promise<Task[]> {
    return await this.db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const result = await this.db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await this.db.insert(tasks).values([task]).returning();
    return result[0];
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await this.db.update(tasks).set(task).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await this.db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await this.db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const result = await this.db.insert(emailTemplates).values([template]).returning();
    return result[0];
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    const result = await this.db.delete(emailTemplates).where(eq(emailTemplates.id, id)).returning();
    return result.length > 0;
  }

  async getClientActivities(clientId: number): Promise<ClientActivity[]> {
    return await this.db.select().from(clientActivities)
      .where(eq(clientActivities.clientId, clientId))
      .orderBy(desc(clientActivities.createdAt));
  }

  async createClientActivity(activity: InsertClientActivity): Promise<ClientActivity> {
    const result = await this.db.insert(clientActivities).values([activity]).returning();
    return result[0];
  }

  async getStatistics(): Promise<Statistics> {
    const result = await this.db.select().from(schema.statistics).limit(1);
    if (result.length === 0) {
      const defaultStats = {
        userId: "1",
        communicationsSent: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
      };
      const created = await this.db.insert(schema.statistics).values([defaultStats]).returning();
      return created[0];
    }
    return result[0];
  }

  async updateStatistics(stats: Partial<InsertStatistics>): Promise<Statistics> {
    const existing = await this.getStatistics();
    const result = await this.db.update(statistics).set(stats).where(eq(statistics.id, existing.id)).returning();
    return result[0];
  }

  async getAiContext(): Promise<AiContext | undefined> {
    const result = await this.db.select().from(aiContext).limit(1);
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
      const created = await this.db.insert(aiContext).values([defaultContext]).returning();
      return created[0];
    }
    return result[0];
  }

  async updateAiContext(context: InsertAiContext): Promise<AiContext> {
    const existing = await this.getAiContext();
    if (existing) {
      const result = await this.db.update(aiContext).set(context).where(eq(aiContext.id, existing.id)).returning();
      return result[0];
    } else {
      const result = await this.db.insert(aiContext).values([context]).returning();
      return result[0];
    }
  }
}