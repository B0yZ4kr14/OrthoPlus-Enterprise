import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { ArrowLeft } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { ForgotPasswordValues } from "./types";

interface ForgotPasswordFormProps {
  form: UseFormReturn<ForgotPasswordValues>;
  isLoading: boolean;
  onSubmit: (values: ForgotPasswordValues) => void;
  onBack: () => void;
}

export function ForgotPasswordForm({
  form,
  isLoading,
  onSubmit,
  onBack,
}: ForgotPasswordFormProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Recuperar Senha</CardTitle>
        <CardDescription>
          Digite seu email para receber um link de redefinição de senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onBack}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
