import { Settings2, Check } from "lucide-react";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";

interface MotorTabProps {
  selectedEngine: string;
  onSelectEngine: (engine: string) => void;
}

const ENGINE_DETAILS: Record<string, { port: string; desc: string; whenToUse: string[]; limitations: string[]; resources: string[] }> = {
  PostgreSQL: {
    port: '5432',
    desc: 'Banco relacional robusto para produção',
    whenToUse: ['Ambientes corporativos com alta concorrência', 'Alta disponibilidade com replicação', 'Dados JSON semi-estruturados (JSONB)', 'Queries analíticas complexas'],
    limitations: ['Configuração inicial mais complexa', 'Consumo de memória maior', 'Overhead para bancos pequenos'],
    resources: ['JSON/JSONB nativo', 'Full-text search avançado', 'Replicação síncrona/assíncrona', 'Extensões (PostGIS, etc)', 'MVCC robusto'],
  },
  Firebird: {
    port: '3050',
    desc: 'Banco legado com suporte embedded',
    whenToUse: ['Sistemas legados existentes', 'Aplicações desktop standalone', 'Compatibilidade com Interbase', 'Embedded database com servidor'],
    limitations: ['Comunidade menor', 'Menos ferramentas modernas', 'Documentação menos extensa'],
    resources: ['Modo embedded e servidor', 'Stored procedures', 'Triggers avançados', 'Instalação pequena', 'Suporte a eventos'],
  },
  SQLite: {
    port: 'N/A',
    desc: 'Banco embutido sem servidor',
    whenToUse: ['Desenvolvimento e testes locais', 'Aplicações single-node', 'Dispositivos com poucos recursos', 'Banco embutido em app'],
    limitations: ['Sem multi-user concorrente', 'Sem servidor remoto nativo', 'Sem full-text search nativo'],
    resources: ['Zero config', 'Arquivo único', 'Sem servidor', 'Leitura rápida', 'Embedded'],
  },
  MariaDB: {
    port: '3306',
    desc: 'Fork MySQL com melhorias de performance',
    whenToUse: ['Migração de sistemas MySQL', 'Workloads OLTP tradicionais', 'Compatibilidade com legado', 'Cluster com Galera'],
    limitations: ['Menos nativo no ecossistema Node/Prisma', 'JSON menos poderoso que PostgreSQL', 'Extensões limitadas'],
    resources: ['MySQL compatible', 'Performance melhorada', 'Galera Cluster', 'JSON suporte', 'Replicação'],
  },
};

export function MotorTab({ selectedEngine, onSelectEngine }: MotorTabProps) {
  const currentDetails = ENGINE_DETAILS[selectedEngine];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-interactive" />
          Motor do Banco
        </h3>
        <p className="text-sm text-muted-foreground">Selecione o SGBD que melhor atende esta categoria</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['SQLite', 'PostgreSQL', 'MariaDB', 'Firebird'].map((engine) => (
          <div
            key={engine}
            onClick={() => onSelectEngine(engine)}
            className={`
              p-4 rounded-xl cursor-pointer transition-all duration-200 border relative group
              ${selectedEngine === engine 
                ? 'border-interactive bg-interactive/10 shadow-[var(--shadow-card)]' 
                : 'border border-border bg-card hover:bg-muted hover:border-border'}
            `}
          >
            {selectedEngine === engine && (
              <div className="absolute top-4 right-4 text-interactive">
                <Check className="w-5 h-5" />
              </div>
            )}
            <h4 className="font-semibold text-foreground mb-1 transition-colors">
              {engine} / Porta: {ENGINE_DETAILS[engine].port}
            </h4>
            <p className="text-sm text-muted-foreground transition-colors">
              {ENGINE_DETAILS[engine].desc}
            </p>
          </div>
        ))}
      </div>

      {currentDetails && (
        <Card className="border border-border bg-muted/20 mt-8">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-foreground border-b border-border pb-4 mb-4">
              {selectedEngine} — Detalhes
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h5 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                  ✅ Quando usar
                </h5>
                <ul className="space-y-2">
                  {currentDetails.whenToUse.map((item, idx) => (
                    <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-medium text-yellow-500 mb-3 flex items-center gap-2">
                  ⚠️ Limitações
                </h5>
                <ul className="space-y-2">
                  {currentDetails.limitations.map((item, idx) => (
                    <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-blue-400 mb-3">🚀 Recursos:</h5>
              <div className="flex flex-wrap gap-2">
                {currentDetails.resources.map((resource, idx) => (
                  <Badge key={idx} variant="outline" className="border-interactive/30 bg-interactive/10 text-interactive">
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
