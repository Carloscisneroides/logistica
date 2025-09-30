import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

/**
 * Middleware per enforcement limiti spedizioni subscription
 * Controlla se il client ha raggiunto il limite mensile di spedizioni
 * basato sul piano subscription attivo
 */
export async function checkSubscriptionLimits(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    
    if (!user?.tenantId) {
      return res.status(400).json({ error: "Tenant not found" });
    }

    // Estrai clientId dalla request body
    const { clientId } = req.body;
    
    if (!clientId) {
      return res.status(400).json({ error: "Client ID is required" });
    }

    // Verifica subscription attiva per il client
    const subscription = await storage.getActiveClientSubscription(clientId);
    
    // Se non c'è subscription attiva, blocca (nessun piano gratuito senza subscription)
    if (!subscription) {
      return res.status(403).json({ 
        error: "No active subscription found",
        message: "Please activate a subscription plan to create shipments"
      });
    }

    // Controlla se il limite mensile è stato raggiunto
    if (subscription.currentUsage >= subscription.monthlyShipmentLimit) {
      return res.status(429).json({ 
        error: "Monthly shipment limit reached",
        message: `You have reached your monthly limit of ${subscription.monthlyShipmentLimit} shipments`,
        currentUsage: subscription.currentUsage,
        limit: subscription.monthlyShipmentLimit,
        tier: subscription.tier,
        upgradeAvailable: true
      });
    }

    // Controllo warning: avvisa se vicino al limite (90%)
    const usagePercentage = (subscription.currentUsage / subscription.monthlyShipmentLimit) * 100;
    if (usagePercentage >= 90) {
      // Aggiungi warning nell'header della response
      res.setHeader('X-Subscription-Warning', `You are at ${Math.round(usagePercentage)}% of your monthly limit`);
    }

    // Aggiungi info subscription alla request per uso successivo
    (req as any).subscription = subscription;
    
    next();
  } catch (error: any) {
    console.error('[SUBSCRIPTION_MIDDLEWARE] Error checking limits:', error);
    return res.status(500).json({ 
      error: "Failed to check subscription limits",
      message: error.message 
    });
  }
}

/**
 * Middleware per incrementare il contatore usage dopo creazione spedizione
 * Da chiamare DOPO la creazione della spedizione
 */
export async function incrementShipmentUsage(
  req: Request,
  res: Response,
  shipmentId: string
) {
  try {
    const subscription = (req as any).subscription;
    
    if (!subscription) {
      console.warn('[SUBSCRIPTION_MIDDLEWARE] No subscription found in request, skipping usage increment');
      return;
    }

    // Incrementa currentUsage
    await storage.incrementSubscriptionUsage(subscription.id);
    
    console.log(`[SUBSCRIPTION_MIDDLEWARE] Incremented usage for subscription ${subscription.id}: ${subscription.currentUsage + 1}/${subscription.monthlyShipmentLimit}`);
    
  } catch (error: any) {
    console.error('[SUBSCRIPTION_MIDDLEWARE] Error incrementing usage:', error);
    // Non bloccare la response, logga solo l'errore
  }
}

/**
 * Helper function per resettare usage mensile (da chiamare con cron job)
 */
export async function resetMonthlyUsage() {
  try {
    console.log('[SUBSCRIPTION_MIDDLEWARE] Starting monthly usage reset...');
    
    const result = await storage.resetAllSubscriptionUsage();
    
    console.log(`[SUBSCRIPTION_MIDDLEWARE] Monthly usage reset completed: ${result.count} subscriptions reset`);
    
    return result;
  } catch (error: any) {
    console.error('[SUBSCRIPTION_MIDDLEWARE] Error resetting monthly usage:', error);
    throw error;
  }
}
