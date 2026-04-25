import { useState } from "react";
import { HardDrive, HelpCircle, ChevronDown, ChevronUp, Download, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Switch } from "@orthoplus/core-ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@orthoplus/core-ui/tooltip";

type SubTab = 'local' | 'nuvem' | 'distribuido';
type BackupType = 'completo' | 'incremental';

export function BackupLocalCard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('local');
  const [backupType, setBackupType] = useState<BackupType>('completo');
  const [autoSchedule, setAutoSchedule] = useState(false);

  return (
    <Card className="border border-border bg-card overflow-hidden">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-interactive/10 rounded-xl border border-interactive/20">
            <HardDrive className="w-6 h-6 text-interactive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Backup Local
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Configure backups automatizados e manuais.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h2>
            <p className="text-sm text-gray-400 mt-1">Criar e restaurar backups do banco de dados</p>
          </div>
        </div>
        <div className="text-muted-foreground">
          {isCollapsed ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
        </div>
      </div>

      {!isCollapsed && (
        <CardContent className="p-0 border-t border-border">
          <div className="p-6 bg-background">
            <div className="bg-muted/50 border border-border rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">O que são Backups?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                    Cópias de segurança dos seus dados.
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                    Protegem contra perdas acidentais.
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                    Garantem a conformidade com a LGPD.
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium mt-0.5">4</span>
                    Permitem restaurar o sistema em caso de falhas.
                  </li>
                </ul>

                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">Faça backups diários após o expediente.</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">Mantenha os backups em um disco externo ou nuvem.</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">Teste as restaurações periodicamente.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">Sem backup, se o computador quebrar, você perde TUDO! Não arrisque.</p>
              </div>
            </div>

            <div className="flex border-b border-border mb-6">
              {[
                { id: 'local', label: 'Local' },
                { id: 'nuvem', label: 'Nuvem' },
                { id: 'distribuido', label: 'Distribuído' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as SubTab)}
                  className={`px-6 py-3 text-sm font-medium transition-colors border-b-2
                    ${activeSubTab === tab.id 
                      ? 'text-foreground border-interactive' 
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'}
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeSubTab === 'local' ? (
              <div className="space-y-6">
                <div className="flex w-full bg-muted rounded-lg p-1 border border-border">
                  <button
                    onClick={() => setBackupType('completo')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-colors
                      ${backupType === 'completo' ? 'bg-interactive text-white shadow-sm' : 'bg-transparent text-muted-foreground hover:text-foreground'}
                    `}
                  >
                    <Download className="w-4 h-4" /> Backup Completo
                  </button>
                  <button
                    onClick={() => setBackupType('incremental')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-colors
                      ${backupType === 'incremental' ? 'bg-interactive text-white shadow-sm' : 'bg-transparent text-muted-foreground hover:text-foreground'}
                    `}
                  >
                    <Download className="w-4 h-4" /> Incremental
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-xl">
                  <div>
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      📅 Agendamento Automático
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Realizar backups agendados diariamente às 03:00</p>
                  </div>
                  <Switch 
                    checked={autoSchedule}
                    onCheckedChange={setAutoSchedule}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Backups Recentes</h4>
                  <div className="flex items-center justify-center p-12 bg-muted/20 border border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground text-sm">Nenhum backup encontrado</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-muted/20 border border-dashed border-border rounded-xl">
                <div className="p-3 bg-warning/10 text-warning rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">🚧 Em breve</h4>
                <p className="text-muted-foreground text-sm text-center max-w-sm">
                  O recurso de backup em {activeSubTab} estará disponível nas próximas atualizações do OrthoPlus.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
