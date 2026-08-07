import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Phone,
  Mail,
  MessageCircle,
  ArrowRight,
  Sliders,
  CheckCircle,
  HelpCircle,
  Navigation,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  AlertCircle,
  Menu,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
  FileText,
  Download,
  Ticket,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Vehicle, VehicleCategory, Booking, SpecialPreference, WayPoint } from "./types";
import { Language, SIGHTS_TRANSLATIONS, VEHICLES_TRANSLATIONS, TESTIMONIALS_TRANSLATIONS, UI_TRANSLATIONS } from "./lib/translations";
import AddressInput from "./components/AddressInput";
import ControlManagement from "./components/ControlManagement";
import StepBasics from "./components/StepBasics";
import StepRoute from "./components/StepRoute";
import StepComfort from "./components/StepComfort";
import StepComfortCheckout from "./components/StepComfortCheckout";
import FleetSelector from "./components/FleetSelector";
import BookingsDashboard from "./components/BookingsDashboard";
import BookingItineraryModal from "./components/BookingItineraryModal";
import { generatePlaintextItinerary, generateHTMLVoucher, downloadFile } from "./utils/itinerary-exporter";

import mercedesE300eImage from "./assets/images/regenerated_image_1781734160478.webp";
import teslaModel3Image from "./assets/images/regenerated_image_1781734159656.jpg";
import toyotaPriusImage from "./assets/images/regenerated_image_1782568637414.jpg";

// Coordinate reference points for distance calculation
const SIGHTS = [
  { id: "el-prat", name: "Barcelona-El Prat Airport", city: "Barcelona", lat: 41.2974, lng: 2.0833, category: "airport", description: "Terminal 1 & 2 private pickup gate, VIP arrivals salon access." },
  { id: "montserrat", name: "Montserrat Royal Monastery", city: "Montserrat", lat: 41.5958, lng: 1.8302, category: "excursion", description: "Dramatic multi-peaked mountain abbey." },
  { id: "sitges", name: "Sitges Coastal Sanctuary", city: "Sitges", lat: 41.2335, lng: 1.8048, category: "excursion", description: "Discreet Mediterranean seaside resort." }
];

// Available showroom vehicles
const VEHICLES: Vehicle[] = [
  {
    id: "tesla-model-3",
    name: "Tesla Model 3",
    category: VehicleCategory.STANDARD,
    passengers: 4,
    luggage: 4,
    electric: true,
    powerSource: "Electric (BEV)",
    description: "100% Electric. Panoramic glass roof. Zero emissions.",
    image: teslaModel3Image,
    basePrice: 30.00,
    pricePerKm: 2.25,
    minPrice: 30.00,
    amenities: ["100% Electric", "Panoramic glass roof", "Zero emissions"],
    premium: true,
    hourlyRate: 65,
    make: "Tesla",
    model: "Model 3",
    displayCategory: "Green Executive",
    powertrain: "Electric (BEV)",
    highlights: ["100% Electric", "Panoramic glass roof", "Zero emissions"],
    luggageDetails: {
      standard_checked_bags: 2,
      cabin_bags: 2,
      notes: "Utilizes rear trunk and front trunk (frunk)"
    }
  },
  {
    id: "mercedes-e300e",
    name: "Mercedes-Benz E300e",
    category: VehicleCategory.STANDARD,
    passengers: 4,
    luggage: 3,
    electric: true,
    powerSource: "Plug-in Hybrid (PHEV)",
    description: "Plug-in Hybrid. Classic corporate luxury. Silent urban driving.",
    image: mercedesE300eImage,
    basePrice: 40.00,
    pricePerKm: 2.50,
    minPrice: 40.00,
    amenities: ["Plug-in Hybrid", "Classic corporate luxury", "Silent urban driving"],
    premium: true,
    hourlyRate: 80,
    make: "Mercedes-Benz",
    model: "E300e",
    displayCategory: "Business Class",
    powertrain: "Plug-in Hybrid (PHEV)",
    highlights: ["Plug-in Hybrid", "Classic corporate luxury", "Silent urban driving"],
    luggageDetails: {
      standard_checked_bags: 2,
      cabin_bags: 1,
      notes: "Trunk space slightly reduced due to PHEV battery"
    }
  },
  {
    id: "mercedes-v-class",
    name: "Mercedes-Benz V-Class (V220d / V300d)",
    category: VehicleCategory.VAN,
    passengers: 8,
    luggage: 14,
    electric: false,
    powerSource: "Diesel",
    description: "Face-to-face conference seating. Rear climate control. Maximum luggage capacity.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTm6mLRaPyOV3mn45BROyNhKCUJ2wifLqjkxGBNqgGx_XDVKlyW5TQYZA8XPNVayzW14fZaN5xIyhHSq3kdohGnq_WBWsiK2NLwKPR3hn-B1-KIDfjRuxhjvuPxeP0TvqPlPo3eM9YgRN6xMMYfhB7g-KD9sDmRDAxl41z6Z9gOV3P72kx8JqYXGJZiz4A4NM-mucgtBolwta3Lrs0lK3uRWEn8QVo0lX4fQu_JaawgCywXzM75TJdnEbXNzdeqnYS7ALYrpANQEUd",
    basePrice: 50.00,
    pricePerKm: 3.00,
    minPrice: 50.00,
    amenities: ["Face-to-face conference seating", "Rear climate control", "Maximum luggage capacity"],
    premium: true,
    hourlyRate: 110,
    make: "Mercedes-Benz",
    model: "V-Class (V220d / V300d)",
    displayCategory: "VIP Jet Class",
    powertrain: "Diesel",
    highlights: ["Face-to-face conference seating", "Rear climate control", "Maximum luggage capacity"],
    luggageDetails: {
      standard_checked_bags: 8,
      cabin_bags: 6,
      notes: "Ideal for groups and heavy luggage"
    }
  },
  {
    id: "taxi-1-4-pax",
    name: "Taxi 1-4 pax",
    category: VehicleCategory.TAXI,
    passengers: 4,
    luggage: 4,
    electric: true,
    powerSource: "Hybrid (HEV)",
    description: "Toyotas Prius Plus , corolla sedan / familiar",
    image: toyotaPriusImage,
    basePrice: 15.00,
    pricePerKm: 2.20,
    minPrice: 15.00,
    amenities: ["Taxi 1-4 Passengers", "Toyotas Prius Plus / Corolla", "Air Conditioning", "Standard Luggage Space"],
    premium: false,
    taxi: true,
    hourlyRate: 45,
    make: "Toyota",
    model: "Prius Plus / Corolla",
    displayCategory: "Taxi 1-4 Pax",
    powertrain: "Hybrid (HEV)",
    highlights: ["Toyotas Prius Plus , corolla sedan / familiar", "Hybrid Efficiency", "City & Airport Transfer"],
    luggageDetails: {
      standard_checked_bags: 2,
      cabin_bags: 2,
      notes: "Toyota Prius Plus / Corolla boot space"
    }
  },
  {
    id: "taxi-vans-4-8-pax",
    name: "Taxi Vans 4-8 pax",
    category: VehicleCategory.TAXI,
    passengers: 8,
    luggage: 8,
    electric: false,
    powerSource: "Diesel / Hybrid",
    description: "Mercedes Vito/V class ,ford custom",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTm6mLRaPyOV3mn45BROyNhKCUJ2wifLqjkxGBNqgGx_XDVKlyW5TQYZA8XPNVayzW14fZaN5xIyhHSq3kdohGnq_WBWsiK2NLwKPR3hn-B1-KIDfjRuxhjvuPxeP0TvqPlPo3eM9YgRN6xMMYfhB7g-KD9sDmRDAxl41z6Z9gOV3P72kx8JqYXGJZiz4A4NM-mucgtBolwta3Lrs0lK3uRWEn8QVo0lX4fQu_JaawgCywXzM75TJdnEbXNzdeqnYS7ALYrpANQEUd",
    basePrice: 30.00,
    pricePerKm: 2.70,
    minPrice: 30.00,
    amenities: ["Taxi Vans 4-8 Passengers", "Mercedes Vito/V class / Ford Custom", "Large Group Capacity", "Air Conditioning"],
    premium: false,
    taxi: true,
    hourlyRate: 65,
    make: "Mercedes / Ford",
    model: "Vito / V-Class / Custom",
    displayCategory: "Taxi Vans 4-8 Pax",
    powertrain: "Diesel / Hybrid",
    highlights: ["Mercedes Vito/V class ,ford custom", "Large Luggage Capacity", "Group Transfer"],
    luggageDetails: {
      standard_checked_bags: 6,
      cabin_bags: 4,
      notes: "Large group bay for up to 8 passengers"
    }
  }
];

// Testimonials for rotating carousel
const TESTIMONIALS = [
  {
    quote: "The severe silent cabin option with Majestic Fleet Sl allowed me to prepare for my keynote at the Mobile World Congress in absolute isolation. Incredible luxury standards.",
    author: "MARCUS COHEN",
    title: "Global Logistics and Trade President"
  },
  {
    quote: "A sublime afternoon route through the rolling vineyards of Penedès. Our chauffeur handled our organic cava cases with absolute ease and knew the best scenic lookouts.",
    author: "ELENA ROVIRA",
    title: "Catalonian Cellar Critic & Journalist"
  },
  {
    quote: "Discreet and elite. Majestic Fleet Sl has completely re-modeled executive transport standards in Barcelona. I will use no other service during my coastal trips.",
    author: "DR. PIERRE DUVAL",
    title: "Private Healthcare Founder"
  }
];

// Haversine route solver using direct coordinate structures
const calculateDistance = (
  pCoords: { lat: number; lng: number } | null,
  dCoords: { lat: number; lng: number } | null,
  stops: { address: string; coords: { lat: number; lng: number } }[]
) => {
  if (!pCoords || !dCoords) return 0;

  const getDistanceBetween = (c1: { lat: number; lng: number }, c2: { lat: number; lng: number }) => {
    const R = 6371; // km
    const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
    const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.lat * Math.PI) / 180) *
        Math.cos((c2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  let totalDist = 0;
  let currentStart = pCoords;

  stops.forEach((st) => {
    if (st.coords) {
      totalDist += getDistanceBetween(currentStart, st.coords);
      currentStart = st.coords;
    }
  });

  totalDist += getDistanceBetween(currentStart, dCoords);

  // realistic driving distance (Haversine * 1.35)
  return parseFloat((totalDist * 1.35).toFixed(1));
};

const formatHourMinute = (mins: number) => {
  const hours = Math.floor(mins / 60);
  const m = mins % 60;
  if (hours === 0) return `${mins} mins`;
  return `${hours} hr${hours !== 1 ? 's' : ''} ${m} min${m !== 1 ? 's' : ''} (${mins} mins)`;
};

// Safe LocalStorage wrapper to handle Sandbox iframe restrictions without throwing SecurityError
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      console.warn("localStorage reading is blocked or unavailable in this sandbox environment:", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn("localStorage writing is blocked or unavailable in this sandbox environment:", e);
    }
  }
};

