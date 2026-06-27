import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Label } from "@orthoplus/core-ui/label";
import { Switch } from "@orthoplus/core-ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Button } from "@orthoplus/core-ui/button";

export function BackupSettingsTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agendamento Automático</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="settings-backup-auto">Backup Automático</Label>
              <p className="text-sm text-muted-foreground">
                Criar backups automaticamente
              </p>
            </div>
            <Switch id="settings-backup-auto" defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Frequência</Label>
            <Select defaultValue="daily">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">A cada hora</SelectItem>
                <SelectItem value="daily">Diariamente</SelectItem>
                <SelectItem value="weekly">Semanalmente</SelectItem>
                <SelectItem value="monthly">Mensalmente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Horário</Label>
            <Select defaultValue="18:00">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00:00">00:00</SelectItem>
                <SelectItem value="06:00">06:00</SelectItem>
                <SelectItem value="12:00">12:00</SelectItem>
                <SelectItem value="18:00">18:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Retenção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Manter backups por</Label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="15">15 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="settings-retention-cleanup">Limpeza Automática</Label>
              <p className="text-sm text-muted-foreground">
                Deletar backups antigos automaticamente
              </p>
            </div>
            <Switch id="settings-retention-cleanup" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Armazenamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Localização</Label>
            <Select defaultValue="local">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Armazenamento Local</SelectItem>
                <SelectItem value="s3">Amazon S3</SelectItem>
                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                <SelectItem value="azure">Azure Blob Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="settings-storage-compression">Compressão</Label>
              <p className="text-sm text-muted-foreground">
                Reduz o tamanho dos backups
              </p>
            </div>
            <Switch id="settings-storage-compression" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="settings-storage-encryption">Criptografia</Label>
              <p className="text-sm text-muted-foreground">
                Protege os backups com AES-256
              </p>
            </div>
            <Switch id="settings-storage-encryption" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full">Salvar Configurações</Button>
    </div>
  );
}
