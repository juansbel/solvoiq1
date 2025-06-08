import { StatCard } from "@/components/StatCard";
import { useQuery } from "@tanstack/react-query";
import { Send, PlusCircle, CheckCircle, TrendingUp } from "lucide-react";
import { commonHeaderClass, calculateCompletionRate } from "@/lib/utils";
import { Statistics } from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function Dashboard() {
  const { data: stats, isLoading } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const completionRate = stats 
    ? calculateCompletionRate(stats.tasksCompleted, stats.tasksCreated)
    : 0;

  return (
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
            value={stats?.communicationsSent || 0}
            icon={Send}
            iconColor="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Tasks Created"
            value={stats?.tasksCreated || 0}
            icon={PlusCircle}
            iconColor="bg-green-100 text-green-600"
          />
          <StatCard
            title="Tasks Completed"
            value={stats?.tasksCompleted || 0}
            icon={CheckCircle}
            iconColor="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={TrendingUp}
            iconColor="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Communications</h3>
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
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Pending Tasks</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-slate-300 rounded"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Schedule follow-up meeting with Acme Corp</p>
                  <p className="text-xs text-slate-500">Due tomorrow</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-slate-300 rounded"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Prepare proposal for new client</p>
                  <p className="text-xs text-slate-500">Due in 2 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-slate-300 rounded"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Review contract terms</p>
                  <p className="text-xs text-slate-500">Due in 3 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
