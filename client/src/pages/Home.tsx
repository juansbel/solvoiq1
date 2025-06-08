import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, PlusCircle, CheckCircle, TrendingUp, BrainCircuit, Copy, Trash2, ArrowLeft, Edit2, Plus, User, Search, FileText } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { TaskItem } from "@/components/TaskItem";
import { ActionButton } from "@/components/ActionButton";
import { TextareaWithCopy } from "@/components/TextareaWithCopy";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Message } from "@/components/ui/message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { callGeminiAPI } from "@/lib/gemini";
import { debounce, commonSectionClass, commonHeaderClass, commonSubHeaderClass, copyToClipboard } from "@/lib/utils";
import {
  SAMPLE_CLIENTS,
  SAMPLE_TEAM_MEMBERS,
  SAMPLE_TASKS,
  SAMPLE_EMAIL_TEMPLATES,
  SAMPLE_CLIENT_ACTIVITY_LOGS,
  SAMPLE_CLIENT_MEETINGS,
  SAMPLE_CLIENT_FOLLOWUPS,
  SAMPLE_STATS,
  SAMPLE_AI_CONTEXT
} from "@/lib/sampleData";
import type { 
  Client, 
  TeamMember, 
  Task, 
  EmailTemplate, 
  ClientActivity, 
  ClientMeeting, 
  ClientFollowup,
  Stats 
} from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  
  // State
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [clientActivityLogs, setClientActivityLogs] = useState<ClientActivity[]>([]);
  const [clientMeetings, setClientMeetings] = useState<ClientMeeting[]>([]);
  const [clientFollowups, setClientFollowups] = useState<ClientFollowup[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalTasks: 0,
    tasksCompleted: 0,
    tasksPending: 0,
    tasksCreated: 0,
    tasksUpdated: 0,
    tasksDeleted: 0,
    averageTaskCompletionTime: 0,
    clientSatisfactionScore: 0,
    teamProductivityScore: 0
  });
  const [aiContext, setAiContext] = useState(SAMPLE_AI_CONTEXT.content);

  // Current selections
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewingClientDetail, setViewingClientDetail] = useState(false);

  // Form states
  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: null,
    notes: null,
    assignedTeamMembers: []
  });
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    email: "",
    role: "",
    position: null,
    location: null,
    teamMemberId: null,
    skills: [],
    incapacidades: [],
    oneOnOneSessions: []
  });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editClientData, setEditClientData] = useState<Partial<Client>>({});

  // AI feature states
  const [draftEmail, setDraftEmail] = useState("");
  const [rewrittenEmail, setRewrittenEmail] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");
  const [followupSubject, setFollowupSubject] = useState("");
  const [generatedFollowup, setGeneratedFollowup] = useState("");
  const [emailToAnalyze, setEmailToAnalyze] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [reportPeriodStart, setReportPeriodStart] = useState("2024-03-01");
  const [reportPeriodEnd, setReportPeriodEnd] = useState("2024-03-22");
  const [reportHighlights, setReportHighlights] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");

  // Client detail form states
  const [newActivityLog, setNewActivityLog] = useState("");
  const [newMeeting, setNewMeeting] = useState({
    date: "",
    attendees: "",
    summary: "",
    actionItems: ""
  });
  const [newFollowup, setNewFollowup] = useState({
    date: "",
    subject: "",
    body: ""
  });

  // Loading states
  const [isLoading, setIsLoading] = useState({
    rewrite: false,
    followup: false,
    analyze: false,
    report: false,
    generateTasks: false,
    generateTemplates: false,
    aiGenerateFollowup: false
  });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {}
  });

  // Debounced auto-save for AI context
  const debouncedSaveContext = useCallback(
    debounce((content: string) => {
      // Simulate auto-save
      toast({
        title: "AI context auto-saved",
        description: "Your context has been automatically saved."
      });
    }, 2000),
    []
  );

  useEffect(() => {
    debouncedSaveContext(aiContext);
  }, [aiContext, debouncedSaveContext]);

  // Helper functions
  const incrementStat = (statType: keyof Stats) => {
    setStats(prev => ({
      ...prev,
      [statType]: (prev[statType] as number) + 1
    }));
  };

  const showSuccessMessage = (message: string) => {
    toast({
      title: "Success",
      description: message
    });
  };

  const showErrorMessage = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  };

  // Client management
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.company || !newClient.email) {
      showErrorMessage("Please fill in all required fields");
      return;
    }

    const client: Client = {
      id: clients.length + 1,
      ...newClient,
      assignedTeamMembers: []
    };

    setClients(prev => [...prev, client]);
    setNewClient({ name: "", company: "", email: "", phone: null, notes: null, assignedTeamMembers: [] });
    showSuccessMessage("Client added successfully! (Sample Data Mode)");
  };

  const handleViewClientDetails = (client: Client) => {
    setSelectedClient(client);
    setViewingClientDetail(true);
  };

  const handleBackToClients = () => {
    setViewingClientDetail(false);
    setSelectedClient(null);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setEditClientData(client);
  };

  const handleSaveClientEdit = () => {
    if (!editingClient || !editClientData) return;

    setClients(prev => prev.map(client => 
      client.id === editingClient.id 
        ? { ...client, ...editClientData }
        : client
    ));

    if (selectedClient?.id === editingClient.id) {
      setSelectedClient({ ...selectedClient, ...editClientData } as Client);
    }

    setEditingClient(null);
    setEditClientData({});
    showSuccessMessage("Client updated successfully!");
  };

  // Team management
  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamMember.name || !newTeamMember.email || !newTeamMember.role) {
      showErrorMessage("Please fill in all required fields");
      return;
    }

    const teamMember: TeamMember = {
      id: teamMembers.length + 1,
      ...newTeamMember
    };

    setTeamMembers(prev => [...prev, teamMember]);
    setNewTeamMember({ name: "", email: "", role: "", position: null, location: null, teamMemberId: null, skills: [], incapacidades: [], oneOnOneSessions: [] });
    showSuccessMessage("Team member added successfully! (Sample Data Mode)");
  };

  // Task management
  const handleToggleTaskStatus = (taskId: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === "pending" ? "completed" : "pending";
        
        // Update stats
        if (newStatus === "completed") {
          incrementStat("tasksCompleted");
        } else {
          setStats(prevStats => ({
            ...prevStats,
            tasksCompleted: Math.max(0, prevStats.tasksCompleted - 1)
          }));
        }
        
        return { ...task, status: newStatus };
      }
      return task;
    }));
    
    showSuccessMessage("Task status updated!");
  };

  const handleGenerateTasks = async () => {
    setIsLoading(prev => ({ ...prev, generateTasks: true }));
    
    try {
      const prompt = "Generate 3-5 actionable business tasks based on the provided context. Focus on client relationship management, project coordination, and business development activities.";
      
      const schema = {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                suggestedDueDate: { type: "string" }
              },
              required: ["name", "description", "suggestedDueDate"]
            }
          }
        },
        required: ["tasks"]
      };

      const result = await callGeminiAPI(prompt, aiContext, schema);
      
      if (result.tasks && Array.isArray(result.tasks)) {
        const newTasks: Task[] = result.tasks.map((task: any, index: number) => ({
          id: tasks.length + index + 1,
          name: task.name,
          description: task.description,
          suggestedDueDate: task.suggestedDueDate,
          status: "pending",
          isAiGenerated: true
        }));

        setTasks(prev => [...prev, ...newTasks]);
        setStats(prev => ({ ...prev, tasksCreated: prev.tasksCreated + newTasks.length }));
        showSuccessMessage(`Generated ${newTasks.length} tasks from AI context!`);
      }
    } catch (error) {
      showErrorMessage("Failed to generate tasks. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, generateTasks: false }));
    }
  };

  // AI-powered features
  const handleRewriteEmail = async () => {
    if (!draftEmail.trim()) {
      showErrorMessage("Please enter a draft email to rewrite");
      return;
    }

    setIsLoading(prev => ({ ...prev, rewrite: true }));
    
    try {
      const prompt = `Please rewrite the following email draft to make it more professional, clear, and effective while maintaining the original intent and key information:\n\n${draftEmail}`;
      const result = await callGeminiAPI(prompt, aiContext);
      
      setRewrittenEmail(result);
      incrementStat("communicationsSent");
      showSuccessMessage("Email rewritten successfully with AI!");
    } catch (error) {
      showErrorMessage("Failed to rewrite email. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, rewrite: false }));
    }
  };

  const handleGenerateFollowup = async () => {
    setIsLoading(prev => ({ ...prev, followup: true }));
    
    try {
      const prompt = `Generate a professional follow-up email based on the following details:
      ${followupSubject ? `Subject/Context: ${followupSubject}` : ""}
      ${followupNotes ? `Specific points to include: ${followupNotes}` : ""}
      
      Please create a well-structured, professional follow-up email that addresses these points while maintaining a collaborative and solution-oriented tone.`;
      
      const result = await callGeminiAPI(prompt, aiContext);
      
      setGeneratedFollowup(result);
      incrementStat("communicationsSent");
      showSuccessMessage("Follow-up email generated successfully!");
    } catch (error) {
      showErrorMessage("Failed to generate follow-up. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, followup: false }));
    }
  };

  const handleAnalyzeEmail = async () => {
    if (!emailToAnalyze.trim()) {
      showErrorMessage("Please enter an email to analyze");
      return;
    }

    setIsLoading(prev => ({ ...prev, analyze: true }));
    
    try {
      const prompt = `Analyze the following client email and provide:
      1. Key insights (urgency level, client satisfaction, main concerns)
      2. Recommended next steps (specific, actionable items)
      3. Communication priority level
      
      Email to analyze:
      ${emailToAnalyze}`;
      
      const result = await callGeminiAPI(prompt, aiContext);
      setAnalysisResult(result);
      showSuccessMessage("Email analyzed successfully! See suggestions below.");
    } catch (error) {
      showErrorMessage("Failed to analyze email. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, analyze: false }));
    }
  };

  const handleCreateTasksFromSuggestions = async () => {
    if (!analysisResult) return;

    setIsLoading(prev => ({ ...prev, generateTasks: true }));
    
    try {
      const prompt = `Based on the following email analysis, generate specific actionable tasks:
      
      ${analysisResult}
      
      Create 3-5 specific tasks that address the recommendations.`;
      
      const schema = {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                suggestedDueDate: { type: "string" }
              },
              required: ["name", "description", "suggestedDueDate"]
            }
          }
        },
        required: ["tasks"]
      };

      const result = await callGeminiAPI(prompt, aiContext, schema);
      
      if (result.tasks && Array.isArray(result.tasks)) {
        const newTasks: Task[] = result.tasks.map((task: any, index: number) => ({
          id: tasks.length + index + 1,
          name: task.name,
          description: task.description,
          suggestedDueDate: task.suggestedDueDate,
          status: "pending",
          isAiGenerated: true
        }));

        setTasks(prev => [...prev, ...newTasks]);
        setStats(prev => ({ ...prev, tasksCreated: prev.tasksCreated + newTasks.length }));
        showSuccessMessage(`Created ${newTasks.length} tasks from email analysis!`);
      }
    } catch (error) {
      showErrorMessage("Failed to create tasks from suggestions. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, generateTasks: false }));
    }
  };

  const handleGenerateEmailTemplates = async () => {
    if (!analysisResult) return;

    setIsLoading(prev => ({ ...prev, generateTemplates: true }));
    
    try {
      const prompt = `Based on the following email analysis, generate 2-3 professional email templates that could be used to address the situation:
      
      ${analysisResult}
      
      Create templates that are professional, actionable, and address the key concerns identified.`;
      
      const schema = {
        type: "object",
        properties: {
          templates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                body: { type: "string" }
              },
              required: ["title", "body"]
            }
          }
        },
        required: ["templates"]
      };

      const result = await callGeminiAPI(prompt, aiContext, schema);
      
      if (result.templates && Array.isArray(result.templates)) {
        const newTemplates: EmailTemplate[] = result.templates.map((template: any, index: number) => ({
          id: emailTemplates.length + index + 1,
          title: template.title,
          body: template.body,
          isAiGenerated: true
        }));

        setEmailTemplates(prev => [...prev, ...newTemplates]);
        showSuccessMessage(`Generated ${newTemplates.length} email templates!`);
      }
    } catch (error) {
      showErrorMessage("Failed to generate email templates. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, generateTemplates: false }));
    }
  };

  const handleGenerateReport = async () => {
    setIsLoading(prev => ({ ...prev, report: true }));
    
    try {
      const prompt = `Generate a comprehensive client activity report for the period ${reportPeriodStart} to ${reportPeriodEnd}.
      
      Key activities and highlights to include:
      ${reportHighlights}
      
      Please create a professional report with sections for:
      - Executive Summary
      - Key Achievements
      - Performance Metrics
      - Next Steps
      
      Format the report in a clear, structured manner suitable for client presentation.`;
      
      const result = await callGeminiAPI(prompt, aiContext);
      
      setGeneratedReport(result);
      incrementStat("communicationsSent");
      showSuccessMessage("Report generated successfully!");
    } catch (error) {
      showErrorMessage("Failed to generate report. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, report: false }));
    }
  };

  // Template management
  const handleDeleteTemplate = (templateId: number) => {
    setConfirmDialog({
      open: true,
      title: "Delete Template",
      description: "Are you sure you want to delete this template? This action cannot be undone.",
      onConfirm: () => {
        setEmailTemplates(prev => prev.filter(template => template.id !== templateId));
        showSuccessMessage("Template deleted successfully!");
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleCopyTemplateBody = async (body: string) => {
    try {
      await copyToClipboard(body);
      showSuccessMessage("Template body copied to clipboard!");
    } catch (error) {
      showErrorMessage("Failed to copy template body.");
    }
  };

  // Client detail functions
  const handleAddActivityLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newActivityLog.trim()) return;

    const log: ClientActivity = {
      id: Date.now(),
      clientId: selectedClient.id,
      entry: newActivityLog,
      timestamp: new Date()
    };

    setClientActivityLogs(prev => ({
      ...prev,
      [selectedClient.id]: [...(prev[selectedClient.id] || []), log]
    }));

    setNewActivityLog("");
    showSuccessMessage("Activity log added!");
  };

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newMeeting.date || !newMeeting.attendees || !newMeeting.summary) return;

    const meeting: ClientMeeting = {
      id: Date.now(),
      clientId: selectedClient.id,
      ...newMeeting
    };

    setClientMeetings(prev => ({
      ...prev,
      [selectedClient.id]: [...(prev[selectedClient.id] || []), meeting]
    }));

    setNewMeeting({ date: "", attendees: "", summary: "", actionItems: "" });
    showSuccessMessage("Meeting recorded!");
  };

  const handleAddFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newFollowup.date || !newFollowup.body) return;

    const followup: ClientFollowup = {
      id: Date.now(),
      clientId: selectedClient.id,
      ...newFollowup,
      isAiGenerated: false
    };

    setClientFollowups(prev => ({
      ...prev,
      [selectedClient.id]: [...(prev[selectedClient.id] || []), followup]
    }));

    setNewFollowup({ date: "", subject: "", body: "" });
    showSuccessMessage("Follow-up recorded!");
  };

  const handleAiGenerateFollowup = async () => {
    if (!selectedClient) return;

    setIsLoading(prev => ({ ...prev, aiGenerateFollowup: true }));
    
    try {
      const prompt = `Generate a professional follow-up email for client ${selectedClient.name} from ${selectedClient.company}. Use the global context and create a relevant, timely follow-up communication.`;
      
      const result = await callGeminiAPI(prompt, aiContext);
      
      const followup: ClientFollowup = {
        id: Date.now(),
        clientId: selectedClient.id,
        date: new Date().toISOString().split('T')[0],
        subject: "AI Generated Follow-up",
        body: result,
        isAiGenerated: true
      };

      setClientFollowups(prev => ({
        ...prev,
        [selectedClient.id]: [...(prev[selectedClient.id] || []), followup]
      }));

      incrementStat("communicationsSent");
      showSuccessMessage("AI follow-up generated and saved!");
    } catch (error) {
      showErrorMessage("Failed to generate AI follow-up. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, aiGenerateFollowup: false }));
    }
  };

  // Calculate completion percentage
  const completionPercentage = stats.tasksCreated > 0 
    ? Math.round((stats.tasksCompleted / stats.tasksCreated) * 100)
    : 0;

  const pendingTasks = tasks.filter(task => task.status === "pending");
  const completedTasks = tasks.filter(task => task.status === "completed");

  const renderDashboard = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Dashboard</h2>
          <p className="text-slate-600">Overview of your communication activities and task management</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Communications Sent"
            value={stats.communicationsSent}
            icon={Send}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Tasks Created"
            value={stats.tasksCreated}
            icon={PlusCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Tasks Completed"
            value={stats.tasksCompleted}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
          />
          <StatCard
            title="Completion Rate"
            value={`${completionPercentage}%`}
            icon={TrendingUp}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Email rewritten for Acme Corp</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Follow-up generated for Tech Solutions</p>
                    <p className="text-xs text-slate-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Report generated for GlobalTech</p>
                    <p className="text-xs text-slate-500">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-slate-300 rounded"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{task.name}</p>
                      <p className="text-xs text-slate-500">Due {task.suggestedDueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Clients</h2>
          <p className="text-slate-600">Manage your client relationships and communications</p>
        </div>

        {/* Add New Client Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-name">Name</Label>
                <Input
                  id="client-name"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Client name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="client-company">Company</Label>
                <Input
                  id="client-company"
                  value={newClient.company}
                  onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="client-email">Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="client@company.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="client-phone">Phone</Label>
                <Input
                  id="client-phone"
                  type="tel"
                  value={newClient.phone || ""}
                  onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value as any }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="client-notes">Notes</Label>
                <Textarea
                  id="client-notes"
                  value={newClient.notes || ""}
                  onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value as any }))}
                  placeholder="Additional notes about the client"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <ActionButton type="submit">
                  Add Client
                </ActionButton>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Existing Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map(client => (
                <div key={client.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{client.name}</h4>
                      <p className="text-sm text-slate-500">{client.company}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{client.email}</p>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleViewClientDetails(client)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderClientDetail = () => {
    if (!selectedClient) return null;

    const clientLogs = clientActivityLogs[selectedClient.id] || [];
    const clientMeetingsList = clientMeetings[selectedClient.id] || [];
    const clientFollowupsList = clientFollowups[selectedClient.id] || [];
    const assignedMembers = teamMembers.filter(member => 
      selectedClient.assignedTeamMembers.includes(member.id)
    );

    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToClients}
              className="mb-4 text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients List
            </Button>
            <h2 className={commonHeaderClass}>Client Details</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Information */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Client Information</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClient(selectedClient)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-500">Name</Label>
                    <p className="text-slate-900">{selectedClient.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-500">Company</Label>
                    <p className="text-slate-900">{selectedClient.company}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-500">Email</Label>
                    <p className="text-slate-900">{selectedClient.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-500">Phone</Label>
                    <p className="text-slate-900">{selectedClient.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-500">Notes</Label>
                    <p className="text-slate-900">{selectedClient.notes || "No notes"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignedMembers.length > 0 ? (
                      assignedMembers.map(member => (
                        <div key={member.id} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.role}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No team members assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity and Communications */}
            <div className="lg:col-span-2 space-y-6">
              {/* Activity Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4">
                    {clientLogs.map(log => (
                      <div key={log.id} className="border-l-2 border-blue-200 pl-4">
                        <p className="text-sm text-slate-900 font-medium">{log.entry}</p>
                        <p className="text-xs text-slate-500">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'No timestamp'}
                        </p>
                      </div>
                    ))}
                    {clientLogs.length === 0 && (
                      <p className="text-sm text-slate-500">No activity logs yet</p>
                    )}
                  </div>
                  <form onSubmit={handleAddActivityLog} className="border-t border-slate-200 pt-4">
                    <Textarea
                      value={newActivityLog}
                      onChange={(e) => setNewActivityLog(e.target.value)}
                      placeholder="Add new activity log entry"
                      rows={2}
                      className="mb-3"
                    />
                    <ActionButton type="submit">
                      Add Log Entry
                    </ActionButton>
                  </form>
                </CardContent>
              </Card>

              {/* Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle>Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4">
                    {clientMeetingsList.map(meeting => (
                      <div key={meeting.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">Meeting</h4>
                          <span className="text-sm text-slate-500">{meeting.date}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">Attendees: {meeting.attendees}</p>
                        <p className="text-sm text-slate-700 mb-2">{meeting.summary}</p>
                        <p className="text-sm text-slate-600">Action Items: {meeting.actionItems}</p>
                      </div>
                    ))}
                    {clientMeetingsList.length === 0 && (
                      <p className="text-sm text-slate-500">No meetings recorded yet</p>
                    )}
                  </div>
                  <form onSubmit={handleAddMeeting} className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                      <Input
                        placeholder="Attendees (comma-separated)"
                        value={newMeeting.attendees}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, attendees: e.target.value }))}
                        required
                      />
                    </div>
                    <Textarea
                      placeholder="Meeting summary"
                      value={newMeeting.summary}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, summary: e.target.value }))}
                      rows={2}
                      required
                    />
                    <Textarea
                      placeholder="Action items"
                      value={newMeeting.actionItems}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, actionItems: e.target.value }))}
                      rows={2}
                    />
                    <ActionButton type="submit">
                      Record Meeting
                    </ActionButton>
                  </form>
                </CardContent>
              </Card>

              {/* Follow-ups */}
              <Card>
                <CardHeader>
                  <CardTitle>Recorded Follow-ups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4">
                    {clientFollowupsList.map(followup => (
                      <div key={followup.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{followup.subject}</h4>
                          <div className="flex items-center space-x-2">
                            {followup.isAiGenerated && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                AI Generated
                              </span>
                            )}
                            <span className="text-sm text-slate-500">{followup.date}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">{followup.body}</p>
                      </div>
                    ))}
                    {clientFollowupsList.length === 0 && (
                      <p className="text-sm text-slate-500">No follow-ups recorded yet</p>
                    )}
                  </div>
                  <form onSubmit={handleAddFollowup} className="border-t border-slate-200 pt-4 space-y-3">
                    <Input
                      type="date"
                      value={newFollowup.date}
                      onChange={(e) => setNewFollowup(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="Subject (optional)"
                      value={newFollowup.subject}
                      onChange={(e) => setNewFollowup(prev => ({ ...prev, subject: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Follow-up content"
                      value={newFollowup.body}
                      onChange={(e) => setNewFollowup(prev => ({ ...prev, body: e.target.value }))}
                      rows={3}
                      required
                    />
                    <div className="flex space-x-3">
                      <ActionButton type="submit">
                        Save Follow-up
                      </ActionButton>
                      <ActionButton
                        type="button"
                        icon={BrainCircuit}
                        isLoading={isLoading.aiGenerateFollowup}
                        onClick={handleAiGenerateFollowup}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        AI Generate & Save
                      </ActionButton>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTeam = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Team</h2>
          <p className="text-slate-600">Manage your team members and their roles</p>
        </div>

        {/* Add Team Member Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTeamMember} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="member-name">Name</Label>
                <Input
                  id="member-name"
                  value={newTeamMember.name}
                  onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  value={newTeamMember.email}
                  onChange={(e) => setNewTeamMember(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@company.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="member-role">Role</Label>
                <Select
                  value={newTeamMember.role}
                  onValueChange={(value) => setNewTeamMember(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Account Manager">Account Manager</SelectItem>
                    <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                    <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                    <SelectItem value="Designer">Designer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <ActionButton type="submit">
                  Add Team Member
                </ActionButton>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map(member => (
                <div key={member.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{member.name}</h4>
                      <p className="text-sm text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{member.email}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={commonHeaderClass}>Tasks</h2>
              <p className="text-slate-600">Manage and track your tasks</p>
            </div>
            <ActionButton
              icon={BrainCircuit}
              isLoading={isLoading.generateTasks}
              onClick={handleGenerateTasks}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Generate Tasks from Context
            </ActionButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      id={task.id}
                      name={task.name}
                      description={task.description}
                      suggestedDueDate={task.suggestedDueDate}
                      status={task.status}
                      onToggleStatus={handleToggleTaskStatus}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No pending tasks</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedTasks.length > 0 ? (
                  completedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      id={task.id}
                      name={task.name}
                      description={task.description}
                      suggestedDueDate={task.suggestedDueDate}
                      status={task.status}
                      onToggleStatus={handleToggleTaskStatus}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No completed tasks</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderRewriteEmail = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Rewrite Email</h2>
          <p className="text-slate-600">Transform your draft emails into professional communications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Draft Email</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                placeholder="Paste your draft email here..."
                rows={12}
                className="mb-4"
              />
              <ActionButton
                icon={BrainCircuit}
                isLoading={isLoading.rewrite}
                onClick={handleRewriteEmail}
                className="w-full"
              >
                Rewrite Email with AI
              </ActionButton>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Professional Version</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyTemplateBody(rewrittenEmail)}
                  disabled={!rewrittenEmail}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={rewrittenEmail}
                readOnly
                rows={12}
                className="bg-slate-50 mb-4"
                placeholder="Rewritten email will appear here..."
              />
              {rewrittenEmail && (
                <Message type="success">
                  Email successfully rewritten! Communication count updated.
                </Message>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderFollowup = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Generate Follow-up</h2>
          <p className="text-slate-600">Create contextually relevant follow-up emails</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="followup-subject">Subject/Context (Optional)</Label>
                <Input
                  id="followup-subject"
                  value={followupSubject}
                  onChange={(e) => setFollowupSubject(e.target.value)}
                  placeholder="e.g., Project status update, Meeting follow-up"
                />
              </div>
              <div>
                <Label htmlFor="followup-notes">Specific Points to Include</Label>
                <Textarea
                  id="followup-notes"
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  placeholder="Enter any specific points, updates, or questions you want to include in the follow-up..."
                  rows={6}
                />
              </div>
              <ActionButton
                icon={BrainCircuit}
                isLoading={isLoading.followup}
                onClick={handleGenerateFollowup}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Generate Follow-up Email
              </ActionButton>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Follow-up</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyTemplateBody(generatedFollowup)}
                  disabled={!generatedFollowup}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generatedFollowup}
                readOnly
                rows={14}
                className="bg-slate-50 mb-4"
                placeholder="Generated follow-up will appear here..."
              />
              {generatedFollowup && (
                <Message type="success">
                  Follow-up email generated successfully! Communication count updated.
                </Message>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderAnalyzeEmail = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Analyze Email</h2>
          <p className="text-slate-600">Extract insights and get actionable suggestions from client emails</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Client Email to Analyze</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={emailToAnalyze}
                onChange={(e) => setEmailToAnalyze(e.target.value)}
                placeholder="Paste the client's email here..."
                rows={12}
                className="mb-4"
              />
              <ActionButton
                icon={Search}
                isLoading={isLoading.analyze}
                onClick={handleAnalyzeEmail}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Analyze Email & Suggest Next Steps
              </ActionButton>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis & Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResult ? (
                <div>
                  <div className="prose prose-sm max-w-none mb-4">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700">{analysisResult}</pre>
                  </div>
                  <div className="space-y-3">
                    <ActionButton
                      isLoading={isLoading.generateTasks}
                      onClick={handleCreateTasksFromSuggestions}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Create Tasks from Suggestions
                    </ActionButton>
                    <ActionButton
                      isLoading={isLoading.generateTemplates}
                      onClick={handleGenerateEmailTemplates}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      Generate Email Templates from Suggestions
                    </ActionButton>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Analysis results will appear here...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderReport = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Generate Report</h2>
          <p className="text-slate-600">Create comprehensive client activity reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Report Period</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={reportPeriodStart}
                    onChange={(e) => setReportPeriodStart(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={reportPeriodEnd}
                    onChange={(e) => setReportPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="report-highlights">Key Activities & Highlights</Label>
                <Textarea
                  id="report-highlights"
                  value={reportHighlights}
                  onChange={(e) => setReportHighlights(e.target.value)}
                  placeholder="Enter specific points or recent activities to highlight in the report..."
                  rows={8}
                />
              </div>
              <ActionButton
                icon={FileText}
                isLoading={isLoading.report}
                onClick={handleGenerateReport}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Generate Report
              </ActionButton>
            </CardContent>
          </Card>

          {/* Generated Report */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Report</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyTemplateBody(generatedReport)}
                  disabled={!generatedReport}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {generatedReport ? (
                <div>
                  <div className="prose prose-sm max-w-none mb-4">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700">{generatedReport}</pre>
                  </div>
                  <Message type="success">
                    Report generated successfully! Communication count updated.
                  </Message>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Generated report will appear here...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Email Templates Gallery</h2>
          <p className="text-slate-600">Store and reuse your frequently used email templates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emailTemplates.map(template => (
            <Card key={template.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{template.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-slate-400 hover:text-red-500 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {template.body.substring(0, 150)}...
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleCopyTemplateBody(template.body)}
                  >
                    Copy Body
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>AI Settings</h2>
          <p className="text-slate-600">Configure the global context for AI-powered features</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Global AI Context</CardTitle>
            <p className="text-sm text-slate-600">
              This context will be used by all AI features to personalize communications and tasks according to your business needs.
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              placeholder="Enter your global AI context here..."
              rows={20}
              className="font-mono text-sm mb-4"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Auto-saved</span>
              </div>
              <ActionButton>
                Save Context
              </ActionButton>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Context Usage</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Email rewriting and follow-up generation</li>
                    <li>• Task creation from communications</li>
                    <li>• Client report generation</li>
                    <li>• Email template creation</li>
                    <li>• Communication analysis and insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCurrentTab = () => {
    if (viewingClientDetail) {
      return renderClientDetail();
    }

    switch (currentTab) {
      case "dashboard":
        return renderDashboard();
      case "clients":
        return renderClients();
      case "team":
        return renderTeam();
      case "tasks":
        return renderTasks();
      case "rewrite":
        return renderRewriteEmail();
      case "followup":
        return renderFollowup();
      case "analyze":
        return renderAnalyzeEmail();
      case "report":
        return renderReport();
      case "templates":
        return renderTemplates();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentTab={viewingClientDetail ? "clients" : currentTab} 
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setViewingClientDetail(false);
        }} 
      />
      {renderCurrentTab()}
      
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information and team assignments
            </DialogDescription>
          </DialogHeader>
          
          {editingClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editClientData.name || ""}
                    onChange={(e) => setEditClientData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editClientData.company || ""}
                    onChange={(e) => setEditClientData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editClientData.email || ""}
                    onChange={(e) => setEditClientData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editClientData.phone || ""}
                    onChange={(e) => setEditClientData(prev => ({ ...prev, phone: e.target.value as any }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editClientData.notes || ""}
                  onChange={(e) => setEditClientData(prev => ({ ...prev, notes: e.target.value as any }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Assigned Team Members</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={editClientData.assignedTeamMembers?.includes(member.id) || false}
                        onCheckedChange={(checked) => {
                          const currentMembers = editClientData.assignedTeamMembers || [];
                          const newMembers = checked
                            ? [...currentMembers, member.id]
                            : currentMembers.filter(id => id !== member.id);
                          setEditClientData(prev => ({ ...prev, assignedTeamMembers: newMembers }));
                        }}
                      />
                      <Label htmlFor={`member-${member.id}`} className="text-sm">
                        {member.name} ({member.role})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingClient(null)}>
              Cancel
            </Button>
            <ActionButton onClick={handleSaveClientEdit}>
              Save Changes
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
