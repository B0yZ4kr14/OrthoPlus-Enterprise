import { Odontograma3DLazy } from "../lazy/Odontograma3DLazy";

interface OdontogramaContentProps {
  patientId: string;
}

export default function OdontogramaContent({
  patientId,
}: OdontogramaContentProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Odontograma</h3>
      <Odontograma3DLazy patientId={patientId} />
    </div>
  );
}
