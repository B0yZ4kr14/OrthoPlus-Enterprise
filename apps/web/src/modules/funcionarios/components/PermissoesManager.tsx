import { useState, useEffect } from "react";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import { Label } from "@orthoplus/core-ui/label";
import { Button } from "@orthoplus/core-ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@orthoplus/core-ui/card";
import {
  Permissoes,
  permissoesDisponiveis,
  perfisPermissoes,
  Cargo,
} from "../types/funcionario.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";

interface PermissoesManagerProps {
  permissoes: Permissoes;
  cargo?: Cargo;
  onChange: (permissoes: Permissoes) => void;
}

export function PermissoesManager({
  permissoes,
  cargo,
  onChange,
}: PermissoesManagerProps) {
  const [currentPermissoes, setCurrentPermissoes] =
    useState<Permissoes>(permissoes);

  // Atualiza permissões quando o cargo muda
  useEffect(() => {
    if (cargo && perfisPermissoes[cargo]) {
      const perfilPermissoes = perfisPermissoes[cargo];
      setCurrentPermissoes(perfilPermissoes);
      onChange(perfilPermissoes);
    }
  }, [cargo]);

  const handleTogglePermissao = (modulo: string, acao: string) => {
    const moduloPermissoes = currentPermissoes[modulo] || [];
    const novasPermissoes = moduloPermissoes.includes(acao)
      ? moduloPermissoes.filter((p) => p !== acao)
      : ([...moduloPermissoes, acao] as typeof moduloPermissoes);

    const updated: Permissoes = {
      ...currentPermissoes,
      [modulo]: novasPermissoes,
    };

    setCurrentPermissoes(updated);
    onChange(updated);
  };

  const handleToggleTodos = (modulo: string, marcar: boolean) => {
    const permissions =
      permissoesDisponiveis[modulo as keyof typeof permissoesDisponiveis]
        .permissions;
    const updated: Permissoes = {
      ...currentPermissoes,
      [modulo]: marcar ? ([...permissions] as string[]) : [],
    };

    setCurrentPermissoes(updated);
    onChange(updated);
  };

  const aplicarPerfil = (perfilNome: string) => {
    if (perfisPermissoes[perfilNome]) {
      const perfil = perfisPermissoes[perfilNome];
      setCurrentPermissoes(perfil);
      onChange(perfil);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Perfis Pré-definidos</CardTitle>
          <CardDescription>
            Selecione um perfil para aplicar permissões automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(perfisPermissoes).map((perfil) => (
              <Button
                key={perfil}
                variant="outline"
                size="sm"
                onClick={() => aplicarPerfil(perfil)}
              >
                {perfil}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(permissoesDisponiveis).map(([modulo, config]) => {
          const moduloPermissoes = currentPermissoes[modulo] || [];
          const todasMarcadas = config.permissions.every((p) =>
            moduloPermissoes.includes(p),
          );
          const algumasMarcadas = config.permissions.some((p) =>
            moduloPermissoes.includes(p),
          );

          return (
            <Card key={modulo}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{config.label}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleTodos(modulo, !todasMarcadas)}
                    >
                      {todasMarcadas ? "Desmarcar todas" : "Marcar todas"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {config.permissions.map((acao) => (
                  <div key={acao} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${modulo}-${acao}`}
                      checked={moduloPermissoes.includes(acao)}
                      onCheckedChange={() =>
                        handleTogglePermissao(modulo, acao)
                      }
                    />
                    <label
                      htmlFor={`${modulo}-${acao}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                    >
                      {acao}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
