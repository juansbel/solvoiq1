import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Flag,
  CheckCircle2,
  Circle,
  PlayCircle,
  PauseCircle,
  MoreHorizontal,
  Filter,
  Search,
  Kanban,
  List,
  Calendar as CalendarView,
  BarChart3
} from "lucide-react";
import type { Task, TeamMember } from "@/../../shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CharacterAvatar } from "@/components/character-avatar";

interface Project {
  id: number;
  name: string;
  description: string;
  status: "planning" | "active" | "on-hold" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  startDate: Date;
  endDate: Date;
  teamMembers: string[];
  budget: number;
  spent: number;
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: "Client Portal Redesign",
    description: "Complete overhaul of the client portal interface",
    status: "active",
    priority: "high",
    progress: 65,
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-03-30"),
    teamMembers: ["Sarah Chen", "Mike Rodriguez"],
    budget: 45000,
    spent: 29250
  },
  {
    id: 2,
    name: "AI Integration Phase 2",
    description: "Implement advanced AI features across platform",
    status: "planning",
    priority: "critical",
    progress: 25,
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-05-15"),
    teamMembers: ["Sarah Chen", "David Kim"],
    budget: 75000,
    spent: 18750
  }
];

export default function ProjectManagement() {
  const [view, setView] = useState<"kanban" | "list" | "calendar" | "timeline">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    description: "",
    priority: "medium",
    startDate: new Date(),
    endDate: new Date(),
    budget: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "on-hold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "border-l-green-500";
      case "medium": return "border-l-yellow-500";
      case "high": return "border-l-orange-500";
      case "critical": return "border-l-red-500";
      default: return "border-l-gray-500";
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className={`border-0 shadow-lg border-l-4 ${getPriorityColor(project.priority)} hover:shadow-xl transition-shadow cursor-pointer`}
          onClick={() => setSelectedProject(project)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            {project.name}
          </CardTitle>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {project.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Budget</span>
            <span className="font-medium">
              ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
            </span>
          </div>
          <Progress value={(project.spent / project.budget) * 100} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {format(project.endDate, "MMM dd, yyyy")}
            </span>
          </div>
          <div className="flex -space-x-2">
            {project.teamMembers.slice(0, 3).map((member, index) => (
              <CharacterAvatar
                key={index}
                name={member}
                size="sm"
                className="border-2 border-white dark:border-gray-800"
              />
            ))}
            {project.teamMembers.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                +{project.teamMembers.length - 3}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filteredProjects = mockProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Project Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Organize and track project progress with advanced project management tools
            </p>
          </div>
          <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input
                      value={newProjectData.name}
                      onChange={(e) => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newProjectData.priority}
                      onValueChange={(value) => setNewProjectData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newProjectData.description}
                    onChange={(e) => setNewProjectData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Project description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Budget</Label>
                    <Input
                      type="number"
                      value={newProjectData.budget}
                      onChange={(e) => setNewProjectData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                      placeholder="Project budget"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(newProjectData.endDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newProjectData.endDate}
                          onSelect={(date) => date && setNewProjectData(prev => ({ ...prev, endDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast({
                      title: "Project Created",
                      description: `${newProjectData.name} has been created successfully.`,
                    });
                    setIsNewProjectOpen(false);
                  }}>
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("kanban")}
            >
              <Kanban className="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              <CalendarView className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>
        </div>

        {/* Project Views */}
        {view === "kanban" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {["planning", "active", "on-hold", "completed"].map((status) => (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                    {status.replace("-", " ")}
                  </h3>
                  <Badge variant="secondary">
                    {filteredProjects.filter(p => p.status === status).length}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {filteredProjects
                    .filter(project => project.status === status)
                    .map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "list" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProjects.map(project => (
                <div key={project.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                     onClick={() => setSelectedProject(project)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {project.name}
                        </h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(project.priority).replace('border-l-', 'border-')}>
                          {project.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <span>Progress: {project.progress}%</span>
                        <span>Budget: ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                        <span>Due: {format(project.endDate, "MMM dd, yyyy")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {project.teamMembers.slice(0, 3).map((member, index) => (
                          <CharacterAvatar
                            key={index}
                            name={member}
                            size="sm"
                            className="border-2 border-white dark:border-gray-800"
                          />
                        ))}
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "calendar" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <CalendarView className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                <p>Project timeline and milestone calendar will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedProject.name}
                  <Badge className={getStatusColor(selectedProject.status)}>
                    {selectedProject.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedProject.description}
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progress
                      </Label>
                      <div className="mt-2">
                        <Progress value={selectedProject.progress} className="h-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedProject.progress}% Complete
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Budget Utilization
                      </Label>
                      <div className="mt-2">
                        <Progress value={(selectedProject.spent / selectedProject.budget) * 100} className="h-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ${selectedProject.spent.toLocaleString()} of ${selectedProject.budget.toLocaleString()} spent
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Timeline
                      </Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                          <span>{format(selectedProject.startDate, "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                          <span>{format(selectedProject.endDate, "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Team Members
                      </Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedProject.teamMembers.map((member, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full pl-1 pr-3 py-1">
                            <CharacterAvatar name={member} size="sm" />
                            <span className="text-sm font-medium">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}