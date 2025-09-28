import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { Loader2, Truck, Shield, Users, Zap } from "lucide-react";
import ycoreLogo from "@assets/Copilot_20250928_191905_1759079989814.png";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
// Validazione Partita IVA italiana (11 cifre)
const validatePartitaIVA = (piva: string) => {
  if (!/^\d{11}$/.test(piva)) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let digit = parseInt(piva[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit = digit - 9;
    }
    sum += digit;
  }
  return (10 - (sum % 10)) % 10 === parseInt(piva[10]);
};

// Validazione Codice Fiscale italiano
const validateCodiceFiscale = (cf: string) => {
  return /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(cf.toUpperCase());
};

// CINA - USCI (Unified Social Credit Identifier) per partner Temu/Shein/Alibaba
const validateUSCI = (usci: string) => {
  return /^[0-9A-Z]{18}$/.test(usci.toUpperCase());
};

// REGNO UNITO - VAT Number (9 cifre + 2 di controllo opzionali)
const validateUKVAT = (vat: string) => {
  return /^(GB)?[0-9]{9}([0-9]{3})?$/.test(vat.replace(/\s/g, ''));
};

// GERMANIA - USt-IdNr (VAT tedesco)
const validateGermanVAT = (vat: string) => {
  return /^(DE)?[0-9]{9}$/.test(vat.replace(/\s/g, ''));
};

// FRANCIA - Numéro de TVA
const validateFrenchVAT = (vat: string) => {
  return /^(FR)?[0-9A-Z]{2}[0-9]{9}$/.test(vat.replace(/\s/g, ''));
};

// USA - EIN (Employer Identification Number)
const validateEIN = (ein: string) => {
  return /^[0-9]{2}-[0-9]{7}$/.test(ein);
};

// DANIMARCA - CVR (per Maersk e logistics danesi)
const validateCVR = (cvr: string) => {
  return /^[0-9]{8}$/.test(cvr);
};

// SINGAPORE - UEN (Unique Entity Number) per hub logistico
const validateUEN = (uen: string) => {
  return /^[0-9]{8}[A-Z]$|^[0-9]{9}[A-Z]$|^T[0-9]{8}[A-Z]$|^S[0-9]{8}[A-Z]$/.test(uen.toUpperCase());
};

// SPAGNA - CIF/NIF (Código/Número de Identificación Fiscal)
const validateSpanishFiscal = (fiscal: string) => {
  // NIF: 12345678A (8 cifre + 1 lettera)
  // CIF: A12345674 (1 lettera + 7 cifre + 1 carattere controllo)
  const nif = /^[0-9]{8}[A-Z]$/.test(fiscal.toUpperCase());
  const cif = /^[A-Z][0-9]{7}[0-9A-Z]$/.test(fiscal.toUpperCase());
  return nif || cif;
};

// Funzione di validazione dinamica per paese
const validateFiscalId = (fiscalId: string, country: string, type: string) => {
  switch (country) {
    case 'IT':
      return type === 'codice_fiscale' ? validateCodiceFiscale(fiscalId) : validatePartitaIVA(fiscalId);
    case 'CN':
      return validateUSCI(fiscalId);
    case 'GB':
      return validateUKVAT(fiscalId);
    case 'DE':
      return validateGermanVAT(fiscalId);
    case 'FR':
      return validateFrenchVAT(fiscalId);
    case 'US':
      return validateEIN(fiscalId);
    case 'DK':
      return validateCVR(fiscalId);
    case 'SG':
      return validateUEN(fiscalId);
    case 'ES':
      return validateSpanishFiscal(fiscalId);
    default:
      return fiscalId.length >= 5; // Validazione base per altri paesi
  }
};

