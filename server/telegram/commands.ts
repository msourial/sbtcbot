import TelegramBot from 'node-telegram-bot-api';
import { storage } from '../storage';
import { analyzeTransactionSecurity } from '../services/claude';
import { sendTransaction, getTransactionFee } from '../services/bitcoinService';
import { SECURITY_STATUS } from '@/lib/constants';

// Handle explicit commands
export async function handleCommand(
  bot: TelegramBot, 
  command: string, 
  chatId: number, 
  telegramId: string
) {
  try {
    const user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      bot.sendMessage(chatId, "You need to start the bot with /start first.");
      return;
    }
    
    switch (command) {
      case 'balance':
        await handleBalanceCommand(bot, chatId, user.id);
        break;
      case 'send':
        bot.sendMessage(
          chatId, 
          "To send sBTC, use the format: 'Send [amount] sBTC to [@username or address]'\n\nExample: Send 0.01 sBTC to @Alice"
        );
        break;
      case 'receive':
        await handleReceiveCommand(bot, chatId, user.id);
        break;
      case 'history':
        await handleHistoryCommand(bot, chatId, user.id);
        break;
      case 'help':
        sendHelpMessage(bot, chatId);
        break;
      default:
        bot.sendMessage(
          chatId, 
          "I don't recognize that command. Try /help to see available commands."
        );
    }
    
    // Store the command in message history
    await storage.createMessage({
      userId: user.id,
      content: `/${command}`,
      isFromUser: true,
      messageType: 'command'
    });
    
  } catch (error) {
    console.error(`Error handling command ${command}:`, error);
    bot.sendMessage(chatId, "Sorry, there was an error processing your command. Please try again later.");
  }
}

// Handle natural language text messages
export async function handleTextMessage(
  bot: TelegramBot, 
  text: string, 
  chatId: number, 
  telegramId: string
) {
  try {
    const user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      bot.sendMessage(chatId, "You need to start the bot with /start first.");
      return;
    }
    
    // Store the message
    await storage.createMessage({
      userId: user.id,
      content: text,
      isFromUser: true,
      messageType: 'text'
    });
    
    // Check for send commands
    const sendPattern = /send\s+([\d.]+)\s+(?:s?btc|sbtc)\s+to\s+(@\w+|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})/i;
    const sendMatch = text.match(sendPattern);
    
    if (sendMatch) {
      const amount = parseFloat(sendMatch[1]);
      const recipient = sendMatch[2];
      
      // Process send command
      await handleSendCommand(bot, chatId, user.id, amount, recipient);
      return;
    }
    
    // Check for balance-related queries
    if (/balance|how much|sbtc do i have/i.test(text)) {
      await handleBalanceCommand(bot, chatId, user.id);
      return;
    }
    
    // Check for history-related queries
    if (/history|transactions|recent|activity/i.test(text)) {
      await handleHistoryCommand(bot, chatId, user.id);
      return;
    }
    
    // Check for receive-related queries
    if (/receive|address|deposit|wallet address/i.test(text)) {
      await handleReceiveCommand(bot, chatId, user.id);
      return;
    }
    
    // Default response if we can't understand the message
    bot.sendMessage(
      chatId, 
      "I'm not sure how to respond to that. Try using a command like /balance, /send, /receive, or /history."
    );
    
  } catch (error) {
    console.error('Error handling text message:', error);
    bot.sendMessage(chatId, "Sorry, there was an error processing your message. Please try again later.");
  }
}

// Handle voice messages
export async function handleVoiceMessage(
  bot: TelegramBot, 
  voice: TelegramBot.Voice, 
  chatId: number, 
  telegramId: string
) {
  try {
    const user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      bot.sendMessage(chatId, "You need to start the bot with /start first.");
      return;
    }
    
    // In a real implementation, we would:
    // 1. Download the voice file
    // 2. Convert it to text using a speech-to-text service
    // 3. Process the text as a command
    
    // For now, we'll send a message that voice processing is coming soon
    bot.sendMessage(
      chatId, 
      "I've received your voice message. Voice command processing is coming soon!\n\nIn the meantime, please type your command."
    );
    
    // Store the voice message
    await storage.createMessage({
      userId: user.id,
      content: "[Voice message]",
      isFromUser: true,
      messageType: 'voice'
    });
    
  } catch (error) {
    console.error('Error handling voice message:', error);
    bot.sendMessage(chatId, "Sorry, there was an error processing your voice message. Please try again later.");
  }
}

