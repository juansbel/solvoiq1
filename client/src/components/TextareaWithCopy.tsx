import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TextareaWithCopyProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  className?: string;
}

export function TextareaWithCopy({
  value,
  onChange,
  placeholder,
  rows = 4,
  readOnly = false,
  className
}: TextareaWithCopyProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await copyToClipboard(value);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className={className}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={handleCopy}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
}
