// cspell:disable
import { HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@orthoplus/core-ui/tooltip";
import { MODULE_DATA } from "./constants";
import { TooltipContentView } from "./TooltipContent";
import type { ModuleTooltipProps } from "./types";

export function ModuleTooltip({ moduleKey, children, variant = "icon" }: ModuleTooltipProps) {
  const data = MODULE_DATA[moduleKey];

  if (!data) {
    return children || <Info className="h-4 w-4" />;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {variant === "icon" ? (
            <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground hover:text-foreground transition-colors" />
          ) : (
            children
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-md p-4" sideOffset={8}>
          <TooltipContentView data={data} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
