import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { CreateProdutoInput } from "../../application/use-cases";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  categoria: z.enum([
    "MATERIAL",
    "MEDICAMENTO",
    "EQUIPAMENTO",
    "CONSUMIVEL",
    "OUTRO",
  ]),
  unidadeMedida: z.enum([
    "UNIDADE",
    "CAIXA",
    "PACOTE",
    "LITRO",
    "ML",
    "GRAMA",
    "KG",
  ]),
  quantidadeAtual: z.number().min(0, "Quantidade deve ser positiva"),
  quantidadeMinima: z.number().min(0, "Quantidade mínima deve ser positiva"),
  valorUnitario: z.number().min(0, "Valor deve ser positivo"),
  codigoBarras: z.string().optional(),
  fornecedor: z.string().optional(),
  localizacao: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProdutoFormProps {
  open: boolean;
  onClose: () => void;
}

export const ProdutoForm = ({ open, onClose }: ProdutoFormProps) => {
  const { createProduto, isCreating } = useProdutos();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      categoria: "MATERIAL",
      unidadeMedida: "UNIDADE",
      quantidadeAtual: 0,
      quantidadeMinima: 0,
      valorUnitario: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createProduto(data as CreateProdutoInput);
      form.reset();
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
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
                        <SelectItem value="MATERIAL">Material</SelectItem>
                        <SelectItem value="MEDICAMENTO">Medicamento</SelectItem>
                        <SelectItem value="EQUIPAMENTO">Equipamento</SelectItem>
                        <SelectItem value="CONSUMIVEL">Consumível</SelectItem>
                        <SelectItem value="OUTRO">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidadeMedida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade *</FormLabel>
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
                        <SelectItem value="UNIDADE">Unidade</SelectItem>
                        <SelectItem value="CAIXA">Caixa</SelectItem>
                        <SelectItem value="PACOTE">Pacote</SelectItem>
                        <SelectItem value="LITRO">Litro</SelectItem>
                        <SelectItem value="ML">ML</SelectItem>
                        <SelectItem value="GRAMA">Grama</SelectItem>
                        <SelectItem value="KG">KG</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantidadeAtual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qtd. Atual *</FormLabel>
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
                name="quantidadeMinima"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qtd. Mínima *</FormLabel>
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
                name="valorUnitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Unit. *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="codigoBarras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Barras</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fornecedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="localizacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
