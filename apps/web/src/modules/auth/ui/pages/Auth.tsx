import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, Key, Eye, EyeOff } from "lucide-react";
import { CardTopBorder } from "@/components/shared/CardTopBorder";

const loginSchema = z.object({
  email: z.string().min(1, "Informe seu email ou usuário"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const signupSchema = z
  .object({
    fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Informe um email válido"),
    password: z
      .string()
      .min(12, "Senha deve ter no mínimo 12 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
      .regex(/\d/, "Senha deve conter pelo menos um número")
      .regex(
        /[@$!%*?&#]/,
        "Senha deve conter pelo menos um símbolo (@$!%*?&#)",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, signIn, signUp, signInPatient } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const patientLoginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    const identifier = values.email.includes("@")
      ? values.email.toLowerCase()
      : values.email.toLowerCase() + "@orthoplus.com";
    setIsLoading(true);
    try {
      // Use AuthContext signIn — it saves tokens to localStorage AND updates global user state.
      // The useEffect above (line 95-99) will redirect to /dashboard when user becomes non-null.
      const { error } = await signIn(identifier, values.password);
      if (error) {
        toast.error("Erro ao fazer login", {
          description: "Email ou senha incorretos",
        });
      }
      // On success, signIn updated user state → useEffect will navigate automatically.
      // No manual navigate needed here.
    } catch (e) {
      console.error("Login error:", e);
      toast.error("Erro ao fazer login", {
        description: "Não foi possível conectar ao servidor. Tente novamente.",
      });
    }
    setIsLoading(false);
  };

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    const { error } = await signUp(
      values.email,
      values.password,
      values.fullName,
    );
    setIsLoading(false);

    if (!error) {
      signupForm.reset();
    }
  };

  const handlePatientLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    const { error } = await signInPatient(values.email, values.password);
    setIsLoading(false);

    if (!error) {
      navigate("/portal-paciente");
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card shadow-[0_0_40px_rgba(0,0,0,0.08)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <CardHeader className="space-y-6 text-center pb-2 relative overflow-hidden">
          <CardTopBorder color="interactive" opacity={40} />
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          {/* Logo OrthoPlus Enterprise */}
          <div className="flex flex-col items-center space-y-2">
            <img
              src="/OrthoPlus-Enterprise/orthoplus-logo-enterprise.svg"
              alt="OrthoPlus Enterprise"
              className="h-12 w-auto dark:brightness-200 dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
            />
            <div className="text-xs font-medium text-interactive tracking-[0.3em] uppercase">
              Clínicas Odontológicas
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Bem-vindo ao OrthoPlus Enterprise
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sistema de Gestão para Clínicas Odontológicas
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 dark:bg-muted dark:border-border">
              <TabsTrigger value="login">Equipe</TabsTrigger>
              <TabsTrigger value="patient">Paciente</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Acesso para dentistas, recepcionistas e administradores
              </p>
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Email ou Usuário
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="seu@email.com ou usuário"
                              className="pl-10"
                              {...field}
                              disabled={isLoading}
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10"
                              {...field}
                              disabled={isLoading}
                            />
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    variant="default"
                    className="w-full shadow-[0_0_16px_hsl(var(--interactive)/0.2)] hover:shadow-[0_0_24px_hsl(var(--interactive)/0.3)] transition-shadow duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm text-interactive hover:text-interactive/80"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Esqueceu sua senha?
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup">
              <Form {...signupForm}>
                <form
                  onSubmit={signupForm.handleSubmit(handleSignup)}
                  className="space-y-4"
                >
                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu nome completo"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com ou usuário"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <PasswordStrengthIndicator password={field.value} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
