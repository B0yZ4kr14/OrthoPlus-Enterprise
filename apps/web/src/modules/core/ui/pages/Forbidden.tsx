import { useNavigate } from "react-router-dom";
import { Button } from "@orthoplus/core-ui/button";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-lg border-border/50 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Erro 403
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Acesso Negado
            </h1>
            <p className="mx-auto max-w-sm text-muted-foreground leading-relaxed">
              Você não tem permissão para acessar este módulo. Entre em contato
              com o administrador da clínica se acredita que isso é um erro.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={() => navigate("/")} className="gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
