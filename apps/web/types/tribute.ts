// File: types/tribute.ts

export interface RSVP {
  name: string;
  attending: boolean;
  timestamp: string; // ISO string
}

export interface FuneralDetails {
  rsvpEnabled?: boolean;
  rsvpList?: RSVP[];
  dateTime?: string;
  location?: string;
  rsvpLink?: string;
  notes?: string;
  [key: string]: any;
}

export interface Tribute {
  id: string;
  createdBy: string;
  name: string;
  birthDate: string;
  deathDate?: string;
  bio?: string;
  obituaryText?: string;
  photoBase64?: string;
  photoUrl?: string;
  story?: string;
  funeralDetails?: FuneralDetails;
  tags?: string[];
}
