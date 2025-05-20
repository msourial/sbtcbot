import { useRef, useEffect, useState } from "react";
import { ChatMessage } from "@shared/schema";
import BalanceCard from "@/components/transaction/BalanceCard";
import TransactionCard from "@/components/transaction/TransactionCard";
import TransactionList from "@/components/transaction/TransactionList";
import ReceiveCard from "@/components/transaction/ReceiveCard";
import SecurityAlert from "@/components/transaction/SecurityAlert";
import ProcessingTransaction from "@/components/transaction/ProcessingTransaction";

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to this bubble when it's added
    if (bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Determine the bubble class based on who sent it
  const bubbleClass = message.isFromUser ? "user-bubble" : "bot-bubble";

  // For voice messages from user
  if (message.isFromUser && message.messageType === "voice") {
    return (
      <div ref={bubbleRef} className={`chat-bubble ${bubbleClass} flex items-center`}>
        <div className="bg-[hsl(var(--bitcoin-gold))]/20 rounded-full p-2 mr-2">
          <i className="ri-mic-fill text-[hsl(var(--bitcoin-gold))]"></i>
        </div>
        <p className="text-sm italic text-neutral-600">
          Voice message: {typeof message.content === "string" ? message.content : "Check my balance"}
        </p>
      </div>
    );
  }

  // For specialized message types
  if (!message.isFromUser) {
    switch (message.messageType) {
      case "balance":
        return (
          <div ref={bubbleRef} className={`chat-bubble ${bubbleClass}`}>
            {typeof message.content === "string" && (
              <p className="italic text-sm text-neutral-500 mb-2">{message.content}</p>
            )}
            <BalanceCard />
          </div>
        );

      case "transaction":
        {
          const [isProcessing, setIsProcessing] = useState(false);
          const [isConfirmed, setIsConfirmed] = useState(false);
          
          const handleConfirm = () => {
            setIsProcessing(true);
            
            // Simulate transaction processing
            setTimeout(() => {
              setIsProcessing(false);
              setIsConfirmed(true);
              
              // Send confirmation message to the parent component
              window.dispatchEvent(new CustomEvent("sendMessage", {
                detail: { message: "confirm" }
              }));
            }, 1500);
          };
          
          // If already confirmed, don't show anything
          if (isConfirmed) {
            return null;
          }
          
          return (
            <div ref={bubbleRef} className={`chat-bubble ${bubbleClass}`}>
              <p className="font-medium mb-3">Transaction Details</p>
              {typeof message.content === "object" ? (
                message.content
              ) : isProcessing ? (
                <ProcessingTransaction />
              ) : (
                <TransactionCard 
                  onConfirm={handleConfirm}
                />
              )}
            </div>
          );
        }

      case "history":
        return (
          <div ref={bubbleRef} className={`chat-bubble ${bubbleClass}`}>
            <p className="font-medium mb-3">Recent Transactions</p>
            <TransactionList />
          </div>
        );

      case "receive":
        return (
          <div ref={bubbleRef} className={`chat-bubble ${bubbleClass}`}>
            <p className="font-medium mb-3">Receive sBTC</p>
            <ReceiveCard />
          </div>
        );

      case "security":
        return (
          <div ref={bubbleRef} className={`chat-bubble ${bubbleClass}`}>
            <SecurityAlert />
          </div>
        );

      case "processing":
        return (
          <div ref={bubbleRef} className={`chat-bubble ${bubbleClass} mb-1`}>
            <ProcessingTransaction />
          </div>
        );
    }
  }

  // Default text message
  return (
    <div ref={bubbleRef} className={`chat-bubble ${bubbleClass}`}>
      {typeof message.content === "string" ? (
        <p className="text-neutral-800">{message.content}</p>
      ) : (
        message.content
      )}
    </div>
  );
}
