import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { CheckCircle2, Clock, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  name: string;
  timeline: string;
  modules: string[];
  rationale: string;
  benefits: string[];
}

interface Recommendation {
  phases: Phase[];
  insights: string;
}

interface ModuleAdoptionRoadmapProps {
  recommendation: Recommendation;
  clinicProfile?: {
    patient_count: number;
    days_since_creation: number;
    active_modules_count: number;
    inactive_modules_count: number;
  };
  onActivatePhase?: (modules: string[]) => void;
}

export function ModuleAdoptionRoadmap({
  recommendation,
  clinicProfile,
  onActivatePhase,
}: ModuleAdoptionRoadmapProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/15 shadow-lg border-2 border-primary/40">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">
            Roadmap de Adoção Inteligente
          </h3>
          <p className="text-sm text-muted-foreground">
            Sequência recomendada baseada em análise IA do perfil da sua clínica
          </p>
        </div>
      </div>

      {/* Clinic Profile Summary */}
      {clinicProfile && (
        <Alert className="border-primary/30 bg-primary/5">
          <TrendingUp className="h-4 w-4 text-primary" />
          <AlertDescription>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Pacientes:</span>
                <span className="ml-2 font-semibold">
                  {clinicProfile.patient_count}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Dias de uso:</span>
                <span className="ml-2 font-semibold">
                  {clinicProfile.days_since_creation}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Módulos ativos:</span>
                <span className="ml-2 font-semibold">
                  {clinicProfile.active_modules_count}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Disponíveis:</span>
                <span className="ml-2 font-semibold">
                  {clinicProfile.inactive_modules_count}
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Insights */}
      {recommendation.insights && (
        <Card className="p-4 bg-muted/30">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Análise do Perfil
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recommendation.insights}
          </p>
        </Card>
      )}

      {/* Phases */}
      <div className="space-y-4">
        {recommendation.phases?.map((phase, index) => (
          <Card
            key={index}
            className={cn(
              "p-6 transition-all hover:shadow-lg",
              index === 0 && "border-primary/50 bg-primary/5",
            )}
          >
            <div className="space-y-4">
              {/* Phase Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg",
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg text-foreground">
                        {phase.name}
                      </h4>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {phase.timeline}
                      </Badge>
                      {index === 0 && (
                        <Badge variant="default" className="bg-primary">
                          Prioridade
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {phase.rationale}
                    </p>
                  </div>
                </div>

                {onActivatePhase && (
                  <Button
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onActivatePhase(phase.modules)}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Ativar Fase
                  </Button>
                )}
              </div>

              {/* Modules */}
              <div>
                <h5 className="text-sm font-semibold mb-2 text-foreground">
                  Módulos desta fase:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {phase.modules.map((module, mIndex) => (
                    <Badge key={mIndex} variant="secondary" className="text-xs">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              {phase.benefits && phase.benefits.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold mb-2 text-foreground">
                    Benefícios esperados:
                  </h5>
                  <ul className="space-y-1">
                    {phase.benefits.map((benefit, bIndex) => (
                      <li
                        key={bIndex}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
