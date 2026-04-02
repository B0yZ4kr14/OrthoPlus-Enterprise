import {
  Funcionario,
  diasSemana,
  permissoesDisponiveis,
} from "../types/funcionario.types";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Separator } from "@orthoplus/core-ui/separator";
import {
  Edit,
  User,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Shield,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FuncionarioDetailsProps {
  funcionario: Funcionario;
  onEdit: () => void;
  onClose: () => void;
}

export function FuncionarioDetails({
  funcionario,
  onEdit,
  onClose,
}: FuncionarioDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "default";
      case "Inativo":
        return "secondary";
      case "Férias":
        return "outline";
      case "Afastado":
        return "destructive";
      default:
        return "default";
    }
  };

  const getDiasTrabalhoText = () => {
    return funcionario.diasTrabalho
      .sort((a, b) => a - b)
      .map((dia) => diasSemana.find((d) => d.value === dia)?.label)
      .join(", ");
  };

  const getPermissoesAtivas = () => {
    const permissoesAtivas: {
      modulo: string;
      label: string;
      acoes: string[];
    }[] = [];

    Object.entries(funcionario.permissoes).forEach(([modulo, acoes]) => {
      if (acoes.length > 0) {
        const config =
          permissoesDisponiveis[modulo as keyof typeof permissoesDisponiveis];
        if (config) {
          permissoesAtivas.push({
            modulo,
            label: config.label,
            acoes,
          });
        }
      }
    });

    return permissoesAtivas;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{funcionario.nome}</h2>
            <Badge variant={getStatusColor(funcionario.status)}>
              {funcionario.status}
            </Badge>
            {funcionario.cargo === "Administrador" && (
              <Badge variant="default" className="gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Cadastrado em{" "}
            {format(
              parseISO(funcionario.createdAt!),
              "dd 'de' MMMM 'de' yyyy",
              { locale: ptBR },
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            Fechar
          </Button>
        </div>
      </div>

      <Separator />

      {/* Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">CPF</p>
              <p className="font-medium">{funcionario.cpf}</p>
            </div>
            {funcionario.rg && (
              <div>
                <p className="text-sm text-muted-foreground">RG</p>
                <p className="font-medium">{funcionario.rg}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">
                Data de Nascimento
              </p>
              <p className="font-medium">
                {format(new Date(funcionario.dataNascimento), "dd/MM/yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sexo</p>
              <p className="font-medium">
                {funcionario.sexo === "M"
                  ? "Masculino"
                  : funcionario.sexo === "F"
                    ? "Feminino"
                    : "Outro"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{funcionario.telefone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Celular</p>
              <p className="font-medium">{funcionario.celular}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{funcionario.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {funcionario.endereco.logradouro}, {funcionario.endereco.numero}
              {funcionario.endereco.complemento &&
                ` - ${funcionario.endereco.complemento}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {funcionario.endereco.bairro} - {funcionario.endereco.cidade}/
              {funcionario.endereco.estado}
            </p>
            <p className="text-sm text-muted-foreground">
              CEP: {funcionario.endereco.cep}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-5 w-5" />
              Informações Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Cargo</p>
              <p className="font-medium">{funcionario.cargo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Admissão</p>
              <p className="font-medium">
                {format(new Date(funcionario.dataAdmissao), "dd/MM/yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salário</p>
              <p className="font-medium">
                R$ {funcionario.salario.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5" />
              Horários de Trabalho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Dias de Trabalho</p>
              <p className="font-medium">{getDiasTrabalhoText()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horário</p>
              <p className="font-medium">
                {funcionario.horarioTrabalho.inicio} às{" "}
                {funcionario.horarioTrabalho.fim}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissões de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getPermissoesAtivas().length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma permissão concedida
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getPermissoesAtivas().map(({ modulo, label, acoes }) => (
                <div key={modulo} className="space-y-2">
                  <p className="font-medium text-sm">{label}</p>
                  <div className="flex flex-wrap gap-1">
                    {acoes.map((acao) => (
                      <Badge
                        key={acao}
                        variant="outline"
                        className="text-xs capitalize"
                      >
                        {acao}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      {funcionario.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {funcionario.observacoes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID:</span>
            <span className="font-medium">{funcionario.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cadastrado em:</span>
            <span className="font-medium">
              {format(parseISO(funcionario.createdAt!), "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última atualização:</span>
            <span className="font-medium">
              {format(parseISO(funcionario.updatedAt!), "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
