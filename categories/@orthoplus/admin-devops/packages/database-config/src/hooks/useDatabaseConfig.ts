import { useState, useCallback, useMemo } from 'react';
import type { 
  EngineType, 
  TabType, 
  DatabaseConfig, 
  EngineInfo, 
  ConnectionTestResult, 
  ConnectionHistoryEntry
} from '../types';
import { 
  TABS, 
  DEFAULT_CONFIGS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  VALIDATION_LIMITS
} from '../constants';
import { useToast } from '@orthoplus/core-hooks';

/**
 * Hook de configuração de banco de dados
 * 
 * NOTA: A partir da versão 2.0, o OrthoPlus suporta APENAS PostgreSQL
 * em ambientes de produção. Outros engines (SQLite, MariaDB, Firebird)
 * estão disponíveis apenas para desenvolvimento e migração de dados.
 */
export function useDatabaseConfig() {
  const [activeTab, setActiveTab] = useState<TabType>('motor');
  const [selectedEngine, setSelectedEngine] = useState<EngineType>('postgresql');
  const [engineDetails, _setEngineDetails] = useState<EngineInfo | null>(null);
  
  // Configuração padrão otimizada para PostgreSQL
  const [config, setConfig] = useState<DatabaseConfig>({
    engine: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: 'orthoplus',
    username: 'orthoplus',
    password: '',
    file_path: '/var/lib/orthoplus/database.db',
    ssl_mode: 'prefer',
    charset: 'utf8'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [history, _setHistory] = useState<ConnectionHistoryEntry[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [migrationSource, setMigrationSource] = useState<EngineType>('sqlite');
  const [migrationTarget, setMigrationTarget] = useState<EngineType>('postgresql');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { showSuccess, showError } = useToast();

  const validateConfig = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (selectedEngine === 'sqlite') {
      if (!config.file_path?.trim()) {
        errors.file_path = 'Caminho do arquivo é obrigatório';
      }
    } else {
      if (!config.host?.trim()) {
        errors.host = 'Host é obrigatório';
      }
      if (!config.port || config.port < VALIDATION_LIMITS.PORT_MIN || config.port > VALIDATION_LIMITS.PORT_MAX) {
        errors.port = `Porta deve estar entre ${VALIDATION_LIMITS.PORT_MIN} e ${VALIDATION_LIMITS.PORT_MAX}`;
      }
      if (!config.database?.trim()) {
        errors.database = 'Nome do banco é obrigatório';
      }
      if (!config.username?.trim()) {
        errors.username = 'Usuário é obrigatório';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [config, selectedEngine]);

  const testConnection = useCallback(async () => {
    if (!validateConfig()) {
      return;
    }
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Simulação de teste de conexão (modo demo)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult: ConnectionTestResult = {
        success: true,
        message: 'Conexão estabelecida com sucesso (Modo Demo)',
        details: {
          version: selectedEngine === 'postgresql' ? 'PostgreSQL 15.2' : '1.0.0',
          size_mb: 45.2,
        },
        timestamp: new Date().toISOString()
      };
      
      setTestResult(mockResult);
      showSuccess(SUCCESS_MESSAGES.TEST_SUCCESS);
    } catch (error) {
      showError(ERROR_MESSAGES.CONNECTION_ERROR);
      setTestResult({
        success: false,
        message: ERROR_MESSAGES.CONNECTION_ERROR,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, [config, selectedEngine, validateConfig, showSuccess, showError]);

  const saveConfig = useCallback(async () => {
    if (!validateConfig()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      showSuccess(SUCCESS_MESSAGES.CONFIG_SAVED);
    } catch (error) {
      showError(ERROR_MESSAGES.CONNECTION_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [config, selectedEngine, validateConfig, showSuccess, showError]);

  // Lista de engines disponíveis
  // Em produção, apenas PostgreSQL é suportado
  // const isProduction = import.meta.env.MODE === 'production';
  
  const engines = useMemo(() => {
    const allEngines = [
      { id: 'postgresql' as EngineType, name: 'PostgreSQL', icon: '🐘', port: 5432, description: 'Banco de dados robusto e escalável - RECOMENDADO' },
      { id: 'sqlite' as EngineType, name: 'SQLite', icon: '📁', port: null, description: 'Apenas para desenvolvimento local' },
      { id: 'mariadb' as EngineType, name: 'MariaDB', icon: '🐬', port: 3306, description: 'Para migração de sistemas legados' },
      { id: 'firebird' as EngineType, name: 'Firebird', icon: '🔥', port: 3050, description: 'Para migração de sistemas legados' },
    ];
    
    // Em produção, mostrar PostgreSQL primeiro e destacado
    // Outros engines ficam disponíveis apenas para migração
    return allEngines;
  }, []);

  return {
    activeTab,
    setActiveTab,
    selectedEngine,
    setSelectedEngine,
    engineDetails,
    engines,
    config,
    setConfig,
    isLoading,
    testResult,
    history,
    showPassword,
    setShowPassword,
    migrationSource,
    setMigrationSource,
    migrationTarget,
    setMigrationTarget,
    formErrors,
    setFormErrors,
    validateConfig,
    testConnection,
    saveConfig,
    TABS,
    DEFAULT_CONFIGS,
  };
}
