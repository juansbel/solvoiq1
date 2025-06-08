import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  Award,
  Plus,
  Edit2,
  MapPin,
  Phone,
  Mail,
  Briefcase
} from "lucide-react";
import { 
  SAMPLE_TEAM_MEMBERS, 
  SAMPLE_CLIENTS,
  COP_PER_TEAM_MEMBER,
  COP_PERFORMANCE_BONUS,
  COP_NEW_POSITION_BONUS
} from "@/lib/sampleData";

interface CommissionData {
  teamMemberCount: number;
  performanceMet: number;
  newPositions: number;
  totalCommission: number;
}

interface KPI {
  id: number;
  name: string;
  target: number;
  actual: number;
  met: boolean;
}

export default function CommissionTracking() {
  // Set page title
  useEffect(() => {
    document.title = "Commission Tracking - ClientHub AI";
  }, []);

  // Fetch real data from API
  const { data: teamMembers = [] } = useQuery<any[]>({
    queryKey: ["/api/team-members"],
    staleTime: 30000,
  });

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ["/api/clients"],
    staleTime: 30000,
  });

  const [commissionData, setCommissionData] = useState<CommissionData>({
    teamMemberCount: 0,
    performanceMet: 2,
    newPositions: 1,
    totalCommission: 0
  });

  // Update commission data when team members load
  useEffect(() => {
    setCommissionData(prev => ({
      ...prev,
      teamMemberCount: teamMembers.length
    }));
  }, [teamMembers]);

  const [editingKPI, setEditingKPI] = useState<{ clientId: number; kpiId: number } | null>(null);
  const [newKPI, setNewKPI] = useState({ name: "", target: 0, actual: 0 });
  const [showAddKPI, setShowAddKPI] = useState<number | null>(null);

  // Calculate commission
  const calculateCommission = () => {
    const baseCommission = commissionData.teamMemberCount * COP_PER_TEAM_MEMBER;
    const performanceBonus = commissionData.performanceMet * COP_PERFORMANCE_BONUS;
    const newPositionBonus = commissionData.newPositions * COP_NEW_POSITION_BONUS;
    
    return baseCommission + performanceBonus + newPositionBonus;
  };

  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateKPIProgress = (kpis: KPI[]) => {
    if (!kpis || kpis.length === 0) return 0;
    const metKPIs = kpis.filter(kpi => kpi.met).length;
    return (metKPIs / kpis.length) * 100;
  };

  const totalCommission = calculateCommission();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Commission Tracking Dashboard</h1>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Total: {formatCOP(totalCommission)}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">KPI Management</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{commissionData.teamMemberCount}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCOP(COP_PER_TEAM_MEMBER)} per member
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance Bonus</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{commissionData.performanceMet}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCOP(COP_PERFORMANCE_BONUS)} per achievement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Positions</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{commissionData.newPositions}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCOP(COP_NEW_POSITION_BONUS)} per position
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCOP(totalCommission)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly commission
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Commission Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Commission ({commissionData.teamMemberCount} members)</span>
                  <span>{formatCOP(commissionData.teamMemberCount * COP_PER_TEAM_MEMBER)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance Bonus ({commissionData.performanceMet} achievements)</span>
                  <span>{formatCOP(commissionData.performanceMet * COP_PERFORMANCE_BONUS)}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Position Bonus ({commissionData.newPositions} positions)</span>
                  <span>{formatCOP(commissionData.newPositions * COP_NEW_POSITION_BONUS)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCOP(totalCommission)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <h2 className="text-2xl font-bold">Client KPI Management</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SAMPLE_CLIENTS.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{client.company}</span>
                    <Badge variant={calculateKPIProgress(client.kpis || []) > 75 ? "default" : "secondary"}>
                      {Math.round(calculateKPIProgress(client.kpis || []))}% Complete
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{client.name}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress 
                    value={calculateKPIProgress(client.kpis || [])} 
                    className="w-full"
                  />
                  
                  <div className="space-y-3">
                    {client.kpis?.map((kpi) => (
                      <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{kpi.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Target: {kpi.target.toLocaleString()} | Actual: {kpi.actual.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={kpi.met ? "default" : "destructive"}>
                            {kpi.met ? "Met" : "Not Met"}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingKPI({ clientId: client.id, kpiId: kpi.id })}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddKPI(client.id)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add KPI
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <h2 className="text-2xl font-bold">Enhanced Team Member Profiles</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SAMPLE_TEAM_MEMBERS.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{member.name}</span>
                    <Badge variant="secondary">{member.teamMemberId}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{member.position}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.location}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.skills?.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Incapacidades</Label>
                    <div className="mt-1 space-y-1">
                      {member.incapacidades?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">None registered</p>
                      ) : (
                        member.incapacidades?.map((incapacidad) => (
                          <div key={incapacidad.id} className="text-sm p-2 bg-muted rounded">
                            <div className="font-medium">{incapacidad.reason}</div>
                            <div className="text-muted-foreground">
                              {incapacidad.startDate} to {incapacidad.endDate}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Recent 1-on-1 Sessions</Label>
                    <div className="mt-1 space-y-2">
                      {member.oneOnOneSessions?.map((session) => (
                        <div key={session.id} className="text-sm p-3 border rounded">
                          <div className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {session.date}
                          </div>
                          <div className="mt-1">
                            <div className="text-muted-foreground">Discussion Points:</div>
                            <ul className="list-disc list-inside ml-2">
                              {session.discussionPoints.map((point, index) => (
                                <li key={index} className="text-sm">{point}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-1">
                            <div className="text-muted-foreground">Action Items:</div>
                            <ul className="list-disc list-inside ml-2">
                              {session.actionItems.map((item, index) => (
                                <li key={index} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamCount">Team Members</Label>
                  <Input
                    id="teamCount"
                    type="number"
                    value={commissionData.teamMemberCount}
                    onChange={(e) => setCommissionData(prev => ({ 
                      ...prev, 
                      teamMemberCount: parseInt(e.target.value) || 0 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCOP(COP_PER_TEAM_MEMBER)} per member
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="performanceCount">Performance Achievements</Label>
                  <Input
                    id="performanceCount"
                    type="number"
                    value={commissionData.performanceMet}
                    onChange={(e) => setCommissionData(prev => ({ 
                      ...prev, 
                      performanceMet: parseInt(e.target.value) || 0 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCOP(COP_PERFORMANCE_BONUS)} per achievement
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPositions">New Positions</Label>
                  <Input
                    id="newPositions"
                    type="number"
                    value={commissionData.newPositions}
                    onChange={(e) => setCommissionData(prev => ({ 
                      ...prev, 
                      newPositions: parseInt(e.target.value) || 0 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCOP(COP_NEW_POSITION_BONUS)} per position
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatCOP(calculateCommission())}
                </div>
                <p className="text-muted-foreground">Total Monthly Commission</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}