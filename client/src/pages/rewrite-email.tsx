import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BrainCircuit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commonSectionClass, commonHeaderClass } from "@/lib/utils";
import { ActionButton } from "@/components/action-button";
import { TextareaWithCopy } from "@/components/textarea-with-copy";
import { Message } from "@/components/ui/message";

export function RewriteEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [draftEmail, setDraftEmail] = useState(`Hi John,

Hope you're doing well. Just wanted to touch base about the project we discussed last week. We're making good progress but I think we might need to adjust the timeline a bit. Can we set up a call to go over the details?

Let me know what works for you.

Thanks,
Alex`);
  const [rewrittenEmail, setRewrittenEmail] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRewriteEmail = async () => {
    if (!draftEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a draft email to rewrite",
        variant: "destructive",
      });
      return;
    }

    setIsRewriting(true);
    setIsSuccess(false);
    try {
      const response = await apiRequest("POST", "/api/ai/rewrite-email", {
        draftEmail,
      });
      const data = await response.json();
      
      setRewrittenEmail(data.rewrittenEmail);
      setIsSuccess(true);
      
      // Invalidate statistics to update the dashboard
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      
      toast({
        title: "Success",
        description: "Email rewritten successfully with AI!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rewrite email",
        variant: "destructive",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Rewrite Email</h2>
          <p className="text-slate-600">Transform your draft emails into professional communications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className={commonSectionClass}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Draft Email</h3>
            <TextareaWithCopy
              value={draftEmail}
              onChange={setDraftEmail}
              placeholder="Paste your draft email here..."
              rows={12}
              className="mb-4"
            />
            <ActionButton
              onClick={handleRewriteEmail}
              loading={isRewriting}
              variant="primary"
              icon={BrainCircuit}
              className="w-full"
            >
              Rewrite Email with AI
            </ActionButton>
          </div>

          {/* Output Section */}
          <div className={commonSectionClass}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Version</h3>
            <TextareaWithCopy
              value={rewrittenEmail}
              placeholder="Rewritten email will appear here..."
              rows={12}
              readonly
              className="mb-4 bg-slate-50"
            />
            {isSuccess && rewrittenEmail && (
              <Message type="success">
                Email successfully rewritten! Communication count updated.
              </Message>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
