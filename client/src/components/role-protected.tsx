import { useAuth } from "@/hooks/use-auth";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type UserRole = 'system_creator' | 'admin' | 'staff' | 'client';

interface RoleProtectedProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  clientType?: 'marketplace' | 'logistica';
}

/**
 * Componente per proteggere contenuti basati su ruoli
 * Verifica che l'utente abbia uno dei ruoli consentiti
 */
export function RoleProtected({ 
  allowedRoles, 
  children, 
  fallback,
  showFallback = true,
  clientType
}: RoleProtectedProps) {
  const { user, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Non autenticato
  if (!user) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Shield className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this area
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/auth'} data-testid="button-login">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verifica autorizzazione ruolo e clientType
  if (!hasPermission(user.role as UserRole, allowedRoles) || 
      (clientType && user.role === 'client' && (user as any).clientType !== clientType)) {
    if (fallback) return <>{fallback}</>;
    
    if (!showFallback) return null;

    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AlertTriangle className="h-12 w-12 text-orange-500" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                Your Role: {user.role}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Required: {allowedRoles.join(', ')}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()} 
              className="w-full"
              data-testid="button-go-back"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Accesso autorizzato
  return <>{children}</>;
}

/**
 * Utility per verificare permessi ruolo
 */
function hasPermission(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  // System creator ha accesso a tutto
  if (userRole === 'system_creator') return true;
  
  // Verifica se il ruolo è esplicitamente consentito
  if (allowedRoles.includes(userRole)) return true;
  
  // Verifica gerarchia permessi
  const roleHierarchy: Record<UserRole, UserRole[]> = {
    system_creator: ['system_creator', 'admin', 'staff', 'client'],
    admin: ['admin', 'staff', 'client'],
    staff: ['staff', 'client'],
    client: ['client']
  };
  
  const userPermissions = roleHierarchy[userRole];
  return allowedRoles.some(role => userPermissions.includes(role));
}

/**
 * Hook per verificare permessi dell'utente corrente
 */
export function useRolePermissions() {
  const { user } = useAuth();
  
  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return hasPermission(user.role as UserRole, [role]);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return hasPermission(user.role as UserRole, roles);
  };

  const canAccess = (requiredRoles: UserRole[]): boolean => {
    return hasAnyRole(requiredRoles);
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    canAccess,
    isSystemCreator: hasRole('system_creator'),
    isAdmin: hasRole('admin'),
    isStaff: hasRole('staff'),
    isClient: hasRole('client')
  };
}