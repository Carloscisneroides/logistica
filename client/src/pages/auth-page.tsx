import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { Loader2, Truck, Shield, Users, Zap } from "lucide-react";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
const registerSchema = insertUserSchema.pick({ username: true, email: true, password: true });

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">YCore</span>
            </div>
            <div className="text-xs text-muted-foreground/60 text-center">
              © 2025 YCore SRL Innovativa - Proprietà riservata
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {isLogin ? "Accedi" : "Registrati"}
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin 
                  ? "Inserisci le tue credenziali per accedere alla piattaforma"
                  : "Crea un nuovo account per iniziare"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLogin ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      {...loginForm.register("username")}
                      data-testid="input-username"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...loginForm.register("password")}
                      data-testid="input-password"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Accedi
                  </Button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      type="text"
                      {...registerForm.register("username")}
                      data-testid="input-reg-username"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      {...registerForm.register("email")}
                      data-testid="input-reg-email"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      {...registerForm.register("password")}
                      data-testid="input-reg-password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Registrati
                  </Button>
                </form>
              )}

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  data-testid="button-switch-mode"
                >
                  {isLogin 
                    ? "Non hai un account? Registrati" 
                    : "Hai già un account? Accedi"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="flex-1 bg-primary text-primary-foreground p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto space-y-8">
          <h1 className="text-4xl font-bold">
            Piattaforma SaaS Modulare per Spedizioni
          </h1>
          <p className="text-xl text-primary-foreground/90">
            Gestisci le tue spedizioni con AI routing, integrazione multi-corriere e fatturazione automatica.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 mt-1 text-accent" />
              <div>
                <h3 className="font-semibold">Multi-Tenant Sicuro</h3>
                <p className="text-sm text-primary-foreground/80">
                  Architettura scalabile con separazione completa dei dati
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Zap className="w-6 h-6 mt-1 text-accent" />
              <div>
                <h3 className="font-semibold">AI Routing Intelligente</h3>
                <p className="text-sm text-primary-foreground/80">
                  Selezione automatica del corriere più conveniente
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 mt-1 text-accent" />
              <div>
                <h3 className="font-semibold">Gestione Team Commerciali</h3>
                <p className="text-sm text-primary-foreground/80">
                  Provvigioni automatiche e dashboard dedicate
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
