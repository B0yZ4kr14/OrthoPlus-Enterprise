// cspell:disable
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";

interface BadgesTabProps {
  onCreateBadge: () => void;
}

export function BadgesTab({ onCreateBadge }: BadgesTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Badges Compartilháveis</CardTitle>
        <Button onClick={onCreateBadge}>Criar Badge</Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Configure badges que pacientes podem conquistar e compartilhar
          nas redes sociais
        </p>
      </CardContent>
    </Card>
  );
}
