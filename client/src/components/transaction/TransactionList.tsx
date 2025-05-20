import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatTimeAgo } from "@/lib/helpers";

export default function TransactionList() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Default mock transactions if API doesn't return data
  const transactionData = transactions || [
    {
      id: 1,
      type: 'sent',
      recipient: '@Alice',
      amount: 0.01,
      timestamp: new Date(),
    },
    {
      id: 2,
      type: 'received',
      sender: '@Bob',
      amount: 0.025,
      timestamp: new Date(Date.now() - 86400000), // yesterday
    },
    {
      id: 3,
      type: 'sent',
      recipient: '@Charlie',
      amount: 0.005,
      timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
    }
  ];

  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="transaction-card p-3 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-full mr-2" />
                <div>
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-20 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
        <Button className="w-full bg-neutral-100 text-neutral-700 rounded-lg py-2 text-sm font-medium">
          View All Transactions
        </Button>
      </>
    );
  }

  return (
    <>
      {transactionData.map((tx) => {
        const isSent = tx.type === 'sent';
        const usdValue = tx.amount * 61000; // Using approximate BTC price
        
        return (
          <div key={tx.id} className="transaction-card p-3 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 bg-[hsl(var(--telegram-light))] rounded-full flex items-center justify-center mr-2`}>
                  {isSent ? (
                    <i className="ri-arrow-right-up-line text-status-error"></i>
                  ) : (
                    <i className="ri-arrow-left-down-line text-status-success"></i>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {isSent ? `Sent to ${tx.recipient}` : `Received from ${tx.sender}`}
                  </p>
                  <p className="text-xs text-neutral-500">{formatTimeAgo(tx.timestamp)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${isSent ? 'text-status-error' : 'text-status-success'}`}>
                  {isSent ? '-' : '+'}{tx.amount} sBTC
                </p>
                <p className="text-xs text-neutral-500">≈ {formatCurrency(usdValue)}</p>
              </div>
            </div>
          </div>
        );
      })}
      
      <Button className="w-full bg-neutral-100 text-neutral-700 rounded-lg py-2 text-sm font-medium">
        View All Transactions
      </Button>
    </>
  );
}
