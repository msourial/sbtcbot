import { useState } from 'react';
import TransactionCard from "../transaction/TransactionCard";
import ProcessingTransaction from "../transaction/ProcessingTransaction";

interface ConfirmableTransactionProps {
  recipient?: string;
  amount?: number;
  onConfirm: (confirmed: boolean) => void;
}

export default function ConfirmableTransaction({ 
  recipient = "@Alice", 
  amount = 0.01,
  onConfirm
}: ConfirmableTransactionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleConfirm = () => {
    setIsProcessing(true);
    
    // After a delay, tell the parent component the transaction was confirmed
    setTimeout(() => {
      onConfirm(true);
    }, 1500);
  };
  
  const handleCancel = () => {
    onConfirm(false);
  };
  
  if (isProcessing) {
    return <ProcessingTransaction />;
  }
  
  return (
    <TransactionCard 
      recipientName={recipient}
      amount={amount}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}