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
  const { messages, sendMessage, sendCommand, isLoading } = useChat();

  // Fetch user data from the server
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
    // The queryFn is already set up in queryClient.ts
  });

  // Listen for transaction confirmation events
  useEffect(() => {
    const handleConfirmEvent = (event: any) => {
      if (event.detail && event.detail.message) {
        handleSendMessage(event.detail.message);
      }
    };
    
    window.addEventListener("sendMessage", handleConfirmEvent);
    
    return () => {
      window.removeEventListener("sendMessage", handleConfirmEvent);
    };
  }, []);

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
        <ChatHeader />
        
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
