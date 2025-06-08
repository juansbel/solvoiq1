import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { type AiContext } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/ai";
import { commonSectionClass, commonHeaderClass } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AiSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isAutoSaved, setIsAutoSaved] = useState(false);

  const { data: aiContext } = useQuery<AiContext>({
    queryKey: ["/api/ai-context"],
  });

  const updateContextMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("PUT", "/api/ai-context", { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-context"] });
      setIsAutoSaved(true);
      setTimeout(() => setIsAutoSaved(false), 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save AI context",
        variant: "destructive",
      });
    },
  });

  // Initialize content when data loads
  useEffect(() => {
    if (aiContext?.content) {
      setContent(aiContext.content);
    }
  }, [aiContext]);

  // Debounced auto-save
  const debouncedSave = debounce((content: string) => {
    if (content.trim() && content !== aiContext?.content) {
      updateContextMutation.mutate(content);
    }
  }, 2000);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedSave(newContent);
  };

  const handleManualSave = () => {
    if (content.trim()) {
      updateContextMutation.mutate(content);
      toast({
        title: "Success",
        description: "AI context saved successfully!",
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>AI Settings</h2>
          <p className="text-slate-600">Configure the global context for AI-powered features</p>
        </div>

        <div className={commonSectionClass}>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Global AI Context</h3>
          <p className="text-sm text-slate-600 mb-4">
            This context will be used by all AI features to personalize communications and tasks according to your business needs.
          </p>
          
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Enter your global AI context here..."
            rows={20}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm mb-4"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isAutoSaved ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              <span className="text-sm text-slate-600">
                {isAutoSaved ? 'Auto-saved' : 'Changes will be auto-saved'}
              </span>
            </div>
            <Button
              onClick={handleManualSave}
              disabled={updateContextMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateContextMutation.isPending ? 'Saving...' : 'Save Context'}
            </Button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Usage Information */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Context Usage</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Email rewriting and follow-up generation</li>
                    <li>• Task creation from communications</li>
                    <li>• Client report generation</li>
                    <li>• Email template creation</li>
                    <li>• Communication analysis and insights</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-3">💡 Best Practices for Effective AI Context</h4>
              <div className="space-y-3 text-sm text-green-800">
                <div>
                  <h5 className="font-medium mb-1">1. Company Information</h5>
                  <p>Include your company name, industry, size, and core services. Example: "TechSolutions Inc is a 50-person software consulting firm specializing in enterprise web applications."</p>
                </div>
                <div>
                  <h5 className="font-medium mb-1">2. Communication Style</h5>
                  <p>Define your preferred tone and formality. Example: "We use professional but friendly communication, avoiding technical jargon with clients."</p>
                </div>
                <div>
                  <h5 className="font-medium mb-1">3. Key Processes</h5>
                  <p>Describe your typical workflows and methodologies. Example: "We follow agile development with bi-weekly client check-ins and milestone reviews."</p>
                </div>
                <div>
                  <h5 className="font-medium mb-1">4. Client Types</h5>
                  <p>Specify your target audience and their characteristics. Example: "Our clients are primarily mid-market B2B companies needing digital transformation."</p>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="text-sm font-medium text-amber-900 mb-3">🚀 Pro Tips for Maximum AI Effectiveness</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-800">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Regular Updates:</span> Update context monthly with new processes, services, or team changes.
                  </div>
                  <div>
                    <span className="font-medium">Specific Examples:</span> Include actual client names, project types, and common scenarios.
                  </div>
                  <div>
                    <span className="font-medium">Pain Points:</span> Mention common challenges and how you typically address them.
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Key Metrics:</span> Include important KPIs, goals, and success criteria.
                  </div>
                  <div>
                    <span className="font-medium">Team Structure:</span> Describe roles, responsibilities, and reporting relationships.
                  </div>
                  <div>
                    <span className="font-medium">Industry Terms:</span> Define specialized vocabulary and acronyms you use.
                  </div>
                </div>
              </div>
            </div>

            {/* Context Template */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="text-sm font-medium text-slate-900 mb-3">📝 Context Template (Copy & Customize)</h4>
              <div className="bg-white p-3 rounded border text-xs font-mono text-slate-700 overflow-x-auto">
                <pre>{`## Company Overview
Company: [Your Company Name]
Industry: [Your Industry]
Size: [Number of employees]
Primary Services: [List key services/products]

## Communication Style
Tone: [Professional/Casual/Formal]
Audience: [Client types and preferences]
Avoid: [Words or phrases to avoid]

## Business Context
Key Processes: [Your main workflows]
Common Projects: [Typical project types]
Success Metrics: [KPIs and goals]
Challenges: [Common pain points]

## Team Structure
Roles: [Key team positions]
Specializations: [Areas of expertise]
Decision Makers: [Who approves what]

## Client Information
Target Market: [Ideal client profile]
Common Needs: [Frequent client requests]
Success Stories: [Notable achievements]`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
