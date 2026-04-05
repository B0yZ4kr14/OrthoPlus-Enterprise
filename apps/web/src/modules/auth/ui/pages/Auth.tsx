import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
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
import { Mail, Key } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const signupSchema = z
  .object({
    fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
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
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    const { error } = await signIn(values.email, values.password);
    setIsLoading(false);

    if (!error) {
      navigate("/");
    }
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 shadow-2xl shadow-cyan-500/10">
        <CardHeader className="space-y-6 text-center pb-2">
          {/* Logo Ortho+ */}
          <div className="flex flex-col items-center space-y-2">
            <div className="text-4xl font-bold text-white tracking-tight">
              Ortho<span className="text-cyan-400">+</span>
            </div>
            <div className="text-xs font-medium text-cyan-400 tracking-[0.3em] uppercase">
              Clínicas Odontológicas
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-white">
              Bem-vindo ao Ortho+
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sistema de Gestão para Clínicas Odontológicas
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 p-1">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
              >
                Equipe
              </TabsTrigger>
              <TabsTrigger 
                value="patient"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
              >
                Paciente
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
              >
                Cadastro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <p className="text-sm text-slate-400 text-center">
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
                        <FormLabel className="text-slate-300">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 pl-10"
                              {...field}
                              disabled={isLoading}
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
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
                        <FormLabel className="text-slate-300">Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 pl-10"
                              {...field}
                              disabled={isLoading}
                            />
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/25" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm text-cyan-400 hover:text-cyan-300"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Esqueceu sua senha?
                  </Button>

                  <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-center text-slate-300">
                      Login Padrão de Administrador
                    </p>
                    <div className="text-xs space-y-1 text-slate-400">
                      <p>
                        <span className="font-medium text-slate-300">Email:</span>{" "}
                        admin@orthoplus.com
                      </p>
                      <p>
                        <span className="font-medium text-slate-300">Senha:</span> Admin123!
                      </p>
                    </div>
                  </div>
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
                            placeholder="seu@email.com"
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
