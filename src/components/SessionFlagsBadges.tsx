import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SessionFlagsBadgesProps {
  impulso25Plus?: boolean;
  superOdd?: boolean;
  className?: string;
}

export function SessionFlagsBadges({
  impulso25Plus,
  superOdd,
  className,
}: SessionFlagsBadgesProps) {
  if (!impulso25Plus && !superOdd) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {impulso25Plus && (
        <Badge variant="warning">Impulso 25%+</Badge>
      )}
      {superOdd && <Badge variant="strong">Odd Aumentada</Badge>}
    </div>
  );
}
