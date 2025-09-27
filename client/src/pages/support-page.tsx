import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Headphones, 
  Bot, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Sparkles,
  Package,
  CreditCard,
  Truck,
  Settings,
  Users,
  LifeBuoy
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Support ticket schema
const supportTicketSchema = z.object({
  title: z.string().min(5, "Il titolo deve essere di almeno 5 caratteri"),
  description: z.string().min(10, "La descrizione deve essere di almeno 10 caratteri"),
  category: z.string().min(1, "Seleziona una categoria"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  clientId: z.string().optional(),
  ticketType: z.enum(["csm", "tsm"])
});

type SupportTicketForm = z.infer<typeof supportTicketSchema>;

// AI Assistant component
function AIAssistant({ onSuggestionClick }: { onSuggestionClick: (suggestion: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const askAI = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/ai/support-assistant", { question });
      return response.json();
    },
    onSuccess: (data: any) => {
      setAiResponse(data.response);
      if (data.suggestions) {
        // Show suggested tickets/actions
      }
    }
  });

  const handleAskAI = () => {
    if (!question.trim()) return;
    setIsLoading(true);
    askAI.mutate(question, {
      onSettled: () => setIsLoading(false)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          data-testid="button-ai-assistant"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Assistant
          </DialogTitle>
          <DialogDescription>
            Chiedimi aiuto per aprire un ticket o risolvere un problema
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
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Button variant="outline" size="sm" onClick={() => setQuestion("Ho un pacco in ritardo")}>
              Pacco in ritardo
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuestion("Problema fatturazione")}>
              Fatturazione
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuestion("Pacco danneggiato")}>
              Pacco danneggiato
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuestion("Problema piattaforma")}>
              Problema tecnico
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SupportPage() {
  const { toast } = useToast();
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);

  // Fetch user clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"]
  }) as { data: any[] };

  // Fetch CSM tickets
  const { data: csmTickets = [], isLoading: isLoadingCSM } = useQuery({
    queryKey: ["/api/support/csm-tickets"]
  }) as { data: any[], isLoading: boolean };

  // Fetch TSM tickets  
  const { data: tsmTickets = [], isLoading: isLoadingTSM } = useQuery({
    queryKey: ["/api/support/tsm-tickets"]
  }) as { data: any[], isLoading: boolean };

  const form = useForm<SupportTicketForm>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      priority: "medium",
      ticketType: "csm"
    }
  });

  const createTicket = useMutation({
    mutationFn: async (data: SupportTicketForm) => {
      const endpoint = data.ticketType === "csm" ? "/api/support/csm-tickets" : "/api/support/tsm-tickets";
      return apiRequest("POST", endpoint, data);
    },
    onSuccess: () => {
      toast({
        title: "Ticket creato",
        description: "Il tuo ticket è stato creato con successo",
      });
      form.reset();
      setIsCreateTicketOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/support/csm-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tsm-tickets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nella creazione del ticket",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      open: { variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
      in_progress: { variant: "default" as const, color: "bg-yellow-100 text-yellow-800" },
      resolved: { variant: "default" as const, color: "bg-green-100 text-green-800" },
      closed: { variant: "outline" as const, color: "bg-gray-100 text-gray-800" },
      escalated: { variant: "destructive" as const, color: "bg-red-100 text-red-800" }
    };
    const config = variants[status as keyof typeof variants] || variants.open;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status === "open" && "Aperto"}
        {status === "in_progress" && "In lavorazione"} 
        {status === "resolved" && "Risolto"}
        {status === "closed" && "Chiuso"}
        {status === "escalated" && "Escalato"}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low": return <Clock className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes("pacco") || category.includes("spedizione")) return <Package className="h-4 w-4" />;
    if (category.includes("fatturazione")) return <CreditCard className="h-4 w-4" />;
    if (category.includes("piattaforma") || category.includes("technical")) return <Settings className="h-4 w-4" />;
    if (category.includes("corriere")) return <Truck className="h-4 w-4" />;
    return <LifeBuoy className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Headphones className="h-8 w-8 text-blue-600" />
            Assistenza Clienti
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestione ticket CSM e TSM con supporto AI integrato
          </p>
        </div>
        <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-ticket">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Crea Nuovo Ticket</DialogTitle>
              <DialogDescription>
                Apri un ticket di supporto per assistenza CSM o TSM
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createTicket.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="ticketType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Ticket</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-ticket-type">
                            <SelectValue placeholder="Seleziona tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="csm">CSM - Customer Success</SelectItem>
                          <SelectItem value="tsm">TSM - Technical Support</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente (Opzionale)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="Seleziona cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client: any) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titolo</FormLabel>
                      <FormControl>
                        <Input placeholder="Breve descrizione del problema" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Seleziona categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pacco_ritardo">Pacco in ritardo</SelectItem>
                          <SelectItem value="pacco_smarrito">Pacco smarrito</SelectItem>
                          <SelectItem value="pacco_danneggiato">Pacco danneggiato</SelectItem>
                          <SelectItem value="pacco_non_ricevuto">Pacco consegnato ma non ricevuto</SelectItem>
                          <SelectItem value="fatturazione">Fatturazione</SelectItem>
                          <SelectItem value="piattaforma">Funzionalità piattaforma</SelectItem>
                          <SelectItem value="altro">Altre domande</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorità</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder="Seleziona priorità" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Bassa</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrivi dettagliatamente il problema..."
                          rows={4}
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateTicketOpen(false)}
                  >
                    Annulla
                  </Button>
                  <Button type="submit" disabled={createTicket.isPending} data-testid="button-submit-ticket">
                    {createTicket.isPending ? "Creazione..." : "Crea Ticket"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tickets Tabs */}
      <Tabs defaultValue="csm" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csm" className="flex items-center gap-2" data-testid="tab-csm">
            <Users className="h-4 w-4" />
            CSM Tickets
          </TabsTrigger>
          <TabsTrigger value="tsm" className="flex items-center gap-2" data-testid="tab-tsm">
            <Settings className="h-4 w-4" />
            TSM Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csm" className="mt-6">
          {isLoadingCSM ? (
            <div className="text-center py-8">Caricamento ticket CSM...</div>
          ) : csmTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Nessun ticket CSM presente</p>
                <p className="text-sm text-muted-foreground">I ticket di Customer Success Management appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {csmTickets.map((ticket: any) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCategoryIcon(ticket.category)}
                        {ticket.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span>#{ticket.ticketNumber}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3" data-testid={`text-description-${ticket.id}`}>
                      {ticket.description}
                    </p>
                    {ticket.assignedToName && (
                      <p className="text-xs text-muted-foreground">
                        Assegnato a: {ticket.assignedToName}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tsm" className="mt-6">
          {isLoadingTSM ? (
            <div className="text-center py-8">Caricamento ticket TSM...</div>
          ) : tsmTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Nessun ticket TSM presente</p>
                <p className="text-sm text-muted-foreground">I ticket di Technical Support Management appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tsmTickets.map((ticket: any) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCategoryIcon(ticket.category)}
                        {ticket.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                        {ticket.escalationLevel > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            L{ticket.escalationLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span>#{ticket.ticketNumber}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                      <span>•</span>
                      <span>Severità: {ticket.severity}</span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3" data-testid={`text-description-${ticket.id}`}>
                      {ticket.description}
                    </p>
                    {ticket.assignedToName && (
                      <p className="text-xs text-muted-foreground">
                        Assegnato a: {ticket.assignedToName}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* AI Assistant floating button */}
      {/* AI Assistant è ora disponibile globalmente nell'header */}
    </div>
  );
}