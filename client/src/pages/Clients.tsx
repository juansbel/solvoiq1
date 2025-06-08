import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { commonHeaderClass, commonSubHeaderClass, commonSectionClass } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Client, InsertClient } from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ClientPreviewPanel } from "@/components/clients/ClientPreviewPanel";

interface ClientsProps {
  onViewClient: (clientId: number) => void;
}

export function Clients({ onViewClient }: ClientsProps) {
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [formData, setFormData] = useState<InsertClient>({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
    assignedTeamMembers: [],
  });

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: InsertClient) => {
      const response = await apiRequest("POST", "/api/clients", clientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        description: "Client added successfully! (Sample Data Mode)",
        type: "success",
      });
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        notes: "",
        assignedTeamMembers: [],
      });
    },
    onError: () => {
      toast({
        description: "Failed to add client",
        type: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof InsertClient, value: string) => {
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
    <>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className={commonHeaderClass}>Clients</h2>
            <p className="text-slate-600">Manage your client relationships and communications</p>
          </div>

          {/* Add New Client Form */}
          <div className={`${commonSectionClass} mb-8`}>
            <h3 className={commonSubHeaderClass}>Add New Client</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Client name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                  Company
                </Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Company name"
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
                  placeholder="client@company.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  placeholder="Additional notes about the client"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={createClientMutation.isPending}
                  className="bg-primary-600 text-white hover:bg-primary-700 font-medium"
                >
                  {createClientMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Client"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Existing Clients */}
          <div className={commonSectionClass}>
            <h3 className={commonSubHeaderClass}>Existing Clients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients?.map((client) => (
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
                    onClick={() => setSelectedClientId(client.id)}
                    variant="outline"
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedClientId && (
        <ClientPreviewPanel 
          clientId={selectedClientId} 
          onClose={() => setSelectedClientId(null)} 
        />
      )}
    </>
  );
}
