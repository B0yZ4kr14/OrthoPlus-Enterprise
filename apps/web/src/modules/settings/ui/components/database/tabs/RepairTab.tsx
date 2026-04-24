import { Play, Wrench, Activity } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { useToast } from "@orthoplus/core-hooks";
import { useCategoryDatabase, CategoryDatabase } from "@/hooks/useCategoryDatabase";

interface RepairTabProps {
  selectedEngine: string;
  category: string;
}

const ENGINE_REPAIR_TOOLS: Record<string, { name: string; desc: string; cmd: string }[]> = {
  PostgreSQL: [
    { name: 'VACUUM FULL',       desc: 'Compacta e recupera espaço',    cmd: 'VACUUM FULL;' },
    { name: 'ANALYZE',           desc: 'Atualiza estatísticas',         cmd: 'ANALYZE;' },
    { name: 'REINDEX DATABASE',  desc: 'Reconstrói índices',            cmd: 'REINDEX DATABASE orthoplus;' },
    { name: 'pg_checksums',      desc: 'Verifica checksums das páginas', cmd: 'pg_checksums --check' },
  ],
  Firebird: [
    { name: 'gfix -sweep',    desc: 'Remove versões antigas de registros', cmd: 'gfix -sweep orthoplus.fdb' },
    { name: 'gfix -validate', desc: 'Valida estrutura do banco',           cmd: 'gfix -validate -full orthoplus.fdb' },
    { name: 'gfix -mend',     desc: 'Repara erros encontrados',            cmd: 'gfix -mend orthoplus.fdb' },
    { name: 'gstat',          desc: 'Estatísticas do banco',              cmd: 'gstat -h orthoplus.fdb' },
  ],
  MariaDB: [
    { name: 'OPTIMIZE TABLE', desc: 'Desfragmenta tabelas',  cmd: 'OPTIMIZE TABLE nome;' },
    { name: 'CHECK TABLE',    desc: 'Verifica erros',        cmd: 'CHECK TABLE nome;' },
    { name: 'REPAIR TABLE',   desc: 'Repara erros',          cmd: 'REPAIR TABLE nome;' },
    { name: 'ANALYZE TABLE',  desc: 'Atualiza estatísticas', cmd: 'ANALYZE TABLE nome;' },
  ],
  SQLite: [
    { name: 'VACUUM',            desc: 'Compacta e recria arquivo', cmd: 'VACUUM;' },
    { name: 'INTEGRITY CHECK',   desc: 'Verifica integridade',      cmd: 'PRAGMA integrity_check;' },
    { name: 'ANALYZE',           desc: 'Atualiza índices',          cmd: 'ANALYZE;' },
    { name: 'REINDEX',           desc: 'Reconstrói índices',        cmd: 'REINDEX;' },
  ],
};

export function RepairTab({ selectedEngine, category }: RepairTabProps) {
  const { showSuccess, showError, showInfo } = useToast();
  const { runMaintenance } = useCategoryDatabase(category as CategoryDatabase);

  const tools = ENGINE_REPAIR_TOOLS[selectedEngine] || ENGINE_REPAIR_TOOLS.PostgreSQL;

  const handleRun = async (toolName: string) => {
    if (selectedEngine === 'PostgreSQL') {
      try {
        await runMaintenance();
        showSuccess(`Operação ${toolName} executada com sucesso no PostgreSQL.`);
      } catch (error) {
        showError("Ocorreu um erro ao executar a operação.");
      }
    } else {
      showInfo(`Executando ${toolName} para ${selectedEngine}...`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-400" />
          Ferramentas de Reparo: {selectedEngine}
        </h3>
        <p className="text-sm text-muted-foreground">Otimize e repare a base de dados desta categoria</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool, idx) => (
          <Card key={idx} className="border-gray-800 bg-gray-900/50 hover:bg-gray-800 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-200">{tool.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                </div>
                <Button 
                  onClick={() => handleRun(tool.name)} 
                  variant="outline" 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white border-none h-8 w-8 p-0"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 p-2 bg-black rounded border border-gray-800">
                <code className="text-xs text-green-400 font-mono">{tool.cmd}</code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <h4 className="text-sm font-medium text-gray-300">Histórico de Conexão e Manutenção</h4>
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-gray-800 bg-gray-900/20 text-center">
          <div className="p-3 bg-gray-800/50 rounded-full mb-3">
            <Activity className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-sm text-muted-foreground">Nenhum histórico de conexão disponível</p>
        </div>
      </div>
    </div>
  );
}
