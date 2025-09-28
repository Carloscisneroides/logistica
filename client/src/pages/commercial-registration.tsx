import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Briefcase, 
  Upload, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle,
  Loader2,
  ArrowRight,
  Star
} from "lucide-react";

// Form validation schema
const commercialRegistrationSchema = z.object({
  // Dati personali
  nome: z.string().min(2, "Nome richiesto (min. 2 caratteri)"),
  cognome: z.string().min(2, "Cognome richiesto (min. 2 caratteri)"),
  email: z.string().email("Email non valida"),
  telefono: z.string().min(10, "Numero di telefono non valido"),
  
  // Informazioni professionali
  anniEsperienza: z.string().min(1, "Anni di esperienza richiesti"),
  settoreEsperienza: z.string().min(1, "Settore di esperienza richiesto"),
  specializzazioni: z.array(z.string()).min(1, "Almeno una specializzazione richiesta"),
  portfolioClienti: z.string().min(1, "Portfolio clienti richiesto"),
  
  // CV
  cvUrl: z.string().optional(),
  cvStorageKey: z.string().optional(),
  
  // Esperienze specifiche
  esperienze: z.array(z.object({
    azienda: z.string().min(1, "Nome azienda richiesto"),
    ruolo: z.string().min(1, "Ruolo richiesto"),
    periodo: z.string().min(1, "Periodo richiesto"),
    descrizione: z.string().min(10, "Descrizione richiesta (min. 10 caratteri)")
  })).optional(),
  
  // Motivazioni e disponibilità
  motivazioni: z.string().min(50, "Motivazioni richieste (min. 50 caratteri)"),
  disponibilita: z.string().min(1, "Disponibilità richiesta"),
  obiettiviVendita: z.string().min(1, "Obiettivi di vendita richiesti"),
  
  // Privacy
  privacyAccepted: z.boolean().refine(val => val === true, "Accettazione privacy richiesta")
});

type FormData = z.infer<typeof commercialRegistrationSchema>;

