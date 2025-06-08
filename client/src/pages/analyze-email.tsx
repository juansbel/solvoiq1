import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commonSectionClass, commonHeaderClass } from "@/lib/utils";
import { ActionButton } from "@/components/action-button";
import { TextareaWithCopy } from "@/components/textarea-with-copy";
import { Button } from "@/components/ui/button";

export function AnalyzeEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [emailContent, setEmailContent] = useState(`Subject: Urgent: Project Concerns and Timeline Questions

Hi Alex,

I hope you're well. I wanted to reach out because we've been discussing the project internally and have some concerns that need addressing.

First, we're not entirely satisfied with the current design direction. The mockups don't quite capture the modern, clean aesthetic we were hoping for. Our marketing team feels they look a bit outdated compared to our competitors.

Second, we're under pressure from our board to launch by Q2, which is earlier than our original timeline. Is there any way we can accelerate the development process?

Also, we'd like to add a mobile app component to the project. We know this wasn't in the original scope, but it's become a priority for us. What would this involve?

Finally, we need to discuss budget. The additional features we're requesting will likely impact costs, and we need to understand the implications.

Can we schedule a meeting this week to discuss all of these points? We're hoping to resolve these issues quickly so we can move forward.

Thanks,
John Smith
CEO, Acme Corporation`);
  const [analysis, setAnalysis] = useState("");
  const [generatedTemplates, setGeneratedTemplates] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [isGeneratingTemplates, setIsGeneratingTemplates] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const saveTemplateMutation = useMutation({
    mutationFn: async (template: { title: string; body: string }) => {
      const response = await apiRequest("POST", "/api/email-templates", {
        title: template.title,
        body: template.body,
        isAiGenerated: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({
        title: "Success",
        description: "Template saved to gallery!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    },
  });

  const handleAnalyzeEmail = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/ai/analyze-email", {
        emailContent,
      });
      const data = await response.json();
      
      setAnalysis(data.analysis);
      
      toast({
        title: "Success",
        description: "Email analyzed successfully! See suggestions below.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze email",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTasksFromSuggestions = async () => {
    if (!analysis) {
      toast({
        title: "Error",
        description: "Please analyze an email first",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingTasks(true);
    try {
      const response = await apiRequest("POST", "/api/ai/generate-tasks", {
        suggestions: analysis,
      });
      const data = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      
      toast({
        title: "Success",
        description: `Created ${data.tasks?.length || 0} tasks from suggestions!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tasks",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTasks(false);
    }
  };

  const handleGenerateEmailTemplates = async () => {
    if (!analysis) {
      toast({
        title: "Error",
        description: "Please analyze an email first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTemplates(true);
    try {
      const response = await apiRequest("POST", "/api/ai/generate-templates", {
        suggestions: analysis,
      });
      const data = await response.json();
      
      setGeneratedTemplates(data.templates || []);
      setShowTemplates(true);
      
      toast({
        title: "Success",
        description: `Generated ${data.templates?.length || 0} email templates!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate templates",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTemplates(false);
    }
  };

  const handleSaveTemplate = (template: { title: string; body: string }) => {
    saveTemplateMutation.mutate(template);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Analyze Email</h2>
          <p className="text-slate-600">Extract insights and get actionable suggestions from client emails</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className={commonSectionClass}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Client Email to Analyze</h3>
            <TextareaWithCopy
              value={emailContent}
              onChange={setEmailContent}
              placeholder="Paste the client's email here..."
              rows={12}
              className="mb-4"
            />
            <ActionButton
              onClick={handleAnalyzeEmail}
              loading={isAnalyzing}
              variant="warning"
              icon={Search}
              className="w-full"
            >
              Analyze Email & Suggest Next Steps
            </ActionButton>
          </div>

          {/* Analysis Results */}
          <div className={commonSectionClass}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Analysis & Suggestions</h3>
            <div className="min-h-[300px] mb-4">
              {analysis ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                    {analysis}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Analysis results will appear here after analyzing an email
                </div>
              )}
            </div>

            {analysis && (
              <div className="space-y-3">
                <ActionButton
                  onClick={handleCreateTasksFromSuggestions}
                  loading={isCreatingTasks}
                  variant="primary"
                  icon={Plus}
                  className="w-full"
                >
                  Create Tasks from Suggestions
                </ActionButton>
                <ActionButton
                  onClick={handleGenerateEmailTemplates}
                  loading={isGeneratingTemplates}
                  variant="success"
                  icon={FileText}
                  className="w-full"
                >
                  Generate Email Templates from Suggestions
                </ActionButton>
              </div>
            )}
          </div>
        </div>

        {/* Generated Templates */}
        {showTemplates && generatedTemplates.length > 0 && (
          <div className={`${commonSectionClass} mt-6`}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Generated Email Templates</h3>
            <div className="space-y-4">
              {generatedTemplates.map((template, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{template.title}</h4>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(template.body);
                          toast({
                            title: "Copied!",
                            description: "Template body copied to clipboard",
                          });
                        }}
                      >
                        Copy Body
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveTemplate(template)}
                        disabled={saveTemplateMutation.isPending}
                      >
                        Save to Gallery
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{template.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
