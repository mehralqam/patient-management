 export interface Clinic {
  id: number;
  name: string;
  address: string;
}

export interface Clinician {
  id: number;
  name: string;
  role: string;
}

export interface Appointment {
  id: number;
  date: string;
  clinicians: Clinician[];
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  clinic: number;
  clinic_name: string;
  appointments: Appointment[];
}

export interface CreatePatientDto {
  first_name: string;
  last_name: string;
  date_of_birth: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
