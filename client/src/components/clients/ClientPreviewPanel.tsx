import { useQuery } from "@tanstack/react-query";
import { X, Mail, Phone, Briefcase, BarChart2, CheckCircle } from "lucide-react";
import { Client, ClientActivity, Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { commonHeaderClass, commonSubHeaderClass, commonSectionClass } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClientPreviewPanelProps {
  clientId: number;
  onClose: () => void;
}

const fetchClient = async (clientId: number): Promise<Client> => {
  const response = await apiRequest("GET", `/api/clients/${clientId}`);
  return response.json();
};

const fetchClientActivities = async (clientId: number): Promise<ClientActivity[]> => {
  const response = await apiRequest("GET", `/api/clients/${clientId}/activities`);
  return response.json();
}

const fetchClientTasks = async (clientId: number): Promise<Task[]> => {
  const response = await apiRequest("GET", `/api/tasks/by-client/${clientId}`);
  return response.json();
}

export function ClientPreviewPanel({ clientId, onClose }: ClientPreviewPanelProps) {
  const { data: client, isLoading, isError } = useQuery<Client>({
    queryKey: ["/api/clients", clientId],
    queryFn: () => fetchClient(clientId),
  });

  const { data: activities } = useQuery<ClientActivity[]>({
    queryKey: ["/api/clients", clientId, "activities"],
    queryFn: () => fetchClientActivities(clientId),
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks/by-client", clientId],
    queryFn: () => fetchClientTasks(clientId),
  });

  if (isLoading) {
    return (
      <div className="fixed inset-y-0 right-0 w-1/3 bg-white shadow-lg z-50 p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="fixed inset-y-0 right-0 w-1/3 bg-white shadow-lg z-50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className={commonHeaderClass}>Error</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <p>Could not load client details.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-white shadow-lg z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className={commonHeaderClass}>{client.name}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-4">
            <div className={commonSectionClass}>
              <h4 className={commonSubHeaderClass}>Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-slate-500" />
                  <span>{client.company}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-slate-500" />
                  <a href={`mailto:${client.email}`} className="text-primary-600 hover:underline">{client.email}</a>
                </div>
                {client.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={commonSectionClass}>
              <h4 className={commonSubHeaderClass}>Recent Activity</h4>
              {activities && activities.length > 0 ? (
                <ul className="space-y-3">
                  {activities.slice(0, 5).map(activity => (
                    <li key={activity.id} className="text-sm">
                      <p className="font-medium">{activity.type}</p>
                      <p className="text-slate-500">{new Date(activity.timestamp).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No recent activity.</p>
              )}
            </div>
            
            <div className={commonSectionClass}>
              <h4 className={commonSubHeaderClass}>Engagement Stats</h4>
              <div className="bg-slate-100 h-40 rounded-lg flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <BarChart2 className="w-8 h-8 mx-auto mb-2" />
                  <p>Chart placeholder</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tasks" className="pt-4">
            <div className={commonSectionClass}>
              <h4 className={commonSubHeaderClass}>Associated Tasks</h4>
              {isLoadingTasks ? (
                <LoadingSpinner />
              ) : tasks && tasks.length > 0 ? (
                <ul className="space-y-3">
                  {tasks.map(task => (
                    <li key={task.id} className="text-sm p-2 border rounded-md hover:bg-slate-50 cursor-pointer">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-slate-500 capitalize">{task.status}</p>
                        {task.dueDate && <p className="text-xs text-slate-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No tasks associated with this client.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 