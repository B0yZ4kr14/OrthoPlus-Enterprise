/**
 * Hook customizado para busca automática de CEP via API ViaCEP
 * @module useCEPLookup
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { lookupCEP, isLoading, error } = useCEPLookup();
 *
 * const handleCEPChange = async (cep: string) => {
 *   const address = await lookupCEP(cep);
 *   if (address) {
 *     setValue('logradouro', address.logradouro);
 *     setValue('bairro', address.bairro);
 *   }
 * };
 * ```
 */

import { useState } from "react";
import { toast } from "sonner";

export interface CEPAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export function useCEPLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca endereço completo a partir do CEP
   * @param cep - CEP com ou sem formatação (ex: "12345678" ou "12345-678")
   * @returns Dados do endereço ou null se não encontrado
   */
  const lookupCEP = async (cep: string): Promise<CEPAddress | null> => {
    // Limpar formatação
    const cleanCEP = cep.replace(/\D/g, "");

    // Validar formato
    if (cleanCEP.length !== 8) {
      setError("CEP deve conter 8 dígitos");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCEP}/json/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar CEP. Tente novamente.");
      }

      const data: ViaCEPResponse = await response.json();

      // ViaCEP retorna erro: true quando CEP não existe
      if (data.erro) {
        setError("CEP não encontrado");
        toast.error("CEP não encontrado", {
          description: "Verifique o CEP digitado e tente novamente.",
        });
        return null;
      }

      // Converter resposta para formato interno
      const address: CEPAddress = {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        ibge: data.ibge,
        gia: data.gia,
        ddd: data.ddd,
        siafi: data.siafi,
      };

      toast.success("CEP encontrado", {
        description: `${address.logradouro}, ${address.bairro} - ${address.cidade}/${address.estado}`,
      });

      return address;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar CEP";
      setError(errorMessage);
      toast.error("Erro ao buscar CEP", {
        description: errorMessage,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpa o estado de erro
   */
  const clearError = () => setError(null);

  return {
    lookupCEP,
    isLoading,
    error,
    clearError,
  };
}
