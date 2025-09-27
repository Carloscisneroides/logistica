import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Bot, 
  Sparkles,
  Package,
  CreditCard,
  Truck,
  Settings,
  Users,
  LifeBuoy,
  FileText,
  BarChart3
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AIAssistantProps {
  variant?: "header" | "floating";
  className?: string;
}

// AI Assistant contextual based on current page
function getContextualPrompts(currentPath: string) {
  const prompts = {
    "/": [
      "Mostra statistiche spedizioni",
      "Clienti attivi oggi", 
      "Performance corrieri",
      "Fatturato del mese"
    ],
    "/clients": [
      "Aggiungi nuovo cliente",
      "Problemi fatturazione",
      "Gestione crediti",
      "Onboarding cliente"
    ],
    "/courier-modules": [
      "Attiva nuovo corriere",
      "Confronta tariffe",
      "Problemi integrazione",
      "Configurazione API"
    ],
    "/billing": [
      "Fattura non pagata",
      "Errore importo",
      "Problema Stripe",
      "Report fatturazione"
    ],
    "/support": [
      "Pacco in ritardo",
      "Pacco danneggiato", 
      "Problema fatturazione",
      "Problema tecnico"
    ],
    "/commercial": [
      "Performance commerciale",
      "Calcolo commissioni",
      "Target mensili",
      "Clienti prospect"
    ]
  };

  return prompts[currentPath as keyof typeof prompts] || prompts["/"];
}

function getContextualSystemPrompt(currentPath: string, userRole: string) {
  const contexts = {
    "/": "Dashboard principale - statistiche, overview generale, KPI",
    "/clients": "Gestione clienti - onboarding, fatturazione, supporto clienti",  
    "/courier-modules": "Corrieri - configurazione, attivazione, integrazione API",
    "/billing": "Fatturazione - invoice, pagamenti, Stripe, crediti",
    "/support": "Assistenza - ticket, problemi spedizioni, supporto tecnico",
    "/commercial": "Area commerciale - commissioni, performance, target"
  };

  const contextDescription = contexts[currentPath as keyof typeof contexts] || "Sistema generale";

  return `Sei l'AI Assistant di YCore, piattaforma SaaS per gestione spedizioni multi-tenant.

CONTESTO CORRENTE: ${contextDescription}
RUOLO UTENTE: ${userRole}

Fornisci risposte brevi, specifiche al contesto attuale e sempre in italiano.
Suggerisci azioni concrete e pertinenti al modulo corrente.
Mantieni un tono professionale e propositivo.`;
}

function getPageIcon(currentPath: string) {
  const icons = {
    "/": <BarChart3 className="w-4 h-4" />,
    "/clients": <Users className="w-4 h-4" />,
    "/courier-modules": <Truck className="w-4 h-4" />,
    "/billing": <CreditCard className="w-4 w-4" />,
    "/support": <LifeBuoy className="w-4 h-4" />,
    "/commercial": <FileText className="w-4 h-4" />
  };

  return icons[currentPath as keyof typeof icons] || <Settings className="w-4 h-4" />;
}

export function GlobalAIAssistant({ variant = "header", className = "" }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [location] = useLocation();

  // Get contextual data
  const contextualPrompts = getContextualPrompts(location);
  const pageIcon = getPageIcon(location);

  const askAI = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/ai/support-assistant", { 
        question,
        context: location,
        module: location.replace("/", "") || "dashboard"
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setAiResponse(data.response);
      if (data.suggestions) {
        // Could show suggestions in UI later
      }
    },
    onError: (error: any) => {
      toast({
        title: "AI Assistant",
        description: "Risposta non disponibile al momento",
        variant: "destructive"
      });
    }
  });

  const handleAskAI = () => {
    if (!question.trim()) return;
    setIsLoading(true);
    askAI.mutate(question, {
      onSettled: () => setIsLoading(false)
    });
  };

  const handlePromptClick = (prompt: string) => {
    setQuestion(prompt);
    handleAskAI();
  };

  if (variant === "floating") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg ${className}`}
            data-testid="button-ai-assistant-floating"
          >
            <Bot className="h-6 w-6 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <AIDialogContent 
            question={question}
            setQuestion={setQuestion}
            aiResponse={aiResponse}
            isLoading={isLoading}
            handleAskAI={handleAskAI}
            contextualPrompts={contextualPrompts}
            handlePromptClick={handlePromptClick}
            location={location}
            pageIcon={pageIcon}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Header variant - compact button
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
          data-testid="button-ai-assistant-header"
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bot className="w-5 h-5 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <span className="hidden md:inline text-sm font-medium">AI</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <AIDialogContent 
          question={question}
          setQuestion={setQuestion}
          aiResponse={aiResponse}
          isLoading={isLoading}
          handleAskAI={handleAskAI}
          contextualPrompts={contextualPrompts}
          handlePromptClick={handlePromptClick}
          location={location}
          pageIcon={pageIcon}
        />
      </DialogContent>
    </Dialog>
  );
}

// Extracted dialog content component to avoid duplication
function AIDialogContent({ 
  question, 
  setQuestion, 
  aiResponse, 
  isLoading, 
  handleAskAI, 
  contextualPrompts, 
  handlePromptClick,
  location,
  pageIcon
}: {
  question: string;
  setQuestion: (q: string) => void;
  aiResponse: string;
  isLoading: boolean;
  handleAskAI: () => void;
  contextualPrompts: string[];
  handlePromptClick: (prompt: string) => void;
  location: string;
  pageIcon: React.ReactNode;
}) {
  
  const getModuleName = (path: string) => {
    const names = {
      "/": "Dashboard",
      "/clients": "Clienti", 
      "/courier-modules": "Corrieri",
      "/billing": "Fatturazione",
      "/support": "Assistenza",
      "/commercial": "Commerciale"
    };
    return names[path as keyof typeof names] || "YCore";
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Assistant
          <Badge variant="outline" className="ml-2">
            {pageIcon}
            <span className="ml-1">{getModuleName(location)}</span>
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Assistente AI contestuale per {getModuleName(location)} - chiedimi qualsiasi cosa!
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input 
            placeholder="Come posso aiutarti?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
            data-testid="input-ai-question"
          />
          <Button 
            onClick={handleAskAI} 
            disabled={isLoading || !question.trim()}
            data-testid="button-ask-ai"
          >
            {isLoading ? "..." : "Chiedi"}
          </Button>
        </div>
        
        {aiResponse && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm" data-testid="text-ai-response">{aiResponse}</p>
          </div>
        )}
        
        {/* Contextual quick prompts */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Domande frequenti per questa sezione:</p>
          <div className="grid grid-cols-2 gap-2">
            {contextualPrompts.map((prompt, index) => (
              <Button 
                key={index}
                variant="outline" 
                size="sm" 
                className="text-xs h-8 justify-start"
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}