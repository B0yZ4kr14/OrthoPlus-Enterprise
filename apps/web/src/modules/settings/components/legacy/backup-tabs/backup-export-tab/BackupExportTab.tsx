import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { useBackupExport } from "./useBackupExport";
import { FormatSelect } from "./FormatSelect";
import { ExportButton } from "./ExportButton";
import { IncludedDataAlert, LGPDAlert } from "./ExportAlerts";

export function BackupExportTab() {
  const { isExporting, selectedFormat, setSelectedFormat, handleExport } =
    useBackupExport();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exportação de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormatSelect value={selectedFormat} onChange={setSelectedFormat} />
          <ExportButton isExporting={isExporting} onClick={handleExport} />
        </CardContent>
      </Card>

      <IncludedDataAlert />
      <LGPDAlert />
    </div>
  );
}
