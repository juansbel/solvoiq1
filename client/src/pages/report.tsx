import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commonSectionClass, commonHeaderClass } from "@/lib/utils";
import { ActionButton } from "@/components/action-button";
import { TextareaWithCopy } from "@/components/textarea-with-copy";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Message } from "@/components/ui/message";

export function Report() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("2024-03-01");
  const [endDate, setEndDate] = useState("2024-03-22");
  const [highlights, setHighlights] = useState(`- Completed initial project phase with 95% client satisfaction
- Successfully delivered design mockups ahead of schedule
- Conducted 3 client meetings with positive feedback
- Resolved 2 critical technical issues
- Onboarded new team member to support project acceleration
- Implemented client-requested feature enhancements
- Exceeded monthly communication targets by 20%`);
  const [generatedReport, setGeneratedReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGenerateReport = async () => {
    if (!highlights.trim()) {
      toast({
        title: "Error",
        description: "Please enter some highlights for the report",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setIsSuccess(false);
    try {
      const response = await apiRequest("POST", "/api/ai/generate-report", {
        startDate,
        endDate,
        highlights,
      });
      const data = await response.json();
      
      setGeneratedReport(data.report);
      setIsSuccess(true);
      
      // Invalidate statistics to update the dashboard
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      
      toast({
        title: "Success",
        description: "Report generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
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
          <h2 className={commonHeaderClass}>Generate Report</h2>
          <p className="text-slate-600">Create comprehensive client activity reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className={commonSectionClass}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Report Details</h3>
            <div className="space-y-4">
              <div>
                <Label>Report Period</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="highlights">Key Activities & Highlights</Label>
                <TextareaWithCopy
                  value={highlights}
                  onChange={setHighlights}
                  placeholder="Enter specific points or recent activities to highlight in the report..."
                  rows={8}
                />
              </div>
            </div>
            <ActionButton
              onClick={handleGenerateReport}
              loading={isGenerating}
              variant="primary"
              icon={FileText}
              className="w-full mt-4"
            >
              Generate Report
            </ActionButton>
          </div>

          {/* Generated Report */}
          <div className={commonSectionClass}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Generated Report</h3>
            <TextareaWithCopy
              value={generatedReport}
              placeholder="Generated report will appear here..."
              rows={16}
              readonly
              className="mb-4 bg-slate-50"
            />
            {isSuccess && generatedReport && (
              <Message type="success">
                Report generated successfully! Communication count updated.
              </Message>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
