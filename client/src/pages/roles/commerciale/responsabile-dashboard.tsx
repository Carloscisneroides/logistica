import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, TrendingUp, BarChart3, Award, Target, DollarSign, UserCheck, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function ResponsabileDashboard() {
  const { user } = useAuth();

  const { data: teamStats } = useQuery({
    queryKey: ['/api/commerciale/responsabile-team'],
    enabled: user?.role === 'commerciale' && user?.subRole === 'responsabile'
  });

  const { data: agentsData } = useQuery({
    queryKey: ['/api/commerciale/responsabile-agents'],
    enabled: user?.role === 'commerciale' && user?.subRole === 'responsabile'
  });

  const getLivelloColor = (livello: string) => {
    switch(livello) {
      case 'premium': return 'bg-yellow-500 text-black';
      case 'medium': return 'bg-blue-500 text-white';
      case 'base': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-purple-600" />
            Dashboard Responsabile
          </h1>
          <p className="text-muted-foreground mt-2">
            Benvenuto {user?.username}! Gestisci il tuo team di agenti commerciali
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="px-3 py-1">
            <Users className="h-4 w-4 mr-1" />
            RESPONSABILE COMMERCIALE
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            {teamStats?.totalAgents || 8} AGENTI
          </Badge>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{teamStats?.avgPerformance || 87}%</div>
            <div className="mt-2">
              <Progress value={teamStats?.avgPerformance || 87} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Media del team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agenti Attivi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats?.activeAgents || 8}</div>
            <p className="text-xs text-muted-foreground">
              su {teamStats?.totalAgents || 8} totali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatturato Mensile</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{teamStats?.monthlyRevenue || '45.200'}</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mese scorso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuovi Clienti</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats?.newClients || 15}</div>
            <p className="text-xs text-muted-foreground">
              Questo mese
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Management Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestione Team
            </CardTitle>
            <CardDescription>
              Gestisci il tuo team di agenti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-add-agent">
              <Users className="h-4 w-4 mr-2" />
              Aggiungi Nuovo Agente
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-assign-targets">
              <Target className="h-4 w-4 mr-2" />
              Assegna Obiettivi
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-team-training">
              <Award className="h-4 w-4 mr-2" />
              Programmi Formazione
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics & Reports
            </CardTitle>
            <CardDescription>
              Analisi performance del team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-team-report">
              <BarChart3 className="h-4 w-4 mr-2" />
              Report Team Completo
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-performance-trends">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trend Performance
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-commission-overview">
              <DollarSign className="h-4 w-4 mr-2" />
              Overview Commissioni
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurazioni
            </CardTitle>
            <CardDescription>
              Impostazioni team e processi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-commission-structure">
              <Settings className="h-4 w-4 mr-2" />
              Struttura Commissioni
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-level-requirements">
              <Award className="h-4 w-4 mr-2" />
              Requisiti Livelli
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-territory-assignment">
              <Target className="h-4 w-4 mr-2" />
              Assegnazione Territori
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Agents Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance Agenti
          </CardTitle>
          <CardDescription>
            Panoramica delle performance dei tuoi agenti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agente</TableHead>
                <TableHead>Livello</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Clienti</TableHead>
                <TableHead>Fatturato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(agentsData?.agents || []).slice(0, 8).map((agent: any, index: number) => (
                <TableRow key={index} data-testid={`agent-row-${index}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{agent.name || `Agente ${index + 1}`}</p>
                      <p className="text-xs text-muted-foreground">{agent.email || `agente${index + 1}@ycore.it`}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getLivelloColor(agent.livello || 'base')}>
                      {(agent.livello || 'base').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {agent.grado || '1'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span className={`font-medium ${getPerformanceColor(agent.performance || 75)}`}>
                        {agent.performance || 75}%
                      </span>
                      <Progress value={agent.performance || 75} className="h-1 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>{agent.clients || 12}</TableCell>
                  <TableCell className="text-green-600 font-medium">
                    €{agent.revenue || '5.200'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" data-testid={`button-view-agent-${index}`}>
                        Visualizza
                      </Button>
                      <Button size="sm" variant="default" data-testid={`button-manage-agent-${index}`}>
                        Gestisci
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!agentsData?.agents || agentsData.agents.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nessun agente assegnato al momento
                    </p>
                    <Button className="mt-4" data-testid="button-add-first-agent">
                      Aggiungi Primo Agente
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Team Goals & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Obiettivi Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fatturato Trimestrale</span>
                <span>€{teamStats?.quarterlyProgress || '120.000'}/€150.000</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nuovi Clienti Acquisiti</span>
                <span>{teamStats?.newClientsProgress || 38}/50</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Agenti Premium</span>
                <span>{teamStats?.premiumAgents || 2}/3</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Riconoscimenti Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Agente del Mese</span>
                <Badge className="bg-yellow-500 text-black">
                  {teamStats?.topAgent || 'Mario Rossi'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Team Performance</span>
                <Badge variant={(teamStats?.teamRank || 5) <= 3 ? 'default' : 'secondary'}>
                  #{teamStats?.teamRank || 2} Nazionale
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bonus Team</span>
                <span className="font-bold text-green-600">€{teamStats?.teamBonus || '3.200'}</span>
              </div>
            </div>
            <Button variant="default" className="w-full" data-testid="button-team-achievements">
              <Award className="h-4 w-4 mr-2" />
              Visualizza Achievements
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}