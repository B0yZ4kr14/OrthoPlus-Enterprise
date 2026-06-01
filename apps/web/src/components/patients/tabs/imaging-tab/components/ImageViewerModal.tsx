import { Button } from "@orthoplus/core-ui/button";
import { ZoomIn } from "lucide-react";
import { ImageViewer } from "@/components/imaging/ImageViewer";

interface ImageViewerModalProps {
  imageUrl: string;
  onClose: () => void;
}

export function ImageViewerModal({ imageUrl, onClose }: ImageViewerModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={onClose}
          aria-label="Fechar visualizador"
        >
          <ZoomIn className="h-6 w-6" />
        </Button>
        <ImageViewer imageUrl={imageUrl} />
      </div>
    </div>
  );
}
