import { useState } from "react";
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

  const handleSendMessage = (message: string) => {
    if (message.startsWith('/')) {
      sendCommand(message);
    } else {
      sendMessage(message);
    }
  };

  const handleVoiceMessage = (audioBlob: Blob) => {
    // In a real implementation, send the audio to the server for processing
    // For now, we'll simulate a voice command
    sendMessage("Check my balance", "voice");
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
