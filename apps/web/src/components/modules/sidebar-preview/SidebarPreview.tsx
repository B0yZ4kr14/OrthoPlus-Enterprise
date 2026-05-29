import { Card } from "@orthoplus/core-ui/card";
import type { SidebarPreviewProps } from "./types";
import { useSidebarModules } from "./useSidebarModules";
import { SidebarHeader } from "./SidebarHeader";
import { ModuleCategory } from "./ModuleCategory";
import { AdminSection } from "./AdminSection";
import { SidebarFooter } from "./SidebarFooter";

export function SidebarPreview({ modules }: SidebarPreviewProps) {
  const { activeModules, groupedModules } = useSidebarModules(modules);

  return (
    <Card className="p-4 bg-sidebar border-border shadow-2xl">
      <div className="space-y-1">
        <SidebarHeader />

        <div className="space-y-4">
          {Object.entries(groupedModules).map(
            ([category, categoryModules], index) => (
              <ModuleCategory
                key={category}
                category={category}
                modules={categoryModules}
                showSeparator={index > 0}
              />
            ),
          )}

          <AdminSection />
        </div>

        <SidebarFooter activeCount={activeModules.length} />
      </div>
    </Card>
  );
}
