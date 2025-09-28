import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Target, Award, DollarSign, BarChart3, Calendar, Gift } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function AgenteDashboard() {
  const { user } = useAuth();

  const { data: performance } = useQuery({
    queryKey: ['/api/commerciale/agente-performance'],
    enabled: user?.role === 'commerciale' && user?.subRole === 'agente'
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/commerciale/agente-clients'],
    enabled: user?.role === 'commerciale' && user?.subRole === 'agente'
  });

  // Calcolo livello e grado in base alle performance
  const getLivelloColor = (livello: string) => {
    switch(livello) {
      case 'premium': return 'text-yellow-600';
      case 'medium': return 'text-blue-600';
      case 'base': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getGradoBadge = (grado: string) => {
    const colors = {
      '3': 'bg-yellow-500 text-black',
      '2': 'bg-blue-500 text-white', 
      '1': 'bg-gray-500 text-white'
    };
    return colors[grado as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-green-600" />
            Dashboard Agente
          </h1>
          <p className="text-muted-foreground mt-2">
            Benvenuto {user?.username}! Monitora le tue performance e clienti
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="px-3 py-1">
            <Award className="h-4 w-4 mr-1" />
            AGENTE COMMERCIALE
          </Badge>
          <Badge className={`px-3 py-1 ${getGradoBadge((user as any)?.grado || '1')}`}>
            GRADO {(user as any)?.grado || '1'}
          </Badge>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livello Attuale</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getLivelloColor((user as any)?.livello || 'base')}`}>
              {((user as any)?.livello || 'base').toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              Grado {(user as any)?.grado || '1'} di 3
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance %</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(user as any)?.percentuale || 85}%</div>
            <div className="mt-2">
              <Progress value={(user as any)?.percentuale || 85} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +5% questo mese
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clienti Attivi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance?.activeClients || 24}</div>
            <p className="text-xs text-muted-foreground">
              +3 questo mese
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissioni</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{performance?.monthlyCommissions || '2.450'}</div>
            <p className="text-xs text-muted-foreground">
              Questo mese
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals & Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Obiettivi Mensili
            </CardTitle>
            <CardDescription>
              I tuoi target per il mese corrente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nuovi Clienti</span>
                <span>{performance?.newClientsProgress || 8}/10</span>
              </div>
              <Progress value={(performance?.newClientsProgress || 8) * 10} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Volume Vendite</span>
                <span>€{performance?.salesProgress || '18.500'}/€25.000</span>
              </div>
              <Progress value={74} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Retention Rate</span>
                <span>{performance?.retentionRate || 92}%/95%</span>
              </div>
              <Progress value={performance?.retentionRate || 92} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
            <CardDescription>
              Analisi delle tue performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-sales-report">
              <BarChart3 className="h-4 w-4 mr-2" />
              Report Vendite Settimanale
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-client-analysis">
              <Users className="h-4 w-4 mr-2" />
              Analisi Portafoglio Clienti
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-commission-details">
              <DollarSign className="h-4 w-4 mr-2" />
              Dettaglio Commissioni
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-upgrade-path">
              <Award className="h-4 w-4 mr-2" />
              Percorso Avanzamento
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients & Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clienti Recenti
          </CardTitle>
          <CardDescription>
            Ultimi clienti acquisiti e attività
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(clients?.recent || []).slice(0, 5).map((client: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`client-recent-${index}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{client.name || `Cliente ${index + 1}`}</p>
                    <Badge variant={client.type === 'logistica' ? 'default' : 'secondary'}>
                      {client.type || 'marketplace'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {client.company || 'Azienda di Logistica SRL'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Volume: €{client.monthlyVolume || '1.200'}/mese</span>
                    <span>Acquisito: {client.acquisitionDate || '3 giorni fa'}</span>
                    <span>Tipo: {client.businessType || 'Logistica'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" data-testid={`button-client-details-${index}`}>
                    Dettagli
                  </Button>
                  <Button size="sm" variant="default" data-testid={`button-contact-client-${index}`}>
                    Contatta
                  </Button>
                </div>
              </div>
            ))}
            {(!clients?.recent || clients.recent.length === 0) && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Non hai ancora acquisito clienti questo mese
                </p>
                <Button className="mt-4" data-testid="button-find-prospects">
                  Trova Nuovi Prospects
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Level Progression & Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Progressione Livello
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Livello Attuale</span>
                <Badge className={`${getLivelloColor((user as any)?.livello || 'base')}`}>
                  {((user as any)?.livello || 'base').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Grado Attuale</span>
                <Badge className={getGradoBadge((user as any)?.grado || '1')}>
                  GRADO {(user as any)?.grado || '1'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Prossimo Livello</span>
                <span className="text-xs text-muted-foreground">
                  {(user as any)?.livello === 'premium' ? 'Massimo Raggiunto' : 
                   (user as any)?.livello === 'medium' ? 'PREMIUM' : 'MEDIUM'}
                </span>
              </div>
            </div>
            <Button variant="default" className="w-full" data-testid="button-level-requirements">
              <Award className="h-4 w-4 mr-2" />
              Requisiti Avanzamento
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Premi & Incentivi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Bonus Trimestrale</span>
                <span className="font-bold text-green-600">€{performance?.quarterlyBonus || 850}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Prossimo Bonus</span>
                <span className="text-xs text-muted-foreground">{performance?.nextBonusEta || '15 giorni'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Incentivi Attivi</span>
                <span className="text-xs text-muted-foreground">{performance?.activeIncentives || 2} disponibili</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-view-incentives">
              <Gift className="h-4 w-4 mr-2" />
              Visualizza Incentivi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}