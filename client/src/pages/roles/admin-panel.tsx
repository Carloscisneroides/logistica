import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  MessageSquare, 
  UserCheck, 
  Briefcase,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CommercialApplication,
  CommercialProfile,
  commercialApprovalSchema,
  commercialRejectionSchema,
  type CommercialApproval,
  type CommercialRejection
} from "@shared/schema";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for commercial applications management
  const [selectedApplication, setSelectedApplication] = useState<CommercialApplication | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  
  // State for registration requests management
  const [selectedRegistrationRequest, setSelectedRegistrationRequest] = useState<any | null>(null);
  const [registrationApprovalDialogOpen, setRegistrationApprovalDialogOpen] = useState(false);
  const [registrationRejectionDialogOpen, setRegistrationRejectionDialogOpen] = useState(false);
  const [registrationRejectionReason, setRegistrationRejectionReason] = useState('');

  // React Hook Form for approval
  const approvalForm = useForm<CommercialApproval>({
    resolver: zodResolver(commercialApprovalSchema),
    defaultValues: {
      subRole: undefined,
      livello: 'base',
      grado: '1',
      percentuale: '5.00',
      notes: '',
    },
  });

  // React Hook Form for rejection
  const rejectionForm = useForm<CommercialRejection>({
    resolver: zodResolver(commercialRejectionSchema),
    defaultValues: {
      rejectionReason: '',
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/admin/user-stats'],
    enabled: user?.role === 'admin'
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ['/api/admin/registration-requests'],
    enabled: user?.role === 'admin'
  });

  // Commercial applications queries with strong typing and loading states
  const { 
    data: commercialApplications = [], 
    isLoading: loadingApplications 
  } = useQuery<CommercialApplication[]>({
    queryKey: ['/api/commercial/applications'],
    enabled: user?.role === 'admin'
  });

  const { 
    data: commercialStats, 
    isLoading: loadingStats 
  } = useQuery<{
    pendingApplications: number;
    activeProfiles: number;
    totalRevenue: number;
  }>({
    queryKey: ['/api/commercial/dashboard-stats'],
    enabled: user?.role === 'admin'
  });

  const { 
    data: commercialProfiles = [], 
    isLoading: loadingProfiles 
  } = useQuery<CommercialProfile[]>({
    queryKey: ['/api/commercial/profiles'],
    enabled: user?.role === 'admin'
  });

  // Mutations for commercial applications with strong typing
  const approveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CommercialApproval }) => {
      const response = await apiRequest("PATCH", `/api/commercial/applications/${id}/approve`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/profiles'] });
      setApprovalDialogOpen(false);
      setSelectedApplication(null);
      approvalForm.reset();
      toast({
        title: "Candidatura approvata",
        description: "Il nuovo commerciale è stato attivato con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nell'approvazione della candidatura",
        variant: "destructive",
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CommercialRejection }) => {
      const response = await apiRequest("PATCH", `/api/commercial/applications/${id}/reject`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/dashboard-stats'] });
      setRejectionDialogOpen(false);
      setSelectedApplication(null);
      rejectionForm.reset();
      toast({
        title: "Candidatura rifiutata",
        description: "Il candidato è stato notificato del rifiuto",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nel rifiuto della candidatura",
        variant: "destructive",
      });
    }
  });

  // Registration Request mutations
  const approveRegistrationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/approve-registration/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/registration-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-stats'] });
      setRegistrationApprovalDialogOpen(false);
      setSelectedRegistrationRequest(null);
      toast({
        title: "Registrazione approvata",
        description: "L'utente è stato creato e può ora accedere al sistema",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nell'approvazione della registrazione",
        variant: "destructive",
      });
    }
  });

  const rejectRegistrationMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/admin/reject-registration/${id}`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/registration-requests'] });
      setRegistrationRejectionDialogOpen(false);
      setSelectedRegistrationRequest(null);
      setRegistrationRejectionReason('');
      toast({
        title: "Registrazione rifiutata",
        description: "La richiesta è stata rifiutata",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nel rifiuto della registrazione",
        variant: "destructive",
      });
    }
  });

  // Handlers with form-based approach
  const handleApprove = (application: CommercialApplication) => {
    setSelectedApplication(application);
    approvalForm.reset({
      subRole: undefined,
      livello: 'base',
      grado: '1',
      percentuale: '5.00',
      notes: '',
    });
    setApprovalDialogOpen(true);
  };

  const handleReject = (application: CommercialApplication) => {
    setSelectedApplication(application);
    rejectionForm.reset({
      rejectionReason: '',
    });
    setRejectionDialogOpen(true);
  };

  const onApprovalSubmit = (data: CommercialApproval) => {
    if (!selectedApplication) return;
    
    approveMutation.mutate({
      id: selectedApplication.id,
      data
    });
  };

  const onRejectionSubmit = (data: CommercialRejection) => {
    if (!selectedApplication) return;
    
    rejectMutation.mutate({
      id: selectedApplication.id,
      data
    });
  };

  // Filter pending commercial applications
  const pendingCommercialApplications = commercialApplications?.filter(
    (app: CommercialApplication) => app.status === 'pending'
  ) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestione utenti, contenuti e configurazioni operative
          </p>
        </div>
        <Badge variant="default" className="px-3 py-1">
          <UserCheck className="h-4 w-4 mr-1" />
          ADMIN ACCESS
        </Badge>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(userStats as any)?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% dal mese scorso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Richieste Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(pendingRequests as any)?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Da approvare
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenuti Moderati</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(userStats as any)?.moderatedContent || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ultima settimana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(userStats as any)?.revenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              Questo mese
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidature Commerciali</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commercialStats?.pendingApplications || 0}</div>
            <p className="text-xs text-muted-foreground">
              Da valutare
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestione Utenti
            </CardTitle>
            <CardDescription>
              Approva registrazioni e gestisci utenti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-user-approval">
              <UserCheck className="h-4 w-4 mr-2" />
              Approva Registrazioni ({(pendingRequests as any)?.length || 0})
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-user-management">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-role-assignment">
              <Shield className="h-4 w-4 mr-2" />
              Role Assignment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Moderazione Contenuti
            </CardTitle>
            <CardDescription>
              Gestisci contenuti e comunicazioni
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-content-review">
              <MessageSquare className="h-4 w-4 mr-2" />
              Content Review
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-user-reports">
              <FileText className="h-4 w-4 mr-2" />
              User Reports
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-communication-tools">
              <MessageSquare className="h-4 w-4 mr-2" />
              Communication Tools
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Gestione Commerciali
            </CardTitle>
            <CardDescription>
              Gestisci candidature e team commerciale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-commercial-applications">
              <UserCheck className="h-4 w-4 mr-2" />
              Candidature Pending ({pendingCommercialApplications.length})
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-commercial-profiles">
              <Users className="h-4 w-4 mr-2" />
              Profili Attivi ({commercialProfiles.length || 0})
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-commercial-stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Registration Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Richieste di Registrazione Pending
          </CardTitle>
          <CardDescription>
            Approva o rifiuta nuove registrazioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(pendingRequests as any)?.slice(0, 5).map((request: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`request-${index}`}>
                <div className="space-y-1">
                  <p className="font-medium">{request.username}</p>
                  <p className="text-sm text-muted-foreground">{request.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Role: {request.role} | Company: {request.companyName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={() => {
                      setSelectedRegistrationRequest(request);
                      setRegistrationApprovalDialogOpen(true);
                    }}
                    data-testid={`button-approve-${index}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approva
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => {
                      setSelectedRegistrationRequest(request);
                      setRegistrationRejectionDialogOpen(true);
                    }}
                    data-testid={`button-reject-${index}`}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rifiuta
                  </Button>
                </div>
              </div>
            ))}
            {(!pendingRequests || (pendingRequests as any).length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                Nessuna richiesta pending al momento
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Commercial Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Candidature Commerciali Pending
          </CardTitle>
          <CardDescription>
            Approva o rifiuta candidature per il team commerciale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingCommercialApplications.slice(0, 5).map((application: any, index: number) => (
              <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`commercial-application-${index}`}>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{application.fullName}</p>
                      <p className="text-sm text-muted-foreground">{application.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Tel: {application.phoneNumber} | Area: {application.geographicArea}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Area: {application.geographicArea}</p>
                      <p className="text-xs text-muted-foreground">
                        Candidatura: {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                      {application.cvUrl && (
                        <Badge variant="secondary" className="text-xs">
                          CV Allegato
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {application.experienceDescription?.substring(0, 150)}...
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" data-testid={`button-view-application-${index}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Dettagli
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Candidatura: {application.fullName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-medium">Email</Label>
                            <p className="text-sm">{application.email}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Telefono</Label>
                            <p className="text-sm">{application.phoneNumber}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Area Geografica</Label>
                            <p className="text-sm">{application.geographicArea}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Esperienza</Label>
                            <p className="text-sm">{application.experienceDescription}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="font-medium">Specializzazioni</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {application.specializzazioni?.map((spec: string, i: number) => (
                              <Badge key={i} variant="secondary">{spec}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="font-medium">Portfolio Clienti</Label>
                          <p className="text-sm mt-1">{application.portfolioClienti}</p>
                        </div>

                        <div>
                          <Label className="font-medium">Motivazioni</Label>
                          <p className="text-sm mt-1">{application.motivazioni}</p>
                        </div>

                        <div>
                          <Label className="font-medium">Disponibilità</Label>
                          <p className="text-sm mt-1">{application.disponibilita}</p>
                        </div>

                        <div>
                          <Label className="font-medium">Obiettivi di Vendita</Label>
                          <p className="text-sm mt-1">{application.obiettiviVendita}</p>
                        </div>

                        {application.cvUrl && (
                          <div>
                            <Label className="font-medium">CV</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Button size="sm" variant="outline" asChild>
                                <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Scarica CV
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}

                        {application.aiAnalysis && (
                          <div className="border rounded-lg p-4 bg-blue-50">
                            <Label className="font-medium">Analisi AI</Label>
                            <div className="mt-2 space-y-2">
                              <p className="text-sm">Score CV: {application.aiAnalysis.cvScore}/100</p>
                              <p className="text-sm">Categoria Suggerita: {application.aiAnalysis.suggestedCategory}</p>
                              <p className="text-sm">Confidenza: {application.aiAnalysis.confidenceLevel}%</p>
                              {application.aiAnalysis.notes?.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium">Note:</p>
                                  <ul className="text-sm list-disc pl-4">
                                    {application.aiAnalysis.notes.map((note: string, i: number) => (
                                      <li key={i}>{note}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={() => handleApprove(application)}
                    data-testid={`button-approve-commercial-${index}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approva
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleReject(application)}
                    data-testid={`button-reject-commercial-${index}`}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rifiuta
                  </Button>
                </div>
              </div>
            ))}
            {pendingCommercialApplications.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nessuna candidatura commerciale pending al momento
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reportistica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics e Reportistica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full" data-testid="button-user-analytics">
              <Users className="h-4 w-4 mr-2" />
              User Analytics
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-revenue-reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Revenue Reports
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-system-reports">
              <Settings className="h-4 w-4 mr-2" />
              System Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approva Candidatura</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedApplication.fullName}</p>
                <p className="text-sm text-muted-foreground">{selectedApplication.email}</p>
              </div>
              
              <Form {...approvalForm}>
                <form onSubmit={approvalForm.handleSubmit(onApprovalSubmit)} className="space-y-4">
                  <FormField
                    control={approvalForm.control}
                    name="subRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ruolo Commerciale *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona ruolo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="agente">Agente Commerciale</SelectItem>
                            <SelectItem value="responsabile">Responsabile Commerciale</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={approvalForm.control}
                      name="livello"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Livello</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="base">Base</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={approvalForm.control}
                      name="grado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={approvalForm.control}
                    name="percentuale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentuale Provvigione (%)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="2.50">2.50%</SelectItem>
                            <SelectItem value="5.00">5.00%</SelectItem>
                            <SelectItem value="7.50">7.50%</SelectItem>
                            <SelectItem value="10.00">10.00%</SelectItem>
                            <SelectItem value="12.50">12.50%</SelectItem>
                            <SelectItem value="15.00">15.00%</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={approvalForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note (opzionale)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Note aggiuntive per il nuovo commerciale..."
                            {...field}
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
                      onClick={() => setApprovalDialogOpen(false)}
                      disabled={approveMutation.isPending}
                    >
                      Annulla
                    </Button>
                    <Button 
                      type="submit"
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Approvando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approva Candidatura
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rifiuta Candidatura</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedApplication.fullName}</p>
                <p className="text-sm text-muted-foreground">{selectedApplication.email}</p>
              </div>
              
              <Form {...rejectionForm}>
                <form onSubmit={rejectionForm.handleSubmit(onRejectionSubmit)} className="space-y-4">
                  <FormField
                    control={rejectionForm.control}
                    name="rejectionReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivazione del rifiuto *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Spiega i motivi del rifiuto della candidatura..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Questa motivazione sarà inviata al candidato via email
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setRejectionDialogOpen(false)}
                      disabled={rejectMutation.isPending}
                    >
                      Annulla
                    </Button>
                    <Button 
                      type="submit"
                      variant="destructive"
                      disabled={rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Rifiutando...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Rifiuta Candidatura
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Registration Approval Dialog */}
      <Dialog open={registrationApprovalDialogOpen} onOpenChange={setRegistrationApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approva Registrazione</DialogTitle>
          </DialogHeader>
          {selectedRegistrationRequest && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedRegistrationRequest.username}</p>
                <p className="text-sm text-muted-foreground">{selectedRegistrationRequest.email}</p>
                {selectedRegistrationRequest.companyName && (
                  <p className="text-sm text-muted-foreground">Azienda: {selectedRegistrationRequest.companyName}</p>
                )}
                {selectedRegistrationRequest.message && (
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="text-sm">{selectedRegistrationRequest.message}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setRegistrationApprovalDialogOpen(false)}
                  disabled={approveRegistrationMutation.isPending}
                >
                  Annulla
                </Button>
                <Button 
                  onClick={() => approveRegistrationMutation.mutate(selectedRegistrationRequest.id)}
                  disabled={approveRegistrationMutation.isPending}
                >
                  {approveRegistrationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approva
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Registration Rejection Dialog */}
      <Dialog open={registrationRejectionDialogOpen} onOpenChange={setRegistrationRejectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rifiuta Registrazione</DialogTitle>
          </DialogHeader>
          {selectedRegistrationRequest && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedRegistrationRequest.username}</p>
                <p className="text-sm text-muted-foreground">{selectedRegistrationRequest.email}</p>
              </div>
              
              <div>
                <Label htmlFor="rejectionReason">Motivazione del rifiuto *</Label>
                <Textarea 
                  placeholder="Spiega i motivi del rifiuto..."
                  value={registrationRejectionReason}
                  onChange={(e) => setRegistrationRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setRegistrationRejectionDialogOpen(false);
                    setRegistrationRejectionReason('');
                  }}
                  disabled={rejectRegistrationMutation.isPending}
                >
                  Annulla
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => rejectRegistrationMutation.mutate({
                    id: selectedRegistrationRequest.id,
                    reason: registrationRejectionReason
                  })}
                  disabled={rejectRegistrationMutation.isPending || !registrationRejectionReason.trim()}
                >
                  {rejectRegistrationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rifiutando...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Rifiuta
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}