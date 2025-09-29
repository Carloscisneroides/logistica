export type Language = {
  code: string;
  name: string;
  flag: string;
};

export const languages: Language[] = [
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export const translations = {
  it: {
    // Navigation
    dashboard: "Dashboard",
    courierModules: "Moduli Corrieri",
    aiRouting: "AI Routing",
    clients: "Clienti",
    billing: "Fatturazione",
    corrections: "Rettifiche & Supplementi",
    commercial: "Commerciali",
    analytics: "Analytics",
    settings: "Impostazioni",
    
    // Common
    active: "Attivo",
    inactive: "Inattivo",
    pending: "In Attesa",
    add: "Aggiungi",
    edit: "Modifica",
    delete: "Elimina",
    save: "Salva",
    cancel: "Annulla",
    loading: "Caricamento...",
    success: "Successo",
    error: "Errore",
    
    // Auth
    login: "Accesso",
    username: "Username",
    password: "Password",
    enterCredentials: "Inserisci le tue credenziali",
    enterUsername: "Inserisci il tuo username",
    enterPassword: "Inserisci la tua password",
    tagline: "Il Motore del Business Moderno",
    demoReserved: "DEMO RISERVATA",
    authorizedPartners: "Accesso limitato ai partner autorizzati",
    installApp: "Installa NYVRA App",
    
    // eCommerce
    products: "Prodotti",
    orders: "Ordini",
    addProduct: "Aggiungi Prodotto",
    productName: "Nome Prodotto",
    productPrice: "Prezzo",
    productStock: "Scorte",
    outOfStock: "Esaurito",
    inStock: "Disponibile",
    
    // Dashboard
    todayShipments: "Spedizioni Oggi",
    activeClients: "Clienti Attivi",
    monthlyRevenue: "Ricavi Mensili",
    activeModules: "Moduli Attivi",
    
    // Billing
    invoices: "Fatture",
    prepaid: "Ricarica Anticipata",
    postpaid: "Fatturazione Posticipata",
    daily: "Giornaliera",
    weekly: "Settimanale",
    biweekly: "Ogni 15 giorni",
    monthly: "Mensile",
    
    // Client types
    merchant: "Merchant",
    platform: "Piattaforma",
    subClient: "Sotto-cliente",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    courierModules: "Courier Modules",
    aiRouting: "AI Routing",
    clients: "Clients",
    billing: "Billing",
    corrections: "Corrections & Supplements",
    commercial: "Sales Team",
    analytics: "Analytics",
    settings: "Settings",
    
    // Common
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    
    // Auth
    login: "Login",
    username: "Username",
    password: "Password",
    enterCredentials: "Enter your credentials",
    enterUsername: "Enter your username",
    enterPassword: "Enter your password",
    tagline: "The Engine of Modern Business",
    demoReserved: "DEMO RESERVED",
    authorizedPartners: "Access limited to authorized partners",
    installApp: "Install NYVRA App",
    
    // eCommerce
    products: "Products",
    orders: "Orders",
    addProduct: "Add Product",
    productName: "Product Name",
    productPrice: "Price",
    productStock: "Stock",
    outOfStock: "Out of Stock",
    inStock: "In Stock",
    
    // Dashboard
    todayShipments: "Today's Shipments",
    activeClients: "Active Clients",
    monthlyRevenue: "Monthly Revenue",
    activeModules: "Active Modules",
    
    // Billing
    invoices: "Invoices",
    prepaid: "Prepaid",
    postpaid: "Postpaid",
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    
    // Client types
    merchant: "Merchant",
    platform: "Platform",
    subClient: "Sub-client",
  },
};

export type TranslationKey = keyof typeof translations.it;

export class I18n {
  private static instance: I18n;
  private currentLanguage: string = "it";
  private translations = translations;

  private constructor() {}

  public static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
  }

  public setLanguage(language: string): void {
    if (this.translations[language as keyof typeof translations]) {
      this.currentLanguage = language;
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  public t(key: TranslationKey): string {
    const langTranslations = this.translations[this.currentLanguage as keyof typeof translations] || this.translations.it;
    return langTranslations[key] || key;
  }

  public getLanguages(): Language[] {
    return languages;
  }
}

export const i18n = I18n.getInstance();

// React hook for translations
import { useState, useEffect } from "react";

export function useTranslation() {
  const [, forceUpdate] = useState({});

  const t = (key: TranslationKey) => i18n.t(key);
  
  const setLanguage = (language: string) => {
    i18n.setLanguage(language);
    forceUpdate({});
  };

  return {
    t,
    setLanguage,
    currentLanguage: i18n.getCurrentLanguage(),
    languages: i18n.getLanguages(),
  };
}
