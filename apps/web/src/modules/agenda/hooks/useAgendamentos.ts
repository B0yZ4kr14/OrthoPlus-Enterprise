import { useState, useEffect, useCallback } from "react";
import { Agendamento } from "@/domain/entities/Agendamento";
import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";
import { CreateAgendamentoUseCase } from "@/application/use-cases/agenda/CreateAgendamentoUseCase";
import { UpdateAgendamentoUseCase } from "@/application/use-cases/agenda/UpdateAgendamentoUseCase";
import { CancelAgendamentoUseCase } from "@/application/use-cases/agenda/CancelAgendamentoUseCase";
import { GetAgendamentosByDateRangeUseCase } from "@/application/use-cases/agenda/GetAgendamentosByDateRangeUseCase";
import { container } from "@/infrastructure/di/Container";
import { SERVICE_KEYS } from "@/infrastructure/di/ServiceKeys";
import { useToast } from "@/hooks/use-toast";

export function useAgendamentos(
  clinicId: string,
  startDate?: Date,
  endDate?: Date,
  dentistId?: string,
) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Resolver dependências do DI Container
  const agendamentoRepository = container.resolve<IAgendamentoRepository>(
    SERVICE_KEYS.AGENDAMENTO_REPOSITORY,
  );
  const createAgendamentoUseCase = container.resolve<CreateAgendamentoUseCase>(
    SERVICE_KEYS.CREATE_AGENDAMENTO_USE_CASE,
  );
  const updateAgendamentoUseCase = container.resolve<UpdateAgendamentoUseCase>(
    SERVICE_KEYS.UPDATE_AGENDAMENTO_USE_CASE,
  );
  const cancelAgendamentoUseCase = container.resolve<CancelAgendamentoUseCase>(
    SERVICE_KEYS.CANCEL_AGENDAMENTO_USE_CASE,
  );
  const getAgendamentosByDateRangeUseCase =
    container.resolve<GetAgendamentosByDateRangeUseCase>(
      SERVICE_KEYS.GET_AGENDAMENTOS_BY_DATE_RANGE_USE_CASE,
    );

  /**
   * Busca agendamentos
   */
  const fetchAgendamentos = useCallback(async () => {
    if (!clinicId) return;

    setIsLoading(true);
    try {
      let result: Agendamento[];

      if (startDate && endDate) {
        // Buscar por período
        result = await getAgendamentosByDateRangeUseCase.execute({
          clinicId,
          startDate,
          endDate,
          dentistId,
        });
      } else if (dentistId) {
        // Buscar todos de um dentista
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAhead = new Date();
        thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

        result = await agendamentoRepository.findByDentistAndDateRange(
          dentistId,
          thirtyDaysAgo,
          thirtyDaysAhead,
        );
      } else {
        // Buscar ativos da clínica
        result = await agendamentoRepository.findAtivos(clinicId);
      }

      setAgendamentos(result);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      toast({
        title: "Erro ao buscar agendamentos",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    clinicId,
    startDate,
    endDate,
    dentistId,
    agendamentoRepository,
    getAgendamentosByDateRangeUseCase,
    toast,
  ]);

  /**
   * Cria novo agendamento
   */
  const createAgendamento = useCallback(
    async (data: {
      patientId: string;
      dentistId: string;
      title: string;
      description?: string;
      startTime: Date;
      endTime: Date;
      treatmentId?: string;
      createdBy: string;
    }) => {
      setIsLoading(true);
      try {
        await createAgendamentoUseCase.execute({
          clinicId,
          ...data,
        });

        toast({
          title: "Agendamento criado",
          description: "O agendamento foi criado com sucesso",
        });

        await fetchAgendamentos();
      } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        toast({
          title: "Erro ao criar agendamento",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clinicId, createAgendamentoUseCase, fetchAgendamentos, toast],
  );

  /**
   * Atualiza agendamento
   */
  const updateAgendamento = useCallback(
    async (
      agendamentoId: string,
      data: {
        title?: string;
        description?: string;
        startTime?: Date;
        endTime?: Date;
      },
    ) => {
      setIsLoading(true);
      try {
        await updateAgendamentoUseCase.execute({
          agendamentoId,
          ...data,
        });

        toast({
          title: "Agendamento atualizado",
          description: "O agendamento foi atualizado com sucesso",
        });

        await fetchAgendamentos();
      } catch (error) {
        console.error("Erro ao atualizar agendamento:", error);
        toast({
          title: "Erro ao atualizar agendamento",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [updateAgendamentoUseCase, fetchAgendamentos, toast],
  );

  /**
   * Cancela agendamento
   */
  const cancelAgendamento = useCallback(
    async (agendamentoId: string) => {
      setIsLoading(true);
      try {
        await cancelAgendamentoUseCase.execute({ agendamentoId });

        toast({
          title: "Agendamento cancelado",
          description: "O agendamento foi cancelado com sucesso",
        });

        await fetchAgendamentos();
      } catch (error) {
        console.error("Erro ao cancelar agendamento:", error);
        toast({
          title: "Erro ao cancelar agendamento",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [cancelAgendamentoUseCase, fetchAgendamentos, toast],
  );

  /**
   * Confirma agendamento
   */
  const confirmarAgendamento = useCallback(
    async (agendamentoId: string) => {
      setIsLoading(true);
      try {
        const agendamento = await agendamentoRepository.findById(agendamentoId);
        if (!agendamento) {
          throw new Error("Agendamento não encontrado");
        }

        agendamento.confirmar();
        await agendamentoRepository.update(agendamento);

        toast({
          title: "Agendamento confirmado",
          description: "O agendamento foi confirmado com sucesso",
        });

        await fetchAgendamentos();
      } catch (error) {
        console.error("Erro ao confirmar agendamento:", error);
        toast({
          title: "Erro ao confirmar agendamento",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agendamentoRepository, fetchAgendamentos, toast],
  );

  /**
   * Inicia atendimento
   */
  const iniciarAtendimento = useCallback(
    async (agendamentoId: string) => {
      setIsLoading(true);
      try {
        const agendamento = await agendamentoRepository.findById(agendamentoId);
        if (!agendamento) {
          throw new Error("Agendamento não encontrado");
        }

        agendamento.iniciarAtendimento();
        await agendamentoRepository.update(agendamento);

        toast({
          title: "Atendimento iniciado",
          description: "O atendimento foi iniciado",
        });

        await fetchAgendamentos();
      } catch (error) {
        console.error("Erro ao iniciar atendimento:", error);
        toast({
          title: "Erro ao iniciar atendimento",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agendamentoRepository, fetchAgendamentos, toast],
  );

  /**
   * Conclui atendimento
   */
  const concluirAtendimento = useCallback(
    async (agendamentoId: string) => {
      setIsLoading(true);
      try {
        const agendamento = await agendamentoRepository.findById(agendamentoId);
        if (!agendamento) {
          throw new Error("Agendamento não encontrado");
        }

        agendamento.concluir();
        await agendamentoRepository.update(agendamento);

        toast({
          title: "Atendimento concluído",
          description: "O atendimento foi concluído com sucesso",
        });

        await fetchAgendamentos();
      } catch (error) {
        console.error("Erro ao concluir atendimento:", error);
        toast({
          title: "Erro ao concluir atendimento",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agendamentoRepository, fetchAgendamentos, toast],
  );

  /**
   * Marca falta
   */
  const marcarFalta = useCallback(
    async (agendamentoId: string) => {
      setIsLoading(true);
      try {
        const agendamento = await agendamentoRepository.findById(agendamentoId);
        if (!agendamento) {
          throw new Error("Agendamento não encontrado");
        }

        agendamento.marcarFalta();
        await agendamentoRepository.update(agendamento);

        toast({
          title: "Falta marcada",
          description: "A falta foi registrada",
        });

        await fetchAgendamentos();
      } catch (error) {
        console.error("Erro ao marcar falta:", error);
        toast({
          title: "Erro ao marcar falta",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agendamentoRepository, fetchAgendamentos, toast],
  );

  // Buscar agendamentos ao montar ou quando dependências mudarem
  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  return {
    agendamentos,
    isLoading,
    createAgendamento,
    updateAgendamento,
    cancelAgendamento,
    confirmarAgendamento,
    iniciarAtendimento,
    concluirAtendimento,
    marcarFalta,
    refresh: fetchAgendamentos,
  };
}
