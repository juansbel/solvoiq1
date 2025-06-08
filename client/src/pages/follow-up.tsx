import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BrainCircuit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commonSectionClass, commonHeaderClass } from "@/lib/utils";
import { ActionButton } from "@/components/action-button";
import { TextareaWithCopy } from "@/components/textarea-with-copy";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Message } from "@/components/ui/message";

export function FollowUp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState(`- Project is 70% complete
- Need to discuss timeline adjustment
- Waiting for client feedback on design mockups
- Schedule next milestone review meeting`);
  const [followupEmail, setFollowupEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGenerateFollowup = async () => {
    if (!notes.trim()) {
      toast({
        title: "Error",
        description: "Please enter some points to include in the follow-up",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setIsSuccess(false);
    try {
      const response = await apiRequest("POST", "/api/ai/generate-followup", {
        subject,
        notes,
      });
      const data = await response.json();
      
      setFollowupEmail(data.followupEmail);
      setIsSuccess(true);
      
      // Invalidate statistics to update the dashboard
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      
      toast({
        title: "Success",
        description: "Follow-up email generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate follow-up",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Generate Follow-up</h2>
          <p className="text-slate-600">Create contextually relevant follow-up emails</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className={commonSectionClass}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Follow-up Details</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject/Context (Optional)</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Project status update, Meeting follow-up"
                />
              </div>
              <div>
                <Label htmlFor="notes">Specific Points to Include</Label>
                <TextareaWithCopy
                  value={notes}
                  onChange={setNotes}
                  placeholder="Enter any specific points, updates, or questions you want to include in the follow-up..."
                  rows={6}
                />
              </div>
            </div>
            <ActionButton
              onClick={handleGenerateFollowup}
              loading={isGenerating}
              variant="success"
              icon={BrainCircuit}
              className="w-full mt-4"
            >
              Generate Follow-up Email
            </ActionButton>
          </div>

          {/* Output Section */}
          <div className={commonSectionClass}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Generated Follow-up</h3>
            <TextareaWithCopy
              value={followupEmail}
              placeholder="Generated follow-up email will appear here..."
              rows={14}
              readonly
              className="mb-4 bg-slate-50"
            />
            {isSuccess && followupEmail && (
              <Message type="success">
                Follow-up email generated successfully! Communication count updated.
              </Message>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
