import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Corrections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data: corrections, isLoading } = useQuery({
    queryKey: ["/api/corrections"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const uploadCorrectionsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("csvFile", file);
      
      const res = await fetch("/api/corrections/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Upload failed");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/corrections"] });
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      toast({
        title: "Successo",
        description: `Caricate ${data.corrections?.length || 0} rettifiche`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore nel caricamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Elaborata
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            In Attesa
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Errore
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCorrectionTypeLabel = (type: string) => {
    switch (type) {
      case "supplement":
        return "Supplemento";
      case "correction":
        return "Rettifica";
      case "penalty":
        return "Penale";
      case "weight_supplement":
        return "Supplemento Peso";
      case "zone_supplement":
        return "Supplemento Zona";
      case "storage_fee":
        return "Giacenza";
      default:
        return type;
    }
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFile) {
      uploadCorrectionsMutation.mutate(uploadFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setUploadFile(file);
    } else {
      toast({
        title: "Formato file non valido",
        description: "Per favore seleziona un file CSV",
        variant: "destructive",
      });
    }
  };

  const pendingCorrections = corrections?.filter((c: any) => c.status === "pending") || [];
  const processedCorrections = corrections?.filter((c: any) => c.status === "processed") || [];
  const errorCorrections = corrections?.filter((c: any) => c.status === "error") || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rettifiche e Supplementi</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci rettifiche e supplementi dai corrieri
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" data-testid="button-download-template">
            <Download className="w-4 h-4 mr-2" />
            Template CSV
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload-corrections">
                <Upload className="w-4 h-4 mr-2" />
                Carica CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Carica File CSV Rettifiche</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">File CSV</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    required
                    data-testid="input-csv-file"
                  />
                  <p className="text-sm text-muted-foreground">
                    Il file deve contenere le colonne: clientId, trackingNumber, type, amount, description
                  </p>
                </div>
                {uploadFile && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">File selezionato:</p>
                    <p className="text-sm text-muted-foreground">{uploadFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Dimensione: {(uploadFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsUploadDialogOpen(false);
                      setUploadFile(null);
                    }}
                    data-testid="button-cancel-upload"
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={!uploadFile || uploadCorrectionsMutation.isPending}
                    data-testid="button-submit-upload"
                  >
                    {uploadCorrectionsMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Carica File
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Attesa</p>
                <p className="text-3xl font-bold text-foreground" data-testid="stats-pending-corrections">
                  {pendingCorrections.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Elaborate</p>
                <p className="text-3xl font-bold text-foreground" data-testid="stats-processed-corrections">
                  {processedCorrections.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errori</p>
                <p className="text-3xl font-bold text-foreground" data-testid="stats-error-corrections">
                  {errorCorrections.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Corrections Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rettifiche e Supplementi</CardTitle>
            <Button variant="outline" size="sm" data-testid="button-export-corrections">
              <Download className="w-4 h-4 mr-2" />
              Esporta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {corrections?.map((correction: any) => (
                  <TableRow key={correction.id} data-testid={`correction-row-${correction.id}`}>
                    <TableCell>
                      {clients?.find((c: any) => c.id === correction.clientId)?.name || "N/A"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {correction.trackingNumber || "N/A"}
                    </TableCell>
                    <TableCell>
                      {getCorrectionTypeLabel(correction.type)}
                    </TableCell>
                    <TableCell className="font-medium">
                      €{parseFloat(correction.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {correction.description || "-"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(correction.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(correction.createdAt).toLocaleDateString("it-IT")}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-view-correction-${correction.id}`}
                        >
                          Visualizza
                        </Button>
                        {correction.status === "pending" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-process-correction-${correction.id}`}
                          >
                            Elabora
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!corrections || corrections.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Nessuna rettifica caricata</p>
                      <p className="text-sm">Carica un file CSV per iniziare</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* CSV Format Help */}
      <Card>
        <CardHeader>
          <CardTitle>Formato File CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Il file CSV deve contenere le seguenti colonne:
            </p>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <strong>clientId</strong>
                  <p className="text-muted-foreground">ID cliente</p>
                </div>
                <div>
                  <strong>trackingNumber</strong>
                  <p className="text-muted-foreground">Numero tracking</p>
                </div>
                <div>
                  <strong>type</strong>
                  <p className="text-muted-foreground">Tipo (supplement, correction, penalty)</p>
                </div>
                <div>
                  <strong>amount</strong>
                  <p className="text-muted-foreground">Importo (decimale)</p>
                </div>
                <div>
                  <strong>description</strong>
                  <p className="text-muted-foreground">Descrizione (opzionale)</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Esempio: <code>client123,TR123456789,supplement,5.50,Supplemento peso extra</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
