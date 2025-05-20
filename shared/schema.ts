import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallets table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  balance: doublePrecision("balance").notNull().default(0),
  address: text("address").notNull().unique(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  receiverAddress: text("receiver_address"),
  amount: doublePrecision("amount").notNull(),
  feeAmount: doublePrecision("fee_amount").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  txHash: text("tx_hash"),
  securityStatus: text("security_status"), // 'safe', 'caution', 'danger'
  securityDetails: text("security_details"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Message history table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isFromUser: boolean("is_from_user").notNull(),
  messageType: text("message_type").notNull(), // 'text', 'voice', 'command'
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Frontend types
export type ChatMessage = {
  id: string;
  content: string | React.ReactNode;
  isFromUser: boolean;
  messageType: 'text' | 'voice' | 'command' | 'balance' | 'transaction' | 'history' | 'receive' | 'security' | 'processing';
  timestamp: Date;
};

export type Command = {
  name: string;
  description: string;
  icon: string;
};
