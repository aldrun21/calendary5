export interface Appointment {
  id: string;
  patientName: string;
  patientDob: string;
  patientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface BlockedSlot {
  date: string; // YYYY-MM-DD
  time: string | 'ALL'; // HH:mm or 'ALL'
}

export interface User {
  name: string;
  dob: string;
  phone: string;
}
