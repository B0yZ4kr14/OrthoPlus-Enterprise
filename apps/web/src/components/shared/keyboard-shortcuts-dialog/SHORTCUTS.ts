import type { KeyboardShortcut } from "./types";

export const SHORTCUTS: KeyboardShortcut[] = [
  // Navegação
  { key: "Ctrl + 1", description: "Ir para Dashboard", category: "Navegação" },
  { key: "Ctrl + 2", description: "Ir para Agenda", category: "Navegação" },
  { key: "Ctrl + 3", description: "Ir para Pacientes", category: "Navegação" },
  { key: "Ctrl + 4", description: "Ir para Prontuário", category: "Navegação" },
  { key: "Ctrl + 5", description: "Ir para Financeiro", category: "Navegação" },

  // Busca e Comandos
  { key: "Ctrl + P", description: "Busca Rápida de Pacientes", category: "Busca" },
  { key: "Ctrl + K", description: "Command Palette", category: "Busca" },

  // Quick Actions
  { key: "Ctrl + N", description: "Novo Paciente", category: "Ações Rápidas" },
  { key: "Ctrl + T", description: "Novo Tratamento", category: "Ações Rápidas" },
  { key: "Ctrl + R", description: "Nova Prescrição", category: "Ações Rápidas" },
  { key: "Ctrl + O", description: "Abrir Prontuário (menu contextual)", category: "Ações Rápidas" },
  { key: "Ctrl + A", description: "Agendar Consulta (menu contextual)", category: "Ações Rápidas" },

  // Odontograma (quando focado)
  { key: "H", description: "Marcar dente como Hígido", category: "Odontograma" },
  { key: "C", description: "Marcar dente com Cárie", category: "Odontograma" },
  { key: "T", description: "Marcar dente como Tratado", category: "Odontograma" },

  // Ajuda
  { key: "Shift + ?", description: "Exibir este menu de atalhos", category: "Ajuda" },
  { key: "Esc", description: "Fechar diálogos/modais", category: "Ajuda" },
];
