import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function cleanDatabase() {
  try {
    console.log('Cleaning database...');

    // Get all data first
    const [clients, tasks, teamMembers, templates] = await Promise.all([
      fetch(`${API_BASE}/clients`).then(r => r.json()),
      fetch(`${API_BASE}/tasks`).then(r => r.json()),
      fetch(`${API_BASE}/team-members`).then(r => r.json()),
      fetch(`${API_BASE}/email-templates`).then(r => r.json())
    ]);

    // Delete all clients
    for (const client of clients) {
      await fetch(`${API_BASE}/clients/${client.id}`, { method: 'DELETE' });
      console.log(`Deleted client: ${client.name}`);
    }

    // Delete all tasks
    for (const task of tasks) {
      await fetch(`${API_BASE}/tasks/${task.id}`, { method: 'DELETE' });
      console.log(`Deleted task: ${task.name}`);
    }

    // Delete all team members
    for (const member of teamMembers) {
      await fetch(`${API_BASE}/team-members/${member.id}`, { method: 'DELETE' });
      console.log(`Deleted team member: ${member.name}`);
    }

    // Delete all email templates
    for (const template of templates) {
      await fetch(`${API_BASE}/email-templates/${template.id}`, { method: 'DELETE' });
      console.log(`Deleted template: ${template.title}`);
    }

    // Reset statistics
    await fetch(`${API_BASE}/statistics`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        communicationsSent: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
        clientsManaged: 0,
        teamMembers: 0,
        avgResponseTime: '0',
        clientRetention: '0'
      })
    });

    console.log('Database cleaned successfully!');
    console.log('Your application is now ready for fresh data.');

  } catch (error) {
    console.error('Error cleaning database:', error.message);
  }
}

cleanDatabase();