import { useState } from "react";
import {
  Database,
  ChevronDown,
  ChevronUp,
  Settings2,
  Server,
  Wrench,
  ArrowLeftRight,
  FileCode,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { MotorTab } from "./tabs/MotorTab";
import { ConfigTab } from "./tabs/ConfigTab";
import { RepairTab } from "./tabs/RepairTab";
import { MigrationTab } from "./tabs/MigrationTab";
import { TemplatesTab } from "./tabs/TemplatesTab";
import { DocsTab } from "./tabs/DocsTab";

interface DatabaseAdvancedPanelProps {
  category: string;
  categorySchemas: string[];
}

type TabType =
  | "motor"
  | "config"
  | "reparo"
  | "migracao"
  | "templates"
  | "docs";

export function DatabaseAdvancedPanel({
  category,
  categorySchemas,
}: DatabaseAdvancedPanelProps) {
  const [selectedEngine, setSelectedEngine] = useState<string>("PostgreSQL");
  const [activeTab, setActiveTab] = useState<TabType>("motor");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "motor", label: "Motor", icon: Settings2 },
    { id: "config", label: "Config", icon: Server },
    { id: "reparo", label: "Reparo", icon: Wrench },
    { id: "migracao", label: "Migração", icon: ArrowLeftRight },
    { id: "templates", label: "Templates", icon: FileCode },
    { id: "docs", label: "Docs", icon: BookOpen },
  ];

  return (
    <Card className="border border-border bg-card overflow-hidden">
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-interactive/10 rounded-xl border border-interactive/20">
            <Database className="w-6 h-6 text-interactive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Banco de Dados Avançado — {category}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure o motor e conexão do banco de dados
            </p>
          </div>
        </div>
        <div className="text-muted-foreground">
          {isCollapsed ? (
            <ChevronDown className="w-6 h-6" />
          ) : (
            <ChevronUp className="w-6 h-6" />
          )}
        </div>
      </div>

      {!isCollapsed && (
        <CardContent className="p-0 border-t border-border">
          <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap
                    ${
                      isActive
                        ? "bg-interactive text-white border-b-2 border-interactive"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 bg-background">
            {activeTab === "motor" && (
              <MotorTab
                selectedEngine={selectedEngine}
                onSelectEngine={setSelectedEngine}
              />
            )}
            {activeTab === "config" && (
              <ConfigTab selectedEngine={selectedEngine} />
            )}
            {activeTab === "reparo" && (
              <RepairTab selectedEngine={selectedEngine} category={category} />
            )}
            {activeTab === "migracao" && (
              <MigrationTab selectedEngine={selectedEngine} />
            )}
            {activeTab === "templates" && (
              <TemplatesTab
                category={category}
                categorySchemas={categorySchemas}
              />
            )}
            {activeTab === "docs" && (
              <DocsTab selectedEngine={selectedEngine} />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