export default function App() {
  console.log("[VELVET] Rendering App component hierarchy...");
  const [lang, setLang] = useState<Language>(() => {
    const saved = safeLocalStorage.getItem("velvet_language");
    return (saved === "ca" || saved === "en" || saved === "es") ? (saved as Language) : "en";
  });

  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"book" | "dashboard" | "fleet">("book");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Dynamic Vehicle List & Prices State
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>(VEHICLES);

  const fetchVehiclePrices = async () => {
    try {
      const res = await fetch("/api/vehicle-prices");
      if (res.ok) {
        const pricesData = await res.json();
        if (Array.isArray(pricesData) && pricesData.length > 0) {
          setVehiclesList((prevVehicles) =>
            prevVehicles.map((v) => {
              const override = pricesData.find((p: any) => p.id === v.id);
              if (override) {
                return {
                  ...v,
                  basePrice: typeof override.basePrice === "number" ? override.basePrice : v.basePrice,
                  pricePerKm: typeof override.pricePerKm === "number" ? override.pricePerKm : v.pricePerKm,
                  minPrice: typeof override.minPrice === "number" ? override.minPrice : v.minPrice,
                  hourlyRate: typeof override.hourlyRate === "number" ? override.hourlyRate : v.hourlyRate,
                };
              }
              return v;
            })
          );
        }
      }
    } catch (err) {
      console.error("Error fetching vehicle prices:", err);
    }
  };

  useEffect(() => {
    fetchVehiclePrices();
  }, []);

  // Sync language selection to localStorage
  useEffect(() => {
    safeLocalStorage.setItem("velvet_language", lang);
  }, [lang]);

  // Scroll to the top of the page when changing tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Compute localized data dynamically
  const localizedSights = useMemo(() => {
    return SIGHTS.map((s) => ({
      ...s,
      name: SIGHTS_TRANSLATIONS[lang][s.id]?.name || s.name,
      description: SIGHTS_TRANSLATIONS[lang][s.id]?.description || s.description,
    }));
  }, [lang]);

  const localizedVehicles = useMemo(() => {
    return vehiclesList.map((v) => ({
      ...v,
      name: VEHICLES_TRANSLATIONS[lang][v.id]?.name || v.name,
      description: VEHICLES_TRANSLATIONS[lang][v.id]?.description || v.description,
      powerSource: VEHICLES_TRANSLATIONS[lang][v.id]?.powerSource || v.powerSource,
      amenities: VEHICLES_TRANSLATIONS[lang][v.id]?.amenities || v.amenities,
    }));
  }, [lang, vehiclesList]);

  const localizedTestimonials = useMemo(() => {
    return TESTIMONIALS_TRANSLATIONS[lang];
  }, [lang]);

  const t = useMemo(() => {
    return UI_TRANSLATIONS[lang];
  }, [lang]);

  // Booking details configuration with coordinates
  const [bookingType, setBookingType] = useState<"distance" | "hourly">("distance");
  const [hourlyDuration, setHourlyDuration] = useState<number>(2); // 2 to 24 hours
  const [wizardStep, setWizardStep] = useState<number>(1); // Steps 1 to 4
  const [passengersCount, setPassengersCount] = useState<number>(2);
  const [luggageCount, setLuggageCount] = useState<number>(2);
  const [cabinLuggageCount, setCabinLuggageCount] = useState<number>(0);
  const [pickup, setPickup] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [vehicleId, setVehicleId] = useState("mercedes-e300e");
  const [extraStops, setExtraStops] = useState<{ address: string; coords: { lat: number; lng: number } }[]>([]);
  const [selectedPresetSight, setSelectedPresetSight] = useState<{ id: string; name: string; lat: number; lng: number } | null>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<"T1" | "T2">("T1");
  
  // Passenger Contact
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+34");
  const [flightNumber, setFlightNumber] = useState("");
  const [specialRemarks, setSpecialRemarks] = useState("");
  
  // Invoice states requested by user
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [invoiceDocumentNumber, setInvoiceDocumentNumber] = useState("");
  const [invoiceDocumentType, setInvoiceDocumentType] = useState("passport"); // "passport" | "national_id" | "tax_id"
  const [invoiceFullName, setInvoiceFullName] = useState("");

  const [preferences, setPreferences] = useState<SpecialPreference>({
    silentCabin: false,
    beverages: false,
    infantSeat: false,
    financialTimes: false,
    privacyTint: false,
    targetTemp: 21.0,
    sriGroup: "none",
    sriQuantity: 0,
    sriG0Quantity: 0,
    sriG1Quantity: 0,
    sriG23Quantity: 0,
    wheelchairType: "none",
    wheelchairQuantity: 0
  });

  // Scroll to the Service Concierge container when changing wizard steps
  const wizardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (wizardRef.current) {
      const rect = wizardRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - 70; // 70px offset for the fixed navigation bar
      
      window.scrollTo({
        top: targetY,
        behavior: "smooth"
      });
    }
  }, [wizardStep]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [viewingVoucherBooking, setViewingVoucherBooking] = useState<Booking | null>(null);

  const handleTriggerPrintBooking = (booking: Booking) => {
    try {
      let printEl = document.getElementById("print-mount-point");
      if (!printEl) {
        printEl = document.createElement("div");
        printEl.id = "print-mount-point";
        document.body.appendChild(printEl);
      }

      const htmlContent = generateHTMLVoucher(booking, localizedVehicles);

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      const ticketContainer = tempDiv.querySelector(".ticket-container");

      if (ticketContainer) {
        printEl.innerHTML = ticketContainer.outerHTML;
      } else {
        printEl.innerHTML = htmlContent;
      }

      let printStyle = document.getElementById("print-override-style");
      if (!printStyle) {
        printStyle = document.createElement("style");
        printStyle.id = "print-override-style";
        printStyle.innerHTML = `
          @media print {
            body > *:not(#print-mount-point) {
              display: none !important;
            }
            #print-mount-point {
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
              color: black !important;
            }
          }
          #print-mount-point {
            display: none;
          }
        `;
        document.head.appendChild(printStyle);
      }

      window.focus();
      window.print();

      setTimeout(() => {
        if (printEl) printEl.innerHTML = "";
      }, 500);

    } catch (err) {
      console.warn("Direct window printing was obstructed:", err);
    }
  };

  // Refs to strictly resolve React state closure sync updates
  const bookingsRef = useRef<Booking[]>([]);
  const notifiedEventsRef = useRef<Set<string>>(new Set());

  // Synchronise bookingsRef immediately on changes
  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);
  const [reservationPrompt, setReservationPrompt] = useState<string | null>(null);

  // Simple visual toast notifications for synchronization status alerts
  const [toasts, setToasts] = useState<{
    id: string;
    title: string;
    description: string;
    type: "info" | "success" | "warning";
  }[]>([]);

  const addToast = (title: string, description: string, type: "info" | "success" | "warning" = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Traffic flow status
  const [trafficStatus, setTrafficStatus] = useState<"smooth" | "moderate" | "congested" | null>("smooth");

  // Custom travel inspiration image states
  const [inspirationImage, setInspirationImage] = useState<string>("");
  const [inspirationPrompt, setInspirationPrompt] = useState<string>("");
  const [isGeneratingInspiration, setIsGeneratingInspiration] = useState<boolean>(false);
  const [inspirationIsGenerated, setInspirationIsGenerated] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [hoveredLandmarkId, setHoveredLandmarkId] = useState<string | null>(null);

  // Custom AI Concierge Chat state
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "model"; content: string; groundingMetadata?: any }[]>([
    {
      role: "model",
      content: lang === "ca"
        ? "Benvingut, passatger. Sóc el vostre Concierge de Majestic Fleet Sl. Permeteu-me dissenyar una excursió a mida per Catalunya durant el nostre viatge. \n\nUs interessa un tast de vins ecològics, caminades guiades per Montserrat o sopar als millors restaurants Michelin?"
        : "Greetings, passenger. I am your Majestic Fleet Sl Concierge. Allow me to design a custom excursion across Catalonia's historic estates as we journey. \n\nAre you interested in organic wine tastings, sacred Montserrat hikes, or Catalan Michelin dining?"
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [useMapsGrounding, setUseMapsGrounding] = useState<boolean>(false);
  const [aiRecommendedStops, setAiRecommendedStops] = useState<{ name: string; description: string; lat: number; lng: number }[]>([]);
  const [aiSuiteTab, setAiSuiteTab] = useState<"chat" | "illustrator">("chat");

  // Synchronize initial greeting when language changes
  useEffect(() => {
    if (chatMessages.length === 1) {
      setChatMessages([
        {
          role: "model",
          content: t.aiGreetings,
        }
      ]);
    }
  }, [lang, t.aiGreetings]);

  // Instantly sync beautiful curated local landscapes based on destination
  useEffect(() => {
    const curatedImageUrls: Record<string, string> = {
      "el-prat": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
      "passeig-de-gracia": "https://images.unsplash.com/photo-1523531294919-4bea7c65e894?auto=format&fit=crop&w=800&q=80",
      "sagrada-familia": "https://images.unsplash.com/photo-1544918817-53784433b93c?auto=format&fit=crop&w=800&q=80",
      "gothic-quarter": "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=800&q=80",
      "montserrat": "https://images.unsplash.com/photo-1551466989-d4cbf11379c3?auto=format&fit=crop&w=800&q=80",
      "sitges": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
      "camp-nou": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80",
      "girona": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      "penedes": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
      "costa-brava": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    };
    
    // Fuzzy match on keyword addresses
    const addr = (destination || "").toLowerCase();
    let matchedKey = "passeig-de-gracia";
    if (addr.includes("airport") || addr.includes("prat")) matchedKey = "el-prat";
    else if (addr.includes("sagrada")) matchedKey = "sagrada-familia";
    else if (addr.includes("gothic")) matchedKey = "gothic-quarter";
    else if (addr.includes("montserrat")) matchedKey = "montserrat";
    else if (addr.includes("sitges")) matchedKey = "sitges";
    else if (addr.includes("camp nou")) matchedKey = "camp-nou";
    else if (addr.includes("girona")) matchedKey = "girona";
    else if (addr.includes("pened")) matchedKey = "penedes";
    else if (addr.includes("brava") || addr.includes("begur")) matchedKey = "costa-brava";

    setInspirationImage(curatedImageUrls[matchedKey] || curatedImageUrls["passeig-de-gracia"]);
    setInspirationIsGenerated(false);
    setInspirationPrompt("");
    setGenerationError(null);
  }, [pickup, destination]);

  // Manually trigger the high-end Gemini art concept generation
  const handleGenerateInspiration = async () => {
    setIsGeneratingInspiration(true);
    setGenerationError(null);

    try {
      const extraStopsNames = extraStops.map((st) => st.address);

      const res = await fetch("/api/gemini/generate-inspiration-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupName: pickup,
          destinationName: destination,
          extraStopsNames,
          pickupId: "custom",
          destinationId: "custom",
        }),
      });

      if (!res.ok) throw new Error("Server response anomaly");

      const data = await res.json();
      setInspirationImage(data.imageUrl);
      setInspirationPrompt(data.prompt || "");
      setInspirationIsGenerated(!!data.isGenerated);

      if (!data.isGenerated) {
        setGenerationError("Atelier free daily limit or token quota reached. Beautiful gallery catalog active.");
      }
    } catch (err) {
      console.warn("Gemini route artist generation failed safely:", err);
      setGenerationError("Standard Google AI rate limit reached. Gallery fallback applied.");
    } finally {
      setIsGeneratingInspiration(false);
    }
  };

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    
    // Add user message to state
    const updatedMessages = [...chatMessages, { role: "user" as const, content: userMessage }];
    setChatMessages(updatedMessages);
    setIsSendingChat(true);

    try {
      const extraStopsNames = extraStops.map((st) => st.address);
      const res = await fetch("/api/gemini/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          currentRoute: {
            pickup,
            destination,
            extraStops: extraStopsNames,
          },
          lang,
          useMapsGrounding,
        }),
      });

      if (!res.ok) throw new Error("Atelier server dispatch error");

      const data = await res.json();
      
      // Add model response with groundingMetadata
      setChatMessages((prev) => [
        ...prev, 
        { 
          role: "model" as const, 
          content: data.reply || t.aiErrorMsg,
          groundingMetadata: data.groundingMetadata
        }
      ]);
      
      // Set recommended stops
      if (data.recommendedStops && Array.isArray(data.recommendedStops)) {
        setAiRecommendedStops(data.recommendedStops);
      } else {
        setAiRecommendedStops([]);
      }
    } catch (err) {
      console.warn("AI Concierge query failed:", err);
      setChatMessages((prev) => [...prev, { role: "model" as const, content: t.aiErrorMsg }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleResetChat = () => {
    setChatMessages([
      {
        role: "model",
        content: t.aiGreetings,
      }
    ]);
    setAiRecommendedStops([]);
    setChatInput("");
  };

  // Handle scroll offsets for dynamic navigation shrink
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch reservations from localStorage on mount and sync server-side webhooks
  const syncServerBookings = async (currentLocalBookings?: Booking[]) => {
    try {
      const response = await fetch("/api/reserve");
      if (response.ok) {
        const serverBookings = await response.json();
        if (Array.isArray(serverBookings) && serverBookings.length > 0) {
          const targetLocal = currentLocalBookings !== undefined ? currentLocalBookings : bookingsRef.current;
          
          const sanitizedServer = serverBookings.map((b: any) => ({
            id: b.id,
            pickup: b.pickup,
            pickupCoords: b.pickupCoords,
            destination: b.destination,
            destinationCoords: b.destinationCoords,
            date: b.date,
            time: b.time,
            vehicleId: b.vehicleId || "mercedes-e300e",
            distanceKm: typeof b.distanceKm === "number" ? b.distanceKm : 18.0,
            durationMins: typeof b.durationMins === "number" ? b.durationMins : 25,
            price: typeof b.price === "number" ? b.price : 120,
            remarks: b.remarks || "",
            extraStops: b.extraStops || [],
            preferences: b.preferences || {
              silentCabin: true,
              beverages: true,
              infantSeat: false,
              financialTimes: false,
              privacyTint: true,
              targetTemp: 21.0,
              sriGroup: "none",
              sriQuantity: 0,
              sriG0Quantity: 0,
              sriG1Quantity: 0,
              sriG23Quantity: 0,
              wheelchairType: "none",
              wheelchairQuantity: 0
            },
            contactName: b.contactName,
            contactEmail: b.contactEmail,
            contactPhone: b.contactPhone || "",
            status: b.status || "confirmed",
            flightNumber: b.flightNumber || "",
            flightStatus: b.flightStatus || "",
            assignedDriverId: b.assignedDriverId || undefined,
            wantsInvoice: !!b.wantsInvoice,
            serviceCode: b.serviceCode,
            invoiceDocumentNumber: b.invoiceDocumentNumber,
            invoiceDocumentType: b.invoiceDocumentType || "passport",
            invoiceFullName: b.invoiceFullName,
            createdAt: b.createdAt || new Date().toISOString()
          }));

          // Prime tracking ref for existing bookings on first boot
          if (currentLocalBookings !== undefined) {
            currentLocalBookings.forEach(b => {
              notifiedEventsRef.current.add(`new-${b.id}`);
              notifiedEventsRef.current.add(`status-${b.id}-${b.status}`);
              if (b.flightStatus) {
                notifiedEventsRef.current.add(`flight-${b.id}-${b.flightStatus}`);
              }
              if (b.assignedDriverId) {
                notifiedEventsRef.current.add(`driver-${b.id}-${b.assignedDriverId}`);
              }
            });
          }

          const localMap = new Map<string, Booking>(targetLocal.map(b => [b.id, b]));
          let countSynced = 0;
          
          sanitizedServer.forEach((sb) => {
            const existing = localMap.get(sb.id);
            if (!existing) {
              localMap.set(sb.id, sb);
              countSynced++;
              
              // Exactly one-time notification dispatcher alert
              const eventKey = `new-${sb.id}`;
              if (!notifiedEventsRef.current.has(eventKey)) {
                notifiedEventsRef.current.add(eventKey);
                // Also cache the state signature to prevent downstream duplicate notifications
                notifiedEventsRef.current.add(`status-${sb.id}-${sb.status}`);
                if (sb.flightStatus) {
                  notifiedEventsRef.current.add(`flight-${sb.id}-${sb.flightStatus}`);
                }
                if (sb.assignedDriverId) {
                  notifiedEventsRef.current.add(`driver-${sb.id}-${sb.assignedDriverId}`);
                }

                const bIdShort = sb.id ? (sb.id.length > 6 ? sb.id.substring(sb.id.length - 6).toUpperCase() : sb.id.toUpperCase()) : "";
                addToast(
                  lang === "ca" ? "Nova reserva sincronitzada" : "New Booking Sync",
                  `${sb.contactName || "Client"} (${bIdShort}) - ${sb.pickup} ➔ ${sb.destination}`,
                  "success"
                );
              }
            } else {
              // Check if any syncable dispatcher fields updated
              let changed = false;
              if (existing.status !== sb.status) {
                changed = true;
                const eventKey = `status-${sb.id}-${sb.status}`;
                if (!notifiedEventsRef.current.has(eventKey)) {
                  notifiedEventsRef.current.add(eventKey);
                  const bIdShort = sb.id ? (sb.id.length > 6 ? sb.id.substring(sb.id.length - 6).toUpperCase() : sb.id.toUpperCase()) : "";
                  const displayStatus = sb.status.charAt(0).toUpperCase() + sb.status.slice(1);
                  addToast(
                    lang === "ca" ? "Estat de reserva actualitzat" : "Booking Status Updated",
                    `Booking #${bIdShort} status is now: ${displayStatus}`,
                    "info"
                  );
                }
              }
              if (existing.flightStatus !== sb.flightStatus) {
                changed = true;
                const eventKey = `flight-${sb.id}-${sb.flightStatus}`;
                if (!notifiedEventsRef.current.has(eventKey)) {
                  notifiedEventsRef.current.add(eventKey);
                  const bIdShort = sb.id ? (sb.id.length > 6 ? sb.id.substring(sb.id.length - 6).toUpperCase() : sb.id.toUpperCase()) : "";
                  
                  let toastTitle = lang === "ca" ? "Estat del vol actualitzat" : "Flight Status Synchronized";
                  let toastDesc = `Booking #${bIdShort} flight status: ${sb.flightStatus || "On Time"}`;
                  let toastType: "info" | "success" | "warning" = "info";

                  if (sb.flightStatus === "Job Started") {
                    toastTitle = lang === "ca" ? "Xòfer en Camí" : "Chauffeur Service Started";
                    toastDesc = lang === "ca" 
                      ? `El xòfer ha iniciat el servei i està en camí cap al lloc d'origen (Reserva #${bIdShort}).`
                      : `Your chauffeur has started the transfer and is en route to your pickup location (Booking #${bIdShort}).`;
                    toastType = "info";
                  } else if (sb.flightStatus === "Arrived" || sb.flightStatus === "At Origin" || sb.flightStatus === "At Gate") {
                    toastTitle = lang === "ca" ? "Xòfer a la Porta / Origen" : "Chauffeur standing by at origin";
                    toastDesc = lang === "ca"
                      ? `El vostre xòfer ha arribat i us espera a la porta d'origen indicada (Reserva #${bIdShort}).`
                      : `Success: Your chauffeur has arrived at the gate and is standing by at the location (Booking #${bIdShort}).`;
                    toastType = "success";
                  } else if (sb.flightStatus === "Boarded" || sb.flightStatus === "Client Boarded") {
                     toastTitle = lang === "ca" ? "Viatge amb Passatger a Bord" : "Passengers Boarded";
                     toastDesc = lang === "ca"
                       ? `El passatger ja està a bord. El transfer està en curs cap a la destinació (Reserva #${bIdShort}).`
                       : `Welcome on board! The transfer is now actively underway (Booking #${bIdShort}).`;
                     toastType = "info";
                  } else if (sb.flightStatus === "Complete" || sb.flightStatus === "Completed") {
                    toastTitle = lang === "ca" ? "Viatge Finalitzat correctament" : "Chauffeur Journey Completed";
                    toastDesc = lang === "ca"
                      ? `El viatge ha finalitzat amb èxit. Gràcies per viatjar amb Majestic Fleet Sl! (Reserva #${bIdShort}).`
                      : `The transfer journey has been successfully completed. Thank you for choosing Majestic Fleet Sl Class (Booking #${bIdShort}).`;
                    toastType = "success";
                  }

                  addToast(toastTitle, toastDesc, toastType);
                }
              }
              if (existing.assignedDriverId !== sb.assignedDriverId) {
                changed = true;
                const eventKey = `driver-${sb.id}-${sb.assignedDriverId || "unassigned"}`;
                if (!notifiedEventsRef.current.has(eventKey)) {
                  notifiedEventsRef.current.add(eventKey);
                  const bIdShort = sb.id ? (sb.id.length > 6 ? sb.id.substring(sb.id.length - 6).toUpperCase() : sb.id.toUpperCase()) : "";
                  addToast(
                    lang === "ca" ? "Xòfer assignat actualitzat" : "Chauffeur Assignment Synced",
                    sb.assignedDriverId 
                      ? `Chauffeur has been assigned to booking #${bIdShort}`
                      : `Chauffeur has been unassigned from booking #${bIdShort}`,
                    "info"
                  );
                }
              }
              if (existing.serviceCode !== sb.serviceCode) {
                changed = true;
              }

              if (changed) {
                localMap.set(sb.id, {
                  ...existing,
                  assignedDriverId: sb.assignedDriverId,
                  flightStatus: sb.flightStatus,
                  status: sb.status,
                  serviceCode: sb.serviceCode
                });
                countSynced++;
              }
            }
          });

          if (countSynced > 0) {
            const merged = Array.from(localMap.values()).sort((a, b) => {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setBookings(merged);
            safeLocalStorage.setItem("velvet_reservations", JSON.stringify(merged));
            console.log(`[MAJESTIC] Synced ${countSynced} reservations from secure WordPress dispatch endpoint.`);
          }
        }
      }
    } catch (err) {
      console.warn("Unable to sync external bookings from server:", err);
    }
  };

  useEffect(() => {
    let initialLocal: Booking[] = [];
    const stored = safeLocalStorage.getItem("velvet_reservations");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          initialLocal = parsed.map((b: any) => ({
            id: b.id || `b-${Date.now()}-${Math.random()}`,
            pickup: b.pickup || "el-prat",
            destination: b.destination || "passeig-de-gracia",
            date: b.date || "",
            time: b.time || "",
            vehicleId: b.vehicleId || "mercedes-e300e",
            distanceKm: typeof b.distanceKm === "number" ? b.distanceKm : 0,
            durationMins: typeof b.durationMins === "number" ? b.durationMins : 0,
            price: typeof b.price === "number" ? b.price : 0,
            remarks: b.remarks || "",
            extraStops: Array.isArray(b.extraStops) ? b.extraStops : [],
            preferences: {
              silentCabin: typeof b.preferences?.silentCabin === "boolean" ? b.preferences.silentCabin : false,
              beverages: typeof b.preferences?.beverages === "boolean" ? b.preferences.beverages : false,
              infantSeat: typeof b.preferences?.infantSeat === "boolean" ? b.preferences.infantSeat : false,
              financialTimes: typeof b.preferences?.financialTimes === "boolean" ? b.preferences.financialTimes : false,
              privacyTint: typeof b.preferences?.privacyTint === "boolean" ? b.preferences.privacyTint : false,
              targetTemp: typeof b.preferences?.targetTemp === "number" ? b.preferences.targetTemp : 21.0,
              sriGroup: b.preferences?.sriGroup || "none",
              sriQuantity: typeof b.preferences?.sriQuantity === "number" ? b.preferences.sriQuantity : 0,
              sriG0Quantity: typeof b.preferences?.sriG0Quantity === "number" ? b.preferences.sriG0Quantity : 0,
              sriG1Quantity: typeof b.preferences?.sriG1Quantity === "number" ? b.preferences.sriG1Quantity : 0,
              sriG23Quantity: typeof b.preferences?.sriG23Quantity === "number" ? b.preferences.sriG23Quantity : 0,
              wheelchairType: b.preferences?.wheelchairType || "none",
              wheelchairQuantity: typeof b.preferences?.wheelchairQuantity === "number" ? b.preferences.wheelchairQuantity : 0,
            },
            contactName: b.contactName || "",
            contactEmail: b.contactEmail || "",
            contactPhone: b.contactPhone || "",
            status: ["pending", "confirmed", "cancelled"].includes(b.status) ? b.status : "confirmed",
            flightNumber: b.flightNumber || "",
            flightStatus: b.flightStatus || "",
            wantsInvoice: !!b.wantsInvoice,
            serviceCode: b.serviceCode,
            invoiceDocumentNumber: b.invoiceDocumentNumber,
            invoiceDocumentType: b.invoiceDocumentType || "passport",
            invoiceFullName: b.invoiceFullName,
            passengersCount: typeof b.passengersCount === "number" ? b.passengersCount : 2,
            luggageCount: typeof b.luggageCount === "number" ? b.luggageCount : 2,
            cabinLuggageCount: typeof b.cabinLuggageCount === "number" ? b.cabinLuggageCount : 0,
            createdAt: b.createdAt || new Date().toISOString()
          }));
          setBookings(initialLocal);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Failed to parse stored itineraries", err);
        setBookings([]);
      }
    }

    // Direct background synchronization triggers
    syncServerBookings(initialLocal);

    // Dynamic 10 second polling
    const pollInterval = setInterval(() => {
      syncServerBookings();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Set default reservation date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
    setTime("14:30");
  }, []);

  // Auto-suggest or enable Airport Meet & Greet if pickup is an airport
  useEffect(() => {
    if (!pickup) return;
    const isAirport = pickup.toLowerCase().includes("airport") || 
                     pickup.toLowerCase().includes("aeroport") || 
                     pickup.toLowerCase().includes("prat") ||
                     pickup.toLowerCase().includes("bcn");
    if (isAirport) {
      setPreferences((prev) => ({ ...prev, airportMeetGreet: true }));
    } else {
      setPreferences((prev) => ({ ...prev, airportMeetGreet: false }));
    }
  }, [pickup]);

  // Core Pricing Estimations including dynamic coordinates
  const computedMetrics = useMemo(() => {
    const isHourly = bookingType === "hourly";
    const distanceKm = isHourly
      ? (destinationCoords ? calculateDistance(pickupCoords, destinationCoords, extraStops) : 0)
      : calculateDistance(pickupCoords, destinationCoords, extraStops);
    const durationMins = isHourly
      ? (hourlyDuration * 60)
      : Math.max(12, Math.round(distanceKm * 1.4) + (extraStops.length * 20));
    
    const v = localizedVehicles.find((vehicle) => vehicle.id === vehicleId) || localizedVehicles[0];
    const baseCharge = isHourly
      ? (hourlyDuration * (v.hourlyRate || 85))
      : (distanceKm * v.pricePerKm);
    
    const stopsCharge = isHourly ? 0 : (extraStops.length * 35);
    
    // Multi-selection: €6 cost per selected group / seat
    const totalSriSeats = (preferences.sriG0Quantity || 0) + (preferences.sriG1Quantity || 0) + (preferences.sriG23Quantity || 0);
    const sriCharge = totalSriSeats * 6;

    // Premium passenger cabin add-ons charges (silent onboarding and temp preset removed per user request)
    const airportMeetGreetCharge = preferences.airportMeetGreet ? 20.00 : 0;
    const premiumAddonsCharge = airportMeetGreetCharge;

    const calculatedPrice = baseCharge + stopsCharge + sriCharge + premiumAddonsCharge;
    const minPrice = isHourly ? (hourlyDuration * (v.hourlyRate || 85)) : v.minPrice;
    const finalPrice = Math.max(minPrice + sriCharge + premiumAddonsCharge, calculatedPrice);

    return {
      distanceKm,
      durationMins,
      price: parseFloat(finalPrice.toFixed(2)),
      sriCharge,
      premiumAddonsCharge,
      silentOnboardingCharge: 0,
      airportMeetGreetCharge,
      tempPresetCharge: 0
    };
  }, [
    bookingType,
    hourlyDuration,
    pickupCoords, 
    destinationCoords, 
    vehicleId, 
    extraStops, 
    preferences.sriG0Quantity, 
    preferences.sriG1Quantity, 
    preferences.sriG23Quantity,
    preferences.silentOnboarding,
    preferences.airportMeetGreet,
    preferences.tempPreset,
    localizedVehicles
  ]);

  // Derived provisional booking for live route planning traffic projections
  const provisionalBooking = useMemo(() => {
    return {
      id: "provisional",
      pickup: pickup,
      destination: destination,
      date,
      time,
      vehicleId,
      distanceKm: computedMetrics.distanceKm,
      durationMins: computedMetrics.durationMins,
      price: computedMetrics.price,
      remarks: specialRemarks,
      extraStops: extraStops.map((st) => st.address),
      preferences,
      contactName,
      contactEmail,
      contactPhone: `${phoneCountryCode} ${contactPhone}`.trim(),
      status: "confirmed" as const,
      createdAt: new Date().toISOString()
    };
  }, [pickup, destination, date, time, vehicleId, computedMetrics, extraStops, preferences, contactName, contactEmail, phoneCountryCode, contactPhone, specialRemarks]);

  // Action: Insert waypoint stop from AI recommendation or interactive map clicking
  const handleAddStop = (stopName: string, coords?: { lat: number; lng: number }) => {
    const match = SIGHTS.find((s) => s.name.toLowerCase() === stopName.toLowerCase() || s.id.toLowerCase() === stopName.toLowerCase());
    
    const finalAddress = match ? match.name : stopName;
    const finalCoords = coords || (match ? { lat: match.lat, lng: match.lng } : { lat: 41.3879, lng: 2.1699 });

    const isDuplicate = extraStops.some((s) => s.address.toLowerCase() === finalAddress.toLowerCase());
    const isPickupOrDest = finalAddress.toLowerCase() === pickup.toLowerCase() || finalAddress.toLowerCase() === destination.toLowerCase();

    if (!isDuplicate && !isPickupOrDest) {
      setExtraStops((p) => [...p, { address: finalAddress, coords: finalCoords }]);
    }
  };

  const handleRemoveStop = (idx: number) => {
    setExtraStops((p) => p.filter((_, i) => i !== idx));
  };

  const handleMoveStop = (idx: number, direction: "up" | "down") => {
    const newStops = [...extraStops];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx >= 0 && targetIdx < newStops.length) {
      const temp = newStops[idx];
      newStops[idx] = newStops[targetIdx];
      newStops[targetIdx] = temp;
      setExtraStops(newStops);
    }
  };

  const handleSwapOriginDestination = () => {
    const tempPickup = pickup;
    const tempPickupCoords = pickupCoords;
    setPickup(destination);
    setPickupCoords(destinationCoords);
    setDestination(tempPickup);
    setDestinationCoords(tempPickupCoords);
  };

  // Map click handler to easily project pickup/destination/stops
  const handleMapNodeClick = (id: string, role?: "role" | "pickup" | "destination" | "stop") => {
    const s = SIGHTS.find(v => v.id === id);
    const labelName = s ? s.name : id;
    const coords = s ? { lat: s.lat, lng: s.lng } : { lat: 41.3879, lng: 2.1699 };

    if (role === "pickup") {
      setPickup(labelName);
      setPickupCoords(coords);
    } else if (role === "destination") {
      setDestination(labelName);
      setDestinationCoords(coords);
    } else {
      handleAddStop(labelName, coords);
    }
  };

  // Edit preferences helper
  const handleUpdatePreferences = (updated: Partial<SpecialPreference>) => {
    setPreferences((prev) => ({ ...prev, ...updated }));
  };

  // New Reservation Submission
  const handlePlaceReservation = (e: React.FormEvent) => {
    e.preventDefault();

    const focusAndScrollTo = (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          el.focus();
        }, 400);
      }
    };

    if (!pickup || !pickup.trim()) {
      setReservationPrompt(lang === "ca" 
        ? "Si us plau, especifiqueu l'adreça de recollida del passatger." 
        : "Please enter a passenger pick-up address.");
      focusAndScrollTo("pickup-address-input");
      return;
    }

    if (bookingType !== "hourly" && (!destination || !destination.trim())) {
      setReservationPrompt(lang === "ca" 
        ? "Si us plau, especifiqueu l'adreça de destinació." 
        : "Please enter a passenger destination address.");
      focusAndScrollTo("destination-address-input");
      return;
    }

    if (!contactName || !contactName.trim()) {
      setReservationPrompt(lang === "ca" 
        ? "Si us plau, introduïu el nom complet del passatger." 
        : "Please enter the passenger's full name.");
      focusAndScrollTo("passenger-full-name-input");
      return;
    }

    if (!contactEmail || !contactEmail.trim()) {
      setReservationPrompt(lang === "ca" 
        ? "Si us plau, introduïu l'adreça de correu electrònic." 
        : "Please enter the passenger's email address.");
      focusAndScrollTo("passenger-email-input");
      return;
    }

    if (!contactPhone || !contactPhone.trim()) {
      setReservationPrompt(lang === "ca" 
        ? "Si us plau, introduïu el número de telèfon de contacte." 
        : "Please enter the passenger's contact phone number.");
      focusAndScrollTo("passenger-phone-input");
      return;
    }

    if (wantsInvoice) {
      if (!invoiceDocumentNumber.trim()) {
        setReservationPrompt(lang === "ca" 
          ? "Si us plau, indica el número de passaport o document oficial per a la factura." 
          : "Please enter your passport or official document number for the invoice.");
        focusAndScrollTo("invoice-document-number-input");
        return;
      }
      if (!invoiceFullName.trim()) {
        setReservationPrompt(lang === "ca" 
          ? "Si us plau, indica el nom complet o de l'empresa de facturació." 
          : "Please enter the full billing name or company name for the invoice.");
        focusAndScrollTo("invoice-full-name-input");
        return;
      }
    }

    const newBooking: Booking = {
      id: `VLV-${Math.floor(100000 + Math.random() * 900000)}`,
      bookingType,
      language: lang,
      hourlyDuration: bookingType === "hourly" ? hourlyDuration : undefined,
      pickup: pickup,
      pickupCoords: pickupCoords || undefined,
      destination: bookingType === "hourly" ? (destination || "As Directed / Chauffeur Disposal") : destination,
      destinationCoords: destinationCoords || undefined,
      date,
      time,
      vehicleId,
      distanceKm: computedMetrics.distanceKm,
      durationMins: computedMetrics.durationMins,
      price: computedMetrics.price,
      remarks: specialRemarks,
      extraStops: bookingType === "hourly" ? [] : extraStops.map((st) => st.address),
      preferences,
      contactName,
      contactEmail,
      contactPhone: `${phoneCountryCode} ${contactPhone}`.trim(),
      status: "confirmed",
      flightNumber,
      flightStatus: flightNumber ? "On Time" : undefined,
      wantsInvoice,
      invoiceDocumentNumber: wantsInvoice ? invoiceDocumentNumber.trim() : undefined,
      invoiceDocumentType: wantsInvoice ? invoiceDocumentType : undefined,
      invoiceFullName: wantsInvoice ? invoiceFullName.trim() : undefined,
      passengersCount,
      luggageCount,
      cabinLuggageCount,
      createdAt: new Date().toISOString()
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    safeLocalStorage.setItem("velvet_reservations", JSON.stringify(updatedBookings));

    // Sync newly created booking to the backend so Dispatchers and Drivers immediately see it!
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBooking)
    }).catch((err) => console.warn("Failed to sync new booking to server:", err));

    // Store recently confirmed booking to show in the final step
    setConfirmedBooking(newBooking);
    setWizardStep(5);
    setReservationPrompt(lang === "ca"
      ? `Èxit! La reserva ${newBooking.id} s'ha registrat correctament.`
      : `Success! Reservation ${newBooking.id} has been registered securely.`);

    // Clear confirmation banner after 6 seconds
    setTimeout(() => {
      setReservationPrompt(null);
    }, 6000);
  };

  const handleResetWizard = () => {
    setBookingType("distance");
    setHourlyDuration(2);
    setWizardStep(1);
    setPickup("");
    setPickupCoords(null);
    setDestination("");
    setDestinationCoords(null);
    setExtraStops([]);
    setSpecialRemarks("");
    setFlightNumber("");
    setWantsInvoice(false);
    setInvoiceDocumentNumber("");
    setInvoiceDocumentType("passport");
    setInvoiceFullName("");
    setPassengersCount(2);
    setLuggageCount(2);
    setCabinLuggageCount(0);
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setPreferences({
      silentCabin: false,
      beverages: false,
      infantSeat: false,
      financialTimes: false,
      privacyTint: false,
      targetTemp: 21.0,
      sriGroup: "none",
      sriQuantity: 0,
      sriG0Quantity: 0,
      sriG1Quantity: 0,
      sriG23Quantity: 0,
      wheelchairType: "none",
      wheelchairQuantity: 0,
      silentOnboarding: false,
      tempPreset: "ambient",
      airportMeetGreet: false,
    });
    setConfirmedBooking(null);
  };

  const getItineraryBooking = (): Booking => {
    if (confirmedBooking) return confirmedBooking;
    return {
      id: "DRAFT-MANIFEST",
      bookingType,
      hourlyDuration: bookingType === "hourly" ? hourlyDuration : undefined,
      pickup: pickup || "Not specified",
      destination: bookingType === "hourly" ? (lang === "ca" ? "Lloguer de Xòfer" : "Chauffeur Hire Service") : (destination || "Not specified"),
      extraStops: extraStops.map((s) => s.address),
      date: date || "YYYY-MM-DD",
      time: time || "HH:MM",
      passengersCount,
      luggageCount,
      cabinLuggageCount,
      vehicleId,
      status: "confirmed",
      distanceKm: computedMetrics.distanceKm,
      durationMins: computedMetrics.durationMins,
      price: computedMetrics.price,
      remarks: specialRemarks || "No supplementary parameters designated.",
      preferences: {
        ...preferences,
        targetTemp: preferences?.targetTemp !== undefined ? preferences.targetTemp : 21,
      },
      contactName: contactName || "Majestic Guest",
      contactEmail: contactEmail || "guest@majestic.com",
      contactPhone: contactPhone || "+34 600 000 000",
      createdAt: new Date().toISOString()
    };
  };

  // Cancel reservation
  const handleCancelBooking = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      const bDate = new Date(`${booking.date}T${booking.time}`);
      if (!isNaN(bDate.getTime())) {
        const now = new Date();
        const diffMs = bDate.getTime() - now.getTime();
        const oneHourMs = 60 * 60 * 1000;
        if (diffMs < oneHourMs) {
          alert(lang === "ca" 
            ? "No es pot cancel·lar una reserva amb menys d'una hora d'antelació." 
            : "You cannot cancel a booking less than 1 hour before departure.");
          return;
        }
      }
    }

    const updated = bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b));
    setBookings(updated);
    safeLocalStorage.setItem("velvet_reservations", JSON.stringify(updated));

    const target = updated.find((b) => b.id === id);
    if (target) {
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target)
      }).catch((err) => console.warn("Failed to sync cancel to server:", err));
    }
  };

  // Reschedule reservation
  const handleRescheduleBooking = (id: string, newDate: string, newTime: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      const bDate = new Date(`${booking.date}T${booking.time}`);
      if (!isNaN(bDate.getTime())) {
        const now = new Date();
        const diffMs = bDate.getTime() - now.getTime();
        const oneHourMs = 60 * 60 * 1000;
        if (diffMs < oneHourMs) {
          alert(lang === "ca" 
            ? "No es pot reprogramar una reserva amb menys d'una hora d'antelació." 
            : "You cannot reschedule a booking less than 1 hour before departure.");
          return;
        }
      }
    }

    const updated = bookings.map((b) =>
      b.id === id ? { ...b, date: newDate, time: newTime } : b
    );
    setBookings(updated);
    safeLocalStorage.setItem("velvet_reservations", JSON.stringify(updated));

    const target = updated.find((b) => b.id === id);
    if (target) {
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target)
      }).catch((err) => console.warn("Failed to sync reschedule to server:", err));
    }
  };

  const handleUpdateBookingFeedback = (id: string, feedback: any) => {
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, feedback } : b
    );
    setBookings(updated);
    safeLocalStorage.setItem("velvet_reservations", JSON.stringify(updated));
    const target = updated.find((b) => b.id === id);
    if (target) {
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target)
      }).catch((err) => console.warn("Failed to sync feedback to server:", err));
    }
  };

  const handleUpdateInvoiceDetails = (id: string, invoiceDetails: { wantsInvoice: boolean; invoiceDocumentNumber: string; invoiceDocumentType: string; invoiceFullName: string }) => {
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, ...invoiceDetails } : b
    );
    setBookings(updated);
    safeLocalStorage.setItem("velvet_reservations", JSON.stringify(updated));
    const target = updated.find((b) => b.id === id);
    if (target) {
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target)
      }).catch((err) => console.warn("Failed to sync invoice update to server:", err));
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1b1c1c] font-sans antialiased overflow-x-hidden selection:bg-amber-100 selection:text-neutral-900">
      
      {/* Dynamic top safety navigation bar */}
      <nav
        className={`fixed top-0 w-full z-[2000] transition-all duration-300 ${
          scrolled
            ? "bg-neutral-950/95 backdrop-blur-md h-12 md:h-14 shadow-lg border-b border-neutral-800 text-white"
            : "bg-neutral-950 h-14 md:h-18 border-b border-neutral-900 text-white"
        }`}
      >
        <div className="flex justify-between items-center w-full px-4 md:px-12 max-w-7xl mx-auto h-full">
          <div className="flex flex-col">
            <a href="#" className="font-display-lg text-base md:text-lg uppercase tracking-[0.3em] text-white font-bold">
              MAJESTIC <span className="text-amber-500 italic font-light tracking-widest lowercase">Fleet Sl</span>
            </a>
            <p className="font-mono text-[8px] tracking-widest text-amber-500 font-semibold -mt-1 uppercase">{t.brandSlogan}</p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Elegant Language Toggle Slider */}
            <div className="flex items-center bg-neutral-900 rounded-sm p-0.5 border border-neutral-800 shadow-inner mr-1">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-neutral-800 text-amber-400 font-extrabold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("es")}
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
                  lang === "es"
                    ? "bg-neutral-800 text-amber-400 font-extrabold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang("ca")}
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
                  lang === "ca"
                    ? "bg-neutral-800 text-amber-400 font-extrabold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                CA
              </button>
            </div>

            {/* Elegant 3-line Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 hover:border-amber-500/50 text-neutral-300 hover:text-amber-400 transition-all cursor-pointer text-[10px] font-mono font-extrabold uppercase tracking-wider shadow-sm"
                aria-label="Toggle Navigation Menu"
              >
                <Menu className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">{lang === "ca" ? "MENÚ" : "MENU"}</span>
              </button>

              {/* Animated Dropdown Menu */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <>
                    {/* Invisible overlay to close on click outside */}
                    <div 
                      className="fixed inset-0 z-[1999] bg-transparent" 
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-neutral-950 border border-neutral-800 rounded shadow-2xl z-[2001] overflow-hidden text-left"
                    >
                      <div className="p-1.5 space-y-1">
                        {/* Option: Home */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("book");
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-[11px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                            activeTab === "book"
                              ? "bg-amber-500 text-neutral-950 font-extrabold shadow"
                              : "text-neutral-300 hover:bg-neutral-900 hover:text-amber-400"
                          }`}
                        >
                          <span>{lang === "ca" ? "INICI" : "HOME"}</span>
                          <span className="text-[9px] font-mono opacity-60">
                            {activeTab === "book" ? "•" : ""}
                          </span>
                        </button>

                        {/* Option: My Bookings */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("dashboard");
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-[11px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                            activeTab === "dashboard"
                              ? "bg-amber-500 text-neutral-950 font-extrabold shadow"
                              : "text-neutral-300 hover:bg-neutral-900 hover:text-amber-400"
                          }`}
                        >
                          <span>{lang === "ca" ? "LES MEVES RESERVES" : "MY BOOKINGS"}</span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            activeTab === "dashboard"
                              ? "bg-amber-600 text-white border-amber-700"
                              : "bg-neutral-900 text-amber-500 border-neutral-800"
                          }`}>
                            {bookings.length}
                          </span>
                        </button>
                      </div>

                      {/* Info footer inside the menu */}
                      <div className="border-t border-neutral-900 bg-neutral-950/60 p-2.5 text-center">
                        <p className="text-[8px] font-mono text-neutral-500 tracking-wider uppercase">
                          Majestic Fleet SL • Barcelona
                        </p>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </nav>

      <main className="pt-14 md:pt-16 pb-4 md:pb-6">
        
        {/* Reservation workspace Tab */}
        {activeTab === "book" && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-3 md:space-y-4">
            
            {/* Split Top section: Beautiful Hero title + Quick booking selector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-4 items-center pt-0.5 md:pt-1">
              <div className="lg:col-span-7 space-y-1.5 md:space-y-2">
                <span className="font-mono text-[9px] md:text-[9.5px] uppercase tracking-[0.2em] text-amber-600 font-extrabold bg-amber-50 border border-amber-500/20 px-2 py-0.5 rounded inline-block">
                  {t.established}
                </span>
                <h1 className="font-display-lg text-lg sm:text-xl md:text-2xl lg:text-3xl text-neutral-900 leading-tight font-medium tracking-tight">
                  {t.arriveQuietTitle} <br />
                  <span className="italic font-light tracking-wide text-amber-700">{t.quietDistinction}</span>
                </h1>
                <p className="text-secondary tracking-normal text-xs text-neutral-500 leading-relaxed max-w-xl">
                  {t.heroSubtitle}
                </p>

                <div className="flex gap-4 items-center pt-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" /> {t.classAChauffeurs}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-neutral-300" />
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                    <Compass className="w-3.5 h-3.5 text-amber-600" /> {lang === "ca" ? "Arquitecte d'itineraris en temps real" : "Real-time Itinerary Architect"}
                  </div>
                </div>
              </div>

              {/* Confirm bookings popup banner if any */}
              {reservationPrompt && (
                <div className="lg:col-span-12 z-40">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded border flex items-center justify-between shadow ${
                      reservationPrompt.includes("Success")
                        ? "bg-emerald-50 border-emerald-255 text-emerald-800"
                        : "bg-red-50 border-red-255 text-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-xs font-semibold">{reservationPrompt}</p>
                    </div>
                    <button onClick={() => setReservationPrompt(null)} className="text-neutral-500 hover:text-neutral-800">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>
              )}

              {/* Wizard Steps Header & Dynamic Views */}
              <div ref={wizardRef} className="lg:col-span-12 pt-2 space-y-4">
                {/* Wizard Steps Navigation Header */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 shadow-md flex flex-col md:flex-row justify-between items-center gap-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-400">
                      <Sliders className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-amber-500 font-extrabold">
                        {lang === "ca" ? "CONCIERGE DE SERVEI" : "SERVICE CONCIERGE"}
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {lang === "ca" ? "Planificador d'itinerari de luxe pas a pas" : "Multi-step bespoke itinerary configure engine"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {[
                      { step: 1, label: lang === "ca" ? "Bàsics" : "Basics" },
                      { step: 2, label: lang === "ca" ? "Ruta" : "Route" },
                      { step: 3, label: lang === "ca" ? "Confort" : "Comfort" },
                      { step: 4, label: lang === "ca" ? "Dades" : "Checkout" },
                      { step: 5, label: lang === "ca" ? "Manifest" : "Manifest" }
                    ].map((item) => (
                      <div key={item.step} className="flex items-center gap-1.5 flex-1 md:flex-none justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.step < wizardStep) setWizardStep(item.step);
                            else if (item.step === 2 && pickup) setWizardStep(2);
                            else if (item.step === 3 && pickup && (bookingType === "hourly" || destination)) setWizardStep(3);
                            else if (item.step === 4 && pickup && (bookingType === "hourly" || destination)) setWizardStep(4);
                            else if (item.step === 5 && pickup && (bookingType === "hourly" || destination) && contactName && contactEmail && contactPhone) setWizardStep(5);
                          }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                            wizardStep === item.step
                              ? "bg-amber-500 text-neutral-900 font-extrabold ring-4 ring-amber-500/20"
                              : wizardStep > item.step
                              ? "bg-emerald-600 text-white"
                              : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                          }`}
                        >
                          {wizardStep > item.step ? "✓" : item.step}
                        </button>
                        <span className={`text-[10px] font-mono tracking-wider font-bold hidden sm:inline ${
                          wizardStep === item.step ? "text-amber-400" : "text-neutral-500"
                        }`}>
                          {item.label}
                        </span>
                        {item.step < 5 && <span className="text-neutral-700 hidden md:inline">➔</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEP 1: BASICS */}
                {wizardStep === 1 && (
                  <StepBasics
                    lang={lang}
                    bookingType={bookingType}
                    setBookingType={setBookingType}
                    hourlyDuration={hourlyDuration}
                    setHourlyDuration={setHourlyDuration}
                    date={date}
                    setDate={setDate}
                    time={time}
                    setTime={setTime}
                    flightNumber={flightNumber}
                    setFlightNumber={setFlightNumber}
                    passengersCount={passengersCount}
                    setPassengersCount={setPassengersCount}
                    luggageCount={luggageCount}
                    setLuggageCount={setLuggageCount}
                    cabinLuggageCount={cabinLuggageCount}
                    setCabinLuggageCount={setCabinLuggageCount}
                    onNext={() => setWizardStep(2)}
                  />
                )}

                {/* STEP 2: ROUTE */}
                {wizardStep === 2 && (
                  <StepRoute
                    lang={lang}
                    bookingType={bookingType}
                    pickup={pickup}
                    setPickup={setPickup}
                    pickupCoords={pickupCoords}
                    setPickupCoords={setPickupCoords}
                    destination={destination}
                    setDestination={setDestination}
                    destinationCoords={destinationCoords}
                    setDestinationCoords={setDestinationCoords}
                    extraStops={extraStops}
                    onAddStop={handleAddStop}
                    onRemoveStop={handleRemoveStop}
                    onMoveStop={handleMoveStop}
                    onClearStops={() => setExtraStops([])}
                    onSwapRoute={handleSwapOriginDestination}
                    localizedSights={localizedSights}
                    selectedPresetSight={selectedPresetSight}
                    setSelectedPresetSight={setSelectedPresetSight}
                    selectedTerminal={selectedTerminal}
                    setSelectedTerminal={setSelectedTerminal}
                    trafficStatus={trafficStatus}
                    onBack={() => setWizardStep(1)}
                    onNext={() => setWizardStep(3)}
                    chatMessages={chatMessages}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    isSendingChat={isSendingChat}
                    onSendChatMessage={handleSendChatMessage}
                    aiRecommendedStops={aiRecommendedStops}
                    onResetChat={handleResetChat}
                    useMapsGrounding={useMapsGrounding}
                    setUseMapsGrounding={setUseMapsGrounding}
                  />
                )}

                {/* STEP 3: COMFORT & VEHICLE SELECTION */}
                {wizardStep === 3 && (
                  <StepComfort
                    lang={lang}
                    vehicles={localizedVehicles}
                    selectedVehicleId={vehicleId}
                    onSelectVehicle={setVehicleId}
                    bookingType={bookingType}
                    hourlyDuration={hourlyDuration}
                    distanceKm={computedMetrics.distanceKm}
                    extraStopsCount={extraStops.length}
                    passengersCount={passengersCount}
                    luggageCount={luggageCount}
                    preferences={preferences}
                    onUpdatePreferences={handleUpdatePreferences}
                    onBack={() => setWizardStep(2)}
                    onNext={() => setWizardStep(4)}
                  />
                )}

                {/* STEP 4: BESPOKE CHECKOUT */}
                {wizardStep === 4 && (
                  <StepComfortCheckout
                    lang={lang}
                    bookingType={bookingType}
                    hourlyDuration={hourlyDuration}
                    preferences={preferences}
                    onUpdatePreferences={handleUpdatePreferences}
                    contactName={contactName}
                    setContactName={setContactName}
                    contactEmail={contactEmail}
                    setContactEmail={setContactEmail}
                    phoneCountryCode={phoneCountryCode}
                    setPhoneCountryCode={setPhoneCountryCode}
                    contactPhone={contactPhone}
                    setContactPhone={setContactPhone}
                    wantsInvoice={wantsInvoice}
                    setWantsInvoice={setWantsInvoice}
                    invoiceDocumentType={invoiceDocumentType}
                    setInvoiceDocumentType={setInvoiceDocumentType}
                    invoiceDocumentNumber={invoiceDocumentNumber}
                    setInvoiceDocumentNumber={setInvoiceDocumentNumber}
                    invoiceFullName={invoiceFullName}
                    setInvoiceFullName={setInvoiceFullName}
                    specialRemarks={specialRemarks}
                    setSpecialRemarks={setSpecialRemarks}
                    computedMetrics={computedMetrics}
                    onBack={() => setWizardStep(3)}
                    onSubmit={handlePlaceReservation}
                  />
                )}

                {/* STEP 5: ITINERARY DOSSIER */}
                {wizardStep === 5 && (() => {
                  const displayBooking = getItineraryBooking();
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-neutral-200 shadow-xl overflow-hidden"
                    >
                      {/* Booking Confirmation Celebration Accent Banner */}
                      {confirmedBooking && (
                        <div className="bg-amber-50 border-b border-amber-200 p-5 flex flex-col gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500 text-neutral-900 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                              ✓
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                                {lang === "ca" ? "Reserva confirmada amb èxit!" : "Bespoke Reservation Secured & Synced"}
                              </h5>
                              <p className="text-xs text-neutral-600 mt-1 font-semibold">
                                {lang === "ca"
                                  ? `El codi Majestic ${confirmedBooking.id} està actiu. El vostre xòfer s'ha assignat de manera transparent.`
                                  : `Your unique booking ID is ${confirmedBooking.id}. Class A chauffeur dispatch is locked and actively synchronized.`}
                              </p>
                            </div>
                          </div>
                          
                          {/* Spam / Promotions Email Warning Notification Box */}
                          <div className="mt-1 bg-white rounded border border-amber-200 p-4 flex items-start gap-3.5 shadow-xs">
                            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Mail className="w-4 h-4 animate-bounce" />
                            </div>
                            <div className="text-xs leading-relaxed text-neutral-700">
                              <p className="font-bold text-neutral-950 uppercase tracking-wide text-[10.5px]">
                                {lang === "ca" 
                                  ? "Important: Comproveu el Correu (Spam / Promocions)" 
                                  : "Important: Check Your Email (Spam / Promotions)"}
                              </p>
                              <p className="mt-1 font-medium text-neutral-600">
                                {lang === "ca" ? (
                                  <>
                                    Hem enviat els detalls i la confirmació a <strong className="text-neutral-900 font-bold">{confirmedBooking.contactEmail}</strong>. Si no el rebeu en un parell de minuts, si us plau <span className="text-amber-700 font-bold underline decoration-amber-500">comproveu la carpeta d'Spam (Correu brossa) o Promocions</span> i marqueu el missatge com a <strong>"No és correu brossa"</strong> per continuar rebent les actualitzacions de ruta.
                                  </>
                                ) : (
                                  <>
                                    We have sent details and reservation confirmation to <strong className="text-neutral-900 font-bold">{confirmedBooking.contactEmail}</strong>. If you do not see it in a couple of minutes, please <span className="text-amber-700 font-bold underline decoration-amber-500">check your Spam or Promotions folder</span> and mark the email as <strong>"Not Spam"</strong> to guarantee real-time chauffeur arrival notifications.
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Top Accent Header */}
                      <div className="bg-neutral-950 p-6 border-b border-amber-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-500 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {confirmedBooking 
                              ? (lang === "ca" ? "ITINERARI CONFIRMAT" : "RESERVATION SECURED") 
                              : (lang === "ca" ? "ESBORRANY DE PROPOSTA" : "PROPOSAL PREVIEW")}
                          </span>
                          <h4 className="font-display-lg text-lg text-white font-bold tracking-tight mt-1.5">
                            {lang === "ca" ? "Dossier de Viatge de l'Atelier" : "Bespoke Atelier Voyage Manifest"}
                          </h4>
                        </div>
                        <div className="text-left md:text-right font-mono text-[10px] text-neutral-400">
                          <p>{lang === "ca" ? `CODI: ${displayBooking.id}` : `CODE: ${displayBooking.id}`}</p>
                          <p className="text-amber-500 font-bold">{lang === "ca" ? "PREPARAT A BARCELONA" : "PREPARED IN BARCELONA"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12">
                        {/* Left: Detailed Summary Card */}
                        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-neutral-150">
                          
                          {/* Transit Parameters */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-neutral-50 p-3.5 rounded border border-neutral-200">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                                {lang === "ca" ? "Tipus de Servei" : "Service Mode"}
                              </span>
                              <span className="text-xs font-bold text-neutral-800 mt-1 block">
                                {displayBooking.bookingType === "hourly" 
                                  ? (lang === "ca" ? `Lloguer de Xòfer (${displayBooking.hourlyDuration}h)` : `Chauffeur Hire (${displayBooking.hourlyDuration} hrs)`)
                                  : (lang === "ca" ? "Transfer de Punt a Punt" : "Point-to-Point Transfer")}
                              </span>
                            </div>

                            <div className="bg-neutral-50 p-3.5 rounded border border-neutral-200">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                                {lang === "ca" ? "Data i Hora de Sortida" : "Scheduled Departure"}
                              </span>
                              <span className="text-xs font-mono font-bold text-neutral-800 mt-1 block">
                                {displayBooking.date} @ {displayBooking.time}
                              </span>
                            </div>
                          </div>

                          {/* Route Timeline */}
                          <div className="space-y-4">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                              {lang === "ca" ? "RUTA CONSECUTIVA" : "TRANSIT ROUTE TIMELINE"}
                            </span>

                            <div className="relative pl-6 border-l-2 border-dashed border-amber-500/30 space-y-5 ml-2">
                              {/* Point A */}
                              <div className="relative">
                                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border border-amber-600 flex items-center justify-center text-[8px] font-bold text-neutral-900 shadow">
                                  A
                                </div>
                                <div>
                                  <h5 className="text-[10px] font-mono font-bold uppercase tracking-wide text-neutral-400">
                                    {lang === "ca" ? "PUNT DE RECOLLIDA" : "PICKUP ORIGIN"}
                                  </h5>
                                  <p className="text-xs font-semibold text-neutral-800 truncate mt-0.5">{displayBooking.pickup || "Not specified"}</p>
                                </div>
                              </div>

                              {/* Waypoints */}
                              {displayBooking.extraStops?.map((stop, idx) => (
                                <div key={idx} className="relative">
                                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[8px] font-bold text-amber-400 shadow">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <h5 className="text-[10px] font-mono font-bold uppercase tracking-wide text-neutral-400">
                                      {lang === "ca" ? `PARADA DE CAMÍ ${idx + 1}` : `WAYPOINT STOP ${idx + 1}`}
                                    </h5>
                                    <p className="text-xs font-semibold text-neutral-800 truncate mt-0.5">{stop}</p>
                                  </div>
                                </div>
                              ))}

                              {/* Point B */}
                              {displayBooking.bookingType !== "hourly" && (
                                <div className="relative">
                                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border border-emerald-700 flex items-center justify-center text-[8px] font-bold text-white shadow">
                                    B
                                  </div>
                                  <div>
                                    <h5 className="text-[10px] font-mono font-bold uppercase tracking-wide text-neutral-400">
                                      {lang === "ca" ? "DESTINACIÓ FINAL" : "FINAL DESTINATION"}
                                    </h5>
                                    <p className="text-xs font-semibold text-neutral-800 truncate mt-0.5">{displayBooking.destination || "Not specified"}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Passenger Specs & Logistics */}
                          <div className="border-t border-neutral-150 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{lang === "ca" ? "Passatgers" : "Passengers"}</span>
                              <span className="text-xs font-semibold text-neutral-800 mt-0.5 block">{displayBooking.passengersCount}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{lang === "ca" ? "Maletes check-in" : "Checked Bags"}</span>
                              <span className="text-xs font-semibold text-neutral-800 mt-0.5 block">{displayBooking.luggageCount}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{lang === "ca" ? "Equipatge de mà" : "Cabin Bags"}</span>
                              <span className="text-xs font-semibold text-neutral-800 mt-0.5 block">{displayBooking.cabinLuggageCount}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{lang === "ca" ? "Distància Est." : "Est. Distance"}</span>
                              <span className="text-xs font-semibold text-neutral-800 mt-0.5 block">
                                {displayBooking.bookingType === "hourly" ? "N/A" : `${displayBooking.distanceKm?.toFixed(1)} km`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Document Center / Action Hub */}
                        <div className="lg:col-span-5 p-6 sm:p-8 bg-neutral-50 flex flex-col justify-between gap-6">
                          <div className="space-y-4">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                              {lang === "ca" ? "CENTRE DE DOCUMENTS" : "ATELIER DOCUMENT CENTRE"}
                            </span>

                            {/* Dynamic Booking Details Card */}
                            <div className="bg-white p-4 rounded border border-neutral-200 space-y-3 shadow-sm">
                              <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                                  {lang === "ca" ? "ESTAT DE LA RESERVA" : "STATUS"}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider ${
                                  confirmedBooking 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {confirmedBooking 
                                    ? (lang === "ca" ? "CONFIRMADA" : "CONFIRMED") 
                                    : (lang === "ca" ? "ESBORRANY" : "DRAFT")}
                                </span>
                              </div>

                              <div className="flex justify-between items-center text-sm">
                                <span className="text-xs text-neutral-500">{lang === "ca" ? "Tarifa Establerta:" : "Established Fare:"}</span>
                                <span className="font-mono font-bold text-neutral-900 text-base">
                                  €{displayBooking.price.toFixed(2)}
                                </span>
                              </div>

                              {/* Comfort details preview in Document center */}
                              <div className="text-[10px] text-neutral-500 space-y-1 pt-1 font-mono leading-relaxed border-t border-neutral-100 mt-1">
                                <p>✓ Chauffeur: Class A dispatch</p>
                                {displayBooking.preferences?.targetTemp !== undefined && (
                                  <p>🌡️ Cabin Temp: {displayBooking.preferences.targetTemp}°C</p>
                                )}
                                {displayBooking.preferences?.silentCabin && (
                                  <p>🔇 Silent Cabin requested</p>
                                )}
                                {displayBooking.preferences?.beverages && (
                                  <p>💧 Mineral Water Setup</p>
                                )}
                                {displayBooking.preferences?.sriQuantity !== undefined && displayBooking.preferences.sriQuantity > 0 && (
                                  <p>👶 Child Safety setup: {displayBooking.preferences.sriQuantity} seats</p>
                                )}
                                <p className="text-[9.5px] text-neutral-400 truncate">👤 {displayBooking.contactName}</p>
                              </div>
                            </div>

                            <p className="text-xs text-neutral-500 leading-relaxed">
                              {lang === "ca" 
                                ? "L'itinerari de servei s'ha estructurat segons les directives de transport executiu Majestic. Baixeu el manifest o voucher oficial per a conservar-lo o imprimir-lo." 
                                : "The bespoke transit plan has been generated according to Majestic logistics guidelines. Download your digital manifest to print or store as an official record."}
                            </p>

                            <div className="pt-2">
                              <h5 className="text-xs font-mono font-bold text-neutral-800 uppercase tracking-widest mb-3 border-b border-neutral-200 pb-1.5 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-amber-500" />
                                {lang === "ca" ? "DOCUMENTS DE RESERVA" : "BOOKING DOCUMENTS"}
                              </h5>

                              <div className="space-y-3">
                                {/* Option 1: Download Full Dossier */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white border border-neutral-200 rounded-md shadow-xs hover:border-amber-500/30 transition-all gap-2.5">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                                      <Download className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span className="truncate">{lang === "ca" ? "Descarregar Dossier Complet" : "Download Full Dossier"}</span>
                                    </p>
                                    <p className="text-[10px] text-neutral-500 font-medium leading-tight mt-0.5">
                                      {lang === "ca" ? "(Descarrega un resum net de l'itinerari)" : "(Downloads a clean summary)"}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const txtContent = generatePlaintextItinerary(displayBooking, VEHICLES);
                                      downloadFile(txtContent, `dossier-${displayBooking.id}.txt`, "text/plain");
                                      addToast(
                                        lang === "ca" ? "Dossier Descarregat" : "Dossier Downloaded",
                                        lang === "ca" ? "El resum net de l'itinerari s'ha descarregat." : "A clean summary of your itinerary has been downloaded.",
                                        "success"
                                      );
                                    }}
                                    className="text-[10px] font-bold bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-white uppercase tracking-wider px-3 py-1.5 rounded border border-neutral-800 transition-colors cursor-pointer shrink-0"
                                  >
                                    {lang === "ca" ? "BAIXAR" : "DOWNLOAD"}
                                  </button>
                                </div>

                                {/* Option 2: View Digital Voucher */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white border border-neutral-200 rounded-md shadow-xs hover:border-amber-500/30 transition-all gap-2.5">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                                      <Ticket className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span className="truncate">{lang === "ca" ? "Veure Voucher Digital" : "View Digital Voucher"}</span>
                                    </p>
                                    <p className="text-[10px] text-neutral-500 font-medium leading-tight mt-0.5">
                                      {lang === "ca" ? "(Obre la pàgina de confirmació interactiva)" : "(Opens the confirmation page)"}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setViewingVoucherBooking(displayBooking);
                                    }}
                                    className="text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-neutral-950 uppercase tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer shrink-0"
                                  >
                                    {lang === "ca" ? "VEURE" : "VIEW"}
                                  </button>
                                </div>

                                {/* Option 3: Print Itinerary */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white border border-neutral-200 rounded-md shadow-xs hover:border-amber-500/30 transition-all gap-2.5">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                                      <Printer className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span className="truncate">{lang === "ca" ? "Imprimir Itinerari" : "Print Itinerary"}</span>
                                    </p>
                                    <p className="text-[10px] text-neutral-500 font-medium leading-tight mt-0.5">
                                      {lang === "ca" ? "(Obre el diàleg d'impressió del sistema)" : "(Launches the print dialog)"}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleTriggerPrintBooking(displayBooking);
                                    }}
                                    className="text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 uppercase tracking-wider px-3 py-1.5 rounded border border-neutral-250 transition-colors cursor-pointer shrink-0"
                                  >
                                    {lang === "ca" ? "IMPRIMIR" : "PRINT"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0">
                            {!confirmedBooking && (
                              <button
                                type="button"
                                onClick={() => setWizardStep(4)}
                                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-100 font-bold rounded text-xs uppercase tracking-wider cursor-pointer"
                              >
                                ⬅ {lang === "ca" ? "Enrere" : "Back"}
                              </button>
                            )}

                            {confirmedBooking ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleResetWizard();
                                    setWizardStep(1);
                                  }}
                                  className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-amber-100 text-neutral-800 hover:text-amber-900 border border-neutral-200 hover:border-amber-300 font-bold rounded text-xs uppercase tracking-wider cursor-pointer text-center"
                                >
                                  🔄 {lang === "ca" ? "Nou Itinerari" : "Plan Another Voyage"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Take them directly to dashboard
                                    setActiveTab("dashboard");
                                    // Optional: reset fields behind the scene so they start clean next time
                                    setTimeout(() => {
                                      handleResetWizard();
                                    }, 1000);
                                  }}
                                  className="flex-1 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-amber-400 hover:text-white font-bold rounded text-xs uppercase tracking-wider cursor-pointer text-center"
                                >
                                  📡 {lang === "ca" ? "Seguiment de Xòfer" : "Track Driver / Active Map"}
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  // Trigger submission flow directly
                                  setWizardStep(4);
                                }}
                                className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold rounded text-xs uppercase tracking-wider cursor-pointer text-center"
                              >
                                🔒 {lang === "ca" ? "Confirmar Reserva" : "Confirm Secure Reservation"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
                {/* END OF STEP 4 */}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard/My Bookings Tab */}
        {activeTab === "dashboard" && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <BookingsDashboard
              bookings={bookings}
              vehicles={localizedVehicles}
              onCancelBooking={handleCancelBooking}
              onRescheduleBooking={handleRescheduleBooking}
              onAddFeedback={handleUpdateBookingFeedback}
              onUpdateInvoiceDetails={handleUpdateInvoiceDetails}
              lang={lang}
            />
          </div>
        )}
      </main>

      {/* Exquisite visual testimonials rotation */}
      <section className="bg-neutral-950 py-10 md:py-12 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 text-center text-white space-y-6">
          <span className="font-mono text-xs text-amber-500 uppercase tracking-[0.3em] font-semibold">{lang === "ca" ? "L'EXPERIÈNCIA" : "THE EXPERIENCE"}</span>
          <div className="relative min-h-[140px] flex items-center justify-center">
            {localizedTestimonials.map((t, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col items-center justify-center gap-4 ${
                  i === activeTestimonial ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
              >
                <p className="font-display-lg text-base sm:text-xl text-neutral-300 italic max-w-3xl leading-relaxed">
                  "{t.quote}"
                </p>
                <div>
                  <h6 className="font-display-lg text-xs tracking-[0.2em] text-amber-500 font-bold uppercase">{t.author}</h6>
                  <p className="text-[10px] text-neutral-500 uppercase mt-0.5 tracking-wider">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 pt-2">
            {localizedTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  i === activeTestimonial ? "bg-amber-500 w-5" : "bg-neutral-800"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Drawer accordions */}
      <section className="py-10 md:py-12 bg-white border-t border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-600 font-extrabold mb-1 block">Frequently Asked Questions</span>
            <h3 className="font-display-lg text-xl font-semibold text-neutral-900 tracking-tight">Atelier Logistics Standards</h3>
          </div>

          <div className="space-y-3.5">
            <details className="group border-b border-neutral-200 pb-3 cursor-pointer">
              <summary className="flex justify-between items-center text-sm font-semibold text-neutral-800 group-hover:text-amber-700 py-3">
                How far in advance should I authorize my reservation?
              </summary>
              <p className="text-xs text-neutral-500 leading-relaxed pb-3 pl-1">
                For complete fleet authorization guarantee, we recommend setting reservations at least 12 hours in advance. Last-minute request pipelines are solved in real-time by active Class A cohorts.
              </p>
            </details>

            <details className="group border-b border-neutral-200 pb-3 cursor-pointer">
              <summary className="flex justify-between items-center text-sm font-semibold text-neutral-800 group-hover:text-amber-700 py-3">
                What does the "Severe Silent Cabin Policy" dictate?
              </summary>
              <p className="text-xs text-neutral-500 leading-relaxed pb-3 pl-1">
                Your absolute isolation is our priority. When active, your chauffeur will speak strictly when directly spoken to, avoiding standard greeting chatter and small talk elements entirely.
              </p>
            </details>

            <details className="group border-b border-neutral-200 pb-3 cursor-pointer">
              <summary className="flex justify-between items-center text-sm font-semibold text-neutral-800 group-hover:text-amber-700 py-3">
                How are delayed flights handled for Airport arrivals?
              </summary>
              <p className="text-xs text-neutral-500 leading-relaxed pb-3 pl-1">
                All airport pick-ups are linked to official flight trackings. Your driver will auto-schedule real-time landing adjustments free of surcharge, waiting with an atmospheric logo board inside private lounges.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Visual Toast Notification Overlay */}
      <div 
        id="toast-notification-system" 
        className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full p-4"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`pointer-events-auto flex items-start gap-3 bg-neutral-900/95 backdrop-blur-md border border-neutral-800/80 hover:border-amber-500/40 text-left rounded-lg p-4 shadow-2xl transition-all duration-300 w-full`}
            >
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              )}
              
              <div className="flex-grow min-w-0 pr-1">
                <h5 className="font-sans font-bold text-xs text-neutral-100 leading-tight uppercase tracking-wider flex items-center gap-2">
                  <span>{toast.title}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                </h5>
                <p className="font-sans text-[11px] text-neutral-300 leading-normal mt-1">
                  {toast.description}
                </p>
              </div>

              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-neutral-500 hover:text-neutral-200 transition-colors p-0.5 rounded cursor-pointer"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <footer className="bg-neutral-950 text-white min-h-[300px] border-t border-neutral-900 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-neutral-400">
          <div className="space-y-4">
            <h5 className="font-display-lg text-sm text-neutral-100 uppercase tracking-widest font-bold">MAJESTIC FLEET SL</h5>
            <p className="leading-relaxed">
              Serving the Catalonian shores with elite absolute silent private transfers, organic detours, and luxury atelier vehicles.
            </p>
            <p className="font-mono text-[9px] text-amber-500 uppercase tracking-wider">OPERATIONAL 24 HOURS A DAY, 7 DAYS A WEEK</p>
          </div>

          <div className="space-y-4">
            <h5 className="font-display-lg text-sm text-neutral-100 uppercase tracking-widest font-bold">DIRECT CONTACT DETAILS</h5>
            <div className="space-y-2 font-mono">
              <a
                href="tel:+34640369120"
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-500 shrink-0" /> +34 640 36 91 20
              </a>
              <a
                href="https://wa.me/34640369120?text=Hello%20Majestic%20Fleet%2C%20I%20would%20like%20to%20inquire%20about%20a%20private%20transfer."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-bold"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" /> WhatsApp Chat
              </a>
              <a
                href="mailto:majesticfleetsl@gmail.com"
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-amber-500 shrink-0" /> majesticfleetsl@gmail.com
              </a>
              <p className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-500 shrink-0" /> CORNELLA DEL LLOBREGAT (BARCELONA), C/ GERDERA, Nº 1
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-display-lg text-sm text-neutral-100 uppercase tracking-widest font-bold">VIP COHORT PROMISE</h5>
            <p className="leading-relaxed">
              Every trip is protected by comprehensive VIP accident guarantees, verified security driver selection, and carbon offset tracking certifications.
            </p>
          </div>
        </div>

        {/* Control & Management Dispatch Hub & Chauffeur Device Portal */}
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pb-12">
          <ControlManagement
            lang={lang}
            bookings={bookings}
            onReloadBookings={() => syncServerBookings(bookings)}
            vehicles={localizedVehicles}
            onPricesUpdated={fetchVehiclePrices}
          />
        </div>

        <div className="border-t border-neutral-900 py-8 bg-neutral-950/40 text-center text-[10px] text-neutral-500">
          <p>© 2026 MAJESTIC FLEET SL COHORTS BARCELONA. ALL REGISTERED RIGHTS DESIGN RETRIEVED.</p>
        </div>
      </footer>

      {/* Exquisite Digital Voucher Modal Overlay */}
      <AnimatePresence>
        {viewingVoucherBooking && (
          <BookingItineraryModal
            booking={viewingVoucherBooking}
            vehicles={localizedVehicles}
            onClose={() => setViewingVoucherBooking(null)}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
