export default function ProcessingTransaction() {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">Processing Transaction</p>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[hsl(var(--telegram-blue))]"></div>
      </div>
      <div className="bg-neutral-100 rounded-lg p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-neutral-600">Validating transaction</span>
          <i className="ri-check-line text-[hsl(var(--status-success))]"></i>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-neutral-600">Securing with sBTC</span>
          <i className="ri-check-line text-[hsl(var(--status-success))]"></i>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-600">Confirming on blockchain</span>
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </>
  );
}
