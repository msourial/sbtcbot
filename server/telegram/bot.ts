import TelegramBot from 'node-telegram-bot-api';
import { handleCommand, handleTextMessage, handleVoiceMessage } from './commands';
import { storage } from '../storage';

// Get the Telegram Bot API token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN || '';

// Create a bot instance
export const bot = new TelegramBot(token, { polling: token !== '' });

// Initialize the bot and set up command handlers
export function initBot() {
  if (!token) {
    console.warn('No TELEGRAM_BOT_TOKEN provided. Bot will not be operational.');
    return;
  }

  console.log('Starting Telegram bot...');

  // Handle /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const username = msg.from?.username;
    const firstName = msg.from?.first_name;
    const lastName = msg.from?.last_name;

    if (!userId) {
      bot.sendMessage(chatId, 'Error: Could not identify user.');
      return;
    }

    try {
      // Check if user exists
      let user = await storage.getUserByTelegramId(userId.toString());

      // Create user if they don't exist
      if (!user) {
        user = await storage.createUser({
          telegramId: userId.toString(),
          username: username,
          firstName: firstName,
          lastName: lastName,
        });

        // Create a wallet for the new user
        const wallet = await storage.createWallet({
          userId: user.id,
          balance: 0.125, // Starting balance for demo purposes
          address: generateBitcoinAddress(),
        });
      }

      // Send welcome message
      bot.sendMessage(
        chatId,
        `Welcome to sBTC Bot! 👋\n\nI help you send, receive, and manage your sBTC as easily as texting a friend.\n\nYou can use the following commands:\n/balance - Check your balance\n/send - Send sBTC\n/receive - Get your receiving address\n/history - View your transaction history\n/help - See all commands`
      );
    } catch (error) {
      console.error('Error in /start command:', error);
      bot.sendMessage(chatId, 'Sorry, there was an error starting the bot. Please try again later.');
    }
  });

  // Handle all commands
  bot.onText(/\/(.+)/, (msg, match) => {
    if (!match) return;
    const command = match[1].toLowerCase();
    if (command === 'start') return; // Already handled above
    
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    
    if (!userId) {
      bot.sendMessage(chatId, 'Error: Could not identify user.');
      return;
    }
    
    handleCommand(bot, command, chatId, userId.toString());
  });

  // Handle regular text messages (for natural language commands)
  bot.on('message', (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return; // Skip commands and non-text messages
    
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    
    if (!userId) {
      bot.sendMessage(chatId, 'Error: Could not identify user.');
      return;
    }
    
    handleTextMessage(bot, msg.text, chatId, userId.toString());
  });

  // Handle voice messages
  bot.on('voice', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const voiceFile = msg.voice;
    
    if (!userId || !voiceFile) {
      bot.sendMessage(chatId, 'Error: Could not process voice message.');
      return;
    }
    
    handleVoiceMessage(bot, voiceFile, chatId, userId.toString());
  });

  console.log('Telegram bot started successfully!');
}

// Generate a random Bitcoin address for demo purposes
function generateBitcoinAddress(): string {
  const prefixes = ['bc1q', '3', '1'];
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  let address = prefix;
  const length = prefix === 'bc1q' ? 39 : 30;
  
  for (let i = 0; i < length; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return address;
}
