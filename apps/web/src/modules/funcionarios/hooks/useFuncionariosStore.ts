import { useState, useEffect } from "react";
import { Funcionario, FuncionarioFilters } from "../types/funcionario.types";
import { toast } from "sonner";

const STORAGE_KEY = "orthoplus_funcionarios";

// Mock data for demonstration
const mockFuncionarios: Funcionario[] = [
  {
    id: "1",
    nome: "Roberto Silva Santos",
    cpf: "111.222.333-44",
    rg: "11.222.333-4",
    dataNascimento: "1988-06-10",
    sexo: "M",
    telefone: "(11) 3456-7890",
    celular: "(11) 98888-7777",
    email: "roberto.silva@clinica.com",
    endereco: {
      cep: "01234-567",
      logradouro: "Rua dos Funcionários",
      numero: "200",
      complemento: "Casa 2",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
    },
    cargo: "Administrador",
    dataAdmissao: "2020-01-15",
    salario: 5000,
    permissoes: {
      pacientes: ["visualizar", "criar", "editar", "excluir"],
      dentistas: ["visualizar", "criar", "editar", "excluir"],
      funcionarios: ["visualizar", "criar", "editar", "excluir"],
      agenda: ["visualizar", "criar", "editar", "excluir", "confirmar"],
      financeiro: ["visualizar", "criar", "editar", "excluir", "aprovar"],
      relatorios: ["visualizar", "exportar"],
      configuracoes: ["visualizar", "editar"],
    },
    horarioTrabalho: {
      inicio: "08:00",
      fim: "18:00",
    },
    diasTrabalho: [1, 2, 3, 4, 5],
    observacoes: "Administrador do sistema",
    status: "Ativo",
    createdAt: "2020-01-15T10:00:00",
    updatedAt: "2020-01-15T10:00:00",
  },
  {
    id: "2",
    nome: "Juliana Oliveira Costa",
    cpf: "222.333.444-55",
    dataNascimento: "1992-03-22",
    sexo: "F",
    telefone: "(11) 2345-6789",
    celular: "(11) 97777-6666",
    email: "juliana.oliveira@clinica.com",
    endereco: {
      cep: "04567-890",
      logradouro: "Av. Principal",
      numero: "1500",
      bairro: "Jardins",
      cidade: "São Paulo",
      estado: "SP",
    },
    cargo: "Recepcionista",
    dataAdmissao: "2021-05-10",
    salario: 2500,
    permissoes: {
      pacientes: ["visualizar", "criar", "editar"],
      dentistas: ["visualizar"],
      funcionarios: [],
      agenda: ["visualizar", "criar", "editar", "confirmar"],
      financeiro: ["visualizar"],
      relatorios: ["visualizar"],
      configuracoes: [],
    },
    horarioTrabalho: {
      inicio: "08:00",
      fim: "17:00",
    },
    diasTrabalho: [1, 2, 3, 4, 5],
    status: "Ativo",
    createdAt: "2021-05-10T10:00:00",
    updatedAt: "2021-05-10T10:00:00",
  },
  {
    id: "3",
    nome: "Marcos Paulo Ferreira",
    cpf: "333.444.555-66",
    dataNascimento: "1995-11-05",
    sexo: "M",
    telefone: "(11) 3210-9876",
    celular: "(11) 96666-5555",
    email: "marcos.ferreira@clinica.com",
    endereco: {
      cep: "02345-678",
      logradouro: "Rua das Palmeiras",
      numero: "80",
      bairro: "Vila Nova",
      cidade: "São Paulo",
      estado: "SP",
    },
    cargo: "Auxiliar de Dentista",
    dataAdmissao: "2022-08-20",
    salario: 2000,
    permissoes: {
      pacientes: ["visualizar"],
      dentistas: ["visualizar"],
      funcionarios: [],
      agenda: ["visualizar"],
      financeiro: [],
      relatorios: [],
      configuracoes: [],
    },
    horarioTrabalho: {
      inicio: "09:00",
      fim: "18:00",
    },
    diasTrabalho: [1, 2, 3, 4, 5],
    observacoes: "Auxiliar com experiência em procedimentos básicos",
    status: "Ativo",
    createdAt: "2022-08-20T10:00:00",
    updatedAt: "2022-08-20T10:00:00",
  },
];

export function useFuncionariosStore() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);

  // Load funcionarios from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFuncionarios(JSON.parse(stored));
      } else {
        // Initialize with mock data
        setFuncionarios(mockFuncionarios);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockFuncionarios));
      }
    } catch (error) {
      console.error("Error loading funcionarios:", error);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveFuncionarios = (updatedFuncionarios: Funcionario[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFuncionarios));
      setFuncionarios(updatedFuncionarios);
    } catch (error) {
      console.error("Error saving funcionarios:", error);
      toast.error("Erro ao salvar funcionários");
      throw error;
    }
  };

  const addFuncionario = (funcionario: Funcionario) => {
    const newFuncionario = {
      ...funcionario,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveFuncionarios([...funcionarios, newFuncionario]);
    toast.success("Funcionário cadastrado com sucesso");
    return newFuncionario;
  };

  const updateFuncionario = (id: string, funcionario: Partial<Funcionario>) => {
    const updated = funcionarios.map((f) =>
      f.id === id
        ? { ...f, ...funcionario, updatedAt: new Date().toISOString() }
        : f,
    );
    saveFuncionarios(updated);
    toast.success("Funcionário atualizado com sucesso");
  };

  const deleteFuncionario = (id: string) => {
    const updated = funcionarios.filter((f) => f.id !== id);
    saveFuncionarios(updated);
    toast.success("Funcionário removido com sucesso");
  };

  const getFuncionario = (id: string) => {
    return funcionarios.find((f) => f.id === id);
  };

  const filterFuncionarios = (filters: FuncionarioFilters) => {
    return funcionarios.filter((funcionario) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !funcionario.nome.toLowerCase().includes(searchLower) &&
          !funcionario.cpf.includes(filters.search) &&
          !funcionario.email.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (filters.status && funcionario.status !== filters.status) {
        return false;
      }
      if (filters.cargo && funcionario.cargo !== filters.cargo) {
        return false;
      }
      return true;
    });
  };

  const verificarPermissao = (
    funcionarioId: string,
    modulo: string,
    acao: string,
  ): boolean => {
    const funcionario = getFuncionario(funcionarioId);
    if (!funcionario) return false;

    const permissoesModulo = funcionario.permissoes[modulo];
    if (!permissoesModulo) return false;

    return permissoesModulo.includes(acao);
  };

  return {
    funcionarios,
    loading,
    addFuncionario,
    updateFuncionario,
    deleteFuncionario,
    getFuncionario,
    filterFuncionarios,
    verificarPermissao,
  };
}
