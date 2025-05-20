import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { initBot } from "./telegram/bot";
import { analyzeTransactionSecurity, processNaturalLanguageCommand } from "./services/claude";
import { getTransactionFee, sendTransaction } from "./services/bitcoinService";
import { z } from "zod";
import { insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the Telegram bot if we're in production
  if (process.env.NODE_ENV === "production") {
    initBot();
  }

  // API routes for the web interface
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would use the authenticated user
      // For demo purposes, we'll get the first user
      const users = await storage.getUsers();
      const user = users.length > 0 ? users[0] : null;
      
      if (!user) {
        return res.status(404).json({ message: "No users found" });
      }
      
      // Don't send sensitive info
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get wallet balance
  app.get("/api/wallet/balance", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would use the authenticated user
      // For demo purposes, we'll get the first user
      const users = await storage.getUsers();
      
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      
      const wallet = await storage.getWalletByUserId(users[0].id);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      res.json({ balance: wallet.balance });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get wallet address
  app.get("/api/wallet/address", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would use the authenticated user
      // For demo purposes, we'll get the first user
      const users = await storage.getUsers();
      
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      
      const wallet = await storage.getWalletByUserId(users[0].id);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      res.json({ address: wallet.address });
    } catch (error) {
      console.error("Error fetching wallet address:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create a wallet with biometric authentication (FIDO2)
  app.post("/api/wallet/create", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would validate biometric authentication data
      // using WebAuthn/FIDO2 standards
      const { biometricData, devicePosture } = req.body;
      
      // In a real implementation, this would use the authenticated user
      // For demo purposes, we'll get the first user
      const users = await storage.getUsers();
      
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      
      // Check if user already has a wallet
      const existingWallet = await storage.getWalletByUserId(users[0].id);
      
      if (existingWallet) {
        return res.status(200).json({ 
          message: "Wallet already exists",
          wallet: existingWallet
        });
      }
      
      // Generate a new wallet address
      // In production, this would use Stacks.js to create a proper wallet
      // without storing seed phrases - just biometric associations
      const bitcoinAddress = `bc1${Math.random().toString(36).substring(2, 10)}`;
      
      // Create the wallet
      const wallet = await storage.createWallet({
        userId: users[0].id,
        address: bitcoinAddress,
        balance: 0.1 // Start with a small balance for testing
      });
      
      res.status(201).json({
        message: "Wallet created successfully with biometric authentication",
        wallet
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get transaction history
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would use the authenticated user
      // For demo purposes, we'll get the first user
      const users = await storage.getUsers();
      
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      
      const transactions = await storage.getTransactionsByUserId(users[0].id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get message history
  app.get("/api/messages", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would use the authenticated user
      // For demo purposes, we'll get the first user
      const users = await storage.getUsers();
      
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      
      const messages = await storage.getMessagesByUserId(users[0].id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send a message
  app.post("/api/message", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const messageData = insertMessageSchema.safeParse(req.body);
      
      if (!messageData.success) {
        return res.status(400).json({ message: "Invalid message data" });
      }
      
      // In a real implementation, this would use the authenticated user
      // For demo purposes, we'll get the first user
      const users = await storage.getUsers();
      
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      
      // Create the message
      const message = await storage.createMessage({
        ...messageData.data,
        userId: users[0].id,
      });
      
      // Process the message and generate a response
      // This would typically be handled by the Telegram bot
      // For the web interface, we'll simulate a response
      const botResponse = await simulateBotResponse(message.content, users[0].id);
      
      res.json({ message, botResponse });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send a transaction
  app.post("/api/transaction", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        recipient: z.string(),
        amount: z.number().positive(),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid transaction data" });
      }
      
      const { recipient, amount } = result.data;
      
      // In a real implementation, this would use the authenticated user
      // For demo purposes, we'll get the first user
      const users = await storage.getUsers();
      
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      
      const userId = users[0].id;
      
      // Get the user's wallet
      const wallet = await storage.getWalletByUserId(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Check balance
      if (wallet.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Determine recipient type (username or address)
      let recipientId: number | null = null;
      let recipientAddress: string = '';
      
      if (recipient.startsWith('@')) {
        // It's a username
        const username = recipient.substring(1);
        const recipientUser = await storage.getUserByUsername(username);
        
        if (!recipientUser) {
          return res.status(404).json({ message: `User ${recipient} not found` });
        }
        
        recipientId = recipientUser.id;
        const recipientWallet = await storage.getWalletByUserId(recipientId);
        
        if (!recipientWallet) {
          return res.status(404).json({ message: `User ${recipient} doesn't have a wallet` });
        }
        
        recipientAddress = recipientWallet.address;
      } else {
        // It's a Bitcoin address
        recipientAddress = recipient;
      }
      
      // Get transaction fee
      const fee = await getTransactionFee(amount);
      const totalAmount = amount + fee;
      
      if (wallet.balance < totalAmount) {
        return res.status(400).json({
          message: `Insufficient balance to cover the fee. You need ${totalAmount} sBTC but have ${wallet.balance} sBTC.`
        });
      }
      
      // Check security using Claude
      const securityResult = await analyzeTransactionSecurity(recipientAddress, amount);
      
      // Create the transaction
      const transaction = await storage.createTransaction({
        senderId: userId,
        receiverId: recipientId,
        receiverAddress: recipientAddress,
        amount,
        feeAmount: fee,
        status: 'pending',
        securityStatus: securityResult.status,
        securityDetails: securityResult.details
      });
      
      res.json({
        transaction,
        security: securityResult
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Confirm a transaction
  app.post("/api/transaction/:id/confirm", async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.id);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }
      
      // Get the transaction
      const transaction = await storage.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: `Transaction is already ${transaction.status}` });
      }
      
      // Get sender's wallet
      const senderWallet = await storage.getWalletByUserId(transaction.senderId);
      
      if (!senderWallet) {
        return res.status(404).json({ message: "Sender wallet not found" });
      }
      
      // Check balance again (in case it changed)
      if (senderWallet.balance < (transaction.amount + transaction.feeAmount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Send the transaction
      const result = await sendTransaction(
        senderWallet.address,
        transaction.receiverAddress || '',
        transaction.amount,
        transaction.feeAmount
      );
      
      if (!result.success) {
        // Update transaction status to failed
        await storage.updateTransaction(transactionId, {
          status: 'failed',
          txHash: result.txHash
        });
        
        return res.status(500).json({ message: "Transaction failed" });
      }
      
      // Update transaction status to completed
      await storage.updateTransaction(transactionId, {
        status: 'completed',
        txHash: result.txHash,
        completedAt: new Date()
      });
      
      // Update sender's wallet balance
      await storage.updateWalletBalance(
        senderWallet.id,
        senderWallet.balance - (transaction.amount + transaction.feeAmount)
      );
      
      // If the recipient is a user of our system, update their wallet balance
      if (transaction.receiverId) {
        const recipientWallet = await storage.getWalletByUserId(transaction.receiverId);
        
        if (recipientWallet) {
          await storage.updateWalletBalance(
            recipientWallet.id,
            recipientWallet.balance + transaction.amount
          );
        }
      }
      
      res.json({
        success: true,
        transaction: await storage.getTransaction(transactionId)
      });
    } catch (error) {
      console.error("Error confirming transaction:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Initialize database with demo data for testing
  app.post("/api/init-demo", async (req: Request, res: Response) => {
    try {
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "This endpoint is only available in development mode" });
      }
      
      await initDemoData();
      res.json({ message: "Demo data initialized" });
    } catch (error) {
      console.error("Error initializing demo data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to simulate bot responses for the web interface
async function simulateBotResponse(message: string, userId: number): Promise<any> {
  // Create a bot response message
  let responseContent = "I received your message!";
  let messageType = 'text';
  
  try {
    // First try to process the message as a natural language command
    const nlpResult = await processNaturalLanguageCommand(message);
    
    // Generate a helpful response based on the detected intent
    if (nlpResult.command === 'balance') {
      messageType = 'balance';
      responseContent = "Here's your current balance:";
    } else if (nlpResult.command === 'send') {
      // If we have both recipient and amount, create a transaction prompt
      if (nlpResult.recipient && nlpResult.amount) {
        messageType = 'transaction';
        responseContent = `Would you like to send ${nlpResult.amount} sBTC to ${nlpResult.recipient}?`;
      } 
      // If we have recipient but no amount, ask for amount
      else if (nlpResult.recipient && !nlpResult.amount) {
        messageType = 'text';
        responseContent = `How much would you like to send to ${nlpResult.recipient}?`;
      }
      // If we have amount but no recipient, ask for recipient 
      else if (!nlpResult.recipient && nlpResult.amount) {
        messageType = 'text';
        responseContent = `Who would you like to send ${nlpResult.amount} sBTC to?`;
      }
      // If we have neither, ask for basic info
      else {
        messageType = 'text';
        responseContent = "Sure, I can help you send sBTC. Who would you like to send it to, and how much?";
      }
    } else if (nlpResult.command === 'receive') {
      messageType = 'receive';
      responseContent = "Here's your receiving address:";
    } else if (nlpResult.command === 'history') {
      messageType = 'history';
      responseContent = "Recent Transactions";
    } else {
      // Unknown command or general inquiry, provide helpful response
      messageType = 'text';
      responseContent = "I can help you manage your sBTC. You can ask me to check your balance, send money to someone, receive sBTC, or view your transaction history.";
    }
  } catch (error) {
    console.error("Error in natural language processing:", error);
    // Fallback to simple keyword matching
    if (/balance|how much/i.test(message)) {
      messageType = 'balance';
      responseContent = "Here's your current balance:";
    } else if (/send/i.test(message)) {
      messageType = 'text';
      responseContent = "Sure, I can help you send sBTC. Who would you like to send it to, and how much?";
    } else if (/receive|address/i.test(message)) {
      messageType = 'receive';
      responseContent = "Here's your receiving address:";
    } else if (/history|transactions/i.test(message)) {
      messageType = 'history';
      responseContent = "Recent Transactions";
    }
  }
  
  // Store the bot response in the database
  const botResponse = await storage.createMessage({
    userId,
    content: responseContent,
    isFromUser: false,
    messageType
  });
  
  return botResponse;
}

// Initialize demo data for testing
async function initDemoData() {
  // Check if we already have users
  const users = await storage.getUsers();
  
  if (users.length > 0) {
    console.log("Demo data already exists");
    return;
  }
  
  console.log("Initializing demo data...");
  
  // Create a demo user
  const user = await storage.createUser({
    telegramId: "12345678",
    username: "demo_user",
    firstName: "Demo",
    lastName: "User"
  });
  
  // Create a wallet for the user
  const wallet = await storage.createWallet({
    userId: user.id,
    balance: 0.125,
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
  });
  
  // Create a second user for transactions
  const user2 = await storage.createUser({
    telegramId: "87654321",
    username: "alice",
    firstName: "Alice",
    lastName: "Smith"
  });
  
  // Create a wallet for the second user
  const wallet2 = await storage.createWallet({
    userId: user2.id,
    balance: 0.05,
    address: "bc1qr0fjdsfkjdsfjkldsjfkldsjklfjdskljfdslk"
  });
  
  // Create some transactions
  await storage.createTransaction({
    senderId: user.id,
    receiverId: user2.id,
    receiverAddress: wallet2.address,
    amount: 0.01,
    feeAmount: 0.0005,
    status: 'completed',
    txHash: "3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    securityStatus: 'safe',
    securityDetails: 'No suspicious patterns detected.',
    completedAt: new Date()
  });
  
  await storage.createTransaction({
    senderId: user2.id,
    receiverId: user.id,
    receiverAddress: wallet.address,
    amount: 0.025,
    feeAmount: 0.001,
    status: 'completed',
    txHash: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w",
    securityStatus: 'safe',
    securityDetails: 'No suspicious patterns detected.',
    completedAt: new Date(Date.now() - 86400000) // yesterday
  });
  
  await storage.createTransaction({
    senderId: user.id,
    receiverId: null,
    receiverAddress: "bc1q9s8zj5t7qr2yvkl0xj3w4e5r6t7y8u9i0o1p2a3s4d5f",
    amount: 0.005,
    feeAmount: 0.0002,
    status: 'completed',
    txHash: "9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c",
    securityStatus: 'safe',
    securityDetails: 'No suspicious patterns detected.',
    completedAt: new Date(Date.now() - 86400000 * 3) // 3 days ago
  });
  
  // Create some messages
  await storage.createMessage({
    userId: user.id,
    content: "Hello, I'd like to check my balance",
    isFromUser: true,
    messageType: 'text'
  });
  
  await storage.createMessage({
    userId: user.id,
    content: "Your current balance is 0.125 sBTC (≈ $7,625.00 USD)",
    isFromUser: false,
    messageType: 'balance'
  });
  
  console.log("Demo data initialized");
}
