import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/helpers";

interface TransactionCardProps {
  recipientName?: string;
  amount?: number;
  securityLevel?: 'high' | 'medium' | 'low';
  showActions?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function TransactionCard({
  recipientName = "@Alice",
  amount = 0.01,
  securityLevel = 'high',
  showActions = true,
  onConfirm,
  onCancel
}: TransactionCardProps) {
  // Fee calculation would typically come from the API
  const fee = amount * 0.005;
  const usdValue = amount * 61000; // Using approximate BTC price
  const feeUsdValue = fee * 61000;
  
  const securityIndicator = {
    high: {
      class: "security-high",
      text: "Safe",
      textClass: "text-status-success"
    },
    medium: {
      class: "security-medium",
      text: "Caution",
      textClass: "text-status-warning"
    },
    low: {
      class: "security-low",
      text: "Danger",
      textClass: "text-status-error"
    }
  };

  const security = securityIndicator[securityLevel];

  return (
    <>
      <div className="transaction-card p-3 mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-600">Sending to:</span>
          <span className="font-medium">{recipientName}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-600">Amount:</span>
          <span className="font-medium">{amount} sBTC</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-600">USD Value:</span>
          <span className="text-neutral-700">≈ {formatCurrency(usdValue)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-600">Network Fee:</span>
          <span className="text-neutral-700">{fee.toFixed(5)} sBTC ({formatCurrency(feeUsdValue)})</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
          <span className="text-sm font-medium text-neutral-700">Security Check:</span>
          <div className="flex items-center">
            <span className={`security-indicator ${security.class}`}></span>
            <span className={`text-sm ${security.textClass} font-medium`}>{security.text}</span>
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="flex gap-2">
          <Button 
            onClick={onConfirm}
            className="btn-primary flex-1 py-2 text-sm"
          >
            Confirm
          </Button>
          <Button 
            onClick={onCancel}
            className="bg-neutral-200 text-neutral-700 rounded-lg py-2 px-4 text-sm font-medium"
          >
            Cancel
          </Button>
        </div>
      )}
    </>
  );
}
