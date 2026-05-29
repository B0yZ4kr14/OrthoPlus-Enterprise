// cspell:disable
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { ScrollArea } from "@orthoplus/core-ui/scroll-area";
import { DiffSection } from "./DiffSection";
import type { DiffSummary } from "./types";

interface DiffTabsProps {
  diffResult: DiffSummary;
  getTotalChanges: (diff: {
    added: unknown[];
    modified: unknown[];
    removed: unknown[];
  }) => number;
}

export function DiffTabs({ diffResult, getTotalChanges }: DiffTabsProps) {
  return (
    <Tabs defaultValue="patients" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="patients">
          Pacientes ({getTotalChanges(diffResult.patients)})
        </TabsTrigger>
        <TabsTrigger value="appointments">
          Agendamentos ({getTotalChanges(diffResult.appointments)})
        </TabsTrigger>
        <TabsTrigger value="clinical">
          Histórico ({getTotalChanges(diffResult.clinical_history)})
        </TabsTrigger>
        <TabsTrigger value="financial">
          Financeiro ({getTotalChanges(diffResult.financial)})
        </TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[500px] mt-4">
        <TabsContent value="patients">
          <DiffSection title="Pacientes" diff={diffResult.patients} />
        </TabsContent>
        <TabsContent value="appointments">
          <DiffSection title="Agendamentos" diff={diffResult.appointments} />
        </TabsContent>
        <TabsContent value="clinical">
          <DiffSection
            title="Histórico Clínico"
            diff={diffResult.clinical_history}
          />
        </TabsContent>
        <TabsContent value="financial">
          <DiffSection title="Financeiro" diff={diffResult.financial} />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}
