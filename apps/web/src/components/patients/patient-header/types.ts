export interface PatientHeaderProps {
  patientId: string;
}

export interface Patient {
  id: string;
  full_name: string;
  social_name?: string;
  status: string;
  phone_primary?: string;
  email?: string;
  birth_date?: string;
  address_city?: string;
  address_state?: string;
  marketing_campaign?: string;
  marketing_source?: string;
}