const registerSchema = z.object({
  username: z.string().min(3, "Username deve avere almeno 3 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Password deve avere almeno 6 caratteri"),
  passwordConfirm: z.string(),
  
  // Dati anagrafici
  firstName: z.string().min(2, "Nome richiesto"),
  lastName: z.string().min(2, "Cognome richiesto"),
  companyName: z.string().optional(),
  phoneNumber: z.string().min(8, "Numero di telefono richiesto"),
  
  // Categoria cliente YCore
  clientCategory: z.enum([
    "merchant_territoriali",
    "marketplace_regionali", 
    "logistiche",
    "broker_doganali",
    "partner_asiatici",
    "srl_territoriali",
    "professionisti"
  ], { errorMap: () => ({ message: "Seleziona una categoria cliente" }) }),
  
  // Validazione fiscale internazionale (9 paesi strategici)
  country: z.enum(["IT", "CN", "GB", "DE", "FR", "US", "DK", "SG", "ES"], {
    errorMap: () => ({ message: "Seleziona il paese" })
  }),
  fiscalType: z.string().optional(),
  fiscalId: z.string().min(1, "Identificativo fiscale richiesto"),
  
  // Dati aggiuntivi
  businessDescription: z.string().min(10, "Descrivi brevemente la tua attività (min 10 caratteri)"),
  message: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Le password non coincidono",
  path: ["passwordConfirm"],
}).refine((data) => {
  return validateFiscalId(data.fiscalId, data.country, data.fiscalType || "");
}, {
  message: "Identificativo fiscale non valido per il paese selezionato",
  path: ["fiscalId"],
});

// Helper functions per UI dinamica fiscale internazionale
const renderFiscalIdLabel = (country: string, fiscalType?: string) => {
  const labels = {
    IT: fiscalType === "codice_fiscale" ? "(Codice Fiscale)" : "(Partita IVA)",
    CN: "(USCI - Unified Social Credit)",
    GB: "(UK VAT Number)", 
    DE: "(German USt-IdNr)",
    FR: "(French VAT Number)",
    US: "(EIN - Employer ID)",
    DK: "(CVR Number)",
    SG: "(UEN Singapore)",
    ES: "(CIF/NIF español)"
  };
  return labels[country as keyof typeof labels] || "";
};

