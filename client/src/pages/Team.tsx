import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { commonHeaderClass, commonSubHeaderClass, commonSectionClass } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TeamMember, InsertTeamMember } from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function Team() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InsertTeamMember>({
    name: "",
    email: "",
    role: "",
  });

  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const createTeamMemberMutation = useMutation({
    mutationFn: async (memberData: InsertTeamMember) => {
      const response = await apiRequest("POST", "/api/team-members", memberData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        description: "Team member added successfully! (Sample Data Mode)",
        type: "success",
      });
      setFormData({
        name: "",
        email: "",
        role: "",
      });
    },
    onError: () => {
      toast({
        description: "Failed to add team member",
        type: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTeamMemberMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof InsertTeamMember, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Team</h2>
          <p className="text-slate-600">Manage your team members and their roles</p>
        </div>

        {/* Add Team Member Form */}
        <div className={`${commonSectionClass} mb-8`}>
          <h3 className={commonSubHeaderClass}>Add New Team Member</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@company.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </Label>
              <Select onValueChange={(value) => handleInputChange("role", value)} value={formData.role}>
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
              <Button
                type="submit"
                disabled={createTeamMemberMutation.isPending}
                className="bg-primary-600 text-white hover:bg-primary-700 font-medium"
              >
                {createTeamMemberMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add Team Member"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Team Members List */}
        <div className={commonSectionClass}>
          <h3 className={commonSubHeaderClass}>Team Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers?.map((member) => (
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
        </div>
      </div>
    </div>
  );
}
