import { Button } from "@/components/ui/button";
import TransactionCard from "./TransactionCard";

interface SecurityAlertProps {
  address?: string;
  amount?: number;
  reasons?: string[];
  onProceed?: () => void;
  onCancel?: () => void;
  onLearnMore?: () => void;
}

export default function SecurityAlert({
  address = "bc1qxr4fjk...h65t8qwgum",
  amount = 0.05,
  reasons = [
    "This address has been associated with recent scam reports",
    "Unusual transaction pattern detected",
    "First-time recipient for your account"
  ],
  onProceed,
  onCancel,
  onLearnMore
}: SecurityAlertProps) {
  return (
    <>
      <div className="bg-[hsl(var(--status-warning))]/10 border border-[hsl(var(--status-warning))] rounded-xl p-4 mb-3">
        <div className="flex items-start mb-3">
          <div className="w-8 h-8 bg-[hsl(var(--status-warning))] rounded-full flex items-center justify-center mr-2 flex-shrink-0">
            <i className="ri-shield-keyhole-line text-white"></i>
          </div>
          <div>
            <p className="font-semibold text-neutral-800">Security Alert</p>
            <p className="text-sm text-neutral-700">Our AI security system has flagged this transaction as potentially suspicious.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-600">Sending to:</span>
            <span className="font-medium text-sm font-mono">{address}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-600">Amount:</span>
            <span className="font-medium">{amount} sBTC</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-600">USD Value:</span>
            <span className="text-neutral-700">≈ ${(amount * 61000).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
            <span className="text-sm font-medium text-neutral-700">Security Check:</span>
            <div className="flex items-center">
              <span className="security-indicator security-medium"></span>
              <span className="text-sm text-[hsl(var(--status-warning))] font-medium">Caution</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 mb-3">
          <p className="text-sm font-medium mb-2">Reasons for caution:</p>
          <ul className="text-sm text-neutral-700 list-disc pl-5 space-y-1">
            {reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={onLearnMore}
            className="flex-1 bg-white border border-neutral-300 text-neutral-700 rounded-lg py-2 text-sm font-medium"
          >
            Learn More
          </Button>
          <Button 
            onClick={onProceed}
            className="flex-1 bg-[hsl(var(--status-warning))] text-white rounded-lg py-2 text-sm font-medium"
          >
            Proceed Anyway
          </Button>
          <Button 
            onClick={onCancel}
            className="flex-1 bg-neutral-700 text-white rounded-lg py-2 text-sm font-medium"
          >
            Cancel
          </Button>
        </div>
      </div>
      <p className="text-sm text-neutral-600">Your security is our priority. Please review the warning before proceeding.</p>
    </>
  );
}
