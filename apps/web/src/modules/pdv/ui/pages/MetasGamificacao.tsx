import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { Card } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Progress } from "@orthoplus/core-ui/progress";
import { PageHeader } from "@/components/shared/PageHeader";
import { Trophy, Target, TrendingUp, Award, Medal, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MetasGamificacao() {
  const { user, clinicId } = useAuth();
  const { toast } = useToast();
  const [metas, setMetas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [periodoRanking, setPeriodoRanking] = useState("MES");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinicId) {
      loadData();
    }
  }, [clinicId, periodoRanking]);

  const loadData = async () => {
    try {
      setLoading(true);

      const hoje = new Date().toISOString().split("T")[0];

      // Carregar todas as informações do endpoint consolidado
      const data = await apiClient.get<Record<string, any>>("/pdv/metas-gamificacao", {
        params: {
          clinicId,
          userId: user?.id,
          periodoRanking,
          dataReferencia: hoje,
        },
      });

      setMetas(data.metas || []);
      setRanking(data.ranking || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de metas e ranking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge: string) => {
    if (badge === "OURO") return <Crown className="h-5 w-5 text-yellow-500" />;
    if (badge === "PRATA") return <Medal className="h-5 w-5 text-gray-400" />;
    if (badge === "BRONZE") return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getStatusColor = (status: string) => {
    if (status === "ATINGIDA") return "success";
    if (status === "SUPERADA") return "info";
    if (status === "NAO_ATINGIDA") return "error";
    return "default";
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Metas e Gamificação"
        description="Acompanhe suas metas, conquistas e posição no ranking"
        // @ts-expect-error - Auto-healer: TS2322 - Type 'Element' is not assignable to type...
        icon={<Trophy />}
      />

      {/* Minhas Metas */}
      <Card depth="normal" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Minhas Metas</h2>
        </div>

        <div className="space-y-4">
          {metas.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma meta cadastrada</p>
          ) : (
            metas.map((meta) => (
              // @ts-expect-error - Auto-healer: TS2339 - Property 'id' does not exist on type 'ne...
              <Card key={meta.id} depth="subtle" className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        // @ts-expect-error - Auto-healer: TS2339 - Property 'periodo_inicio' does not exist...
                        {new Date(meta.periodo_inicio).toLocaleDateString(
                          "pt-BR",
                        )}{" "}
                        até{" "}
                        // @ts-expect-error - Auto-healer: TS2339 - Property 'periodo_fim' does not exist on...
                        {new Date(meta.periodo_fim).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        // @ts-expect-error - Auto-healer: TS2339 - Property 'meta_valor' does not exist on ...
                        Meta: R$ {parseFloat(meta.meta_valor).toFixed(2)}
                      </p>
                    </div>
                    // @ts-expect-error - Auto-healer: TS2339 - Property 'status' does not exist on type...
                    <Badge variant={getStatusColor(meta.status)}>
                      // @ts-expect-error - Auto-healer: TS2339 - Property 'status' does not exist on type...
                      {meta.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">
                        // @ts-expect-error - Auto-healer: TS2339 - Property 'percentual_atingido' does not ...
                        {meta.percentual_atingido}%
                      </span>
                    </div>
                    // @ts-expect-error - Auto-healer: TS2339 - Property 'percentual_atingido' does not ...
                    <Progress value={parseFloat(meta.percentual_atingido)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vendas</p>
                      <p className="font-medium">
                        // @ts-expect-error - Auto-healer: TS2339 - Property 'meta_quantidade' does not exis...
                        // @ts-expect-error - Auto-healer: TS2339 - Property 'quantidade_atingida' does not ...
                        {meta.quantidade_atingida} / {meta.meta_quantidade}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Atingido</p>
                      <p className="font-medium">
                        // @ts-expect-error - Auto-healer: TS2339 - Property 'valor_atingido' does not exist...
                        R$ {parseFloat(meta.valor_atingido).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  // @ts-expect-error - Auto-healer: TS2339 - Property 'premiacao' does not exist on t...
                  {meta.premiacao && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                      <Award className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          // @ts-expect-error - Auto-healer: TS2339 - Property 'premiacao' does not exist on t...
                          {meta.premiacao.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          // @ts-expect-error - Auto-healer: TS2339 - Property 'premiacao' does not exist on t...
                          {meta.premiacao.descricao}
                        </p>
                      </div>
                      // @ts-expect-error - Auto-healer: TS2339 - Property 'premiacao_paga' does not exist...
                      {meta.premiacao_paga ? (
                        <Badge variant="success">Pago</Badge>
                      ) : (
                        <Badge variant="warning">Pendente</Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Ranking */}
      <Card depth="normal" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Ranking de Vendedores</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant={periodoRanking === "DIA" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriodoRanking("DIA")}
            >
              Dia
            </Button>
            <Button
              variant={periodoRanking === "SEMANA" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriodoRanking("SEMANA")}
            >
              Semana
            </Button>
            <Button
              variant={periodoRanking === "MES" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriodoRanking("MES")}
            >
              Mês
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {ranking.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhum dado de ranking disponível
            </p>
          ) : (
            ranking.map((item) => (
              <Card
                // @ts-expect-error - Auto-healer: TS2339 - Property 'id' does not exist on type 'ne...
                key={item.id}
                depth="subtle"
                // @ts-expect-error - Auto-healer: TS2339 - Property 'vendedor_id' does not exist on...
                className={`p-4 ${item.vendedor_id === user?.id ? "border-2 border-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      // @ts-expect-error - Auto-healer: TS2339 - Property 'badge' does not exist on type ...
                      {getBadgeIcon(item.badge)}
                      <span className="text-2xl font-bold text-muted-foreground">
                        // @ts-expect-error - Auto-healer: TS2339 - Property 'posicao' does not exist on typ...
                        #{item.posicao}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        // @ts-expect-error - Auto-healer: TS2339 - Property 'vendedor' does not exist on ty...
                        {item.vendedor?.full_name || "Vendedor"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        // @ts-expect-error - Auto-healer: TS2339 - Property 'pontos' does not exist on type...
                        {item.pontos} pontos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      // @ts-expect-error - Auto-healer: TS2339 - Property 'total_vendas' does not exist o...
                      R$ {parseFloat(item.total_vendas).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      // @ts-expect-error - Auto-healer: TS2339 - Property 'quantidade_vendas' does not ex...
                      {item.quantidade_vendas} vendas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      // @ts-expect-error - Auto-healer: TS2339 - Property 'ticket_medio' does not exist o...
                      Ticket: R$ {parseFloat(item.ticket_medio).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
