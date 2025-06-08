import { Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";

interface TextareaWithCopyProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  readonly?: boolean;
  className?: string;
}

export function TextareaWithCopy({
  value,
  onChange,
  placeholder,
  rows = 6,
  readonly = false,
  className
}: TextareaWithCopyProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
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
        readOnly={readonly}
        className={className}
      />
      {value && (
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 p-2"
        >
          <Copy className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
