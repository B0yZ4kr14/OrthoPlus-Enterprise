// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";

interface FilterControlsProps {
  filterUser: string;
  filterAction: string;
  uniqueUsers: string[];
  onUserChange: (value: string) => void;
  onActionChange: (value: string) => void;
}

export function FilterControls({
  filterUser,
  filterAction,
  uniqueUsers,
  onUserChange,
  onActionChange,
}: FilterControlsProps) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-1">
        <Select value={filterUser} onValueChange={onUserChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os usuários</SelectItem>
            {uniqueUsers.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Select value={filterAction} onValueChange={onActionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            <SelectItem value="PERMISSION_GRANTED">
              Permissão Concedida
            </SelectItem>
            <SelectItem value="PERMISSION_REVOKED">
              Permissão Revogada
            </SelectItem>
            <SelectItem value="TEMPLATE_APPLIED">Template Aplicado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
