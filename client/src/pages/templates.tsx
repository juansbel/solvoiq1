import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Copy } from "lucide-react";
import { type EmailTemplate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/ai";
import { commonSectionClass, commonHeaderClass } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function Templates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

  const { data: templates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/email-templates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const handleCopyTemplate = async (body: string) => {
    const success = await copyToClipboard(body);
    if (success) {
      toast({
        title: "Copied!",
        description: "Template body copied to clipboard",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Failed to copy template to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = (id: number) => {
    setTemplateToDelete(id);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplateMutation.mutate(templateToDelete);
      setTemplateToDelete(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className={commonHeaderClass}>Email Templates Gallery</h2>
          <p className="text-slate-600">Store and reuse your frequently used email templates</p>
        </div>

        {templates.length === 0 ? (
          <div className={commonSectionClass}>
            <div className="text-center py-12">
              <p className="text-slate-500">No email templates found.</p>
              <p className="text-sm text-slate-400 mt-2">
                Generate templates from the "Analyze Email" tab to see them here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className={commonSectionClass}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 line-clamp-2">{template.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-slate-400 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {template.body}
                </p>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyTemplate(template.body)}
                    className="flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Body</span>
                  </Button>
                  {template.isAiGenerated && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      AI Generated
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          open={templateToDelete !== null}
          onOpenChange={(open) => !open && setTemplateToDelete(null)}
          title="Delete Template"
          description="Are you sure you want to delete this template? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}
