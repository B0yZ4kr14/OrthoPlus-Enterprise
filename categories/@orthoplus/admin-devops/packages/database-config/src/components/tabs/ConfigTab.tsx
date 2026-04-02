import { Key, Play, Save, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@orthoplus/core-ui/button';
import { Input } from '@orthoplus/core-ui/input';
import { Label } from '@orthoplus/core-ui/label';
import type { EngineType, DatabaseConfig, ConnectionTestResult } from '../../types';
import { VALIDATION_LIMITS } from '../../constants';

interface ConfigTabProps {
  selectedEngine: EngineType;
  config: DatabaseConfig;
  setConfig: (config: DatabaseConfig) => void;
  formErrors: Record<string, string>;
  setFormErrors: (errors: Record<string, string>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isLoading: boolean;
  testResult: ConnectionTestResult | null;
  onSave: () => void;
  onTest: () => void;
}

export function ConfigTab({
  selectedEngine,
  config,
  setConfig,
  formErrors,
  setFormErrors,
  showPassword,
  setShowPassword,
  isLoading,
  testResult,
  onSave,
  onTest,
}: ConfigTabProps) {
  const handleChange = (field: keyof DatabaseConfig, value: string | number) => {
    setConfig({ ...config, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  return (
    <div className="space-y-5">
      {selectedEngine === 'sqlite' ? (
        // Configuração SQLite
        <div>
          <Label className="text-warning">Caminho do Arquivo</Label>
          <Input
            type="text"
            value={config.file_path || ''}
            onChange={(e) => handleChange('file_path', e.target.value)}
            className="mt-2"
            placeholder="/var/lib/orthoplus/database.db"
          />
          {formErrors.file_path && (
            <p className="text-destructive text-xs mt-1">{formErrors.file_path}</p>
          )}
        </div>
      ) : (
        // Configuração de servidores
        <>
          <div>
            <Label className="text-warning">Host</Label>
            <Input
              type="text"
              value={config.host}
              onChange={(e) => handleChange('host', e.target.value)}
              className="mt-2"
              placeholder="localhost"
            />
            {formErrors.host && (
              <p className="text-destructive text-xs mt-1">{formErrors.host}</p>
            )}
          </div>

          <div>
            <Label className="text-warning">Porta</Label>
            <Input
              type="number"
              value={config.port}
              onChange={(e) => handleChange('port', parseInt(e.target.value) || 0)}
              className="mt-2"
              min={VALIDATION_LIMITS.PORT_MIN}
              max={VALIDATION_LIMITS.PORT_MAX}
            />
            {formErrors.port && (
              <p className="text-destructive text-xs mt-1">{formErrors.port}</p>
            )}
          </div>

          <div>
            <Label className="text-warning">Banco de Dados</Label>
            <Input
              type="text"
              value={config.database}
              onChange={(e) => handleChange('database', e.target.value)}
              className="mt-2"
              placeholder="orthoplus"
            />
            {formErrors.database && (
              <p className="text-destructive text-xs mt-1">{formErrors.database}</p>
            )}
          </div>

          <div>
            <Label className="text-warning">Usuário</Label>
            <Input
              type="text"
              value={config.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="mt-2"
              placeholder={selectedEngine === 'postgresql' ? 'postgres' : 'root'}
            />
            {formErrors.username && (
              <p className="text-destructive text-xs mt-1">{formErrors.username}</p>
            )}
          </div>

          <div>
            <Label className="text-warning">Senha</Label>
            <div className="relative mt-2">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={config.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                type="button"
              >
                <Key className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onSave}
          disabled={isLoading}
          variant="secondary"
          className="flex-1"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Salvar Configuração
        </Button>
        <Button
          onClick={onTest}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          Testar Conexão
        </Button>
      </div>

      {/* Alerta Modo Demo */}
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <p className="text-warning text-sm">
          Modo Demo: Conexão será simulada
        </p>
      </div>

      {/* Resultado do Teste */}
      {testResult && (
        <div className={`p-4 rounded-lg ${
          testResult.success 
            ? 'bg-success/10 border border-success/30' 
            : 'bg-destructive/10 border border-destructive/30'
        }`}>
          <p className={testResult.success ? 'text-success' : 'text-destructive'}>
            {testResult.message}
          </p>
          {testResult.details && (
            <div className="mt-2 text-sm text-muted-foreground">
              {testResult.details.version && <p>Versão: {testResult.details.version}</p>}
              {testResult.details.size_mb && <p>Tamanho: {testResult.details.size_mb} MB</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ConfigTab