export default function CommercialRegistration() {
  const [step, setStep] = useState(1);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(commercialRegistrationSchema),
    defaultValues: {
      specializzazioni: [],
      esperienze: [{ azienda: "", ruolo: "", periodo: "", descrizione: "" }],
      privacyAccepted: false
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "esperienze"
  });

  // CV Upload mutation
  const uploadCvMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('cv', file);
      
      const response = await fetch('/api/commercial/cv-upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore upload CV');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue('cvUrl', data.url);
      form.setValue('cvStorageKey', data.storageKey);
      toast({
        title: "CV caricato con successo",
        description: `File: ${data.fileName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore upload CV",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Registration submission mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/commercial/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast({
        title: "Candidatura inviata!",
        description: "Ti contatteremo entro 48 ore.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore invio candidatura",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvFile(file);
    setIsUploadingCv(true);
    
    try {
      await uploadCvMutation.mutateAsync(file);
    } finally {
      setIsUploadingCv(false);
    }
  };

  const onSubmit = (data: FormData) => {
    registrationMutation.mutate(data);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(step);
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setStep(step + 1);
    }
  };

  const getFieldsForStep = (stepNumber: number): (keyof FormData)[] => {
    switch (stepNumber) {
      case 1:
        return ['nome', 'cognome', 'email', 'telefono'];
      case 2:
        return ['anniEsperienza', 'settoreEsperienza', 'specializzazioni', 'portfolioClienti'];
      case 3:
        return ['motivazioni', 'disponibilita', 'obiettiviVendita'];
      default:
        return [];
    }
  };

  const specializzazioniOptions = [
    "Vendita B2B",
    "Vendita B2C", 
    "E-commerce",
    "Logistica",
    "Trasporti",
    "Import/Export",
    "Tecnologia",
    "Manifatturiero",
    "Servizi",
    "Consulenza"
  ];

  const disponibilitaOptions = [
    "Full-time",
    "Part-time",
    "Consulenza",
    "Progetto specifico",
    "Telelavoro",
    "Trasferte nazionali",
    "Trasferte internazionali"
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Candidatura Inviata!
            </h2>
            <p className="text-gray-600 mb-6">
              Grazie per aver inviato la tua candidatura. Il nostro team la valuterà entro 48 ore e ti contatteremo via email.
            </p>
            <Button 
              onClick={() => setLocation('/')}
              className="w-full"
              data-testid="button-back-home"
            >
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diventa Commerciale YCORE
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unisciti al nostro team commerciale e costruisci la tua carriera nel settore logistico e e-commerce più innovativo
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-8 text-sm text-gray-600">
            <span className={step >= 1 ? "text-blue-600" : ""}>Dati Personali</span>
            <span className={step >= 2 ? "text-blue-600" : ""}>Esperienza</span>
            <span className={step >= 3 ? "text-blue-600" : ""}>Motivazioni</span>
            <span className={step >= 4 ? "text-blue-600" : ""}>CV & Conferma</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: Dati Personali */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Dati Personali
                  </CardTitle>
                  <CardDescription>
                    Inserisci i tuoi dati personali per iniziare
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Il tuo nome"
                              {...field}
                              data-testid="input-nome"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cognome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cognome *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Il tuo cognome"
                              {...field}
                              data-testid="input-cognome"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="la.tua.email@esempio.it"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefono *</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="+39 123 456 7890"
                            {...field}
                            data-testid="input-telefono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      data-testid="button-next-step-1"
                    >
                      Continua
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Esperienza Professionale */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Esperienza Professionale
                  </CardTitle>
                  <CardDescription>
                    Raccontaci della tua esperienza nel settore commerciale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="anniEsperienza"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anni di Esperienza *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger data-testid="select-anni-esperienza">
                                <SelectValue placeholder="Seleziona anni" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0-1">0-1 anni</SelectItem>
                                <SelectItem value="1-3">1-3 anni</SelectItem>
                                <SelectItem value="3-5">3-5 anni</SelectItem>
                                <SelectItem value="5-10">5-10 anni</SelectItem>
                                <SelectItem value="10+">10+ anni</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="settoreEsperienza"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Settore di Esperienza *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger data-testid="select-settore">
                                <SelectValue placeholder="Seleziona settore" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="logistica">Logistica</SelectItem>
                                <SelectItem value="ecommerce">E-commerce</SelectItem>
                                <SelectItem value="trasporti">Trasporti</SelectItem>
                                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                                <SelectItem value="altro">Altro</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="portfolioClienti"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio Clienti *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrivi il tuo portfolio clienti, tipologie di aziende con cui hai lavorato..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-portfolio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Esperienze specifiche */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Esperienze Lavorative</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ azienda: "", ruolo: "", periodo: "", descrizione: "" })}
                        data-testid="button-add-experience"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Aggiungi
                      </Button>
                    </div>
                    
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <FormField
                            control={form.control}
                            name={`esperienze.${index}.azienda`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Azienda</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Nome azienda"
                                    {...field}
                                    data-testid={`input-azienda-${index}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`esperienze.${index}.ruolo`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ruolo</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Il tuo ruolo"
                                    {...field}
                                    data-testid={`input-ruolo-${index}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`esperienze.${index}.periodo`}
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel>Periodo</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Es: Gen 2020 - Dic 2022"
                                  {...field}
                                  data-testid={`input-periodo-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`esperienze.${index}.descrizione`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrizione</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Descrivi le tue responsabilità e risultati..."
                                  {...field}
                                  data-testid={`textarea-descrizione-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {fields.length > 1 && (
                          <div className="flex justify-end mt-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              data-testid={`button-remove-experience-${index}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Rimuovi
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      data-testid="button-prev-step-2"
                    >
                      Indietro
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      data-testid="button-next-step-2"
                    >
                      Continua
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Motivazioni e Disponibilità */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Motivazioni e Disponibilità
                  </CardTitle>
                  <CardDescription>
                    Raccontaci le tue motivazioni e la tua disponibilità
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="motivazioni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perché vuoi lavorare con noi? *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrivi le tue motivazioni, cosa ti attrare del settore logistico e degli obiettivi che vorresti raggiungere..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="textarea-motivazioni"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disponibilita"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponibilità *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger data-testid="select-disponibilita">
                              <SelectValue placeholder="Seleziona disponibilità" />
                            </SelectTrigger>
                            <SelectContent>
                              {disponibilitaOptions.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obiettiviVendita"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Obiettivi di Vendita *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Quali sono i tuoi obiettivi di vendita? Come pensi di raggiungerli?"
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-obiettivi"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      data-testid="button-prev-step-3"
                    >
                      Indietro
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      data-testid="button-next-step-3"
                    >
                      Continua
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: CV Upload e Conferma */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    CV e Conferma
                  </CardTitle>
                  <CardDescription>
                    Carica il tuo CV e conferma la candidatura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* CV Upload */}
                  <div className="space-y-4">
                    <Label>Carica il tuo CV (PDF, DOC, DOCX - max 5MB)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {cvFile ? (
                        <div className="space-y-2">
                          <FileText className="w-8 h-8 text-green-600 mx-auto" />
                          <p className="text-sm font-medium">{cvFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {isUploadingCv && (
                            <div className="flex items-center justify-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Caricamento...</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-600">
                            Clicca per selezionare il file CV
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        data-testid="input-cv-upload"
                      />
                    </div>
                  </div>

                  {/* Specializzazioni */}
                  <FormField
                    control={form.control}
                    name="specializzazioni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specializzazioni *</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {specializzazioniOptions.map((spec) => (
                            <label
                              key={spec}
                              className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={field.value?.includes(spec) || false}
                                onChange={(e) => {
                                  const currentValue = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentValue, spec]);
                                  } else {
                                    field.onChange(currentValue.filter(s => s !== spec));
                                  }
                                }}
                                className="rounded"
                                data-testid={`checkbox-specializzazione-${spec.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                              />
                              <span className="text-sm">{spec}</span>
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Privacy Acceptance */}
                  <FormField
                    control={form.control}
                    name="privacyAccepted"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mt-1"
                            data-testid="checkbox-privacy"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            Accetto il trattamento dei dati personali *
                          </FormLabel>
                          <p className="text-xs text-gray-600">
                            I tuoi dati saranno utilizzati esclusivamente per la valutazione della candidatura e nel rispetto del GDPR.
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      data-testid="button-prev-step-4"
                    >
                      Indietro
                    </Button>
                    <Button 
                      type="submit"
                      disabled={registrationMutation.isPending}
                      data-testid="button-submit-registration"
                    >
                      {registrationMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Invia Candidatura
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}