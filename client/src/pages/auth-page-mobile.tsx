import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceInterface } from "@/hooks/use-device-interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { Loader2, Shield, Download } from "lucide-react";
import ycoreLogo from "@assets/Copilot_20250928_191905_1759079989814.png";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
type LoginData = z.infer<typeof loginSchema>;

export default function AuthPageMobile() {
  const { user, isLoading, loginMutation } = useAuth();
  const { isApp } = useDeviceInterface();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
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

  // MOBILE APP-NATIVE LOGIN
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Mobile Header */}
      <div className="bg-primary px-6 py-8 text-center text-white safe-area-top">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <img src={ycoreLogo} alt="YCORE" className="w-10 h-10" />
          <h1 className="text-2xl font-bold">YCORE</h1>
        </div>
        <p className="text-primary-foreground/80 text-sm">Il Motore del Business Moderno</p>
      </div>

      {/* Mobile Login Form */}
      <div className="flex-1 px-6 py-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-center">Accesso</h2>
          <p className="text-muted-foreground text-center text-sm">Inserisci le tue credenziali per continuare</p>
        </div>

        <form 
          onSubmit={loginForm.handleSubmit(onLoginSubmit)} 
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                {...loginForm.register("username")}
                className="h-14 text-base rounded-xl border-2 border-border/50 focus:border-primary transition-all"
                placeholder="Inserisci il tuo username"
                data-testid="input-username"
              />
              {loginForm.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {loginForm.formState.errors.username.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                {...loginForm.register("password")}
                className="h-14 text-base rounded-xl border-2 border-border/50 focus:border-primary transition-all"
                placeholder="Inserisci la tua password"
                data-testid="input-password"
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-14 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
            disabled={loginMutation.isPending}
            data-testid="button-login"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Accesso in corso...
              </>
            ) : (
              "Accedi"
            )}
          </Button>
        </form>

        {/* Demo Notice - Mobile Optimized */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">DEMO RISERVATA</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Accesso limitato ai partner autorizzati
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}