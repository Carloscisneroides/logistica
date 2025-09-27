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
  const [isLogin, setIsLogin] = useState(true);

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
              
              {/* Disclaimer legale per demo riservata */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg border-l-4 border-amber-500">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="font-semibold text-amber-600">⚠️ DEMO RISERVATA</div>
                  <div>Questa è una demo tecnica riservata per partner autorizzati.</div>
                  <div><strong>NON AUTORIZZATA</strong> alla riproduzione, copia o distribuzione.</div>
                  <div>Accesso limitato a Reply, AWS e partner tecnici fidati.</div>
                  <div className="text-[10px] mt-2 border-t border-muted pt-2">
                    Sistema protetto da logging antifrode e tracciamento accessi.
                    <br />Tutti gli accessi sono registrati e monitorati.
                  </div>
                </div>
              </div>
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
