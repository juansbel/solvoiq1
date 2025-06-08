import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TextareaWithCopy } from "@/components/textarea-with-copy";
import { ActionButton } from "@/components/action-button";
import { 
  Bug, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  User,
  Calendar,
  Tag,
  Copy,
  Wand2,
  FileText,
  Target
} from "lucide-react";
import { callGeminiAPI } from "@/lib/geminiAPI";

interface TicketTemplate {
  id: string;
  name: string;
  type: "bug" | "feature" | "task" | "epic";
  template: string;
  description: string;
}

interface JiraTicket {
  title: string;
  description: string;
  type: "bug" | "feature" | "task" | "epic";
  priority: "low" | "medium" | "high" | "critical";
  assignee: string;
  labels: string[];
  acceptanceCriteria: string;
  storyPoints: number;
}

const TICKET_TEMPLATES: TicketTemplate[] = [
  {
    id: "bug-template",
    name: "Bug Report",
    type: "bug",
    description: "Standard template for reporting software bugs",
    template: `## Summary
Brief description of the issue

## Environment
- OS: 
- Browser: 
- Version: 

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots/Logs
[Attach any relevant files]

## Additional Context
Any other information that might be helpful`
  },
  {
    id: "feature-template",
    name: "Feature Request",
    type: "feature",
    description: "Template for requesting new features",
    template: `## Feature Summary
Brief description of the requested feature

## User Story
As a [type of user], I want [some goal] so that [some reason]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Business Value
Why this feature is important

## Technical Considerations
Any technical requirements or constraints

## Design Mockups
[Attach any relevant designs]`
  },
  {
    id: "task-template",
    name: "Task",
    type: "task",
    description: "General task template",
    template: `## Task Description
What needs to be done

## Objectives
- Objective 1
- Objective 2

## Requirements
- Requirement 1
- Requirement 2

## Definition of Done
- [ ] Task completed
- [ ] Code reviewed
- [ ] Tests written
- [ ] Documentation updated`
  },
  {
    id: "epic-template",
    name: "Epic",
    type: "epic",
    description: "Large feature or initiative template",
    template: `## Epic Summary
High-level description of the epic

## Business Goals
What business objectives this epic supports

## User Personas
Who will benefit from this epic

## Success Metrics
How we'll measure success

## Stories/Tasks
- [ ] Story 1
- [ ] Story 2
- [ ] Story 3

## Timeline
Estimated duration and milestones

## Dependencies
Other epics or external dependencies`
  }
];

const PRIORITY_COLORS = {
  low: "bg-gray-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500"
};

const TYPE_ICONS = {
  bug: Bug,
  feature: Zap,
  task: CheckCircle,
  epic: Target
};

