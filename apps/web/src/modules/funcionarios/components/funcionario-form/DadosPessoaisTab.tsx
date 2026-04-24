import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import { AvatarUpload } from "@/components/shared/AvatarUpload";
import { Calendar } from "@orthoplus/core-ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@orthoplus/core-ui/popover";
import { formatDate } from "@/lib/utils/date.utils";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@orthoplus/core-ui/button";

interface DadosPessoaisTabProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}

export function DadosPessoaisTab({
  register,
  errors,
  setValue,
  watch,
  avatarUrl,
  setAvatarUrl,
}: DadosPessoaisTabProps) {
  const dataNascimento = watch("dataNascimento");

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <AvatarUpload
          currentAvatarUrl={avatarUrl}
          onAvatarChange={setAvatarUrl}
          fallbackText="Funcionário"
          size="lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            {...register("nome")}
            placeholder="Nome do funcionário"
          />
          {errors?.nome && (
            <p className="text-sm text-red-500">{String(errors.nome.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="email@exemplo.com"
          />
          {errors?.email && (
            <p className="text-sm text-red-500">{String(errors.email.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            {...register("cpf")}
            placeholder="000.000.000-00"
          />
          {errors?.cpf && (
            <p className="text-sm text-red-500">{String(errors.cpf.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            {...register("telefone")}
            placeholder="(00) 00000-0000"
          />
          {errors?.telefone && (
            <p className="text-sm text-red-500">{String(errors.telefone.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Data de Nascimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataNascimento && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataNascimento ? (
                  formatDate(dataNascimento)
                ) : (
                  "Selecione uma data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataNascimento ? new Date(dataNascimento) : undefined}
                onSelect={(date) =>
                  setValue("dataNascimento", date?.toISOString() || "")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Textarea
            id="endereco"
            {...register("endereco")}
            placeholder="Endereço completo"
          />
        </div>
      </div>
    </div>
  );
}
