import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { commands } from "@/lib/constants";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  // Using Dialog (which is based on Radix UI) for the modal
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4 p-5 bg-white rounded-xl">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg font-bold">sBTC Bot Commands</DialogTitle>
          <DialogClose className="text-neutral-500">
            <i className="ri-close-line text-xl"></i>
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-3 mb-4">
          {commands.map((command) => (
            <div key={command.name} className="flex items-start">
              <div className="bg-[hsl(var(--telegram-light))] p-1.5 rounded mr-3">
                <i className={`${command.icon} text-[hsl(var(--telegram-blue))]`}></i>
              </div>
              <div>
                <p className="font-medium">{command.name}</p>
                <p className="text-sm text-neutral-600">{command.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-sm text-neutral-600 mb-4">
          You can also use natural language commands like "Send 0.1 sBTC to @username" 
          or voice commands by tapping the microphone icon.
        </p>
        
        <Button 
          className="w-full bg-[hsl(var(--telegram-blue))] text-white py-2.5 rounded-lg font-medium"
          onClick={onClose}
        >
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
}
