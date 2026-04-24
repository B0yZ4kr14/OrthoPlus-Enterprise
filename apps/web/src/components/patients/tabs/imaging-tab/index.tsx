import { useState } from "react";
import type { ImagingTabProps } from "./types";
import { usePatientImages } from "./hooks/usePatientImages";
import { ImagingHeader } from "./components/ImagingHeader";
import { ImageViewerModal } from "./components/ImageViewerModal";
import { ImageGrid } from "./components/ImageGrid";
import { EmptyState } from "./components/EmptyState";

export * from "./types";
export {
  ImagingHeader,
  ImageViewerModal,
  ImageCard,
  ImageGrid,
  EmptyState,
};
export { usePatientImages };

export function ImagingTab({ patientId }: ImagingTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { data: images, isLoading } = usePatientImages(patientId);

  if (isLoading) {
    return <div>Carregando imagens...</div>;
  }

  return (
    <div className="space-y-6">
      <ImagingHeader />

      {selectedImage && (
        <ImageViewerModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {images && images.length > 0 ? (
        <ImageGrid images={images} onImageClick={setSelectedImage} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
