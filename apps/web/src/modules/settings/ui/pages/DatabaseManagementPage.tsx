import { Database } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DatabaseAdvancedPanel } from "../components/database/DatabaseAdvancedPanel";
import { BackupLocalCard } from "../components/database/BackupLocalCard";

export default function DatabaseManagementPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <PageHeader
        title="Gerenciamento de Banco de Dados"
        description="Controle avançado dos motores de banco de dados, backups e manutenções do sistema."
        icon={Database}
      />

      <div className="flex flex-col gap-6">
        <DatabaseAdvancedPanel 
          category="CORE" 
          categorySchemas={['core','pacientes','pep']} 
        />
        <DatabaseAdvancedPanel 
          category="FINANCEIRO" 
          categorySchemas={['financeiro','pdv','faturamento','crypto_config']} 
        />
        <DatabaseAdvancedPanel 
          category="OPERACIONAL" 
          categorySchemas={['operacional','inventario']} 
        />
        <DatabaseAdvancedPanel 
          category="COMERCIAL" 
          categorySchemas={['comercial']} 
        />
        <DatabaseAdvancedPanel 
          category="CLINICO" 
          categorySchemas={['clinico']} 
        />
        <DatabaseAdvancedPanel 
          category="ADMINISTRATIVO" 
          categorySchemas={['administrativo','configuracoes','database_admin','backups']} 
        />

        <BackupLocalCard />
      </div>
    </div>
  );
}
