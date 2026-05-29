import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { ButtonShowcase } from "./ButtonShowcase";
import { BadgeShowcase } from "./BadgeShowcase";
import { CardShowcase } from "./CardShowcase";

export function ShowcaseComponents() {
  return (
    <div className="space-y-8">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Variantes de Botões</CardTitle>
          <CardDescription>
            Todas as variantes disponíveis com micro-interações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonShowcase />
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Variantes de Badges</CardTitle>
          <CardDescription>
            Todas as variantes disponíveis com shimmer effect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeShowcase />
        </CardContent>
      </Card>

      <CardShowcase />
    </div>
  );
}
