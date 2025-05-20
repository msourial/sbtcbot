import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import CommandList from "@/components/chat/CommandList";
import HelpModal from "@/components/chat/HelpModal";
import { useChat } from "@/hooks/use-chat";

export default function Home() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { messages, sendMessage, sendCommand, clearConversation, isLoading } = useChat();

  // Fetch user data from the server
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
    // The queryFn is already set up in queryClient.ts
  });

  // Fetch wallet data
  const { data: walletData } = useQuery({
    queryKey: ['/api/wallet/address'],
  });

  // Listen for transaction confirmation and wallet creation events
  useEffect(() => {
    const handleConfirmEvent = (event: any) => {
      if (event.detail && event.detail.message) {
        // Special handling for wallet creation success
        if (event.detail.message === "Wallet created successfully!") {
          // First, display wallet address
          if (event.detail.wallet && event.detail.wallet.address) {
            sendMessage(`Your wallet address: ${event.detail.wallet.address}`, 'text');
          }
          
          // Then, send a balance command automatically after wallet creation
          setTimeout(() => {
            sendCommand("/balance");
          }, 1000);
        } else {
          // For other messages, proceed normally
          handleSendMessage(event.detail.message);
        }
      }
    };
    
    window.addEventListener("sendMessage", handleConfirmEvent);
    
    return () => {
      window.removeEventListener("sendMessage", handleConfirmEvent);
    };
  }, []);
  
  // Show wallet info when first logging in (if wallet exists)
  useEffect(() => {
    if (walletData && walletData.address) {
      // Check if this is the first load and we have wallet data
      // We don't want to show this message repeatedly on every data refresh
      const hasWalletMessage = messages.some(msg => 
        !msg.isFromUser && msg.content.includes('Your wallet address:')
      );
      
      if (!hasWalletMessage && messages.length <= 3) {
        sendMessage(`Your wallet address: ${walletData.address}`, 'text');
      }
    }
  }, [walletData]);

  const handleSendMessage = (message: string) => {
    if (message.startsWith('/')) {
      sendCommand(message);
    } else {
      sendMessage(message);
    }
  };

  const handleVoiceMessage = (audioBlob: Blob) => {
    // In a real implementation, send the audio to the server for processing
    // For now, we'll simulate a voice command by sending a specific message
    // with the voice message type
    
    // Adding this message to let the user know voice was received
    sendMessage("Voice command received: Check my balance", "text");
    
    // Wait a moment then process the simulated voice command
    setTimeout(() => {
      // This simulates what would happen after voice-to-text processing
      sendCommand("/balance");
    }, 500);
  };

  const toggleHelpModal = () => {
    setShowHelpModal(!showHelpModal);
  };

  return (
    <div className="min-h-screen bg-[#E5F5FD]">
      <div className="telegram-chat">
        <ChatHeader onClearConversation={clearConversation} />
        
        <div 
          className="flex-1 p-4 flex flex-col overflow-y-auto bg-white" 
          id="chat-container"
        >
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
            />
          ))}
        </div>
        
        <div className="bg-white border-t border-neutral-200 p-4">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            onVoiceMessage={handleVoiceMessage}
            isLoading={isLoading}
          />
          <CommandList onHelpClick={toggleHelpModal} />
        </div>
      </div>
      
      <HelpModal isOpen={showHelpModal} onClose={toggleHelpModal} />
    </div>
  );
}
