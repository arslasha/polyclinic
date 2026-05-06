export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  birth_date?: string;
  gender?: string;
}

export interface Doctor {
  id: number;
  user: User;
  specialization: string;
  office_number?: string;
  bio?: string;
}

export interface Patient {
  id: number;
  user: User;
  insurance_number: string;
  medical_policy: string;
  address?: string;
}

export interface Slot {
  id: number;
  doctor: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Appointment {
  id: number;
  patient: number;
  slot: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  complaint?: string;
  diagnosis_mkb10?: string;
  treatment_plan?: string;
  created_at: string;
}
