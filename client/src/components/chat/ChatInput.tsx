import { useState, useRef } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceMessage: (audioBlob: Blob) => void;
  isLoading?: boolean;
}

export default function ChatInput({ onSendMessage, onVoiceMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      onSendMessage(message.trim());
      setMessage("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      // In a real implementation, stop recording and process the audio
      setIsRecording(false);
      
      // Simulate recording a voice message
      // In a real app, we would create an actual audio blob
      const dummyBlob = new Blob([], { type: 'audio/webm' });
      onVoiceMessage(dummyBlob);
    } else {
      // In a real implementation, start recording
      setIsRecording(true);
    }
  };

  return (
    <div className="command-input bg-neutral-100 flex items-center p-2 px-4">
      <i className="ri-command-line text-neutral-400 mr-2"></i>
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a command or message..."
        className="bg-transparent border-none flex-1 focus:outline-none text-neutral-800"
        disabled={isLoading}
      />
      <div className="flex items-center">
        <button
          onClick={toggleVoiceRecording}
          className={`h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-200 ${
            isRecording ? "text-status-error" : "text-telegram-blue"
          }`}
          disabled={isLoading}
          aria-label="Voice command"
        >
          <i className={isRecording ? "ri-mic-fill" : "ri-mic-line"}></i>
        </button>
        <button
          onClick={handleSendMessage}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-200 ml-1"
          disabled={message.trim() === "" || isLoading}
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-t-2 border-telegram-blue rounded-full"></div>
          ) : (
            <i className="ri-send-plane-fill text-telegram-blue"></i>
          )}
        </button>
      </div>
    </div>
  );
}
