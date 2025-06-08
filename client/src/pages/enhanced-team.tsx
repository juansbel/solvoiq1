import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { useDebounce } from "@/hooks/use-debounce";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CharacterAvatar } from "@/components/character-avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, Search, User, Mail, MapPin, Calendar, Trophy,
  Target, TrendingUp, Users, MoreVertical, Edit, MessageSquare,
  FileText, Eye, Filter, Grid, List, Star, Award, Clock,
  Activity, CheckCircle, AlertCircle, BarChart3, Brain
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TeamMember, Task, Client, InsertTeamMember } from "@shared/schema";
import { insertTeamMemberSchema } from "@shared/schema";
import { Controller } from "react-hook-form";

export default function EnhancedTeam() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterRole, setFilterRole] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set page title
  useEffect(() => {
    document.title = "Team - ClientHub AI";
  }, []);

  const form = useForm<InsertTeamMember>({
    resolver: zodResolver(insertTeamMemberSchema),
    defaultValues: {
      userId: "1",
      name: "",
      email: "",
      role: "",
      position: null,
      location: null,
      teamMemberId: null,
      skills: [],
      incapacidades: [],
      oneOnOneSessions: []
    },
  });

  const { data: teamMembers = [], isLoading, error } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
    staleTime: 30000,
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    staleTime: 30000,
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    staleTime: 30000,
  });

  // Memoized filtered team members for performance with debounced search
  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           member.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      if (filterRole === "all") return matchesSearch;
      return matchesSearch && member.role.toLowerCase() === filterRole.toLowerCase();
    });
  }, [teamMembers, debouncedSearchTerm, filterRole]);

  const createTeamMemberMutation = useMutation({
    mutationFn: async (data: InsertTeamMember) => {
      const response = await apiRequest("POST", "/api/team-members", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      form.reset();
      setShowAddDialog(false);
      toast({
        title: "Team member added",
        description: "Team member has been successfully created.",
      });
    },
    onError: (error: any) => {
      console.error('Team member creation error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add team member",
        variant: "destructive",
      });
    },
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: (memberId: number) => apiRequest("DELETE", `/api/team-members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        title: "Team member removed",
        description: "Team member has been successfully removed.",
      });
    }
  });

  const onSubmit = (data: InsertTeamMember) => {
    createTeamMemberMutation.mutate(data);
  };

  const getMemberMetrics = (member: TeamMember) => {
    const memberTasks = tasks.filter(task => 
      task.assignedTo && task.assignedTo.includes(member.name)
    );
    
    const activeTasks = memberTasks.filter(task => task.status !== "completed").length;
    const completedTasks = memberTasks.filter(task => task.status === "completed").length;
    const totalTasks = memberTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate workload based on estimated time
    const totalWorkload = memberTasks
      .filter(task => task.status !== "completed")
      .reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);
    
    // Calculate efficiency based on time spent vs estimated
    const efficiency = memberTasks
      .filter(task => task.status === "completed" && task.estimatedMinutes && task.timeSpent)
      .reduce((acc, task) => {
        const estimated = task.estimatedMinutes || 1;
        const actual = task.timeSpent || 1;
        return acc + Math.min(estimated / actual, 2); // Cap at 200% efficiency
      }, 0) / Math.max(completedTasks, 1) * 100;

    // Get assigned clients count
    const assignedClients = clients.filter(client => 
      client.assignedTeamMembers && client.assignedTeamMembers.includes(member.name)
    ).length;

    return {
      activeTasks,
      completedTasks,
      totalTasks,
      completionRate,
      totalWorkload: Math.round(totalWorkload / 60), // Convert to hours
      efficiency: Math.round(efficiency),
      assignedClients,
      skills: member.skills || [],
      incapacidades: member.incapacidades || [],
      oneOnOneSessions: member.oneOnOneSessions || []
    };
  };

  const getMemberPerformance = (member: TeamMember) => {
    const metrics = getMemberMetrics(member);
    
    let performanceLevel: "excellent" | "good" | "average" | "needs_improvement";
    let color: string;
    
    const score = (metrics.completionRate + metrics.efficiency) / 2;
    
    if (score >= 85) {
      performanceLevel = "excellent";
      color = "text-green-600";
    } else if (score >= 70) {
      performanceLevel = "good";
      color = "text-blue-600";
    } else if (score >= 50) {
      performanceLevel = "average";
      color = "text-yellow-600";
    } else {
      performanceLevel = "needs_improvement";
      color = "text-red-600";
    }
    
    return { performanceLevel, color, score: Math.round(score) };
  };

  const getWorkloadStatus = (workloadHours: number) => {
    if (workloadHours > 40) return { status: "overloaded", color: "bg-red-500" };
    if (workloadHours > 30) return { status: "high", color: "bg-yellow-500" };
    if (workloadHours > 15) return { status: "moderate", color: "bg-blue-500" };
    return { status: "light", color: "bg-green-500" };
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => {
    const metrics = getMemberMetrics(member);
    const performance = getMemberPerformance(member);
    const workloadStatus = getWorkloadStatus(metrics.totalWorkload);
    
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <CharacterAvatar name={member.name} size="lg" />
              <div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  {member.role}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/team-member/${member.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Member
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule 1:1
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => deleteTeamMemberMutation.mutate(member.id)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                performance.performanceLevel === 'excellent' ? 'bg-green-500' :
                performance.performanceLevel === 'good' ? 'bg-blue-500' :
                performance.performanceLevel === 'average' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-medium ${performance.color}`}>
                {performance.performanceLevel.replace('_', ' ').charAt(0).toUpperCase() + 
                 performance.performanceLevel.replace('_', ' ').slice(1)}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              Score: {performance.score}%
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Task Completion</span>
              <span className="font-medium">{Math.round(metrics.completionRate)}%</span>
            </div>
            <Progress value={metrics.completionRate} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Workload ({metrics.totalWorkload}h)</span>
              <span className={`text-xs px-2 py-1 rounded-full text-white ${workloadStatus.color}`}>
                {workloadStatus.status}
              </span>
            </div>
            <Progress value={Math.min((metrics.totalWorkload / 40) * 100, 100)} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Active Tasks:</span>
              <span className="font-medium">{metrics.activeTasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Clients:</span>
              <span className="font-medium">{metrics.assignedClients}</span>
            </div>
          </div>

          {metrics.skills.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Skills</span>
              <div className="flex flex-wrap gap-1">
                {metrics.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {metrics.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{metrics.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <Separator />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {member.email}
            </div>
            {member.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {member.location}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const TeamMemberListItem = ({ member }: { member: TeamMember }) => {
    const metrics = getMemberMetrics(member);
    const performance = getMemberPerformance(member);
    const workloadStatus = getWorkloadStatus(metrics.totalWorkload);
    
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CharacterAvatar name={member.name} size="md" />
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <Badge variant="outline" className={performance.color}>
                  {performance.performanceLevel.replace('_', ' ')}
                </Badge>
                <div className={`h-2 w-2 rounded-full ${workloadStatus.color}`} 
                     title={`Workload: ${workloadStatus.status}`} />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {member.role}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {member.email}
                </span>
                {member.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {member.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.activeTasks}</div>
              <div className="text-xs text-muted-foreground">Active Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.assignedClients}</div>
              <div className="text-xs text-muted-foreground">Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.totalWorkload}h</div>
              <div className="text-xs text-muted-foreground">Workload</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{performance.score}%</div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/team-member/${member.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Member
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule 1:1
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => deleteTeamMemberMutation.mutate(member.id)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const roles = teamMembers.reduce((acc, member) => {
    if (!acc.includes(member.role)) acc.push(member.role);
    return acc;
  }, [] as string[]);
  const avgPerformance = teamMembers.length > 0 
    ? Math.round(teamMembers.reduce((sum, member) => sum + getMemberPerformance(member).score, 0) / teamMembers.length)
    : 0;
  const overloadedMembers = teamMembers.filter(member => getMemberMetrics(member).totalWorkload > 40).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your team and track individual performance</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Create a new team member profile with role and contact information.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Name"
                            required
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@company.com" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input placeholder="Sales Manager" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Account Manager" {...field} value={field.value || ""} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="New York, NY" {...field} value={field.value || ""} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teamMemberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input placeholder="EMP001" {...field} value={field.value || ""} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTeamMemberMutation.isPending}>
                    {createTeamMemberMutation.isPending ? "Adding..." : "Add Team Member"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={role} value={role.toLowerCase()}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgPerformance}%</p>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teamMembers.reduce((sum, member) => sum + getMemberMetrics(member).activeTasks, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overloadedMembers}</p>
                <p className="text-sm text-muted-foreground">Overloaded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredTeamMembers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first team member"}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredTeamMembers.map((member) => (
            viewMode === "grid" ? (
              <TeamMemberCard key={member.id} member={member} />
            ) : (
              <TeamMemberListItem key={member.id} member={member} />
            )
          ))}
        </div>
      )}
    </div>
  );
}