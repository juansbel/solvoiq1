# Supabase Database Setup Guide

Complete guide to enable persistent database storage for Client Hub AI.

## Current Status
- ✅ Application fully functional with in-memory storage
- ✅ Supabase credentials configured
- ✅ Database schema and migrations ready
- ✅ Drizzle ORM integration implemented

## Environment Variables Configured
```
VITE_SUPABASE_URL=https://wkaokssncvhuwkqgkmbf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:x6-QjQDQ48@FMNu@db.wkaokssncvhuwkqgkmbf.supabase.co:5432/postgres
```

## Quick Setup (3 Steps)

### Step 1: Create Database Tables
In your local environment, run:
```bash
npm run db:push
```

### Step 2: Enable Database Storage
In `server/storage.ts`, replace the current storage export:
```typescript
// Replace this line:
export const storage = new MemStorage();

// With this:
export const storage = (() => {
  if (!process.env.DATABASE_URL) {
    console.log("Using MemStorage - no DATABASE_URL provided");
    return new MemStorage();
  }
  
  try {
    console.log("Connecting to Supabase database...");
    return new DrizzleStorage(process.env.DATABASE_URL);
  } catch (error) {
    console.log("Failed to connect to Supabase, falling back to MemStorage:", error instanceof Error ? error.message : "Unknown error");
    return new MemStorage();
  }
})();
```

### Step 3: Restart Application
```bash
npm run dev
```

## Database Tables Created
- **users** - Authentication and user management
- **clients** - Client information and contact details
- **team_members** - Team roster with roles and skills
- **tasks** - Task management with AI-generated suggestions
- **email_templates** - Reusable email templates
- **client_activities** - Activity logging and history
- **statistics** - Dashboard metrics and analytics
- **ai_context** - AI configuration and company context

## Manual Database Setup (Alternative)
If `npm run db:push` fails, run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "username" text NOT NULL,
        "password" text NOT NULL,
        CONSTRAINT "users_username_unique" UNIQUE("username")
);

CREATE TABLE IF NOT EXISTS "clients" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "company" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "notes" text,
        "assigned_team_members" text[],
        "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "team_members" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "role" text NOT NULL,
        "skills" text[],
        "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tasks" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text NOT NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "suggested_due_date" text,
        "is_ai_generated" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "email_templates" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "body" text NOT NULL,
        "is_ai_generated" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "client_activities" (
        "id" serial PRIMARY KEY NOT NULL,
        "client_id" integer NOT NULL,
        "type" text NOT NULL,
        "content" text NOT NULL,
        "metadata" json DEFAULT '{}',
        "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "statistics" (
        "id" serial PRIMARY KEY NOT NULL,
        "communications_sent" integer DEFAULT 0,
        "tasks_created" integer DEFAULT 0,
        "clients_managed" integer DEFAULT 0,
        "team_members" integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "ai_context" (
        "id" serial PRIMARY KEY NOT NULL,
        "content" text NOT NULL
);

ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_client_id_clients_id_fk" 
FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE no action ON UPDATE no action;
```

## Verification
After setup, verify the connection works:
1. Check console logs for "Connecting to Supabase database..."
2. Create a test client in the app
3. Restart the app - data should persist

## Benefits After Migration
- **Data Persistence** - Information survives restarts
- **Multi-user Support** - Team collaboration capabilities
- **Advanced Analytics** - Complex queries and reporting
- **Automatic Backups** - Built-in data protection
- **Scalability** - Handles growing data needs

## Troubleshooting
- **Connection fails**: Verify DATABASE_URL format and password
- **Tables not created**: Run the manual SQL setup above
- **Permission errors**: Check Supabase project settings and RLS policies