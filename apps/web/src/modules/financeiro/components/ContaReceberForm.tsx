import { useState } from "react";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";

interface ContaReceberFormProps {
  onSubmit: (data: unknown) => void;
}

export function ContaReceberForm({ onSubmit }: ContaReceberFormProps) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      descricao,
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
        Criar Conta a Receber
      </Button>
    </form>
  );
}
