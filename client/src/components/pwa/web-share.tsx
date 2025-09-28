import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WebShareProps {
  title?: string;
  text?: string;
  url?: string;
}

export function WebShare({ 
  title = "YCORE - Piattaforma Logistics", 
  text = "Scopri YCORE, la piattaforma SaaS modulare per logistics e e-commerce", 
  url 
}: WebShareProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Get current URL safely
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleShare = async () => {
    // Check if Web Share API is supported
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: currentUrl,
        });
        
        toast({
          title: "📤 Condiviso!",
          description: "Contenuto condiviso con successo",
          duration: 3000,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "📋 Link Copiato!",
        description: "Il link è stato copiato negli appunti",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "❌ Errore",
        description: "Impossibile copiare il link",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="ripple-effect tap-scale"
      data-testid="button-web-share"
    >
      {copied ? (
        <Check className="w-4 h-4 mr-2 text-green-500" />
      ) : (typeof navigator !== 'undefined' && navigator.share) ? (
        <Share2 className="w-4 h-4 mr-2" />
      ) : (
        <Copy className="w-4 h-4 mr-2" />
      )}
      {copied ? "Copiato!" : "Condividi"}
    </Button>
  );
}