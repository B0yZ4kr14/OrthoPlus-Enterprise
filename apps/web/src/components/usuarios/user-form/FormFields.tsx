// cspell:disable
import { useFormContext } from "react-hook-form";
import { Input } from "@orthoplus/core-ui/input";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import type { UserFormValues, User } from "./types";

interface FormFieldsProps {
  user?: User | null;
}

export function FormFields({ user }: FormFieldsProps) {
  const form = useFormContext<UserFormValues>();

  return (
    <>
      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo *</FormLabel>
            <FormControl>
              <Input placeholder="Nome do usuário" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                {...field}
                disabled={!!user}
              />
            </FormControl>
            {user && (
              <FormDescription>
                O email não pode ser alterado após a criação do usuário
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{user ? "Nova Senha (opcional)" : "Senha *"}</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder={
                  user
                    ? "Deixe em branco para manter a senha atual"
                    : "Mínimo 6 caracteres"
                }
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="app_role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nível de Acesso *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="MEMBER">Membro</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Administradores têm acesso total ao sistema, incluindo
              configurações e gerenciamento de módulos
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Usuário Ativo</FormLabel>
              <FormDescription>
                Desmarque para desativar o acesso deste usuário ao sistema
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}
