export interface ImagingTabProps {
  patientId: string;
}

export interface PatientImage {
  id: string;
  imagem_url: string;
  tipo_radiografia: string;
  created_at: string;
  resultado_ia?: boolean;
  confidence_score?: number;
}

export interface ImageGridProps {
  images: PatientImage[];
  onImageClick: (url: string) => void;
}

export interface EmptyStateProps {
  onUpload?: () => void;
}
