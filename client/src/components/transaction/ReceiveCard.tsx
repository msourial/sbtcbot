import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import QRCode from "qrcode.js";
import { useToast } from "@/hooks/use-toast";

export default function ReceiveCard() {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  const { data: walletData, isLoading } = useQuery({
    queryKey: ['/api/wallet/address'],
    onSuccess: (data) => {
      if (data?.address) {
        // Generate QR code on success
        generateQRCode(data.address);
      }
    }
  });
  
  const address = walletData?.address || "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

  const generateQRCode = async (address: string) => {
    try {
      const code = await QRCode.toDataURL(address, {
        margin: 1,
        width: 128,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(code);
    } catch (err) {
      console.error("QR code generation error:", err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address)
      .then(() => {
        toast({
          title: "Address copied",
          description: "Bitcoin address copied to clipboard"
        });
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        toast({
          title: "Failed to copy",
          description: "Unable to copy address to clipboard",
          variant: "destructive"
        });
      });
  };

  const shareAddress = () => {
    // In a real implementation, this would open a share dialog
    // For now, just copy to clipboard
    copyToClipboard();
    toast({
      title: "Address ready to share",
      description: "Address copied to clipboard for sharing"
    });
  };

  const requestAmount = () => {
    // In a real implementation, this would open a dialog to enter an amount
    toast({
      title: "Request feature",
      description: "Amount request feature coming soon"
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-4 text-center mb-3">
        <Skeleton className="mx-auto mb-3 bg-neutral-100 p-2 border border-neutral-200 inline-block rounded w-32 h-32" />
        <p className="text-sm font-medium mb-1">Your sBTC Address</p>
        <div className="flex items-center justify-center">
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-neutral-200 rounded-xl p-4 text-center mb-3">
        <div className="mx-auto mb-3 bg-white p-2 border border-neutral-200 inline-block rounded">
          {qrCode ? (
            <img 
              src={qrCode} 
              alt="QR code for Bitcoin address" 
              className="w-32 h-32"
            />
          ) : (
            <div className="w-32 h-32 bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-400 text-xs">Loading QR code...</span>
            </div>
          )}
        </div>
        <p className="text-sm font-medium mb-1">Your sBTC Address</p>
        <div className="flex items-center justify-center">
          <p className="text-xs text-neutral-500 font-mono bg-neutral-100 px-2 py-1 rounded truncate max-w-[240px]">
            {address}
          </p>
          <button 
            className="ml-2 text-[hsl(var(--telegram-blue))]"
            onClick={copyToClipboard}
            aria-label="Copy address"
          >
            <i className="ri-file-copy-line"></i>
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={shareAddress}
          className="flex-1 bg-[hsl(var(--telegram-blue))] text-white rounded-lg py-2 text-sm font-medium"
        >
          Share Address
        </Button>
        <Button 
          onClick={requestAmount}
          className="flex-1 bg-neutral-200 text-neutral-700 rounded-lg py-2 text-sm font-medium"
        >
          Request Amount
        </Button>
      </div>
    </>
  );
}
