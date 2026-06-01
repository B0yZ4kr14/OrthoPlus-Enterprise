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
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@orthoplus/core-ui/button";

interface Props {
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
}: Props) {
  const dataNascimento = watch("dataNascimento");

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <AvatarUpload
          currentAvatarUrl={avatarUrl}
          onAvatarChange={setAvatarUrl}
          fallbackText="Dentista"
          size="lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dentista-nome">Nome *</Label>
          <Input id="dentista-nome" {...register("nome")} placeholder="Nome completo" />
          {errors?.nome && (
            <p className="text-sm text-destructive">
              {String(errors.nome.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dentista-email">Email *</Label>
          <Input
            id="dentista-email"
            type="email"
            {...register("email")}
            placeholder="email@exemplo.com"
          />
          {errors?.email && (
            <p className="text-sm text-destructive">
              {String(errors.email.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dentista-cro">CRO *</Label>
          <Input id="dentista-cro" {...register("cro")} placeholder="00000" />
          {errors?.cro && (
            <p className="text-sm text-destructive">
              {String(errors.cro.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dentista-telefone">Telefone *</Label>
          <Input id="dentista-telefone" {...register("telefone")} placeholder="(00) 00000-0000" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data-nascimento">Data de Nascimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="data-nascimento"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataNascimento && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataNascimento
                  ? format(new Date(dataNascimento), "dd/MM/yyyy", {
                      locale: ptBR,
                    })
                  : "Selecione"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataNascimento ? new Date(dataNascimento) : undefined}
                onSelect={(date) =>
                  setValue("dataNascimento", date?.toISOString() || "")
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sobre-dentista">Sobre</Label>
          <Textarea
            id="sobre-dentista"
            {...register("sobre")}
            placeholder="Descrição do dentista"
          />
        </div>
      </div>
    </div>
  );
}
