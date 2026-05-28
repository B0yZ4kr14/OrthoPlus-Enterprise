import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@orthoplus/core-ui/button";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Home, SearchX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-lg border-border/50 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="rounded-full bg-primary/10 p-6">
            <SearchX className="h-16 w-16 text-primary" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Erro 404
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Página Não Encontrada
            </h1>
            <p className="mx-auto max-w-sm text-muted-foreground leading-relaxed">
              A página que você está procurando não existe ou foi movida.
              Verifique o endereço ou retorne ao dashboard.
            </p>
          </div>

          <Button asChild className="gap-2">
            <Link to="/dashboard">
              <Home className="h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
