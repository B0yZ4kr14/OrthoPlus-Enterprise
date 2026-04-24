import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";

interface BackupTabsProps {
  settingsTab: React.ReactNode;
  historyTab: React.ReactNode;
  logsTab: React.ReactNode;
}

export function BackupTabs({ settingsTab, historyTab, logsTab }: BackupTabsProps) {
  return (
    <Tabs defaultValue="settings" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="settings">Configurações</TabsTrigger>
        <TabsTrigger value="history">Histórico</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="settings">{settingsTab}</TabsContent>
      <TabsContent value="history">{historyTab}</TabsContent>
      <TabsContent value="logs">{logsTab}</TabsContent>
    </Tabs>
  );
}
