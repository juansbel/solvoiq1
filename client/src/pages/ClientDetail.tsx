import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Edit2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { commonHeaderClass, commonSubHeaderClass, commonSectionClass, formatDateTime } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Client, TeamMember, ActivityLog, Meeting, FollowUp } from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ActionButton } from "@/components/ActionButton";
import { generateFollowUp } from "@/lib/gemini";

interface ClientDetailProps {
  clientId: number;
  onBack: () => void;
}

export function ClientDetail({ clientId, onBack }: ClientDetailProps) {
  const { toast } = useToast();
  const [newLogEntry, setNewLogEntry] = useState("");
  const [meetingForm, setMeetingForm] = useState({
    date: "",
    attendees: "",
    summary: "",
    actionItems: "",
  });
  const [followUpForm, setFollowUpForm] = useState({
    date: "",
    subject: "",
    body: "",
  });

  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: ["/api/clients", clientId],
  });

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const { data: activityLogs } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs", clientId],
  });

  const { data: meetings } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings", clientId],
  });

  const { data: followUps } = useQuery<FollowUp[]>({
    queryKey: ["/api/follow-ups", clientId],
  });

  const { data: aiContext } = useQuery({
    queryKey: ["/api/ai-context"],
  });

  const addActivityLogMutation = useMutation({
    mutationFn: async (entry: string) => {
      const response = await apiRequest("POST", "/api/activity-logs", {
        clientId,
        entry,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs", clientId] });
      setNewLogEntry("");
      toast({
        description: "Activity log added successfully!",
        type: "success",
      });
    },
  });

  const addMeetingMutation = useMutation({
    mutationFn: async (meetingData: typeof meetingForm) => {
      const response = await apiRequest("POST", "/api/meetings", {
        clientId,
        ...meetingData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings", clientId] });
      setMeetingForm({ date: "", attendees: "", summary: "", actionItems: "" });
      toast({
        description: "Meeting recorded successfully!",
        type: "success",
      });
    },
  });

  const addFollowUpMutation = useMutation({
    mutationFn: async (followUpData: typeof followUpForm & { isAiGenerated?: boolean }) => {
      const response = await apiRequest("POST", "/api/follow-ups", {
        clientId,
        ...followUpData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-ups", clientId] });
      setFollowUpForm({ date: "", subject: "", body: "" });
      toast({
        description: "Follow-up recorded successfully!",
        type: "success",
      });
    },
  });

  const [generatingFollowUp, setGeneratingFollowUp] = useState(false);

  const handleGenerateAIFollowUp = async () => {
    if (!aiContext?.context) {
      toast({
        description: "AI context not configured",
        type: "error",
      });
      return;
    }

    setGeneratingFollowUp(true);
    try {
      const generatedContent = await generateFollowUp(
        followUpForm.body || "Generate a professional follow-up based on recent interactions",
        aiContext.context
      );

      addFollowUpMutation.mutate({
        date: followUpForm.date || new Date().toISOString().split('T')[0],
        subject: followUpForm.subject || "Follow-up Communication",
        body: generatedContent,
        isAiGenerated: true,
      });

      // Update statistics
      await apiRequest("PATCH", "/api/statistics", {
        communicationsSent: (await queryClient.fetchQuery({ queryKey: ["/api/statistics"] }) as any).communicationsSent + 1
      });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });

    } catch (error) {
      toast({
        description: "Failed to generate AI follow-up",
        type: "error",
      });
    } finally {
      setGeneratingFollowUp(false);
    }
  };

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Client Not Found</h2>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const assignedMembers = teamMembers?.filter(member => 
    client.assignedTeamMembers?.includes(member.id)
  ) || [];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients List
          </Button>
          <h2 className={commonHeaderClass}>Client Details</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Information */}
          <div className="lg:col-span-1">
            <div className={`${commonSectionClass} mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={commonSubHeaderClass}>Client Information</h3>
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-500">Name</Label>
                  <p className="text-slate-900">{client.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-500">Company</Label>
                  <p className="text-slate-900">{client.company}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-500">Email</Label>
                  <p className="text-slate-900">{client.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-500">Phone</Label>
                  <p className="text-slate-900">{client.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-500">Notes</Label>
                  <p className="text-slate-900">{client.notes || "No notes"}</p>
                </div>
              </div>
            </div>

            {/* Assigned Team Members */}
            <div className={commonSectionClass}>
              <h3 className={commonSubHeaderClass}>Assigned Team Members</h3>
              <div className="space-y-3">
                {assignedMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </div>
                ))}
                {assignedMembers.length === 0 && (
                  <p className="text-sm text-slate-500">No team members assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Activity and Communications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Logs */}
            <div className={commonSectionClass}>
              <h3 className={commonSubHeaderClass}>Activity Logs</h3>
              <div className="space-y-4 mb-4">
                {activityLogs?.map((log) => (
                  <div key={log.id} className="border-l-2 border-blue-200 pl-4">
                    <p className="text-sm text-slate-900 font-medium">{log.entry}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(log.timestamp!)}</p>
                  </div>
                ))}
                {(!activityLogs || activityLogs.length === 0) && (
                  <p className="text-sm text-slate-500">No activity logs yet</p>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newLogEntry.trim()) {
                    addActivityLogMutation.mutate(newLogEntry);
                  }
                }}
                className="border-t border-slate-200 pt-4"
              >
                <Textarea
                  value={newLogEntry}
                  onChange={(e) => setNewLogEntry(e.target.value)}
                  rows={2}
                  placeholder="Add new activity log entry"
                  className="mb-3"
                />
                <Button
                  type="submit"
                  disabled={addActivityLogMutation.isPending || !newLogEntry.trim()}
                >
                  {addActivityLogMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Add Log Entry
                </Button>
              </form>
            </div>

            {/* Meetings */}
            <div className={commonSectionClass}>
              <h3 className={commonSubHeaderClass}>Meetings</h3>
              <div className="space-y-4 mb-4">
                {meetings?.map((meeting) => (
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
                {(!meetings || meetings.length === 0) && (
                  <p className="text-sm text-slate-500">No meetings recorded yet</p>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (meetingForm.date && meetingForm.summary) {
                    addMeetingMutation.mutate(meetingForm);
                  }
                }}
                className="border-t border-slate-200 pt-4 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Attendees (comma-separated)"
                    value={meetingForm.attendees}
                    onChange={(e) => setMeetingForm(prev => ({ ...prev, attendees: e.target.value }))}
                  />
                </div>
                <Textarea
                  placeholder="Meeting summary"
                  rows={2}
                  value={meetingForm.summary}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, summary: e.target.value }))}
                  required
                />
                <Textarea
                  placeholder="Action items"
                  rows={2}
                  value={meetingForm.actionItems}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, actionItems: e.target.value }))}
                />
                <Button
                  type="submit"
                  disabled={addMeetingMutation.isPending || !meetingForm.date || !meetingForm.summary}
                >
                  {addMeetingMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Record Meeting
                </Button>
              </form>
            </div>

            {/* Follow-ups */}
            <div className={commonSectionClass}>
              <h3 className={commonSubHeaderClass}>Recorded Follow-ups</h3>
              <div className="space-y-4 mb-4">
                {followUps?.map((followUp) => (
                  <div key={followUp.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{followUp.subject || "Follow-up"}</h4>
                      <div className="flex items-center space-x-2">
                        {followUp.isAiGenerated && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            AI Generated
                          </span>
                        )}
                        <span className="text-sm text-slate-500">{followUp.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">{followUp.body}</p>
                  </div>
                ))}
                {(!followUps || followUps.length === 0) && (
                  <p className="text-sm text-slate-500">No follow-ups recorded yet</p>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (followUpForm.body) {
                    addFollowUpMutation.mutate(followUpForm);
                  }
                }}
                className="border-t border-slate-200 pt-4 space-y-3"
              >
                <Input
                  type="date"
                  value={followUpForm.date}
                  onChange={(e) => setFollowUpForm(prev => ({ ...prev, date: e.target.value }))}
                />
                <Input
                  type="text"
                  placeholder="Subject (optional)"
                  value={followUpForm.subject}
                  onChange={(e) => setFollowUpForm(prev => ({ ...prev, subject: e.target.value }))}
                />
                <Textarea
                  placeholder="Follow-up content"
                  rows={3}
                  value={followUpForm.body}
                  onChange={(e) => setFollowUpForm(prev => ({ ...prev, body: e.target.value }))}
                  required
                />
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={addFollowUpMutation.isPending || !followUpForm.body}
                  >
                    {addFollowUpMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    Save Follow-up
                  </Button>
                  <ActionButton
                    onClick={handleGenerateAIFollowUp}
                    variant="primary"
                    loading={generatingFollowUp}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    AI Generate & Save
                  </ActionButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
