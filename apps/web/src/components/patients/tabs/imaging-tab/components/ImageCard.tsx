import { Card, CardContent } from "@orthoplus/core-ui/card";
import { formatDate } from "@/lib/utils/date.utils";
import type { PatientImage } from "../types";

interface ImageCardProps {
  image: PatientImage;
  onClick: () => void;
}

export function ImageCard({ image, onClick }: ImageCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden">
          <img
            src={image.imagem_url}
            alt={image.tipo_radiografia}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="font-medium text-sm">{image.tipo_radiografia}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(image.created_at)}
        </p>
        {image.resultado_ia && (
          <div className="mt-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              IA: {image.confidence_score}% confiança
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
