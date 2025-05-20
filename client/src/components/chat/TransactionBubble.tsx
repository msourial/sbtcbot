import { useState } from 'react';
import TransactionCard from "../transaction/TransactionCard";
import ProcessingTransaction from "../transaction/ProcessingTransaction";
import { useChat } from "@/hooks/use-chat";

interface TransactionBubbleProps {
  recipient?: string;
  amount?: number;
}

export default function TransactionBubble({ recipient = "@Alice", amount = 0.01 }: TransactionBubbleProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { sendMessage } = useChat();

  const handleConfirm = () => {
    // Show processing state
    setIsProcessing(true);
    
    // Simulate transaction processing
    setTimeout(() => {
      // After "processing", send confirmation message to trigger success messages
      sendMessage("confirm");
      setIsProcessing(false);
      setIsCompleted(true);
    }, 2000);
  };

  // If transaction is completed, don't show anything as the success message
  // will be shown separately by the chat component
  if (isCompleted) {
    return null;
  }

  // If processing, show the processing animation
  if (isProcessing) {
    return <ProcessingTransaction />;
  }

  // Otherwise show the transaction card with working confirm button
  return (
    <TransactionCard 
      recipientName={recipient}
      amount={amount}
      onConfirm={handleConfirm}
    />
  );
}