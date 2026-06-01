import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { UserPlus } from "lucide-react";
import type { AddUserDialogProps } from "./types";
import { useAddUserForm } from "./hooks/useAddUserForm";
import { UserFormField } from "./components/UserFormField";
import { RoleSelect } from "./components/RoleSelect";

export * from "./types";
export { useAddUserForm, UserFormField, RoleSelect };

export function AddUserDialog({
  isOpen,
  onOpenChange,
  onSubmit,
}: AddUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { formData, updateField, handleSubmit } = useAddUserForm(onSubmit);

  const wrappedHandleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    try {
      await handleSubmit(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" onClick={() => onOpenChange(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Usuário</DialogTitle>
          <DialogDescription>
            Crie uma nova conta de usuário para a clínica
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={wrappedHandleSubmit} className="space-y-4">
          <UserFormField
            label="Nome"
            value={formData.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Nome completo"
            required
          />
          <UserFormField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => updateField("email", value)}
            placeholder="email@exemplo.com"
            required
          />
          <UserFormField
            label="Senha"
            type="password"
            value={formData.password}
            onChange={(value) => updateField("password", value)}
            placeholder="••••••••"
            required
          />
          <RoleSelect
            value={formData.role}
            onChange={(value) => updateField("role", value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
