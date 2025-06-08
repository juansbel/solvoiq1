import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

interface MobileHeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export function MobileHeader({ onMenuToggle, title = "ClientHub AI" }: MobileHeaderProps) {
  const { isMobile } = useMobile();

  if (!isMobile) return null;

  return (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="h-9 w-9 p-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
      </div>
    </div>
  );
}