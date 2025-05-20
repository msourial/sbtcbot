import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { nanoid } from "@/lib/helpers";

interface UseChatResult {
  messages: ChatMessage[];
  sendMessage: (content: string, type?: string) => void;
  sendCommand: (command: string) => void;
  clearConversation: () => void;
  isLoading: boolean;
}

export function useChat(): UseChatResult {
  const queryClient = useQueryClient();
  const defaultMessages = [
    {
      id: nanoid(),
      content: "Welcome to sBTC Bot! 👋\n\nBefore we start, you'll need to create a wallet to send and receive sBTC.",
      isFromUser: false,
      messageType: "text",
      timestamp: new Date(),
    },
    {
      id: nanoid(),
      content: "Create Wallet with Biometrics",
      isFromUser: false,
      messageType: "createwallet",
      timestamp: new Date(Date.now() + 100), // Add small delay for proper ordering
    },
  ];
  
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);

  // Fetch chat history from the server
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/messages'],
  });

  // Add message history when it's loaded
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const formattedHistory: ChatMessage[] = chatHistory.map((msg: any) => ({
        id: msg.id || nanoid(),
        content: msg.content,
        isFromUser: msg.isFromUser,
        messageType: msg.messageType || 'text',
        timestamp: new Date(msg.createdAt || Date.now()),
      }));
      
      // Skip initial wallet creation prompt if we have chat history
      setMessages((prev) => {
        // Replace the default messages with chat history
        return formattedHistory;
      });
    }
  }, [chatHistory]);

  // Send message mutation
  const { mutate: sendMessageMutation, isPending: isSending } = useMutation({
    mutationFn: async ({ content, type }: { content: string, type?: string }) => {
      return apiRequest('POST', '/api/message', { 
        content, 
        messageType: type || 'text',
        isFromUser: true 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  // Function to send a user message and get a response
  const sendMessage = (content: string, type: string = 'text') => {
    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: nanoid(),
      content,
      isFromUser: true,
      messageType: type as any, // Type cast to avoid type error
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Send to the API
    sendMessageMutation({ content, type });
    
    // Simulate bot response based on message content
    // This would be replaced by actual API responses
    simulateBotResponse(content.toLowerCase());
  };

  // Function to handle commands
  const sendCommand = (command: string) => {
    const userMessage: ChatMessage = {
      id: nanoid(),
      content: command,
      isFromUser: true,
      messageType: 'command',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Simulate command response
    switch (command.toLowerCase()) {
      case '/balance':
        addBotMessage({
          content: "Here's your current balance:",
          messageType: 'balance',
        });
        break;
      case '/send':
        addBotMessage({
          content: "To whom would you like to send sBTC? You can use the format: Send [amount] sBTC to @username or address",
          messageType: 'text',
        });
        break;
      case '/receive':
        addBotMessage({
          content: "Receive sBTC",
          messageType: 'receive',
        });
        break;
      case '/history':
        addBotMessage({
          content: "Recent Transactions",
          messageType: 'history',
        });
        break;
      case '/help':
        addBotMessage({
          content: "You can use the following commands:\n/balance - Check your balance\n/send - Send sBTC\n/receive - Receive sBTC\n/history - View transaction history",
          messageType: 'text',
        });
        break;
      default:
        addBotMessage({
          content: "I don't recognize that command. Try /help to see available commands.",
          messageType: 'text',
        });
    }
  };

  // Helper to add bot messages
  const addBotMessage = (message: Partial<ChatMessage>) => {
    const botMessage: ChatMessage = {
      id: nanoid(),
      content: message.content || "",
      isFromUser: false,
      messageType: (message.messageType || 'text') as any, // Type cast to avoid type error
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, botMessage]);
  };

  // Simulate bot responses based on user input
  const simulateBotResponse = (content: string) => {
    if (content.includes('balance')) {
      addBotMessage({
        content: "Responding to voice command: \"Check my balance\"",
        messageType: 'balance',
      });
    } else if (content.includes('createwallet') || content.includes('create wallet')) {
      addBotMessage({
        content: "Create Wallet with Biometrics",
        messageType: 'createwallet',
      });
    } else if (content.includes('send') && content.includes('sbtc')) {
      // Parse recipient and amount
      const amountMatch = content.match(/(\d+\.?\d*)\s*sbtc/i);
      const recipientMatch = content.match(/to\s+(@\w+|bc\w+)/i);
      
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0.01;
      const recipient = recipientMatch ? recipientMatch[1] : "@Alice";
      
      // Check if it's a suspicious address
      if (recipient.startsWith('bc1qxr4fjk')) {
        addBotMessage({
          content: "Security Alert",
          messageType: 'security',
        });
      } else {
        addBotMessage({
          content: "Transaction Details",
          messageType: 'transaction',
        });
      }
    } else if (content.includes('receive')) {
      addBotMessage({
        content: "Receive sBTC",
        messageType: 'receive',
      });
    } else if (content.includes('history') || content.includes('transactions')) {
      addBotMessage({
        content: "Recent Transactions",
        messageType: 'history',
      });
    } else if (content === 'confirm') {
      // Show processing state
      addBotMessage({
        content: "Processing",
        messageType: 'processing',
      });
      
      // Then show success after a delay
      setTimeout(() => {
        addBotMessage({
          content: "✅ Transaction Successful! \n\nSent to: @Alice\nAmount: 0.01 sBTC\nTransaction ID: 3a4b5c...\nTime: Just now",
          messageType: 'text',
        });
        
        addBotMessage({
          content: "Your updated balance is 0.115 sBTC (≈ $7,011.95 USD)",
          messageType: 'text',
        });
      }, 3000);
    } else {
      // Default response
      addBotMessage({
        content: "I'm not sure how to respond to that. Try using a command like /balance, /send, /receive, or /history.",
        messageType: 'text',
      });
    }
  };

  // Function to clear the conversation and reset to initial state
  const clearConversation = () => {
    // Reset to default messages
    setMessages([...defaultMessages]);
    
    // You could also clear server-side history here if needed
    // by making an API call
  };

  return {
    messages,
    sendMessage,
    sendCommand,
    clearConversation,
    isLoading: isSending,
  };
}
