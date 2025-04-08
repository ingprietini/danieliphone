
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Download } from "lucide-react";
import { Conversion } from "./types";

interface AudioActionsProps {
  conversion: Conversion;
  isPlaying: boolean;
  isCurrentPlaying: boolean;
  onPlay: () => void;
  onDownload: () => void;
}

const AudioActions = ({
  conversion,
  isPlaying,
  isCurrentPlaying,
  onPlay,
  onDownload
}: AudioActionsProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={onPlay}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        title={isPlaying && isCurrentPlaying ? "Pausar" : "Reproducir"}
      >
        {isPlaying && isCurrentPlaying ? (
          <PauseCircle className="h-4 w-4" />
        ) : (
          <PlayCircle className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default AudioActions;
