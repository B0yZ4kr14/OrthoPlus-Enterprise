import { useState } from "react";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { CategoriaContaPagar } from "@/domain/entities/ContaPagar";

interface ContaPagarFormProps {
  onSubmit: (data: unknown) => void;
}

export function ContaPagarForm({ onSubmit }: ContaPagarFormProps) {
  const [descricao, setDescricao] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [categoria, setCategoria] = useState<CategoriaContaPagar>("FORNECEDOR");
  const [valor, setValor] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      descricao,
      fornecedor,
      categoria,
      valor: parseFloat(valor),
      dataVencimento: new Date(dataVencimento),
      observacoes: observacoes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="fornecedor">Fornecedor</Label>
        <Input
          id="fornecedor"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="categoria">Categoria</Label>
        <Select
          value={categoria}
          onValueChange={(value) => setCategoria(value as CategoriaContaPagar)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALUGUEL">Aluguel</SelectItem>
            <SelectItem value="FOLHA_PAGAMENTO">Folha de Pagamento</SelectItem>
            <SelectItem value="FORNECEDOR">Fornecedor</SelectItem>
            <SelectItem value="SERVICOS">Serviços</SelectItem>
            <SelectItem value="IMPOSTOS">Impostos</SelectItem>
            <SelectItem value="MARKETING">Marketing</SelectItem>
            <SelectItem value="EQUIPAMENTOS">Equipamentos</SelectItem>
            <SelectItem value="OUTROS">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="valor">Valor</Label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="dataVencimento">Data de Vencimento</Label>
        <Input
          id="dataVencimento"
          type="date"
          value={dataVencimento}
          onChange={(e) => setDataVencimento(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        Criar Conta a Pagar
      </Button>
    </form>
  );
}
