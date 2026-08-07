/**
 * Only standard named imports from lucide-react should be used.
 * Standard TypeScript enum declarations are required.
 */

export enum VehicleCategory {
  STANDARD = "STANDARD",
  VAN = "VAN",
  TAXI = "TAXI",
}

export interface Vehicle {
  id: string;
  name: string;
  category: VehicleCategory;
  passengers: number;
  luggage: number;
  electric: boolean;
  powerSource: string;
  description: string;
  image: string;
  pricePerKm: number;
  basePrice: number;
  minPrice: number;
  amenities: string[];
  premium?: boolean;
  taxi?: boolean;
  hourlyRate?: number;
  make?: string;
  model?: string;
  displayCategory?: string;
  powertrain?: string;
  highlights?: string[];
  luggageDetails?: {
    standard_checked_bags: number;
    cabin_bags: number;
    notes: string;
  };
}

export interface WayPoint {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  category: "airport" | "landmark" | "excursion" | "dining" | "custom";
}

export interface SpecialPreference {
  silentCabin: boolean;
  beverages: boolean;
  infantSeat: boolean;
  financialTimes: boolean;
  privacyTint: boolean;
  targetTemp: number; // in Celsius, default 21
  sriGroup?: "g0" | "g1" | "g2_3" | "g135" | "none"; // legacy single group
  sriQuantity?: number; // legacy overall quantity
  sriG0Quantity?: number; // Group 0/0+ quantity
  sriG1Quantity?: number; // Group 1 quantity
  sriG23Quantity?: number; // Group 2 & 3 quantity
  wheelchairType?: "folding" | "motorized" | "none";
  wheelchairQuantity?: number;
  silentOnboarding?: boolean;
  tempPreset?: "crisp" | "ambient" | "cozy" | "custom";
  airportMeetGreet?: boolean;
}

export interface Booking {
  id: string;
  pickup: string;
  pickupCoords?: { lat: number; lng: number };
  destination: string;
  destinationCoords?: { lat: number; lng: number };
  date: string;
  time: string;
  vehicleId: string;
  distanceKm: number;
  durationMins: number;
  price: number;
  remarks: string;
  extraStops: string[];
  preferences: SpecialPreference;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  flightNumber?: string;
  flightStatus?: string;
  assignedDriverId?: string;
  driverPhone?: string;
  driverName?: string;
  wantsInvoice?: boolean;
  invoiceSent?: boolean;
  serviceCode?: string;
  invoiceDocumentNumber?: string;
  invoiceDocumentType?: string;
  invoiceFullName?: string;
  bookingType?: "distance" | "hourly";
  language?: "en" | "es" | "ca";
  hourlyDuration?: number;
  invoiceNumber?: number;
  passengersCount?: number;
  luggageCount?: number;
  cabinLuggageCount?: number;
  feedback?: {
    chauffeurRating: number;
    serviceRating: number;
    cabinComfortRating: number;
    comments: string;
    selectedPraise: string[];
    submittedAt: string;
  };
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  assignedVehicleId: string;
  password?: string;
  latitude?: number;
  longitude?: number;
  locationTimestamp?: string;
}

export interface FleetItem {
  id: string;
  vehicleId: string;
  name: string;
  plateNumber: string;
  status: "active" | "dispatched" | "offline" | "maintenance";
  category?: string;
  passengers?: number;
  luggage?: number;
  powerSource?: string;
  basePrice?: number;
  pricePerKm?: number;
  minPrice?: number;
  hourlyRate?: number;
  assignedDriverId?: string;
  amenities?: string[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  recommendedStops?: { name: string; description: string; lat?: number; lng?: number }[];
  timestamp: string;
}
