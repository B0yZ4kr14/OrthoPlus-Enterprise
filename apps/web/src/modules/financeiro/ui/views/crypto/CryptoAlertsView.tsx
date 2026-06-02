import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Switch } from "@orthoplus/core-ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { TrendingDown, Plus, Trash2 } from "lucide-react";
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import { CryptoPriceAlertForm } from "@/modules/crypto/components/CryptoPriceAlertForm";
import { CascadeAlertWizard } from "@/modules/crypto/components/CascadeAlertWizard";
import { LoadingState } from "@/components/shared/LoadingState";

export interface CryptoAlertsViewProps {
  alerts: any[]; // Using the generic array type mapping from useCryptoPriceAlerts for now
  alertsLoading: boolean;
  cascadeWizardOpen: boolean;
  setCascadeWizardOpen: (open: boolean) => void;
  alertDialogOpen: boolean;
  setAlertDialogOpen: (open: boolean) => void;
  handleCascadeSubmit: (data: any) => Promise<void>;
  handleAlertSubmit: (data: any) => Promise<void>;
  toggleAlert: (id: string, currentStatus: boolean) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
}

export function CryptoAlertsView({
  alerts,
  alertsLoading,
  cascadeWizardOpen,
  setCascadeWizardOpen,
  alertDialogOpen,
  setAlertDialogOpen,
  handleCascadeSubmit,
  handleAlertSubmit,
  toggleAlert,
  deleteAlert,
}: CryptoAlertsViewProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Alertas de Preço e Estratégias DCA
        </h3>
        <div className="flex gap-2">
          <Dialog open={cascadeWizardOpen} onOpenChange={setCascadeWizardOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <TrendingDown className="h-4 w-4 mr-2" />
                Estratégia DCA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Estratégia DCA em Cascata</DialogTitle>
              </DialogHeader>
              <CascadeAlertWizard
                onSubmit={handleCascadeSubmit}
                onCancel={() => setCascadeWizardOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Alerta Simples
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Configurar Alerta de Preço</DialogTitle>
              </DialogHeader>
              <CryptoPriceAlertForm
                onSubmit={handleAlertSubmit}
                onCancel={() => setAlertDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {alertsLoading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <LoadingState message="Carregando alertas..." />
          </CardContent>
        </Card>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum alerta configurado. Crie um alerta para ser notificado quando
            as taxas atingirem valores específicos.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(() => {
            const cascadeGroups = new Map<string | null, typeof alerts>();
            alerts.forEach((alert) => {
              const groupId = alert.cascade_enabled
                ? alert.cascade_group_id || null
                : null;
              const currentGroup = cascadeGroups.get(groupId);
              if (!currentGroup) {
                cascadeGroups.set(groupId, [alert]);
              } else {
                currentGroup.push(alert);
              }
            });

            return Array.from(cascadeGroups.entries()).map(
              ([groupId, groupAlerts]) => {
                const isCascade = groupId !== null;
                const sortedAlerts = isCascade
                  ? [...groupAlerts].sort(
                      (a, b) => (a.cascade_order || 0) - (b.cascade_order || 0),
                    )
                  : groupAlerts;

                if (isCascade) {
                  return (
                    <Card
                      key={groupId}
                      className="border-primary/30 bg-primary/5"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-primary">
                            Estratégia DCA em Cascata
                          </span>
                          <Badge variant="outline" className="ml-auto">
                            {sortedAlerts.length} níveis
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {sortedAlerts.map((alert, idx) => (
                            <div
                              key={alert.id}
                              className="flex items-center gap-2 p-3 bg-background rounded-lg border"
                            >
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">
                                {alert.cascade_order}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {alert.coin_type}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    R${" "}
                                    {alert.target_rate_brl.toLocaleString(
                                      "pt-BR",
                                      { minimumFractionDigits: 2 },
                                    )}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {alert.conversion_percentage}%
                                  </Badge>
                                </div>
                                {alert.last_triggered_at && (
                                  <span className="text-xs text-muted-foreground">
                                    ✓ Disparado:{" "}
                                    {format(
                                      new Date(alert.last_triggered_at),
                                      "dd/MM HH:mm",
                                      { locale: ptBR },
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Switch
                                  checked={alert.is_active}
                                  onCheckedChange={() =>
                                    toggleAlert(alert.id, alert.is_active)
                                  }
                                  disabled={
                                    idx > 0 &&
                                    !sortedAlerts[idx - 1].last_triggered_at
                                  }
                                />
                                <Button type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteAlert(alert.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return sortedAlerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{alert.coin_type}</Badge>
                            <Badge
                              variant={
                                alert.alert_type === "BELOW"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {alert.alert_type === "BELOW"
                                ? "Abaixo de"
                                : "Acima de"}{" "}
                              R${" "}
                              {alert.target_rate_brl.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </Badge>
                            {alert.stop_loss_enabled && (
                              <Badge variant="destructive" className="text-xs">
                                Stop-Loss {alert.conversion_percentage}%
                              </Badge>
                            )}
                            {alert.last_triggered_at && (
                              <Badge variant="secondary">
                                Disparado:{" "}
                                {format(
                                  new Date(alert.last_triggered_at),
                                  "dd/MM HH:mm",
                                  { locale: ptBR },
                                )}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Notificações:{" "}
                              {alert.notification_method.join(", ")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.is_active}
                            onCheckedChange={() =>
                              toggleAlert(alert.id, alert.is_active)
                            }
                          />
                          <Button type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAlert(alert.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ));
              },
            );
          })()}
        </div>
      )}
    </>
  );
}
