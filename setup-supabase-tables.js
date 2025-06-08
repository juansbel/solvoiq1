import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  ssl: 'require',
  connect_timeout: 10,
  idle_timeout: 10
});

async function setupTables() {
  try {
    console.log('Setting up Supabase database tables...');

    // Create statistics table
    await sql`
      CREATE TABLE IF NOT EXISTS statistics (
        id SERIAL PRIMARY KEY,
        total_clients INTEGER DEFAULT 0,
        active_clients INTEGER DEFAULT 0,
        total_team_members INTEGER DEFAULT 0,
        pending_tasks INTEGER DEFAULT 0,
        completed_tasks INTEGER DEFAULT 0,
        total_revenue DECIMAL(10,2) DEFAULT 0,
        monthly_revenue DECIMAL(10,2) DEFAULT 0,
        client_satisfaction DECIMAL(3,2) DEFAULT 0,
        task_completion_rate DECIMAL(3,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create clients table
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        assigned_team_members TEXT[] DEFAULT '{}',
        notes TEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        industry VARCHAR(100),
        budget DECIMAL(10,2),
        contract_value DECIMAL(10,2),
        start_date DATE,
        kpis JSONB DEFAULT '[]',
        communication_frequency VARCHAR(50),
        preferred_contact_method VARCHAR(50),
        last_contact DATE,
        next_follow_up DATE,
        satisfaction_score DECIMAL(3,2),
        lifetime_value DECIMAL(10,2),
        acquisition_cost DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create team_members table
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(100),
        department VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        skills TEXT[] DEFAULT '{}',
        hourly_rate DECIMAL(8,2),
        availability_hours INTEGER DEFAULT 40,
        incapacidades JSONB DEFAULT '[]',
        one_on_one_sessions JSONB DEFAULT '[]',
        performance_score DECIMAL(3,2),
        goals TEXT,
        manager_id INTEGER,
        hire_date DATE,
        location VARCHAR(100),
        timezone VARCHAR(50),
        workload_capacity INTEGER DEFAULT 100,
        certifications TEXT[] DEFAULT '{}',
        languages TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'medium',
        assigned_to INTEGER,
        client_id INTEGER,
        project_id INTEGER,
        due_date TIMESTAMP,
        estimated_hours DECIMAL(5,2),
        actual_hours DECIMAL(5,2) DEFAULT 0,
        progress INTEGER DEFAULT 0,
        tags TEXT[] DEFAULT '{}',
        dependencies INTEGER[] DEFAULT '{}',
        attachments JSONB DEFAULT '[]',
        comments JSONB DEFAULT '[]',
        time_entries JSONB DEFAULT '[]',
        completion_criteria TEXT,
        risk_level VARCHAR(20) DEFAULT 'low',
        category VARCHAR(100),
        billable BOOLEAN DEFAULT true,
        recurring_pattern VARCHAR(50),
        parent_task_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `;

    // Create email_templates table
    await sql`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500),
        content TEXT,
        category VARCHAR(100),
        tags TEXT[] DEFAULT '{}',
        variables JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        usage_count INTEGER DEFAULT 0,
        last_used TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create client_activities table
    await sql`
      CREATE TABLE IF NOT EXISTS client_activities (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        description TEXT,
        metadata JSONB DEFAULT '{}',
        performed_by INTEGER,
        activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        follow_up_required BOOLEAN DEFAULT false,
        follow_up_date TIMESTAMP,
        impact_score INTEGER,
        outcome VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create ai_context table
    await sql`
      CREATE TABLE IF NOT EXISTS ai_context (
        id SERIAL PRIMARY KEY,
        context_data JSONB DEFAULT '{}',
        conversation_history JSONB DEFAULT '[]',
        user_preferences JSONB DEFAULT '{}',
        business_rules JSONB DEFAULT '{}',
        integration_settings JSONB DEFAULT '{}',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        profile_data JSONB DEFAULT '{}',
        preferences JSONB DEFAULT '{}',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert initial statistics record if it doesn't exist
    const existingStats = await sql`SELECT id FROM statistics LIMIT 1`;
    if (existingStats.length === 0) {
      await sql`
        INSERT INTO statistics (
          total_clients, active_clients, total_team_members, 
          pending_tasks, completed_tasks, total_revenue, 
          monthly_revenue, client_satisfaction, task_completion_rate
        ) VALUES (0, 0, 0, 0, 0, 0, 0, 0, 0)
      `;
    }

    console.log('✓ Database tables created successfully');
    console.log('✓ Initial statistics record inserted');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

setupTables();