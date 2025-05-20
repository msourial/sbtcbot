import { nanoid as nanoIdOriginal } from 'nanoid';

// Generate a unique ID
export const nanoid = () => nanoIdOriginal(10);

// Format currency with proper thousands separators
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format time as "Just now", "Yesterday", "3 days ago", etc.
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Just now";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Yesterday";
  }
  
  if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}

// Parse a command to extract amount and recipient
export function parseTransactionCommand(command: string): { amount: number; recipient: string } | null {
  // Match patterns like "Send 0.01 sBTC to @Alice" or "send 0.5 sbtc to bc1qxy..."
  const regex = /send\s+(\d+\.?\d*)\s+(?:s?btc|sbtc)\s+to\s+(@\w+|bc\w+)/i;
  const match = command.match(regex);
  
  if (match) {
    return {
      amount: parseFloat(match[1]),
      recipient: match[2]
    };
  }
  
  return null;
}

// Validate a Bitcoin address (simplified version)
export function isValidBitcoinAddress(address: string): boolean {
  // This is a simplified check - in production use a proper Bitcoin address validator
  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
}

// Shorten an address for display
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Format sBTC amount with appropriate decimal places
export function formatsBTC(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }) + ' sBTC';
}
