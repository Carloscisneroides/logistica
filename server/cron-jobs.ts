import { storage } from "./storage";

/**
 * NYVRA - Cron Jobs per Subscription Management
 * 
 * Sistema automatizzato per reset mensile utilizzo subscription
 * e gestione lifecycle abbonamenti clienti
 */

// Configurazione cron job
const CRON_ENABLED = process.env.CRON_ENABLED !== 'false';
const RESET_HOUR = parseInt(process.env.SUBSCRIPTION_RESET_HOUR || '0'); // Default: mezzanotte
const RESET_DAY = parseInt(process.env.SUBSCRIPTION_RESET_DAY || '1'); // Default: primo del mese

let monthlyResetInterval: NodeJS.Timeout | null = null;

/**
 * Reset mensile automatico dell'utilizzo di tutte le subscription attive
 * Viene eseguito il primo giorno di ogni mese
 */
export async function resetMonthlySubscriptionUsage() {
  try {
    console.log('[CRON] Starting monthly subscription usage reset...');
    
    const result = await storage.resetAllSubscriptionUsage();
    
    console.log(`[CRON] ✅ Monthly reset completed - ${result.count} subscription(s) reset`);
    
    return {
      success: true,
      count: result.count,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[CRON] ❌ Monthly reset failed:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Calcola il tempo rimanente fino al prossimo reset mensile
 */
function getTimeUntilNextReset(): number {
  const now = new Date();
  const nextReset = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    RESET_DAY,
    RESET_HOUR,
    0,
    0,
    0
  );
  
  // Se siamo già oltre il giorno di reset di questo mese, schedula per il mese prossimo
  if (now.getDate() > RESET_DAY || (now.getDate() === RESET_DAY && now.getHours() >= RESET_HOUR)) {
    nextReset.setMonth(nextReset.getMonth() + 1);
  }
  
  return nextReset.getTime() - now.getTime();
}

/**
 * Schedula il prossimo reset mensile
 */
function scheduleNextReset() {
  if (!CRON_ENABLED) {
    console.log('[CRON] Cron jobs disabled via CRON_ENABLED=false');
    return;
  }

  // Cancella il timer precedente se esiste
  if (monthlyResetInterval) {
    clearTimeout(monthlyResetInterval);
  }

  const timeUntilReset = getTimeUntilNextReset();
  const nextResetDate = new Date(Date.now() + timeUntilReset);
  
  console.log(`[CRON] Next monthly subscription reset scheduled for: ${nextResetDate.toISOString()}`);
  console.log(`[CRON] Time until next reset: ${Math.round(timeUntilReset / 1000 / 60 / 60)} hours`);

  monthlyResetInterval = setTimeout(async () => {
    await resetMonthlySubscriptionUsage();
    // Schedula il prossimo reset dopo l'esecuzione
    scheduleNextReset();
  }, timeUntilReset);
}

/**
 * Inizializza tutti i cron jobs
 */
export function initializeCronJobs() {
  if (!CRON_ENABLED) {
    console.log('[CRON] ⚠️  Cron jobs are DISABLED. Set CRON_ENABLED=true to enable automatic resets.');
    return;
  }

  console.log('[CRON] 🚀 Initializing subscription cron jobs...');
  console.log(`[CRON] Reset schedule: Day ${RESET_DAY} of each month at ${RESET_HOUR}:00`);
  
  // Schedula il primo reset
  scheduleNextReset();
  
  console.log('[CRON] ✅ Cron jobs initialized successfully');
}

/**
 * Ferma tutti i cron jobs attivi
 */
export function stopCronJobs() {
  if (monthlyResetInterval) {
    clearTimeout(monthlyResetInterval);
    monthlyResetInterval = null;
    console.log('[CRON] All cron jobs stopped');
  }
}

/**
 * Ottiene lo stato dei cron jobs
 */
export function getCronJobsStatus() {
  const nextResetTime = monthlyResetInterval ? getTimeUntilNextReset() : null;
  const nextResetDate = nextResetTime ? new Date(Date.now() + nextResetTime) : null;
  
  return {
    enabled: CRON_ENABLED,
    active: monthlyResetInterval !== null,
    resetDay: RESET_DAY,
    resetHour: RESET_HOUR,
    nextReset: nextResetDate?.toISOString() || null,
    hoursUntilReset: nextResetTime ? Math.round(nextResetTime / 1000 / 60 / 60) : null
  };
}