export default function JiraHelper() {
  const [ticket, setTicket] = useState<JiraTicket>({
    title: "",
    description: "",
    type: "task",
    priority: "medium",
    assignee: "",
    labels: [],
    acceptanceCriteria: "",
    storyPoints: 0
  });

  const [currentLabel, setCurrentLabel] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const addLabel = () => {
    if (currentLabel.trim() && !ticket.labels.includes(currentLabel.trim())) {
      setTicket(prev => ({
        ...prev,
        labels: [...prev.labels, currentLabel.trim()]
      }));
      setCurrentLabel("");
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setTicket(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const applyTemplate = (template: TicketTemplate) => {
    setTicket(prev => ({
      ...prev,
      description: template.template,
      type: template.type
    }));
    setSelectedTemplate(template);
  };

  const generateTicketWithAI = async () => {
    if (!ticket.title.trim()) return;

    setIsGenerating(true);
    try {
      const prompt = `Generate a detailed Jira ticket for the following:

Title: ${ticket.title}
Type: ${ticket.type}
Priority: ${ticket.priority}
${customPrompt ? `Additional context: ${customPrompt}` : ''}

Please create a comprehensive ticket description that includes:
- Clear summary
- Detailed description
- Acceptance criteria (if applicable)
- Technical requirements (if applicable)
- Any relevant sections based on the ticket type

Format the response in Markdown that's suitable for Jira.`;

      const generatedContent = await callGeminiAPI(prompt);
      if (generatedContent) {
        setGeneratedTicket(generatedContent);
        setTicket(prev => ({ ...prev, description: generatedContent }));
      }
    } catch (error) {
      console.error("Failed to generate ticket:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateJiraFormat = () => {
    const TypeIcon = TYPE_ICONS[ticket.type];
    
    return `**Ticket Type:** ${ticket.type.toUpperCase()}
**Priority:** ${ticket.priority.toUpperCase()}
**Story Points:** ${ticket.storyPoints}
**Assignee:** ${ticket.assignee || "Unassigned"}
**Labels:** ${ticket.labels.join(", ") || "None"}

---

**Title:** ${ticket.title}

**Description:**
${ticket.description}

${ticket.acceptanceCriteria ? `**Acceptance Criteria:**
${ticket.acceptanceCriteria}` : ''}

---
*Generated with Client Hub AI - Jira Helper*`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Jira Ticket Helper</h1>
        <Badge variant="secondary" className="text-sm">
          AI-Powered Ticket Generation
        </Badge>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Ticket</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="export">Export & Format</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Ticket Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter ticket title..."
                    value={ticket.title}
                    onChange={(e) => setTicket(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={ticket.type} 
                      onValueChange={(value: any) => setTicket(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">🐛 Bug</SelectItem>
                        <SelectItem value="feature">✨ Feature</SelectItem>
                        <SelectItem value="task">✅ Task</SelectItem>
                        <SelectItem value="epic">🎯 Epic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={ticket.priority} 
                      onValueChange={(value: any) => setTicket(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="high">🟠 High</SelectItem>
                        <SelectItem value="critical">🔴 Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Input
                      id="assignee"
                      placeholder="Enter assignee..."
                      value={ticket.assignee}
                      onChange={(e) => setTicket(prev => ({ ...prev, assignee: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storyPoints">Story Points</Label>
                    <Input
                      id="storyPoints"
                      type="number"
                      min="0"
                      max="100"
                      value={ticket.storyPoints}
                      onChange={(e) => setTicket(prev => ({ 
                        ...prev, 
                        storyPoints: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Labels</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add label..."
                      value={currentLabel}
                      onChange={(e) => setCurrentLabel(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addLabel()}
                    />
                    <Button onClick={addLabel} size="sm">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ticket.labels.map((label) => (
                      <Badge 
                        key={label} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeLabel(label)}
                      >
                        {label} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="customPrompt">AI Generation Context (Optional)</Label>
                  <Textarea
                    id="customPrompt"
                    placeholder="Provide additional context for AI to generate better ticket content..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <ActionButton
                  onClick={generateTicketWithAI}
                  disabled={!ticket.title.trim()}
                  loading={isGenerating}
                  icon={Wand2}
                  className="w-full"
                >
                  Generate with AI
                </ActionButton>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description & Acceptance Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter detailed description..."
                    value={ticket.description}
                    onChange={(e) => setTicket(prev => ({ ...prev, description: e.target.value }))}
                    rows={12}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acceptance">Acceptance Criteria</Label>
                  <Textarea
                    id="acceptance"
                    placeholder="Define acceptance criteria..."
                    value={ticket.acceptanceCriteria}
                    onChange={(e) => setTicket(prev => ({ ...prev, acceptanceCriteria: e.target.value }))}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TICKET_TEMPLATES.map((template) => {
              const TypeIcon = TYPE_ICONS[template.type];
              return (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => applyTemplate(template)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-3 rounded text-sm font-mono text-xs overflow-x-auto">
                      <pre>{template.template.substring(0, 200)}...</pre>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Jira-Ready Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TextareaWithCopy
                value={generateJiraFormat()}
                readonly
                rows={20}
                placeholder="Create a ticket to see the formatted output..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const TypeIcon = TYPE_ICONS[ticket.type];
                      return <TypeIcon className="h-5 w-5" />;
                    })()}
                    <span className="font-medium">{ticket.type.toUpperCase()}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[ticket.priority]}`} />
                  <span className="text-sm">{ticket.priority.toUpperCase()} Priority</span>
                  {ticket.storyPoints > 0 && (
                    <Badge variant="outline">{ticket.storyPoints} SP</Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-lg">{ticket.title || "Untitled Ticket"}</h3>
                  {ticket.assignee && (
                    <p className="text-sm text-muted-foreground">
                      Assigned to: {ticket.assignee}
                    </p>
                  )}
                </div>

                {ticket.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {ticket.labels.map((label) => (
                      <Badge key={label} variant="secondary">{label}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}