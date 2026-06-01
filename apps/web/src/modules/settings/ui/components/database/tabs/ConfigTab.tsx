import { useState } from "react";
import { Server, Eye, EyeOff, Play, AlertTriangle } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { useToast } from "@orthoplus/core-hooks";

interface ConfigTabProps {
  selectedEngine: string;
}

const ENGINE_CONFIG: Record<
  string,
  {
    fields: string[];
    portDefault: string;
    dbLabel: string;
    userDefault: string;
    buttonLabel: string;
  }
> = {
  PostgreSQL: {
    fields: ["host", "port", "database", "user", "password"],
    portDefault: "5432",
    dbLabel: "Banco de Dados",
    userDefault: "postgres",
    buttonLabel: "Testar Conexão PostgreSQL",
  },
  Firebird: {
    fields: ["host", "port", "dbpath", "user", "password"],
    portDefault: "3050",
    dbLabel: "Caminho do Banco",
    userDefault: "SYSDBA",
    buttonLabel: "Testar Conexão Firebird",
  },
  MariaDB: {
    fields: ["host", "port", "database", "user", "password"],
    portDefault: "3306",
    dbLabel: "Banco de Dados",
    userDefault: "root",
    buttonLabel: "Testar Conexão MariaDB",
  },
  SQLite: {
    fields: ["filepath", "user", "password"],
    portDefault: "",
    dbLabel: "Caminho do Arquivo",
    userDefault: "",
    buttonLabel: "Testar Conexão SQLite",
  },
};

export function ConfigTab({ selectedEngine }: ConfigTabProps) {
  const { showInfo } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const config = ENGINE_CONFIG[selectedEngine] || ENGINE_CONFIG.PostgreSQL;

  const handleTestConnection = () => {
    showInfo(`Testando conexão para ${selectedEngine}... Sucesso!`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Server className="w-5 h-5 text-interactive" />
          Configuração de Conexão: {selectedEngine}
        </h3>
        <p className="text-sm text-muted-foreground">
          Parâmetros para acesso à base de dados
        </p>
      </div>

      <div className="p-4 rounded-xl border border-warning/50 bg-warning/10 text-warning text-sm font-medium flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />⚠ Modo Demo: Conexão será simulada
      </div>

      <Card className="border border-border bg-muted/30">
        <CardContent className="p-6 space-y-4">
          {config.fields.includes("host") && (
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="db-host" className="text-right text-foreground">Host</Label>
              <div className="col-span-3">
                <Input id="db-host" defaultValue="localhost" />
              </div>
            </div>
          )}

          {config.fields.includes("port") && (
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="db-port" className="text-right text-foreground">Porta</Label>
              <div className="col-span-3">
                <Input id="db-port" defaultValue={config.portDefault} />
              </div>
            </div>
          )}

          {(config.fields.includes("database") ||
            config.fields.includes("dbpath") ||
            config.fields.includes("filepath")) && (
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="db-name" className="text-right text-foreground">
                {config.dbLabel}
              </Label>
              <div className="col-span-3">
                <Input
                  id="db-name"
                  defaultValue={
                    config.fields.includes("database")
                      ? "orthoplus"
                      : "/var/lib/data/db"
                  }
                />
              </div>
            </div>
          )}

          {config.fields.includes("user") && (
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="db-user" className="text-right text-foreground">Usuário</Label>
              <div className="col-span-3">
                <Input id="db-user" defaultValue={config.userDefault} />
              </div>
            </div>
          )}

          {config.fields.includes("password") && (
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="db-password" className="text-right text-foreground">Senha</Label>
              <div className="col-span-3 relative">
                <Input
                  id="db-password"
                  type={showPassword ? "text" : "password"}
                  defaultValue="********"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 pt-4">
            <div className="col-span-1"></div>
            <div className="col-span-3">
              <Button type="button"
                onClick={handleTestConnection}
                className="bg-interactive hover:bg-interactive/90 text-white w-full border-none"
              >
                <Play className="w-4 h-4 mr-2" /> {config.buttonLabel}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
