// cspell:disable
import { useEffect } from "react";
import { useConfiguracaoBancaria } from "./useConfiguracaoBancaria";
import { Header } from "./Header";
import { ConfigForm } from "./ConfigForm";
import { ConfigList } from "./ConfigList";

export function ConfiguracaoBancaria() {
  const {
    configs,
    loading,
    editando,
    bancos,
    loadConfigs,
    handleSave,
    handleSincronizar,
    handleDelete,
    updateEditando,
    startNewConfig,
    setEditando,
  } = useConfiguracaoBancaria();

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  return (
    <div className="space-y-6">
      <Header onNewConfig={startNewConfig} />

      {editando && (
        <ConfigForm
          editando={editando}
          bancos={bancos}
          loading={loading}
          onSave={handleSave}
          onCancel={() => setEditando(null)}
          onChange={updateEditando}
        />
      )}

      <ConfigList
        configs={configs}
        loading={loading}
        onEdit={setEditando}
        onSync={handleSincronizar}
        onDelete={handleDelete}
      />
    </div>
  );
}
