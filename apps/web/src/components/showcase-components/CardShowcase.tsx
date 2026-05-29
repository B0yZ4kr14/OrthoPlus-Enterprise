import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";

export function CardShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>
            Variante padrão sem efeitos especiais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Card básico com background padrão e border sutil.
          </p>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>Com sombra profunda e hover effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Card elevado com sombra e transição suave no hover.
          </p>
        </CardContent>
      </Card>

      <Card variant="gradient">
        <CardHeader>
          <CardTitle>Gradient Card</CardTitle>
          <CardDescription>Com shimmer effect animado</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Card com gradiente e efeito shimmer constante.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
