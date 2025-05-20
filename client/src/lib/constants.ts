import { Command } from "@shared/schema";

export const commands: Command[] = [
  {
    name: "/balance",
    description: "Check your current sBTC balance",
    icon: "ri-wallet-3-line"
  },
  {
    name: "/send",
    description: "Send sBTC to a user or address",
    icon: "ri-send-plane-line"
  },
  {
    name: "/receive",
    description: "Get your sBTC address to receive funds",
    icon: "ri-download-line"
  },
  {
    name: "/history",
    description: "View your transaction history",
    icon: "ri-history-line"
  },
  {
    name: "/security",
    description: "Manage security settings",
    icon: "ri-shield-keyhole-line"
  },
  {
    name: "/help",
    description: "Get help with commands",
    icon: "ri-question-line"
  }
];

export const BITCOIN_PRICE = 61000; // Approximate BTC price in USD

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const SECURITY_STATUS = {
  SAFE: 'safe',
  CAUTION: 'caution',
  DANGER: 'danger'
};
