import { Patient, Consulta, Prontuario } from "../types/patient.types";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Separator } from "@orthoplus/core-ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import {
  Edit,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  User,
} from "lucide-react";

interface PatientDetailsProps {
  patient: Patient;
  onEdit: () => void;
  onClose: () => void;
}

// Mock data for demonstration
const mockConsultas: Consulta[] = [
  {
    id: "1",
    data: "2024-03-15",
    hora: "14:00",
    dentista: "Dr. Carlos Silva",
    procedimento: "Limpeza",
    status: "Realizada",
    observacoes: "Paciente apresentou boa saúde bucal",
  },
  {
    id: "2",
    data: "2024-04-20",
    hora: "10:30",
    dentista: "Dra. Ana Santos",
    procedimento: "Restauração",
    status: "Agendada",
  },
];

const mockProntuarios: Prontuario[] = [
  {
    id: "1",
    pacienteId: "1",
    data: "2024-03-15",
    dentista: "Dr. Carlos Silva",
    anamnese: "Paciente sem queixas, última consulta há 6 meses",
    diagnostico: "Saúde bucal satisfatória, leve acúmulo de tártaro",
    tratamento: "Limpeza completa, aplicação de flúor",
    prescricao: "Uso de fio dental diário, escovação 3x ao dia",
    observacoes: "Retornar em 6 meses para acompanhamento",
  },
];

export function PatientDetails({
  patient,
  onEdit,
  onClose,
}: PatientDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "default";
      case "Inativo":
        return "secondary";
      case "Pendente":
        return "outline";
      default:
        return "default";
    }
  };

  const getConsultaStatusColor = (status: string) => {
    switch (status) {
      case "Realizada":
        return "default";
      case "Agendada":
        return "outline";
      case "Cancelada":
        return "secondary";
      case "Faltou":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{patient.nome}</h2>
            <Badge variant={getStatusColor(patient.status)}>
              {patient.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Cadastrado em{" "}
            {new Date(patient.createdAt!).toLocaleDateString("pt-BR")}
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

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
          <TabsTrigger value="consultas">Histórico de Consultas</TabsTrigger>
          <TabsTrigger value="prontuario">Prontuário</TabsTrigger>
        </TabsList>

        {/* Dados Cadastrais */}
        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{patient.cpf}</p>
                </div>
                {patient.rg && (
                  <div>
                    <p className="text-sm text-muted-foreground">RG</p>
                    <p className="font-medium">{patient.rg}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data de Nascimento
                  </p>
                  <p className="font-medium">
                    {new Date(patient.dataNascimento).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sexo</p>
                  <p className="font-medium">
                    {patient.sexo === "M"
                      ? "Masculino"
                      : patient.sexo === "F"
                        ? "Feminino"
                        : "Outro"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{patient.telefone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Celular</p>
                  <p className="font-medium">{patient.celular}</p>
                </div>
                {patient.email && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {patient.endereco.logradouro}, {patient.endereco.numero}
                {patient.endereco.complemento &&
                  ` - ${patient.endereco.complemento}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {patient.endereco.bairro} - {patient.endereco.cidade}/
                {patient.endereco.estado}
              </p>
              <p className="text-sm text-muted-foreground">
                CEP: {patient.endereco.cep}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Convênio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.convenio.temConvenio ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nome do Convênio
                    </p>
                    <p className="font-medium">
                      {patient.convenio.nomeConvenio}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Número da Carteira
                    </p>
                    <p className="font-medium">
                      {patient.convenio.numeroCarteira}
                    </p>
                  </div>
                  {patient.convenio.validade && (
                    <div>
                      <p className="text-sm text-muted-foreground">Validade</p>
                      <p className="font-medium">
                        {new Date(patient.convenio.validade).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Paciente particular (sem convênio)
                </p>
              )}
            </CardContent>
          </Card>

          {patient.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {patient.observacoes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Histórico de Consultas */}
        <TabsContent value="consultas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Consultas Realizadas e Agendadas
            </h3>
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Nova Consulta
            </Button>
          </div>

          {mockConsultas.map((consulta) => (
            <Card key={consulta.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{consulta.procedimento}</p>
                      <Badge variant={getConsultaStatusColor(consulta.status)}>
                        {consulta.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Data e Hora</p>
                        <p className="font-medium">
                          {new Date(consulta.data).toLocaleDateString("pt-BR")}{" "}
                          às {consulta.hora}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dentista</p>
                        <p className="font-medium">{consulta.dentista}</p>
                      </div>
                    </div>
                    {consulta.observacoes && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          {consulta.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Prontuário */}
        <TabsContent value="prontuario" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Prontuário Odontológico</h3>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Novo Registro
            </Button>
          </div>

          {mockProntuarios.map((prontuario) => (
            <Card key={prontuario.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      Atendimento -{" "}
                      {new Date(prontuario.data).toLocaleDateString("pt-BR")}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {prontuario.dentista}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {prontuario.anamnese && (
                  <div>
                    <p className="font-semibold text-sm mb-1">Anamnese</p>
                    <p className="text-sm text-muted-foreground">
                      {prontuario.anamnese}
                    </p>
                  </div>
                )}
                {prontuario.diagnostico && (
                  <div>
                    <p className="font-semibold text-sm mb-1">Diagnóstico</p>
                    <p className="text-sm text-muted-foreground">
                      {prontuario.diagnostico}
                    </p>
                  </div>
                )}
                {prontuario.tratamento && (
                  <div>
                    <p className="font-semibold text-sm mb-1">
                      Tratamento Realizado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prontuario.tratamento}
                    </p>
                  </div>
                )}
                {prontuario.prescricao && (
                  <div>
                    <p className="font-semibold text-sm mb-1">
                      Prescrição / Orientações
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prontuario.prescricao}
                    </p>
                  </div>
                )}
                {prontuario.observacoes && (
                  <div>
                    <p className="font-semibold text-sm mb-1">Observações</p>
                    <p className="text-sm text-muted-foreground">
                      {prontuario.observacoes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
