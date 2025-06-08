import { useState, useEffect, Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataIntegrationProvider } from "@/contexts/DataIntegrationContext";
import { RealTimeNotifications } from "@/components/shared/real-time-notification";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary as UIErrorBoundary } from "@/components/ui/error-boundary";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMobile } from "@/hooks/use-mobile";

import { AppSidebar } from "@/components/app-sidebar";
import { Dashboard } from "@/pages/enhanced-dashboard";
import SignIn from "@/pages/signin";
import LandingPage from "@/pages/landing";
import NotFound from "@/pages/not-found";

// Lazy load pages for better performance
const EnhancedClients = lazy(() => import("@/pages/enhanced-clients"));
const EnhancedClientProfile = lazy(() => import("@/pages/enhanced-client-profile"));
const EnhancedTeam = lazy(() => import("@/pages/enhanced-team"));
const TeamMemberProfile = lazy(() => import("@/pages/team-member-profile"));
const EnhancedTasks = lazy(() => import("@/pages/enhanced-tasks").then(m => ({ default: m.EnhancedTasks })));
const RewriteEmail = lazy(() => import("@/pages/rewrite-email").then(m => ({ default: m.RewriteEmail })));
const FollowUp = lazy(() => import("@/pages/follow-up").then(m => ({ default: m.FollowUp })));
const AnalyzeEmail = lazy(() => import("@/pages/analyze-email").then(m => ({ default: m.AnalyzeEmail })));
const Report = lazy(() => import("@/pages/report").then(m => ({ default: m.Report })));
const Templates = lazy(() => import("@/pages/templates").then(m => ({ default: m.Templates })));
const AiSettings = lazy(() => import("@/pages/ai-settings").then(m => ({ default: m.AiSettings })));
const CommissionTracking = lazy(() => import("@/pages/commission-tracking"));
const JiraHelper = lazy(() => import("@/pages/jira-helper"));
const AnalyticsDashboard = lazy(() => import("@/pages/analytics-dashboard"));
const AIAutomation = lazy(() => import("@/pages/ai-automation"));
const AdvancedAnalytics = lazy(() => import("@/pages/advanced-analytics"));
const ProjectManagement = lazy(() => import("@/pages/project-management"));
const WorkflowAutomation = lazy(() => import("@/pages/workflow-automation"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-300" role="status" aria-live="polite">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return <>{children}</>;
}

function AppContent() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useMobile();

  // Sync activeTab with current location
  useEffect(() => {
    const path = location.split('/')[1] || 'dashboard';
    setActiveTab(path);
  }, [location]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setLocation(`/${tab}`);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/signin" component={SignIn} />
        <Route>
          {() => (
            <ProtectedRoute>
              <UIErrorBoundary>
                <AppSidebar 
                  activeTab={activeTab} 
                  onTabChange={handleTabChange}
                  isOpen={sidebarOpen}
                  onToggle={toggleSidebar}
                />
                
                <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'w-full' : 'lg:ml-0'}`}>
                  <MobileHeader onMenuToggle={toggleSidebar} />
                  
                  <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading page...</p>
                      </div>
                    </div>
                  }>
                    <Switch>
                      <Route path="/dashboard" component={() => <Dashboard onTabChange={handleTabChange} />} />
                      <Route path="/clients" component={EnhancedClients} />
                      <Route path="/clients/:id" component={EnhancedClientProfile} />
                      <Route path="/team" component={EnhancedTeam} />
                      <Route path="/team/:id" component={TeamMemberProfile} />
                      <Route path="/tasks" component={EnhancedTasks} />
                      <Route path="/rewrite" component={RewriteEmail} />
                      <Route path="/followup" component={FollowUp} />
                      <Route path="/analyze" component={AnalyzeEmail} />
                      <Route path="/report" component={Report} />
                      <Route path="/templates" component={Templates} />
                      <Route path="/settings" component={AiSettings} />
                      <Route path="/commission" component={CommissionTracking} />
                      <Route path="/jira" component={JiraHelper} />
                      <Route path="/analytics" component={AnalyticsDashboard} />
                      <Route path="/automation" component={AIAutomation} />
                      <Route path="/advanced-analytics" component={AdvancedAnalytics} />
                      <Route path="/real-time-analytics" component={lazy(() => import("./pages/real-time-analytics"))} />
                      <Route path="/knowledge" component={lazy(() => import("./pages/knowledge"))} />
                      <Route path="/projects" component={ProjectManagement} />
                      <Route path="/workflows" component={WorkflowAutomation} />
                      <Route component={NotFound} />
                    </Switch>
                  </Suspense>
                  </main>
                </div>
              </UIErrorBoundary>
            </ProtectedRoute>
          )}
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  // Set document title and meta tags
  useEffect(() => {
    document.title = "ClientHub AI - Business Intelligence Platform";
    
    // Add meta description if it doesn't exist
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', 'Comprehensive AI-powered client communication and business intelligence platform for optimizing team collaboration and strategic decision-making.');
      document.head.appendChild(metaDescription);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataIntegrationProvider>
          <TooltipProvider>
            <UIErrorBoundary>
              <Router>
                <AppContent />
              </Router>
              <RealTimeNotifications />
              <Toaster />
            </UIErrorBoundary>
          </TooltipProvider>
        </DataIntegrationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;