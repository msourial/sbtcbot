import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/helpers";

export default function BalanceCard() {
  const { data: balanceData, isLoading } = useQuery({
    queryKey: ['/api/wallet/balance'],
  });

  if (isLoading) {
    return (
      <div className="balance-card p-4 mb-2">
        <p className="text-sm font-medium opacity-80 mb-1">Current Balance</p>
        <Skeleton className="h-8 w-40 bg-white/30 mb-1" />
        <Skeleton className="h-5 w-28 bg-white/30" />
        <div className="mt-3 bg-white/20 p-2 rounded-lg text-xs">
          <Skeleton className="h-5 w-40 bg-white/30" />
        </div>
      </div>
    );
  }

  const balance = balanceData?.balance || 0.125;
  const fiatValue = formatCurrency(balance * 61000); // Using approximate BTC price

  return (
    <div className="balance-card p-4 mb-2">
      <p className="text-sm font-medium opacity-80 mb-1">Current Balance</p>
      <p className="text-2xl font-bold mb-1">{balance} sBTC</p>
      <p className="text-sm opacity-90">≈ {fiatValue} USD</p>
      <div className="mt-3 bg-white/20 p-2 rounded-lg text-xs">
        <p className="font-medium">Last updated: Just now</p>
      </div>
    </div>
  );
}
