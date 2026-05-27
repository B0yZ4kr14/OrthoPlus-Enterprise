import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@orthoplus/core-ui/table";
import { Badge } from "@orthoplus/core-ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@orthoplus/core-ui/dialog";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { useTISSGlosas } from "../../application/hooks/useTISSGlosas";
import { useState } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export function TISSGlosasManager() {
  const { glosas, isLoading, registerGlosa, reprocessarGlosa } = useTISSGlosas();
  const [selectedGlosa, setSelectedGlosa] = useState<string | null>(null);
  const [glosaReason, setGlosaReason] = useState("");
  const [glosaAmount, setGlosaAmount] = useState("");

  const handleRegistrarGlosa = (id: string) => {
    registerGlosa({ id, data: { glosa_amount: Number(glosaAmount), glosa_reason: glosaReason, glosa_date: new Date().toISOString() } });
    setSelectedGlosa(null);
    setGlosaReason("");
    setGlosaAmount("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Glosas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Carregando glosas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Gestão de Glosas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {glosas.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            Nenhuma guia glosada encontrada.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Guia</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Procedimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Valor Glosado</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {glosas.map((glosa) => (
                <TableRow key={glosa.id}>
                  <TableCell>{glosa.guide_number}</TableCell>
                  <TableCell>{glosa.insurance_company}</TableCell>
                  <TableCell>{glosa.procedure_name}</TableCell>
                  <TableCell>R$ {(glosa.amount / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    {glosa.glosa_amount ? `R$ ${(glosa.glosa_amount / 100).toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{glosa.glosa_reason || "Não informado"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedGlosa(glosa.id)}>
                            Registrar Glosa
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Registrar Glosa - Guia {glosa.guide_number}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="glosaReason">Motivo da Glosa</Label>
                              <Input
                                id="glosaReason"
                                value={glosaReason}
                                onChange={(e) => setGlosaReason(e.target.value)}
                                placeholder="Ex: Procedimento não coberto"
                              />
                            </div>
                            <div>
                              <Label htmlFor="glosaAmount">Valor Glosado (centavos)</Label>
                              <Input
                                id="glosaAmount"
                                type="number"
                                value={glosaAmount}
                                onChange={(e) => setGlosaAmount(e.target.value)}
                                placeholder="Ex: 5000"
                              />
                            </div>
                            <Button onClick={() => handleRegistrarGlosa(glosa.id)}>
                              Salvar Glosa
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reprocessarGlosa(glosa.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reprocessar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
