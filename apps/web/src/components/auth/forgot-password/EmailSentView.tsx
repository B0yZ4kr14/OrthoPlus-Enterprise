import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { CheckCircle2, Mail, ArrowLeft } from "lucide-react";

interface EmailSentViewProps {
  email: string;
  onBack: () => void;
}

export function EmailSentView({ email, onBack }: EmailSentViewProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <CardTitle>Email Enviado!</CardTitle>
        <CardDescription>
          Enviamos um link para redefinição de senha para <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Verifique sua caixa de entrada e sua pasta de spam. O link expira em 1 hora.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Login
        </Button>
      </CardContent>
    </Card>
  );
}
