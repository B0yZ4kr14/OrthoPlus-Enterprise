import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import { Button } from "@orthoplus/core-ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Textarea } from "@orthoplus/core-ui/textarea";
import { useProdutos } from "../../presentation/hooks";

const formSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA", "AJUSTE"]),
  quantidade: z.number().min(1, "Quantidade deve ser maior que zero"),
  motivo: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MovimentacaoFormProps {
  open: boolean;
  produtoId: string;
  onClose: () => void;
}

export const MovimentacaoForm = ({
  open,
  produtoId,
  onClose,
}: MovimentacaoFormProps) => {
  const { user } = useAuth();
  const { registrarEntrada, registrarSaida, ajustarEstoque } = useProdutos();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: "ENTRADA",
      quantidade: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user?.id) return;

    try {
      const baseInput = {
        produtoId,
        quantidade: data.quantidade,
        motivo: data.motivo,
        observacoes: data.observacoes,
        usuarioId: user.id,
      };

      switch (data.tipo) {
        case "ENTRADA":
          await registrarEntrada(baseInput);
          break;
        case "SAIDA":
          await registrarSaida(baseInput);
          break;
        case "AJUSTE":
          await ajustarEstoque({
            ...baseInput,
            novaQuantidade: data.quantidade,
          });
          break;
      }

      form.reset();
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Movimentar Estoque</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimentação *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ENTRADA">Entrada</SelectItem>
                      <SelectItem value="SAIDA">Saída</SelectItem>
                      <SelectItem value="AJUSTE">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Compra, Uso em procedimento..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Confirmar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
