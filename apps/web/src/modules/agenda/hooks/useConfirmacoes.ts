import { useState, useEffect, useCallback } from "react";
import { Confirmacao } from "@/domain/entities/Confirmacao";
import { IConfirmacaoRepository } from "@/domain/repositories/IConfirmacaoRepository";
import { SendConfirmacaoWhatsAppUseCase } from "@/application/use-cases/agenda/SendConfirmacaoWhatsAppUseCase";
import { container } from "@/infrastructure/di/Container";
import { SERVICE_KEYS } from "@/infrastructure/di/ServiceKeys";
import { useToast } from "@/hooks/use-toast";

export function useConfirmacoes(agendamentoId?: string) {
  const [confirmacoes, setConfirmacoes] = useState<Confirmacao[]>([]);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Resolver dependências do DI Container
  const confirmacaoRepository = container.resolve<IConfirmacaoRepository>(
    SERVICE_KEYS.CONFIRMACAO_REPOSITORY,
  );
  const sendConfirmacaoWhatsAppUseCase =
    container.resolve<SendConfirmacaoWhatsAppUseCase>(
      SERVICE_KEYS.SEND_CONFIRMACAO_WHATSAPP_USE_CASE,
    );

  /**
   * Busca confirmação de um agendamento específico
   */
  const fetchConfirmacao = useCallback(async () => {
    if (!agendamentoId) return;

    setIsLoading(true);
    try {
      const result =
        await confirmacaoRepository.findByAgendamentoId(agendamentoId);
      setConfirmacao(result);
    } catch (error) {
      console.error("Erro ao buscar confirmação:", error);
      toast({
        title: "Erro ao buscar confirmação",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [agendamentoId, confirmacaoRepository, toast]);

  /**
   * Busca confirmações pendentes
   */
  const fetchPendentes = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await confirmacaoRepository.findPendentes();
      setConfirmacoes(result);
    } catch (error) {
      console.error("Erro ao buscar confirmações pendentes:", error);
      toast({
        title: "Erro ao buscar confirmações",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [confirmacaoRepository, toast]);

  /**
   * Busca confirmações enviadas mas não confirmadas
   */
  const fetchEnviadasNaoConfirmadas = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await confirmacaoRepository.findEnviadasNaoConfirmadas();
      setConfirmacoes(result);
    } catch (error) {
      console.error("Erro ao buscar confirmações enviadas:", error);
      toast({
        title: "Erro ao buscar confirmações",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [confirmacaoRepository, toast]);

  /**
   * Envia confirmação via WhatsApp
   */
  const sendWhatsApp = useCallback(
    async (data: {
      agendamentoId: string;
      phoneNumber: string;
      messageTemplate?: string;
    }) => {
      setIsSending(true);
      try {
        await sendConfirmacaoWhatsAppUseCase.execute(data);

        toast({
          title: "Confirmação enviada",
          description: "A mensagem de confirmação foi enviada via WhatsApp",
        });

        // Atualizar confirmação se estamos vendo um agendamento específico
        if (agendamentoId === data.agendamentoId) {
          await fetchConfirmacao();
        }
      } catch (error) {
        console.error("Erro ao enviar confirmação:", error);
        toast({
          title: "Erro ao enviar confirmação",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsSending(false);
      }
    },
    [agendamentoId, sendConfirmacaoWhatsAppUseCase, fetchConfirmacao, toast],
  );

  /**
   * Confirma manualmente uma confirmação
   */
  const confirmarManualmente = useCallback(
    async (confirmacaoId: string) => {
      setIsLoading(true);
      try {
        const conf = await confirmacaoRepository.findById(confirmacaoId);
        if (!conf) {
          throw new Error("Confirmação não encontrada");
        }

        conf.confirmar();
        await confirmacaoRepository.update(conf);

        toast({
          title: "Confirmação registrada",
          description: "A confirmação foi registrada manualmente",
        });

        if (agendamentoId) {
          await fetchConfirmacao();
        }
      } catch (error) {
        console.error("Erro ao confirmar:", error);
        toast({
          title: "Erro ao confirmar",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [agendamentoId, confirmacaoRepository, fetchConfirmacao, toast],
  );

  /**
   * Reenviar confirmação
   */
  const reenviar = useCallback(
    async (
      agendamentoId: string,
      phoneNumber: string,
      messageTemplate?: string,
    ) => {
      return sendWhatsApp({ agendamentoId, phoneNumber, messageTemplate });
    },
    [sendWhatsApp],
  );

  // Buscar confirmação ao montar se tiver agendamentoId
  useEffect(() => {
    if (agendamentoId) {
      fetchConfirmacao();
    }
  }, [agendamentoId, fetchConfirmacao]);

  return {
    confirmacao,
    confirmacoes,
    isLoading,
    isSending,
    sendWhatsApp,
    confirmarManualmente,
    reenviar,
    fetchPendentes,
    fetchEnviadasNaoConfirmadas,
    refresh: fetchConfirmacao,
  };
}
