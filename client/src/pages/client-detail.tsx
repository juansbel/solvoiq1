import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Edit2, User, BrainCircuit } from "lucide-react";
import { insertClientActivitySchema, type Client, type ClientActivity, type TeamMember } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commonSectionClass, commonHeaderClass, commonSubHeaderClass } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ActionButton } from "@/components/action-button";

interface ClientDetailProps {
  clientId: number;
  onBack: () => void;
}

type ActivityFormData = {
  content: string;
  metadata?: any;
};

export function ClientDetail({ clientId, onBack }: ClientDetailProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isGeneratingFollowup, setIsGeneratingFollowup] = useState(false);

  const { data: client } = useQuery<Client>({
    queryKey: [`/api/clients/${clientId}`],
  });

  const { data: activities = [] } = useQuery<ClientActivity[]>({
    queryKey: [`/api/clients/${clientId}/activities`],
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const logForm = useForm<ActivityFormData>({
    defaultValues: { content: "" },
  });

  const meetingForm = useForm({
    defaultValues: {
      date: "",
      attendees: "",
      summary: "",
      actionItems: "",
    },
  });

  const followupForm = useForm({
    defaultValues: {
      date: "",
      subject: "",
      body: "",
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: { type: string; content: string; metadata?: any }) => {
      const response = await apiRequest("POST", `/api/clients/${clientId}/activities`, {
        type: data.type,
        content: data.content,
        metadata: data.metadata,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/activities`] });
      logForm.reset();
      meetingForm.reset();
      followupForm.reset();
      toast({
        title: "Success",
        description: "Activity added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive",
      });
    },
  });

  const onLogSubmit = (data: ActivityFormData) => {
    createActivityMutation.mutate({
      type: "log",
      content: data.content,
      metadata: { date: new Date().toLocaleString() },
    });
  };

  const onMeetingSubmit = (data: any) => {
    createActivityMutation.mutate({
      type: "meeting",
      content: data.summary,
      metadata: {
        date: data.date,
        attendees: data.attendees,
        actionItems: data.actionItems,
      },
    });
  };

  const onFollowupSubmit = (data: any) => {
    createActivityMutation.mutate({
      type: "followup",
      content: data.body,
      metadata: {
        date: data.date,
        subject: data.subject,
        isAiGenerated: false,
      },
    });
  };

  const handleAiGenerateFollowup = async () => {
    setIsGeneratingFollowup(true);
    try {
      const response = await apiRequest("POST", "/api/ai/generate-followup", {
        subject: "Client follow-up",
        notes: `Generate a follow-up for client ${client?.name} from ${client?.company}`,
      });
      const data = await response.json();
      
      // Save the AI-generated follow-up
      await createActivityMutation.mutateAsync({
        type: "followup",
        content: data.followupEmail,
        metadata: {
          date: new Date().toISOString().split('T')[0],
          subject: "AI-Generated Follow-up",
          isAiGenerated: true,
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI follow-up",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFollowup(false);
    }
  };

  const getAssignedTeamMembers = () => {
    if (!client?.assignedTeamMembers) return [];
    return teamMembers.filter(member => 
      client.assignedTeamMembers.includes(member.id.toString())
    );
  };

  if (!client) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Clients List</span>
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
                  <label className="text-sm font-medium text-slate-500">Name</label>
                  <p className="text-slate-900">{client.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Company</label>
                  <p className="text-slate-900">{client.company}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Email</label>
                  <p className="text-slate-900">{client.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Phone</label>
                  <p className="text-slate-900">{client.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Notes</label>
                  <p className="text-slate-900">{client.notes}</p>
                </div>
              </div>
            </div>

            {/* Assigned Team Members */}
            <div className={commonSectionClass}>
              <h3 className={commonSubHeaderClass}>Assigned Team Members</h3>
              <div className="space-y-3">
                {getAssignedTeamMembers().map((member) => (
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
              </div>
            </div>
          </div>

          {/* Activity and Communications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Logs */}
            <div className={commonSectionClass}>
              <h3 className={commonSubHeaderClass}>Activity Logs</h3>
              <div className="space-y-4 mb-4">
                {activities
                  .filter(activity => activity.type === "log")
                  .map((activity) => (
                    <div key={activity.id} className="border-l-2 border-blue-200 pl-4">
                      <p className="text-sm text-slate-900 font-medium">{activity.content}</p>
                      <p className="text-xs text-slate-500">
                        {activity.metadata?.date || new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
              <Form {...logForm}>
                <form onSubmit={logForm.handleSubmit(onLogSubmit)} className="border-t border-slate-200 pt-4">
                  <FormField
                    control={logForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Add new activity log entry"
                            rows={2}
                            className="mb-3"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createActivityMutation.isPending}>
                    Add Log Entry
                  </Button>
                </form>
              </Form>
            </div>

            {/* Meetings */}
            <div className={commonSectionClass}>
              <h3 className={commonSubHeaderClass}>Meetings</h3>
              <div className="space-y-4 mb-4">
                {activities
                  .filter(activity => activity.type === "meeting")
                  .map((activity) => (
                    <div key={activity.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">Meeting</h4>
                        <span className="text-sm text-slate-500">{activity.metadata?.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Attendees: {activity.metadata?.attendees}
                      </p>
                      <p className="text-sm text-slate-700 mb-2">{activity.content}</p>
                      <p className="text-sm text-slate-600">
                        Action Items: {activity.metadata?.actionItems}
                      </p>
                    </div>
                  ))}
              </div>
              <Form {...meetingForm}>
                <form onSubmit={meetingForm.handleSubmit(onMeetingSubmit)} className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={meetingForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={meetingForm.control}
                      name="attendees"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Attendees (comma-separated)" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={meetingForm.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Meeting summary" rows={2} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={meetingForm.control}
                    name="actionItems"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Action items" rows={2} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createActivityMutation.isPending}>
                    Record Meeting
                  </Button>
                </form>
              </Form>
            </div>

            {/* Follow-ups */}
            <div className={commonSectionClass}>
              <h3 className={commonSubHeaderClass}>Recorded Follow-ups</h3>
              <div className="space-y-4 mb-4">
                {activities
                  .filter(activity => activity.type === "followup")
                  .map((activity) => (
                    <div key={activity.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">
                          {activity.metadata?.subject || "Follow-up"}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {activity.metadata?.isAiGenerated && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              AI Generated
                            </span>
                          )}
                          <span className="text-sm text-slate-500">{activity.metadata?.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700">{activity.content}</p>
                    </div>
                  ))}
              </div>
              <Form {...followupForm}>
                <form onSubmit={followupForm.handleSubmit(onFollowupSubmit)} className="border-t border-slate-200 pt-4 space-y-3">
                  <FormField
                    control={followupForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="date" className="w-full" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={followupForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Subject (optional)" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={followupForm.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Follow-up content" rows={3} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-3">
                    <Button type="submit" disabled={createActivityMutation.isPending}>
                      Save Follow-up
                    </Button>
                    <ActionButton
                      onClick={handleAiGenerateFollowup}
                      loading={isGeneratingFollowup}
                      variant="success"
                      icon={BrainCircuit}
                    >
                      AI Generate & Save
                    </ActionButton>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
