import { Button } from "@/components/ui/button";
import { commands } from "@/lib/constants";

interface CommandListProps {
  onHelpClick: () => void;
}

export default function CommandList({ onHelpClick }: CommandListProps) {
  return (
    <div className="flex mt-2 px-1">
      <span className="text-xs text-neutral-500 mr-2">Popular commands:</span>
      {commands.slice(0, 4).map((command) => (
        <Button
          key={command.name}
          variant="link"
          className="text-xs text-telegram-blue mr-2 p-0 h-auto"
          onClick={() => {
            if (command.name === "/help") {
              onHelpClick();
            }
          }}
        >
          {command.name}
        </Button>
      ))}
    </div>
  );
}
