import type { PatientImage } from "../types";
import { ImageCard } from "./ImageCard";

interface ImageGridProps {
  images: PatientImage[];
  onImageClick: (url: string) => void;
}

export function ImageGrid({ images, onImageClick }: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onClick={() => onImageClick(image.imagem_url)}
        />
      ))}
    </div>
  );
}
