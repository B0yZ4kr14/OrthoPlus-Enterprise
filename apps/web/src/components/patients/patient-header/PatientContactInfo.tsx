import { Phone, Mail, Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils/date.utils";
import type { Patient } from "./types";

interface PatientContactInfoProps {
  patient: Patient;
}

export function PatientContactInfo({ patient }: PatientContactInfoProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      {patient.phone_primary && (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{patient.phone_primary}</span>
        </div>
      )}
      {patient.email && (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{patient.email}</span>
        </div>
      )}
      {patient.birth_date && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {formatDate(patient.birth_date)} (
            {new Date().getFullYear() -
              new Date(patient.birth_date).getFullYear()}{" "}
            anos)
          </span>
        </div>
      )}
      {patient.address_city && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>
            {patient.address_city}, {patient.address_state}
          </span>
        </div>
      )}
    </div>
  );
}