// Handle balance command
async function handleBalanceCommand(bot: TelegramBot, chatId: number, userId: number) {
  try {
    const wallet = await storage.getWalletByUserId(userId);
    
    if (!wallet) {
      bot.sendMessage(chatId, "You don't have a wallet yet. Please use /start to create one.");
      return;
    }
    
    const balance = wallet.balance;
    const btcPrice = 61000; // This would come from an external API in production
    const fiatValue = (balance * btcPrice).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    
    bot.sendMessage(
      chatId,
      `*Current Balance*\n${balance} sBTC\n≈ ${fiatValue} USD`,
      { parse_mode: 'Markdown' }
    );
    
    // Store the bot's response
    await storage.createMessage({
      userId,
      content: `Current Balance: ${balance} sBTC (≈ ${fiatValue} USD)`,
      isFromUser: false,
      messageType: 'balance'
    });
    
  } catch (error) {
    console.error('Error handling balance command:', error);
    bot.sendMessage(chatId, "Sorry, there was an error fetching your balance. Please try again later.");
  }
}

// Handle send command
async function handleSendCommand(
  bot: TelegramBot, 
  chatId: number, 
  userId: number, 
  amount: number, 
  recipient: string
) {
  try {
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      bot.sendMessage(chatId, "Invalid amount. Please specify a positive number.");
      return;
    }
    
    // Get user's wallet
    const wallet = await storage.getWalletByUserId(userId);
    
    if (!wallet || wallet.balance < amount) {
      bot.sendMessage(
        chatId, 
        `Insufficient balance. Your current balance is ${wallet?.balance || 0} sBTC.`
      );
      return;
    }
    
    // Determine recipient type (username or address)
    let recipientId: number | null = null;
    let recipientAddress: string = '';
    
    if (recipient.startsWith('@')) {
      // It's a username
      const username = recipient.substring(1);
      const recipientUser = await storage.getUserByUsername(username);
      
      if (!recipientUser) {
        bot.sendMessage(chatId, `User ${recipient} not found.`);
        return;
      }
      
      recipientId = recipientUser.id;
      const recipientWallet = await storage.getWalletByUserId(recipientId);
      
      if (!recipientWallet) {
        bot.sendMessage(chatId, `User ${recipient} doesn't have a wallet.`);
        return;
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
      bot.sendMessage(
        chatId, 
        `Insufficient balance to cover the fee. You need ${totalAmount} sBTC but have ${wallet.balance} sBTC.`
      );
      return;
    }
    
    // Check security using Claude
    const securityResult = await analyzeTransactionSecurity(recipientAddress, amount);
    
    // Format transaction details message
    const btcPrice = 61000;
    const amountUsd = (amount * btcPrice).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    const feeUsd = (fee * btcPrice).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    
    let transactionMessage = `*Transaction Details*\n\n`;
    transactionMessage += `*Sending to:* ${recipient}\n`;
    transactionMessage += `*Amount:* ${amount} sBTC\n`;
    transactionMessage += `*USD Value:* ≈ ${amountUsd}\n`;
    transactionMessage += `*Network Fee:* ${fee} sBTC (${feeUsd})\n\n`;
    
    // Add security information
    if (securityResult.status === SECURITY_STATUS.SAFE) {
      transactionMessage += `*Security Check:* ✅ Safe\n\n`;
    } else if (securityResult.status === SECURITY_STATUS.CAUTION) {
      transactionMessage += `*Security Check:* ⚠️ Caution\n`;
      transactionMessage += `*Reason:* ${securityResult.details}\n\n`;
    } else {
      transactionMessage += `*Security Check:* 🚫 Danger\n`;
      transactionMessage += `*Reason:* ${securityResult.details}\n\n`;
    }
    
    // Create confirmation buttons
    const keyboard = {
      inline_keyboard: [
        [
          { text: "Confirm", callback_data: `confirm_tx_${amount}_${recipientAddress}` },
          { text: "Cancel", callback_data: "cancel_tx" }
        ]
      ]
    };
    
    // Send transaction details with confirmation buttons
    bot.sendMessage(chatId, transactionMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    
    // Store the transaction details in pending status
    await storage.createTransaction({
      senderId: userId,
      receiverId: recipientId,
      receiverAddress: recipientAddress,
      amount: amount,
      feeAmount: fee,
      status: 'pending',
      securityStatus: securityResult.status,
      securityDetails: securityResult.details
    });
    
    // Store the bot's response
    await storage.createMessage({
      userId,
      content: transactionMessage,
      isFromUser: false,
      messageType: 'transaction'
    });
    
  } catch (error) {
    console.error('Error handling send command:', error);
    bot.sendMessage(chatId, "Sorry, there was an error processing your transaction. Please try again later.");
  }
}

// Handle receive command
async function handleReceiveCommand(bot: TelegramBot, chatId: number, userId: number) {
  try {
    const wallet = await storage.getWalletByUserId(userId);
    
    if (!wallet) {
      bot.sendMessage(chatId, "You don't have a wallet yet. Please use /start to create one.");
      return;
    }
    
    // In a real implementation, we would generate a QR code here
    bot.sendMessage(
      chatId,
      `*Your sBTC Address*\n\`${wallet.address}\`\n\nShare this address with others to receive sBTC.`,
      { parse_mode: 'Markdown' }
    );
    
    // Store the bot's response
    await storage.createMessage({
      userId,
      content: `Your sBTC Address: ${wallet.address}`,
      isFromUser: false,
      messageType: 'receive'
    });
    
  } catch (error) {
    console.error('Error handling receive command:', error);
    bot.sendMessage(chatId, "Sorry, there was an error fetching your receiving address. Please try again later.");
  }
}

// Handle history command
async function handleHistoryCommand(bot: TelegramBot, chatId: number, userId: number) {
  try {
    const transactions = await storage.getTransactionsByUserId(userId);
    
    if (!transactions || transactions.length === 0) {
      bot.sendMessage(chatId, "You don't have any transactions yet.");
      return;
    }
    
    let historyMessage = "*Recent Transactions*\n\n";
    
    // Show the 5 most recent transactions
    const recentTransactions = transactions.slice(0, 5);
    
    for (const tx of recentTransactions) {
      const isSender = tx.senderId === userId;
      const btcPrice = 61000;
      const amountUsd = (tx.amount * btcPrice).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
      
      const date = new Date(tx.createdAt || Date.now());
      const formattedDate = date.toLocaleDateString();
      
      if (isSender) {
        historyMessage += `📤 *Sent:* ${tx.amount} sBTC (${amountUsd})\n`;
        if (tx.receiverId) {
          const receiver = await storage.getUser(tx.receiverId);
          historyMessage += `*To:* @${receiver?.username || 'Unknown'}\n`;
        } else {
          historyMessage += `*To:* ${tx.receiverAddress?.substring(0, 8)}...\n`;
        }
      } else {
        historyMessage += `📥 *Received:* ${tx.amount} sBTC (${amountUsd})\n`;
        const sender = await storage.getUser(tx.senderId);
        historyMessage += `*From:* @${sender?.username || 'Unknown'}\n`;
      }
      
      historyMessage += `*Date:* ${formattedDate}\n`;
      historyMessage += `*Status:* ${tx.status === 'completed' ? '✅ Completed' : '⏳ Pending'}\n\n`;
    }
    
    if (transactions.length > 5) {
      historyMessage += `... and ${transactions.length - 5} more transaction(s)`;
    }
    
    bot.sendMessage(chatId, historyMessage, { parse_mode: 'Markdown' });
    
    // Store the bot's response
    await storage.createMessage({
      userId,
      content: historyMessage,
      isFromUser: false,
      messageType: 'history'
    });
    
  } catch (error) {
    console.error('Error handling history command:', error);
    bot.sendMessage(chatId, "Sorry, there was an error fetching your transaction history. Please try again later.");
  }
}

// Send help message
function sendHelpMessage(bot: TelegramBot, chatId: number) {
  const helpMessage = `
*Available Commands:*

/balance - Check your current sBTC balance
/send - Send sBTC to a user or address
/receive - Get your sBTC address to receive funds
/history - View your transaction history
/security - Manage security settings
/help - Show this help message

You can also use natural language commands like "Send 0.1 sBTC to @username" or voice commands.
  `;
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
}
