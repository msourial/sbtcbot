import { useState } from "react";

export default function ChatHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-[hsl(var(--bitcoin-gold))] rounded-full flex items-center justify-center mr-3">
          <i className="ri-bit-coin-line text-white text-lg"></i>
        </div>
        <div>
          <h1 className="text-lg font-bold">sBTC Bot</h1>
          <p className="text-xs text-neutral-600">Active now</p>
        </div>
      </div>
      <div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="focus:outline-none"
          aria-label="Menu"
        >
          <i className="ri-more-2-fill text-neutral-600 text-xl"></i>
        </button>
        
        {isMenuOpen && (
          <div className="absolute right-4 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
            <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
              <i className="ri-settings-line mr-2"></i> Settings
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
              <i className="ri-shield-line mr-2"></i> Security
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
              <i className="ri-question-line mr-2"></i> Help
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
