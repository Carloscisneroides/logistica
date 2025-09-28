import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user with role
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'system_creator' | 'admin' | 'staff' | 'client';
        username: string;
        email: string;
        tenantId: string;
      };
    }
  }
}

/**
 * Middleware per autorizzazione basata su ruoli
 * Verifica che l'utente abbia il ruolo richiesto per accedere alla risorsa
 */
export function authorizeRole(allowedRoles: Array<'system_creator' | 'admin' | 'staff' | 'client'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verifica autenticazione
    if (!req.user) {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      console.log(`[ROLE_AUTH_FAILED] UNAUTHENTICATED ACCESS ATTEMPT | IP: ${clientIP} | Path: ${req.path} | Time: ${new Date().toISOString()}`);
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verifica autorizzazione ruolo
    if (!allowedRoles.includes(req.user.role)) {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      console.log(`[ROLE_AUTH_FAILED] UNAUTHORIZED ROLE ACCESS | User: ${req.user.id} | Role: ${req.user.role} | Required: ${allowedRoles.join(',')} | IP: ${clientIP} | Path: ${req.path} | Time: ${new Date().toISOString()}`);
      return res.status(403).json({ 
        error: "Insufficient permissions", 
        required: allowedRoles,
        current: req.user.role 
      });
    }

    // Log accesso autorizzato
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`[ROLE_AUTH_SUCCESS] AUTHORIZED ACCESS | User: ${req.user.id} | Role: ${req.user.role} | IP: ${clientIP} | Path: ${req.path} | Time: ${new Date().toISOString()}`);
    
    next();
  };
}

/**
 * Middleware specifici per ogni ruolo
 */
export const requireSystemCreator = authorizeRole(['system_creator']);
export const requireAdmin = authorizeRole(['system_creator', 'admin']);
export const requireStaff = authorizeRole(['system_creator', 'admin', 'staff']);
export const requireClient = authorizeRole(['system_creator', 'admin', 'staff', 'client']);

/**
 * Utility per verificare se un utente ha un ruolo specifico
 */
export function hasRole(user: Express.Request['user'], role: 'system_creator' | 'admin' | 'staff' | 'client'): boolean {
  if (!user) return false;
  
  // System creator ha accesso a tutto
  if (user.role === 'system_creator') return true;
  
  // Admin ha accesso a admin, staff, client
  if (user.role === 'admin' && ['admin', 'staff', 'client'].includes(role)) return true;
  
  // Staff ha accesso a staff, client
  if (user.role === 'staff' && ['staff', 'client'].includes(role)) return true;
  
  // Client ha accesso solo a client
  if (user.role === 'client' && role === 'client') return true;
  
  return false;
}

/**
 * Middleware per verificare accesso a livello tenant
 */
export function authorizeTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // System creator ha accesso a tutti i tenant
  if (req.user.role === 'system_creator') {
    return next();
  }

  // Altri ruoli possono accedere solo al proprio tenant
  const requestedTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
  
  if (requestedTenantId && requestedTenantId !== req.user.tenantId) {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`[TENANT_AUTH_FAILED] CROSS-TENANT ACCESS ATTEMPT | User: ${req.user.id} | UserTenant: ${req.user.tenantId} | RequestedTenant: ${requestedTenantId} | IP: ${clientIP} | Time: ${new Date().toISOString()}`);
    return res.status(403).json({ error: "Tenant access denied" });
  }

  next();
}