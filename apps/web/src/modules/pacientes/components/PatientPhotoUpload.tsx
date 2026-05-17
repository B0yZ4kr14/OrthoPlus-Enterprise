/**
 * PatientPhotoUpload Component
 * Upload e preview da foto do paciente
 */

import { useState, useRef, memo } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@orthoplus/core-ui/avatar";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

interface PatientPhotoUploadProps {
  patientId: string;
  currentPhotoUrl?: string;
  patientName: string;
  onPhotoUpdated: (url: string) => void;
}

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const PatientPhotoUpload = memo(function PatientPhotoUpload({
  patientId,
  currentPhotoUrl,
  patientName,
  onPhotoUpdated,
}: PatientPhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Formato inválido", {
        description: "Use JPG, PNG ou WebP",
      });
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error("Arquivo muito grande", {
        description: `Máximo ${MAX_SIZE_MB}MB`,
      });
      return;
    }

    // Preview local
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await apiClient.post<{
        success: boolean;
        data: { path: string };
      }>("/files/upload", formData);

      if (!uploadRes.success) {
        throw new Error("Upload failed");
      }

      const photoUrl = uploadRes.data.path;

      // Atualizar paciente
      await apiClient.put(`/pacientes/${patientId}`, {
        photoUrl,
      });

      onPhotoUpdated(photoUrl);
      toast.success("Foto atualizada com sucesso!");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro no upload";
      toast.error("Erro ao enviar foto", { description: msg });
      setPreview(currentPhotoUrl ?? null);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const initials = patientName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-border">
          <AvatarImage src={preview ?? undefined} alt={patientName} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Overlay de upload */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? "Enviando..." : preview ? "Trocar foto" : "Adicionar foto"}
      </Button>
    </div>
  );
});
