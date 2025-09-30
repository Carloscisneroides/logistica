import type { User } from "./schema";

export type LogisticsRole = "superadmin" | "admin" | "integrator" | "cliente_base" | "sottocliente";
export type UserRole = "system_creator" | "admin" | "staff" | "client" | "commerciale" | "merchant";
export type ClientType = "marketplace" | "logistica";

export interface LogisticsRoleConfig {
  role: LogisticsRole;
  label: string;
  description: string;
  permissions: {
    canManageProviders: boolean;
    canConfigureAI: boolean;
    canActivateCarriers: boolean;
    canManageSubClients: boolean;
    canCustomizeBranding: boolean;
    canUseOwnContracts: boolean;
    canResell: boolean;
    viewExternalProviders: boolean;
  };
}

export const LOGISTICS_ROLES: Record<LogisticsRole, LogisticsRoleConfig> = {
  superadmin: {
    role: "superadmin",
    label: "SUPERADMIN",
    description: "Accesso completo, provisioning globale",
    permissions: {
      canManageProviders: true,
      canConfigureAI: true,
      canActivateCarriers: true,
      canManageSubClients: true,
      canCustomizeBranding: true,
      canUseOwnContracts: true,
      canResell: true,
      viewExternalProviders: true,
    },
  },
  admin: {
    role: "admin",
    label: "ADMIN",
    description: "Gestione tenant, attivazione corrieri, branding",
    permissions: {
      canManageProviders: false,
      canConfigureAI: false,
      canActivateCarriers: true,
      canManageSubClients: true,
      canCustomizeBranding: true,
      canUseOwnContracts: false,
      canResell: false,
      viewExternalProviders: true,
    },
  },
  integrator: {
    role: "integrator",
    label: "INTEGRATOR",
    description: "Personalizzazione, contratti API propri, rivendita",
    permissions: {
      canManageProviders: false,
      canConfigureAI: false,
      canActivateCarriers: true,
      canManageSubClients: true,
      canCustomizeBranding: true,
      canUseOwnContracts: true,
      canResell: true,
      viewExternalProviders: true,
    },
  },
  cliente_base: {
    role: "cliente_base",
    label: "CLIENTE BASE",
    description: "Accesso limitato, solo NYVRA come provider",
    permissions: {
      canManageProviders: false,
      canConfigureAI: false,
      canActivateCarriers: false,
      canManageSubClients: false,
      canCustomizeBranding: false,
      canUseOwnContracts: false,
      canResell: false,
      viewExternalProviders: false,
    },
  },
  sottocliente: {
    role: "sottocliente",
    label: "SOTTOCLIENTE",
    description: "Visibilità filtrata, branding cliente",
    permissions: {
      canManageProviders: false,
      canConfigureAI: false,
      canActivateCarriers: false,
      canManageSubClients: false,
      canCustomizeBranding: false,
      canUseOwnContracts: false,
      canResell: false,
      viewExternalProviders: false,
    },
  },
};

export function getLogisticsRole(user: Partial<User>): LogisticsRole | null {
  if (!user.role) return null;

  if (user.role === "system_creator") {
    return "superadmin";
  }

  if (user.role === "admin") {
    return "admin";
  }

  if (user.role === "client" && user.clientType === "logistica") {
    if ((user as any).isIntegrator === true) {
      return "integrator";
    }
    
    if ((user as any).parentClientId) {
      return "sottocliente";
    }
    
    return "cliente_base";
  }

  return null;
}

export function hasLogisticsPermission(
  user: Partial<User>,
  permission: keyof LogisticsRoleConfig["permissions"]
): boolean {
  const logisticsRole = getLogisticsRole(user);
  if (!logisticsRole) return false;

  const config = LOGISTICS_ROLES[logisticsRole];
  return config.permissions[permission];
}

export function getLogisticsRoleLabel(user: Partial<User>): string | null {
  const logisticsRole = getLogisticsRole(user);
  if (!logisticsRole) return null;

  return LOGISTICS_ROLES[logisticsRole].label;
}

export function getLogisticsRoleDescription(user: Partial<User>): string | null {
  const logisticsRole = getLogisticsRole(user);
  if (!logisticsRole) return null;

  return LOGISTICS_ROLES[logisticsRole].description;
}

export const LOGISTICS_ROLE_MAPPING = {
  system_creator: "superadmin",
  admin: "admin",
  "client+integrator": "integrator",
  "client+base": "cliente_base",
  "client+sub": "sottocliente",
} as const;
