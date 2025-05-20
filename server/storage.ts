import { 
  User, InsertUser, 
  Wallet, InsertWallet,
  Transaction, InsertTransaction,
  Message, InsertMessage
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet operations
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByUserId(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: number, newBalance: number): Promise<Wallet>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private messages: Map<number, Message>;
  
  private userId: number;
  private walletId: number;
  private transactionId: number;
  private messageId: number;
  
  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.messages = new Map();
    
    this.userId = 1;
    this.walletId = 1;
    this.transactionId = 1;
    this.messageId = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.telegramId === telegramId
    );
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date()
    };
    
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Wallet operations
  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }
  
  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.userId === userId
    );
  }
  
  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const id = this.walletId++;
    const newWallet: Wallet = {
      ...wallet,
      id
    };
    
    this.wallets.set(id, newWallet);
    return newWallet;
  }
  
  async updateWalletBalance(id: number, newBalance: number): Promise<Wallet> {
    const wallet = this.wallets.get(id);
    
    if (!wallet) {
      throw new Error(`Wallet with ID ${id} not found`);
    }
    
    const updatedWallet: Wallet = {
      ...wallet,
      balance: newBalance
    };
    
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }
  
  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.senderId === userId || tx.receiverId === userId
    ).sort((a, b) => {
      const dateA = a.createdAt || new Date(0);
      const dateB = b.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime(); // Newest first
    });
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: new Date()
    };
    
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    const updatedTransaction: Transaction = {
      ...transaction,
      ...updates
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateA.getTime() - dateB.getTime(); // Oldest first
      });
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const newMessage: Message = {
      ...message,
      id,
      createdAt: new Date()
    };
    
    this.messages.set(id, newMessage);
    return newMessage;
  }
}

// Import the database storage
import { DatabaseStorage } from "./database-storage";

// Check if database URL is available
const useDatabase = !!process.env.DATABASE_URL;

// Export the appropriate storage implementation
export const storage = useDatabase 
  ? new DatabaseStorage() 
  : new MemStorage();

// Log the storage type being used
console.log(useDatabase 
  ? "Using database storage." 
  : "No database available. Using in-memory storage.");
