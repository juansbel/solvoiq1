import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

const createTables = async () => {
  try {
    console.log("Creating database tables...");

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "username" text NOT NULL,
        "password" text NOT NULL,
        CONSTRAINT "users_username_unique" UNIQUE("username")
      )
    `;

    // Create clients table with updated schema
    await sql`
      CREATE TABLE IF NOT EXISTS "clients" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "name" text NOT NULL,
        "company" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "notes" text,
        "assigned_team_members" text[],
        "kpis" jsonb DEFAULT '[]',
        "created_at" timestamp DEFAULT now()
      )
    `;

    // Create team_members table with updated schema
    await sql`
      CREATE TABLE IF NOT EXISTS "team_members" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "role" text NOT NULL,
        "position" text,
        "location" text,
        "team_member_id" text,
        "skills" text[],
        "incapacidades" text[],
        "one_on_one_sessions" jsonb DEFAULT '[]',
        "created_at" timestamp DEFAULT now()
      )
    `;

    // Create tasks table with updated schema
    await sql`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "name" text NOT NULL,
        "description" text NOT NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "priority" text DEFAULT 'medium',
        "category" text DEFAULT 'general',
        "estimated_minutes" integer,
        "time_spent" integer DEFAULT 0,
        "assigned_to" text,
        "tags" text[],
        "due_date" timestamp,
        "suggested_due_date" text,
        "is_ai_generated" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
      )
    `;

    // Create email_templates table
    await sql`
      CREATE TABLE IF NOT EXISTS "email_templates" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "title" text NOT NULL,
        "body" text NOT NULL,
        "is_ai_generated" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
      )
    `;

    // Create client_activities table
    await sql`
      CREATE TABLE IF NOT EXISTS "client_activities" (
        "id" serial PRIMARY KEY NOT NULL,
        "client_id" integer NOT NULL,
        "type" text NOT NULL,
        "content" text NOT NULL,
        "metadata" jsonb DEFAULT '{}',
        "created_at" timestamp DEFAULT now()
      )
    `;

    // Create statistics table with updated schema
    await sql`
      CREATE TABLE IF NOT EXISTS "statistics" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "communications_sent" integer DEFAULT 0,
        "tasks_created" integer DEFAULT 0,
        "tasks_completed" integer DEFAULT 0,
        "clients_managed" integer DEFAULT 0,
        "team_members" integer DEFAULT 0,
        "avg_response_time" numeric DEFAULT 2.3,
        "client_retention" numeric DEFAULT 94.2,
        "created_at" timestamp DEFAULT now()
      )
    `;

    // Create ai_context table
    await sql`
      CREATE TABLE IF NOT EXISTS "ai_context" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "content" text NOT NULL,
        "created_at" timestamp DEFAULT now()
      )
    `;

    // Add foreign key constraint
    await sql`
      DO $$ BEGIN
        ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_client_id_clients_id_fk" 
        FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `;

    // Insert sample data
    console.log("Inserting sample data...");

    // Insert sample statistics
    await sql`
      INSERT INTO statistics (user_id, communications_sent, tasks_created, tasks_completed, clients_managed, team_members)
      VALUES ('1', 12, 8, 5, 3, 3)
      ON CONFLICT DO NOTHING
    `;

    console.log("Database setup completed successfully!");
    
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await sql.end();
  }
};

createTables();