const getFiscalIdPlaceholder = (country: string, fiscalType?: string) => {
  switch (country) {
    case "IT":
      return fiscalType === "codice_fiscale" ? "RSSMRA85M01H501Z" : "12345678901";
    case "CN": return "91110000000000000A";
    case "GB": return "GB123456789";
    case "DE": return "DE123456789";
    case "FR": return "FR12345678901";
    case "US": return "12-3456789";
    case "DK": return "12345678";
    case "SG": return "201234567A";
    case "ES": return "A12345674 o 12345678A";
    default: return "Inserisci ID fiscale";
  }
};

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  // **PRIVATE DEMO MODE** - Disabilita registrazione pubblica
  const [isLogin, setIsLogin] = useState(true);
  const isPrivateDemo = true; // Modalità demo privata attiva

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      username: "", 
      email: "", 
      password: "",
      passwordConfirm: "",
      firstName: "",
      lastName: "",
      companyName: "",
      phoneNumber: "",
      clientCategory: "merchant_territoriali",
      country: "IT",
      fiscalType: "",
      fiscalId: "",
      businessDescription: "",
      message: ""
    },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-ping"></div>
      </div>
      
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8 lg:w-1/2 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Modern Logo Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl">
              <img 
                src={ycoreLogo} 
                alt="YCORE Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                YCORE
              </h1>
              <p className="text-sm text-muted-foreground/80 font-medium">
                Il Motore Digitale del Business Moderno
              </p>
            </div>
          </div>

          {/* Glassmorphism Card */}
          <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-white/10 shadow-2xl shadow-blue-500/10 p-8">
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                {isLogin ? "Bentornato" : "Crea Account"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin 
                  ? "Accedi al tuo ecosistema digitale"
                  : "Inizia la trasformazione digitale"
                }
              </p>
            </div>
              
              {/* Elite Demo Notice */}
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-2xl border border-amber-200/50 dark:border-amber-800/50">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">DEMO RISERVATA</span>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Accesso limitato ai partner autorizzati
                  </p>
                  <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">
                    Sistema protetto con tracciamento avanzato
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {isLogin ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium text-foreground/80">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        {...loginForm.register("username")}
                        className="h-12 border-2 border-border/50 focus:border-primary/80 rounded-xl bg-background/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        placeholder="Inserisci il tuo username"
                        data-testid="input-username"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500 flex items-center space-x-1">
                          <span>•</span>
                          <span>{loginForm.formState.errors.username.message}</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...loginForm.register("password")}
                        className="h-12 border-2 border-border/50 focus:border-primary/80 rounded-xl bg-background/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        placeholder="Inserisci la tua password"
                        data-testid="input-password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500 flex items-center space-x-1">
                          <span>•</span>
                          <span>{loginForm.formState.errors.password.message}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    {loginMutation.isPending ? "Accesso..." : "Accedi al Sistema"}
                  </Button>
                </form>
              ) : (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    {/* Dati di accesso */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">🔐 Dati di Accesso</h3>
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-reg-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} data-testid="input-reg-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password *</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} data-testid="input-reg-password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="passwordConfirm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Conferma Password *</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} data-testid="input-password-confirm" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Dati anagrafici */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-lg">👤 Dati Anagrafici</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cognome *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Azienda/Attività</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Es. ABC Logistics SRL" data-testid="input-company" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefono *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+39 123 456 7890" data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Categoria cliente */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-lg">🎯 Categoria Cliente YCore</h3>
                      
                      <FormField
                        control={registerForm.control}
                        name="clientCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seleziona la tua categoria *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-client-category">
                                  <SelectValue placeholder="Seleziona categoria cliente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="merchant_territoriali">🏪 Merchant Territoriali (negozi, SRL, professionisti locali)</SelectItem>
                                <SelectItem value="marketplace_regionali">🛒 Marketplace Regionali (aggregatori, white-label)</SelectItem>
                                <SelectItem value="logistiche">🚚 Logistiche (operatori locali e globali)</SelectItem>
                                <SelectItem value="broker_doganali">📋 Broker Doganali (import/export, documentazione)</SelectItem>
                                <SelectItem value="partner_asiatici">🌏 Partner Asiatici (Temu, Shein, Alibaba, AliExpress)</SelectItem>
                                <SelectItem value="srl_territoriali">🏢 SRL Territoriali (conferimento YCore, white-label)</SelectItem>
                                <SelectItem value="professionisti">👨‍💼 Professionisti (consulenti, freelance, artigiani)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Flessibilità fiscale */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-lg">🧾 Identificazione Fiscale</h3>
                      
                      {/* Selezione paese per validazione fiscale internazionale */}
                      <FormField
                        control={registerForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paese di residenza fiscale *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-country">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="IT">🇮🇹 Italia (P.IVA/CF - Mercato domestico)</SelectItem>
                                <SelectItem value="CN">🇨🇳 Cina (USCI - Partner strategico)</SelectItem>
                                <SelectItem value="GB">🇬🇧 UK (VAT - Brexit commerce)</SelectItem>
                                <SelectItem value="DE">🇩🇪 Germania (USt-IdNr - Hub europeo)</SelectItem>
                                <SelectItem value="FR">🇫🇷 Francia (TVA - Mercato francese)</SelectItem>
                                <SelectItem value="US">🇺🇸 USA (EIN - Mercato americano)</SelectItem>
                                <SelectItem value="DK">🇩🇰 Danimarca (CVR - Hub scandinavo)</SelectItem>
                                <SelectItem value="SG">🇸🇬 Singapore (UEN - Hub logistico)</SelectItem>
                                <SelectItem value="ES">🇪🇸 Spagna (CIF/NIF - Mercato europeo)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="fiscalType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo di identificazione fiscale *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-fiscal-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="partita_iva">Partita IVA (modalità standard aziende)</SelectItem>
                                <SelectItem value="codice_fiscale">Codice Fiscale (professionisti e freelance)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {registerForm.watch("fiscalType") === "partita_iva" && (
                        <FormField
                          control={registerForm.control}
                          name="partitaIVA"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Partita IVA *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="12345678901" maxLength={11} data-testid="input-partita-iva" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {registerForm.watch("fiscalType") === "codice_fiscale" && (
                        <FormField
                          control={registerForm.control}
                          name="codiceFiscale"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Codice Fiscale *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="RSSMRA85M01H501Z" maxLength={16} style={{textTransform: 'uppercase'}} data-testid="input-codice-fiscale" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {/* Descrizione attività */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-lg">📝 Descrizione Attività</h3>
                      
                      <FormField
                        control={registerForm.control}
                        name="businessDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrivi la tua attività *</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Descrivi dettagliatamente la tua attività, settore di riferimento, volume di spedizioni previsto, mercati di riferimento..." className="min-h-[100px]" data-testid="input-business-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Messaggio per il CEO</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Messaggio opzionale per Ylenia Sacco - CEO YCore..." className="min-h-[80px]" data-testid="input-message" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-semibold">📋 Registrazione con Approvazione Manuale</span>
                      <div className="mt-1">
                        La tua richiesta sarà inviata all'amministratore YCore per l'approvazione. 
                        Riceverai una email di conferma dopo la valutazione.
                      </div>
                    </div>
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
                    Invia Richiesta di Registrazione
                  </Button>
                  </form>
                </Form>
              )}

              {/* NASCONDE REGISTRAZIONE IN MODALITÀ DEMO PRIVATA */}
              {!isPrivateDemo && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
                    data-testid="button-switch-mode"
                  >
                    {isLogin 
                      ? "Non hai un account? Registrati" 
                      : "Hai già un account? Accedi"
                    }
                  </Button>
                </div>
              )}
              
              {/* MESSAGGIO DEMO PRIVATA */}
              {isPrivateDemo && (
                <div className="text-center mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    <span className="font-semibold">🔒 DEMO RISERVATA</span>
                    <div className="mt-1">
                      Registrazione disabilitata. Contattare l'amministratore per credenziali di accesso.
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>


      {/* Right side - YCORE Brand Hero Section */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-cyan-300/30 rounded-full blur-md animate-ping delay-500"></div>
        </div>
        
        {/* Main Content */}
        <div className="relative flex items-center justify-center p-12 z-10">
          <div className="max-w-3xl text-center space-y-10">
            {/* Hero Logo and Brand - LAYOUT ORIZZONTALE */}
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl flex items-center justify-center">
                  <img 
                    src={ycoreLogo} 
                    alt="YCORE Logo" 
                    className="w-12 h-12 object-contain"
                  />
                </div>
                
                <div className="text-left">
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                    YCORE
                  </h1>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-white/90">
                  Il Motore Digitale del Business Moderno
                </h2>
              </div>
            </div>
            
            {/* Value Proposition */}
            <div className="space-y-8">
              <p className="text-xl text-white/80 leading-relaxed font-medium max-w-2xl mx-auto">
                Un ecosistema <span className="text-yellow-300 font-bold">modulare</span>, <span className="text-yellow-300 font-bold">intelligente</span> e <span className="text-yellow-300 font-bold">sicuro</span> che trasforma il modo in cui le aziende operano, vendono e crescono.
              </p>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
                <p className="text-white text-xl font-semibold leading-relaxed">
                  YCORE non è solo una piattaforma: è il <span className="text-yellow-300">cuore operativo</span> che connette persone, processi e opportunità in <span className="text-cyan-300">tempo reale</span>.
                </p>
              </div>
              
              {/* Innovation Features */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-white font-semibold">Innovazione</h3>
                  <p className="text-white/70 text-sm">Tecnologie all'avanguardia</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-white font-semibold">Sicurezza</h3>
                  <p className="text-white/70 text-sm">Enterprise-grade</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-white font-semibold">Velocità</h3>
                  <p className="text-white/70 text-sm">Performance ottimali</p>
                </div>
              </div>
            </div>
            
            {/* Key Features Badges */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 border border-white/20">
                <span className="text-white font-bold text-sm">SCALABILE</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 border border-white/20">
                <span className="text-white font-bold text-sm">PERSONALIZZABILE</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 border border-white/20">
                <span className="text-white font-bold text-sm">INIMITABILE</span>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="space-y-3 pt-4">
              <p className="text-2xl font-black text-white tracking-wide">
                <span className="text-yellow-300">Il futuro</span> della gestione aziendale è già qui.
              </p>
              <p className="text-xl font-bold text-cyan-300">
                E parla <span className="text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">YCORE</span>.
              </p>
            </div>

            {/* Elegant Features Grid */}
            <div className="pt-8 grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-cyan-300" />
                  <span className="text-white font-semibold text-sm">Sicurezza Enterprise</span>
                </div>
                <p className="text-blue-100/80 text-xs">Protezione avanzata con AI antifrode integrata</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-white font-semibold text-sm">AI Integrata</span>
                </div>
                <p className="text-blue-100/80 text-xs">Automazione intelligente per ogni processo</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-green-300" />
                  <span className="text-white font-semibold text-sm">Multi-Tenant</span>
                </div>
                <p className="text-blue-100/80 text-xs">Gestione clienti isolata e personalizzabile</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="w-5 h-5 text-purple-300" />
                  <span className="text-white font-semibold text-sm">Logistics 360°</span>
                </div>
                <p className="text-blue-100/80 text-xs">Dalla spedizione locale al commercio globale</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 left-0 w-2 h-48 bg-gradient-to-b from-transparent via-white/20 to-transparent -translate-x-1"></div>
      </div>
    </div>
  );
}
