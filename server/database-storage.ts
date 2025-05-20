import { users, wallets, transactions, messages } from "@shared/schema";
import { User, InsertUser, Wallet, InsertWallet, Transaction, InsertTransaction, Message, InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, or, desc } from "drizzle-orm";
import { IStorage } from "./storage";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // USER OPERATIONS
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  // WALLET OPERATIONS
  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }
  
  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }
  
  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db.insert(wallets).values(wallet).returning();
    return newWallet;
  }
  
  async updateWalletBalance(id: number, newBalance: number): Promise<Wallet> {
    const [updatedWallet] = await db
      .update(wallets)
      .set({ balance: newBalance })
      .where(eq(wallets.id, id))
      .returning();
      
    if (!updatedWallet) {
      throw new Error(`Wallet with ID ${id} not found`);
    }
    
    return updatedWallet;
  }
  
  // TRANSACTION OPERATIONS
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }
  
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(
        or(
          eq(transactions.senderId, userId),
          eq(transactions.receiverId, userId)
        )
      )
      .orderBy(desc(transactions.createdAt));
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }
  
  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
      
    if (!updatedTransaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    return updatedTransaction;
  }
  
  // MESSAGE OPERATIONS
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(messages.createdAt);
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
}