import { useState, useEffect, useRef } from "react";
import { 
  X, 
  Car, 
  Navigation, 
  Compass, 
  Play, 
  Pause, 
  Sparkles, 
  MapPin, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  Info, 
  Send, 
  MessageSquare, 
  Phone,
  ShieldAlert, 
  Sun, 
  Moon, 
  ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import L from "leaflet";
import { Booking } from "../types";

interface LiveDriverTrackingModalProps {
  booking: Booking;
  onClose: () => void;
  onCompleteTrip: (id: string) => void;
  lang?: "en" | "ca" | "es";
}

export default function LiveDriverTrackingModal({
  booking,
  onClose,
  onCompleteTrip,
  lang = "en"
}: LiveDriverTrackingModalProps) {
  useEffect(() => {
    // Disable body scroll when driver tracking modal is active
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const [active, setActive] = useState(true);
  const [progress, setProgress] = useState(15); // Start at a slight offset so it's already on its way
  const [trackingTab, setTrackingTab] = useState<"status" | "chat">("status");
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");
  const [useDeviceAsDriver, setUseDeviceAsDriver] = useState(false);

  // User's browser GPS coordinates
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isWatchingDevice, setIsWatchingDevice] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [leafletLoaded] = useState(true);

  // Simulated Chat Messages State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "chauffeur", text: string, time: string }>>([
    {
      sender: "chauffeur",
      text: lang === "ca"
        ? "Hola! Sóc en Marcos, el seu xofer de Majestic Fleet Sl avui. Estic de camí amb el Mercedes-Benz Classe S negre i m'apropo a la seva posició. Si us plau, digueu-me si necessiteu qualsevol ajust de cabina!"
        : "Hello! I am Marcos, your Majestic Fleet Sl Chauffeur today. I am on my way with the black Mercedes-Benz S-Class and am approaching your position. Please let me know if you need any cabin adjustments!",
      time: "10:02"
    }
  ]);
  const [typedMessage, setTypedMessage] = useState("");
  const [isChauffeurTyping, setIsChauffeurTyping] = useState(false);
  const [unreadChat, setUnreadChat] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const deviceMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const routeGlowRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Translations
  const translations = {
    en: {
      title: "Live Chauffeur Radar Tracking",
      subtitle: "GPS Satellite Feed • Majestic Fleet Sl Class-A Chauffeur",
      driver: "Chauffeur Partner",
      driverName: "Marcos Reyes",
      driverRating: "Verified Class A (English, French, Spanish)",
      pickupPoint: "Pickup Location",
      distance: "Distance",
      eta: "ETA",
      transitLog: "Chauffeur Radio Log",
      deviceGps: "Measure from your GPS?",
      deviceGpsDesc: "Calculate the real-time distance between Marcos and your device's live coordinates.",
      deviceGpsError: "GPS tracking permission denied or unsupported.",
      syncGps: "Sync My Device GPS",
      disconnectGps: "Disconnect Device GPS",
      resetGps: "Reset Simulation",
      trackDriver: "Resume Tracking",
      pauseDriver: "Pause Tracking",
      warp: "+25% Warp Drive",
      arrivedTitle: "Chauffeur Arrived",
      arrivedDesc: "Marcos Reyes has arrived at your pickup terminal and is holding the door for you.",
      concludeVoyage: "Conclude Voyage & Open Feedback",
      centerDriver: "Center Chauffeur",
      centerOverview: "Recenter Map",
      transitStatus: "ATC Dispatch Update",
      
      // Uber-like Client Extras
      chatTab: "Chauffeur Chat Lounge",
      radarTab: "Live Map Status",
      carInfo: "Mercedes-Benz S-Class",
      carColor: "Obsidian Black Metallic",
      plateNumber: "Plate: VLV-777-E",
      verificationCode: "Security PIN Code",
      suggestedReplies: "Quick Messages",
      sendPlaceholder: "Send a message to Marcos...",
      typing: "Marcos is typing...",
      unreadLabel: "New message",
      mapThemeLabel: "Map Theme",
      mapThemeDark: "Obsidian Dark",
      mapThemeLight: "Daylight"
    },
    ca: {
      title: "Seguiment de Xofer en Directe",
      subtitle: "Senyal Satèl·lit GPS • Xofer Majestic Fleet Sl de Classe A",
      driver: "Soci de Xofer",
      driverName: "Marcos Reyes",
      driverRating: "Classe A Verificat (Anglès, Francès, Castellà)",
      pickupPoint: "Punt de Recollida",
      distance: "Distància",
      eta: "ETA",
      transitLog: "Registre de Ràdio del Xofer",
      deviceGps: "Mesurar amb el teu GPS?",
      deviceGpsDesc: "Calcula la distància real entre en Marcos i la posició en directe del teu telèfon.",
      deviceGpsError: "Permís denegat de GPS o no compatible.",
      syncGps: "Sincronitzar GPS Propi",
      disconnectGps: "Desconnectar GPS Propi",
      resetGps: "Reiniciar Simulació",
      trackDriver: "Reprendre Seguiment",
      pauseDriver: "Pausar GPS",
      warp: "+25% Warp",
      arrivedTitle: "El Xofer ha Arribat",
      arrivedDesc: "En Marcos Reyes ja ha arribat al punt de recollida i us està esperant amb la porta oberta.",
      concludeVoyage: "Finalitzar Viatge i Obrir Valoració",
      centerDriver: "Centrar Xofer",
      centerOverview: "Recentrar Mapa",
      transitStatus: "Actualització de Trànsit",

      // Uber-like Client Extras
      chatTab: "Xat del Xofer",
      radarTab: "Mapa de l'Estat",
      carInfo: "Mercedes-Benz Classe S",
      carColor: "Negre Obsidiana Metal·litzat",
      plateNumber: "Matrícula: VLV-777-E",
      verificationCode: "Codi PIN de Seguretat",
      suggestedReplies: "Missatges ràpids",
      sendPlaceholder: "Envia un missatge a en Marcos...",
      typing: "En Marcos està escrivint...",
      unreadLabel: "Nou missatge",
      mapThemeLabel: "Tema del Mapa",
      mapThemeDark: "Obsidiana Fosca",
      mapThemeLight: "Diürn clar"
    }
  };
  const t = translations[lang === "ca" ? "ca" : "en"] || translations.en;

  // Quick Chat Suggested Replies
  const suggestedQuickReplies = lang === "ca" 
    ? [
        "Estic esperant a la porta principal.",
        "Porto dues maletes grans.",
        "Hi ha carregador per al mòbil?",
        "La cabina està fresca?"
      ]
    : [
        "I'm waiting at the main entrance.",
        "I have two large bags of luggage.",
        "Is there phone charging available?",
        "Is the cabin temperature cool?"
      ];

  // Scroll to bottom of chat when messages update or typing state changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChauffeurTyping, trackingTab]);

  // Clear unread indicator when chat tab is active
  useEffect(() => {
    if (trackingTab === "chat") {
      setUnreadChat(false);
    }
  }, [trackingTab]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn("Leaflet map removal failed:", e);
        }
        mapRef.current = null;
      }
      routeGlowRef.current = null;
      routeLineRef.current = null;
      driverMarkerRef.current = null;
      pickupMarkerRef.current = null;
      deviceMarkerRef.current = null;
    };
  }, []);

  // Declared clean synchronization of the active device GPS watch
  useEffect(() => {
    let activeWatchId: number | null = null;

    if (isWatchingDevice || useDeviceAsDriver) {
      if (!navigator.geolocation) {
        setGeoError(t.deviceGpsError);
        setIsWatchingDevice(false);
        setUseDeviceAsDriver(false);
        return;
      }

      setGeoError(null);

      activeWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          setDeviceCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn("GPS watch error:", err);
          setGeoError(t.deviceGpsError);
          setIsWatchingDevice(false);
          setUseDeviceAsDriver(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setDeviceCoords(null);
      setGeoError(null);
    }

    return () => {
      if (activeWatchId !== null) {
        navigator.geolocation.clearWatch(activeWatchId);
      }
    };
  }, [isWatchingDevice, useDeviceAsDriver, t.deviceGpsError]);

  const targetCoords = booking.pickupCoords || { lat: 41.3879, lng: 2.1699 };
  
  // Simulated starting location of the driver (~2.8 km away)
  const startLat = targetCoords.lat + 0.014;
  const startLng = targetCoords.lng - 0.018;

  // Haversine formula
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getBearing = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  };

  // Generate a multi-point grid street-route from starting location to target destination (Drives exact location!)
  const generateGridRoute = (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    const dLat = end.lat - start.lat;
    const dLng = end.lng - start.lng;
    return [
      { lat: start.lat, lng: start.lng },
      { lat: start.lat + dLat * 0.35, lng: start.lng },
      { lat: start.lat + dLat * 0.35, lng: start.lng + dLng * 0.5 },
      { lat: start.lat + dLat * 0.75, lng: start.lng + dLng * 0.5 },
      { lat: start.lat + dLat * 0.75, lng: end.lng },
      { lat: end.lat, lng: end.lng }
    ];
  };

  const routePoints = generateGridRoute({ lat: startLat, lng: startLng }, targetCoords);

  // Interpolate precise position along the grid route based on 0-100% progress
  const getPositionAlongPath = (points: { lat: number; lng: number }[], percentage: number) => {
    if (points.length === 0) return { lat: 0, lng: 0, segmentIndex: 0 };
    if (points.length === 1) return { lat: points[0].lat, lng: points[0].lng, segmentIndex: 0 };
    if (percentage <= 0) return { lat: points[0].lat, lng: points[0].lng, segmentIndex: 0 };
    if (percentage >= 100) return { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng, segmentIndex: points.length - 2 };

    // Calculate lengths of segments
    const segments: number[] = [];
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const dist = getDistance(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
      segments.push(dist);
      totalLength += dist;
    }

    if (totalLength === 0) return { lat: points[0].lat, lng: points[0].lng, segmentIndex: 0 };

    // Find matching segment
    const targetDist = totalLength * (percentage / 100);
    let cumulativeDist = 0;
    for (let i = 0; i < segments.length; i++) {
      const nextCumulative = cumulativeDist + segments[i];
      if (targetDist <= nextCumulative) {
        const segmentProgress = segments[i] === 0 ? 0 : (targetDist - cumulativeDist) / segments[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        return {
          lat: p1.lat + (p2.lat - p1.lat) * segmentProgress,
          lng: p1.lng + (p2.lng - p1.lng) * segmentProgress,
          segmentIndex: i
        };
      }
      cumulativeDist = nextCumulative;
    }
    return { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng, segmentIndex: points.length - 2 };
  };

  const currentPathState = getPositionAlongPath(routePoints, progress);
  const driverLat = (useDeviceAsDriver && deviceCoords) ? deviceCoords.lat : currentPathState.lat;
  const driverLng = (useDeviceAsDriver && deviceCoords) ? deviceCoords.lng : currentPathState.lng;

  const getActiveBearing = () => {
    if (useDeviceAsDriver && deviceCoords) {
      return getBearing(deviceCoords.lat, deviceCoords.lng, targetCoords.lat, targetCoords.lng);
    }
    const idx = currentPathState.segmentIndex;
    const p1 = routePoints[idx];
    const p2 = routePoints[idx + 1] || targetCoords;
    return getBearing(p1.lat, p1.lng, p2.lat, p2.lng);
  };

  const getRemainingRoutePoints = (): [number, number][] => {
    if (useDeviceAsDriver && deviceCoords) {
      return [[deviceCoords.lat, deviceCoords.lng], [targetCoords.lat, targetCoords.lng]];
    }
    if (progress >= 100) {
      const target = hasDeviceGps && deviceCoords ? deviceCoords : targetCoords;
      return [[target.lat, target.lng], [target.lat, target.lng]];
    }
    const pts: [number, number][] = [[driverLat, driverLng]];
    const startIdx = currentPathState.segmentIndex + 1;
    for (let i = startIdx; i < routePoints.length; i++) {
      pts.push([routePoints[i].lat, routePoints[i].lng]);
    }
    if (hasDeviceGps && deviceCoords) {
      pts.push([deviceCoords.lat, deviceCoords.lng]);
    }
    return pts;
  };

  const hasDeviceGps = isWatchingDevice && deviceCoords && !useDeviceAsDriver;
  const activeMeasureTarget = hasDeviceGps ? deviceCoords : targetCoords;
  const realTimeDistance = (useDeviceAsDriver && deviceCoords)
    ? getDistance(deviceCoords.lat, deviceCoords.lng, targetCoords.lat, targetCoords.lng)
    : getDistance(driverLat, driverLng, activeMeasureTarget.lat, activeMeasureTarget.lng);

  // ETA: 36 km/h (0.6 km per minute)
  const etaMinsTotal = (progress === 100 && !useDeviceAsDriver) ? 0 : realTimeDistance / 0.6;
  const etaMinutes = Math.floor(etaMinsTotal);
  const etaSeconds = Math.floor((etaMinsTotal - etaMinutes) * 60);

  // Unified Arrival state
  const isArrived = useDeviceAsDriver 
    ? (deviceCoords !== null && realTimeDistance < 0.05) 
    : (progress === 100);

  // Dynamic progress percentage for display
  const displayProgress = useDeviceAsDriver
    ? Math.max(0, Math.min(100, Math.round(((2.8 - realTimeDistance) / 2.8) * 100)))
    : progress;

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    if (!mapRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
      try {
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: false,
          scrollWheelZoom: true,
          touchZoom: "center"
        }).setView([targetCoords.lat, targetCoords.lng], 13);
      } catch (e) {
        console.warn("[MAJESTIC] Tracking modal Leaflet map initialization caught exception:", e);
      }
    }

    if (!mapRef.current) return;

    // Add Pickup Marker
    if (!pickupMarkerRef.current) {
      const pickupIconHtml = `
        <div class="relative flex flex-col items-center justify-center -translate-y-5">
          <!-- Pulse outer ring -->
          <div class="absolute w-8 h-8 rounded-full animate-ping opacity-40 bg-emerald-500"></div>
          <div class="absolute w-6 h-6 rounded-full bg-emerald-500/20" style="box-shadow: 0 0 12px 3px rgba(16, 185, 129, 0.3)"></div>
          
          <!-- Elegant Pin SVG -->
          <div class="relative w-9 h-11 flex items-center justify-center">
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 0C8.06 0 0 8.06 0 18C0 29.4 15.12 42.4 17.15 44.05C17.4 44.25 17.7 44.35 18 44.35C18.3 44.35 18.6 44.25 18.85 44.05C20.88 42.4 36 29.4 36 18C36 8.06 27.94 0 18 0ZM18 24.5C14.41 24.5 11.5 21.59 11.5 18C11.5 14.41 14.41 11.5 18 11.5C21.59 11.5 24.5 14.41 24.5 18C24.5 21.59 21.59 24.5 18 24.5Z" fill="#10b981"/>
              <circle cx="18" cy="18" r="4.5" fill="#ffffff" />
            </svg>
          </div>
        </div>
      `;

      const pickupIcon = L.divIcon({
        html: pickupIconHtml,
        className: "",
        iconSize: [36, 44],
        iconAnchor: [18, 44]
      });

      pickupMarkerRef.current = L.marker([targetCoords.lat, targetCoords.lng], { icon: pickupIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${t.pickupPoint}:</b><br/>${booking.pickup}`);
    }

    // Initial Fit Bounds
    const bounds = [
      [startLat, startLng],
      [targetCoords.lat, targetCoords.lng]
    ];
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });

  }, [leafletLoaded, targetCoords.lat, targetCoords.lng]);

  // Update Tile Layer URL dynamically when theme changes
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const darkUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    const lightUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    const activeUrl = mapTheme === "dark" ? darkUrl : lightUrl;

    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(activeUrl);
    } else {
      tileLayerRef.current = L.tileLayer(activeUrl, {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 20
      }).addTo(mapRef.current);
    }
  }, [leafletLoaded, mapTheme]);

  // Update Driver Marker, Route Polyline, and Device Marker dynamically when variables change
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const bearing = getActiveBearing();
    const driftAngle = progress === 100 ? 0 : Math.sin(progress * 0.8) * 8; // gentle steering drift
    const finalBearing = (bearing + driftAngle + 360) % 360;

    const driverIconHtml = `
      <div class="relative flex flex-col items-center justify-center -translate-y-5">
        <!-- Pulse outer ring -->
        <div class="absolute w-12 h-12 rounded-full animate-pulse opacity-20 bg-amber-500"></div>
        <div class="absolute w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30" style="box-shadow: 0 0 15px 4px rgba(197, 160, 89, 0.3)"></div>
        
        <!-- Premium Sedan Car Icon -->
        <div style="transform: rotate(${finalBearing}deg); transition: transform 0.2s ease-out;" class="relative w-10 h-10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 100 100">
            <!-- Shadow -->
            <ellipse cx="50" cy="52" rx="18" ry="32" fill="rgba(0,0,0,0.4)" />
            <!-- Car Body -->
            <path d="M34 25 C34 16, 42 12, 50 12 C58 12, 66 16, 66 25 L68 55 C68 62, 66 84, 50 84 C34 84, 32 62, 34 55 Z" fill="#171717" stroke="#c5a059" stroke-width="3" />
            <!-- Windshield front -->
            <path d="M38 32 C38 28, 42 24, 50 24 C58 24, 62 28, 62 32 C62 35, 38 35, 38 32 Z" fill="#475569" />
            <!-- Windshield rear -->
            <path d="M39 65 C39 68, 42 70, 50 70 C58 70, 61 68, 61 65 C61 63, 39 63, 39 65 Z" fill="#475569" />
            <!-- Roof -->
            <rect x="39" y="36" width="22" height="24" rx="3" fill="#262626" />
            <!-- Headlights -->
            <ellipse cx="40" cy="15" rx="3" ry="5" fill="#fef08a" />
            <ellipse cx="60" cy="15" rx="3" ry="5" fill="#fef08a" />
            <!-- Taillights -->
            <rect x="36" y="81" width="5" height="2" fill="#ef4444" />
            <rect x="59" y="81" width="5" height="2" fill="#ef4444" />
          </svg>
        </div>
      </div>
    `;

    const driverIcon = L.divIcon({
      html: driverIconHtml,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Update / Create Driver Marker
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverLat, driverLng]);
      driverMarkerRef.current.setIcon(driverIcon);
    } else {
      driverMarkerRef.current = L.marker([driverLat, driverLng], { icon: driverIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${t.driver}:</b><br/>${t.driverName}`);
    }

    // Update / Create Device Marker
    if (hasDeviceGps && deviceCoords) {
      const deviceIconHtml = `
        <div class="relative flex items-center justify-center">
          <!-- Pulsing glowing rings -->
          <div class="absolute w-8 h-8 rounded-full bg-blue-500 animate-ping opacity-25"></div>
          <div class="absolute w-6 h-6 rounded-full bg-blue-500/40 animate-pulse"></div>
          <!-- Solid core with border -->
          <div class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
        </div>
      `;
      const deviceIcon = L.divIcon({
        html: deviceIconHtml,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (deviceMarkerRef.current) {
        deviceMarkerRef.current.setLatLng([deviceCoords.lat, deviceCoords.lng]);
        deviceMarkerRef.current.setIcon(deviceIcon);
      } else {
        deviceMarkerRef.current = L.marker([deviceCoords.lat, deviceCoords.lng], { icon: deviceIcon })
          .addTo(mapRef.current)
          .bindPopup(`<b>Your Location</b>`);
      }
    } else {
      if (deviceMarkerRef.current) {
        deviceMarkerRef.current.remove();
        deviceMarkerRef.current = null;
      }
    }

    // Update / Create polyline path from Driver to the current target address (or device coordinates)
    const remainingPoints = getRemainingRoutePoints();

    // Glow backing path
    if (routeGlowRef.current) {
      routeGlowRef.current.setLatLngs(remainingPoints);
    } else {
      routeGlowRef.current = L.polyline(remainingPoints, {
        color: "#c5a059",
        weight: 10,
        opacity: 0.35,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(mapRef.current);
    }

    // Sharp foreground path
    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs(remainingPoints);
    } else {
      routeLineRef.current = L.polyline(remainingPoints, {
        color: "#c5a059",
        weight: 4.5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(mapRef.current);
    }

  }, [leafletLoaded, progress, driverLat, driverLng, hasDeviceGps, deviceCoords, activeMeasureTarget, useDeviceAsDriver]);

  // Auto-center map on device coordinates when acting as driver
  useEffect(() => {
    if (useDeviceAsDriver && deviceCoords && mapRef.current) {
      mapRef.current.setView([deviceCoords.lat, deviceCoords.lng], 16);
    }
  }, [useDeviceAsDriver, !!deviceCoords]);

  // Simulation loop
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (active && progress < 100 && !useDeviceAsDriver) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1;
          if (next >= 100) {
            if (interval) clearInterval(interval);
            return 100;
          }
          return next;
        });
      }, 500); // 50s total from 0 to 100. Since we start at 15, takes ~42 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [active, progress, useDeviceAsDriver]);

  // Handle camera control helpers
  const handleCenterDriver = () => {
    if (!mapRef.current) return;
    mapRef.current.setView([driverLat, driverLng], 15);
  };

  const handleCenterOverview = () => {
    if (!mapRef.current) return;
    const bounds = [
      [driverLat, driverLng],
      [activeMeasureTarget.lat, activeMeasureTarget.lng]
    ];
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomOut();
  };

  // Device Location Sync Toggle (Passenger POV)
  const toggleDeviceTracking = () => {
    // If acting as driver, stop it first
    if (useDeviceAsDriver) {
      setUseDeviceAsDriver(false);
    }
    setIsWatchingDevice(prev => !prev);
  };

  // Act as Real-Time Driver Toggle (Chauffeur POV)
  const toggleDeviceAsDriver = () => {
    // If passenger GPS sync is active, disable it
    if (isWatchingDevice) {
      setIsWatchingDevice(false);
    }
    setUseDeviceAsDriver(prev => !prev);
  };

  // Chat message sending and automated response trigger
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = {
      sender: "user" as const,
      text: text,
      time: timeStr
    };

    setChatMessages(prev => [...prev, userMsg]);
    setTypedMessage("");
    setIsChauffeurTyping(true);

    setTimeout(() => {
      let replyText = "";
      const lower = text.toLowerCase();

      if (lower.includes("entrance") || lower.includes("outside") || lower.includes("waiting") || lower.includes("porta") || lower.includes("vestibul")) {
        replyText = lang === "ca"
          ? "Rebut. M'estic apropant al vestíbul principal ara mateix. Aparcaré davant de la porta i us assistiré personalment amb l'equipatge."
          : "Understood. I am approaching the main lobby right now. I will park directly in front of the door and step out to assist you.";
      } else if (lower.includes("bag") || lower.includes("luggage") || lower.includes("maleta") || lower.includes("bulto")) {
        replyText = lang === "ca"
          ? "Perfecte. El maleter de la berlina Classe S ja està preparat i buit. M'encarrego de col·locar totes les maletes."
          : "Excellent. The spacious trunk of the S-Class sedan is fully cleared and prepared. I will carefully load all your luggage.";
      } else if (lower.includes("charge") || lower.includes("cable") || lower.includes("bateria") || lower.includes("mòbil") || lower.includes("charger")) {
        replyText = lang === "ca"
          ? "Per descomptat. El vehicle disposa de ports USB-C ràpids, cables per a Apple Lightning i bases de càrrega per inducció."
          : "Certainly. The rear cabin is fully equipped with high-speed USB-C ports, Apple Lightning cables, and wireless induction charging pads.";
      } else if (lower.includes("temp") || lower.includes("fred") || lower.includes("cool") || lower.includes("clima") || lower.includes("calor")) {
        replyText = lang === "ca"
          ? "Perfecte, he fixat el sistema de climatització bizona a uns confortables 20°C amb ventilació suau. Digueu-me si voleu canviar-ho."
          : "Understood, I have preset the rear dual-zone air conditioning to a comfortable 20°C (68°F) with gentle airflow. Let me know if you prefer any adjustments.";
      } else {
        replyText = lang === "ca"
          ? "Rebut. Estic atent al trànsit camí del seu terminal, però tinc en compte el seu avís. Ens veiem en pocs minuts!"
          : "Understood. I am closely monitoring traffic on my way to your terminal, but I have noted your update. See you in just a brief moment!";
      }

      setChatMessages(prev => [...prev, {
        sender: "chauffeur" as const,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
      setIsChauffeurTyping(false);

      if (trackingTab !== "chat") {
        setUnreadChat(true);
      }
    }, 2200);
  };

  const stages = [
    {
      label: lang === "ca" 
        ? "Sortida de Passeig de Gràcia. Calibrant la cabina..." 
        : "Dispatched from Passeig de Gràcia. Calibrating cabin setup...",
      min: 0,
      max: 20
    },
    {
      label: lang === "ca"
        ? "Circulant per la Gran Via. Velocitat: 52 km/h."
        : "Cruising through Gran Via. Speed: 52 km/h.",
      min: 21,
      max: 40
    },
    {
      label: lang === "ca"
        ? "Passant la Plaça de les Glòries. ETA sincronitzat."
        : "Bypassing Plaza de Glòries. ETA fully synchronized.",
      min: 41,
      max: 65
    },
    {
      label: lang === "ca"
        ? "Maniobrant pels carrers d'accés local."
        : "Maneuvering onto the local approach streets.",
      min: 66,
      max: 85
    },
    {
      label: lang === "ca"
        ? "Reduint velocitat. Preparant l'obertura de portes."
        : "Slowing down. Preparing passenger cabin door exit.",
      min: 86,
      max: 99
    },
    {
      label: lang === "ca"
        ? "Arribat al punt de recollida. Marcos us està esperant."
        : "Arrived at pickup terminal. Marcos is waiting outside.",
      min: 100,
      max: 100
    }
  ];

  const currentStage = stages.find(s => progress >= s.min && progress <= s.max) || stages[5];

  const formatDistance = (dist: number) => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)} m`;
    }
    return `${dist.toFixed(2)} km`;
  };

  const formatEta = (mins: number, secs: number) => {
    if (isArrived) return lang === "ca" ? "Arribat" : "Arrived";
    let str = "";
    if (mins > 0) str += `${mins}m `;
    str += `${secs}s`;
    return str;
  };

  const handleReset = () => {
    setProgress(0);
    setActive(true);
  };

  return (
    <AnimatePresence>
      <motion.div 
        key="driver-tracking-modal-root"
        id="driver-tracking-modal" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-10 bg-neutral-950/80 backdrop-blur-md"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .luxury-leaflet-map .leaflet-tile {
            filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(110%) saturate(40%) sepia(10%) !important;
            transition: filter 0.5s ease-in-out;
          }
          .luxury-leaflet-map-light .leaflet-tile {
            filter: none !important;
            transition: filter 0.5s ease-in-out;
          }
          .leaflet-container {
            background-color: #0c0c0c !important;
          }
          .leaflet-popup-content-wrapper {
            background: #171717 !important;
            color: #ffffff !important;
            border: 1px solid #c5a059 !important;
            border-radius: 8px !important;
            font-family: system-ui, sans-serif !important;
          }
          .leaflet-popup-tip {
            background: #171717 !important;
            border-left: 1px solid #c5a059 !important;
            border-bottom: 1px solid #c5a059 !important;
          }
        `}} />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:grid md:grid-cols-12 min-h-[550px] md:h-[650px]"
        >
          {/* Header Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-[5001] bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800 p-2 rounded-full text-neutral-400 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Left Column: Leaflet Map Container */}
          <div className="relative md:col-span-7 h-[280px] md:h-full bg-neutral-950 flex flex-col border-b md:border-b-0 border-neutral-800">
            <div ref={mapContainerRef} className={`w-full flex-1 z-10 transition-all duration-500 ${mapTheme === "dark" ? "luxury-leaflet-map" : "luxury-leaflet-map-light"}`} />
            
            {/* Loading Indicator */}
            {!leafletLoaded && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950/90 text-xs font-mono text-neutral-400 gap-2">
                <Compass className="w-5 h-5 animate-spin text-amber-500" />
                <span>Initializing Live Radar Feeds...</span>
              </div>
            )}

            {/* Floating Banner HUD (Uber style) */}
            {leafletLoaded && (
              <div className="absolute top-4 right-14 z-[4000] bg-neutral-950/90 backdrop-blur border border-neutral-800 rounded-lg p-2 px-3 shadow-lg flex items-center gap-2.5 max-w-[220px]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-neutral-200 uppercase tracking-wide leading-tight">
                    {isArrived ? t.arrivedTitle : (lang === "ca" ? "En camí" : "En Route")}
                  </p>
                  <p className="text-[9px] text-neutral-400 leading-tight truncate">
                    {isArrived ? (lang === "ca" ? "Marcos us espera" : "Marcos is waiting") : `${formatDistance(realTimeDistance)} • ${formatEta(etaMinutes, etaSeconds)}`}
                  </p>
                </div>
              </div>
            )}

            {/* Custom Floating Camera Controls */}
            {leafletLoaded && (
              <div className="absolute bottom-4 left-4 z-[4000] flex items-center gap-2">
                <div className="flex bg-neutral-950/95 border border-neutral-800 rounded-lg overflow-hidden shadow-lg p-0.5">
                  <button
                    type="button"
                    onClick={handleCenterDriver}
                    className="px-2.5 py-1.5 text-[9.5px] font-mono font-bold text-amber-400 hover:text-white hover:bg-neutral-800 rounded transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Car className="w-3.5 h-3.5" />
                    {t.centerDriver}
                  </button>
                  <div className="w-px bg-neutral-800 self-stretch my-1" />
                  <button
                    type="button"
                    onClick={handleCenterOverview}
                    className="px-2.5 py-1.5 text-[9.5px] font-mono font-bold text-emerald-400 hover:text-white hover:bg-neutral-800 rounded transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    {t.centerOverview}
                  </button>
                </div>

                {/* Map style toggle */}
                <button
                  type="button"
                  onClick={() => setMapTheme(m => m === "dark" ? "light" : "dark")}
                  className="bg-neutral-950/95 border border-neutral-800 p-2 rounded-lg text-neutral-400 hover:text-white shadow-lg cursor-pointer transition-all flex items-center justify-center"
                  title={t.mapThemeLabel}
                >
                  {mapTheme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              </div>
            )}

            {/* Floating Zoom Controls */}
            {leafletLoaded && (
              <div className="absolute top-4 left-4 z-[4000] flex flex-col gap-1 bg-neutral-950/95 border border-neutral-800 rounded-lg p-1 shadow-lg">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded cursor-pointer transition-all"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="h-px bg-neutral-800 mx-1" />
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded cursor-pointer transition-all"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Telemetry and Controls */}
          <div className="md:col-span-5 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto h-[calc(100vh-360px)] md:h-full md:border-l border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950">
            {/* Tabs for Map Status vs Chat Lounge */}
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex bg-neutral-950/80 p-1 rounded-xl border border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setTrackingTab("status")}
                  className={`flex-1 py-2 text-xs font-semibold tracking-wide rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    trackingTab === "status"
                      ? "bg-amber-500 text-neutral-950 shadow-md font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>{t.radarTab}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTrackingTab("chat")}
                  className={`flex-1 py-2 text-xs font-semibold tracking-wide rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 relative ${
                    trackingTab === "chat"
                      ? "bg-amber-500 text-neutral-950 shadow-md font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.chatTab}</span>
                  {unreadChat && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full text-white tracking-widest animate-pulse border border-neutral-950 shadow-lg">
                      {t.unreadLabel}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB CONTENT: STATUS */}
              {trackingTab === "status" && (
                <div className="space-y-4">
                  {/* Metadata and Title */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isArrived ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isArrived ? "bg-emerald-500" : "bg-amber-500"}`} />
                      </span>
                      <span className="font-mono text-[9px] font-extrabold text-amber-500 tracking-wider uppercase">
                        {t.subtitle}
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold tracking-tight text-white leading-tight">
                      {t.title}
                    </h3>
                  </div>

                  {/* Chauffeur profile card */}
                  <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-850/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Driver Avatar with Status Badge */}
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow">
                          <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-amber-500 font-extrabold text-sm font-mono border border-neutral-950">
                            MR
                          </div>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 border border-neutral-950 shadow" title="Verified Gold Driver">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-wider block">
                            {t.driver}
                          </span>
                          <span className="text-[8px] bg-neutral-800 text-neutral-300 font-bold px-1 rounded">4.99 ★</span>
                        </div>
                        <p className="text-xs font-bold text-neutral-100 font-sans leading-tight mt-0.5">{booking.driverName || t.driverName}</p>
                        <p className="text-[10px] text-neutral-400 leading-none truncate mt-0.5">{t.driverRating}</p>
                        {booking.driverPhone && (
                          <p className="text-[10px] text-amber-400 font-mono font-bold mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{booking.driverPhone}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick call & chat buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {booking.driverPhone && (
                        <a
                          href={`tel:${booking.driverPhone}`}
                          className="bg-amber-500 hover:bg-amber-400 text-neutral-950 p-2 rounded-full font-bold transition-all shadow cursor-pointer"
                          title={`Call Chauffeur (${booking.driverPhone})`}
                        >
                          <Phone className="w-4 h-4 fill-current" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setTrackingTab("chat")}
                        className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 p-2 rounded-full text-neutral-300 hover:text-white transition-all cursor-pointer"
                        title="Chat Lounge"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Vehicle details & Safety PIN */}
                  <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-850/40 grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <span className="text-[8px] font-mono text-neutral-500 uppercase font-extrabold tracking-wider block">
                        {lang === "ca" ? "Vehicle Assignat" : "Assigned Vehicle"}
                      </span>
                      <p className="text-xs font-bold text-neutral-200 mt-0.5 truncate">{t.carInfo}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{t.carColor}</p>
                      <span className="inline-block bg-neutral-900 text-[10px] font-mono font-black text-amber-400 border border-neutral-800 px-1.5 py-0.5 rounded mt-1.5">
                        {t.plateNumber}
                      </span>
                    </div>

                    <div className="border-l border-neutral-850 pl-3 flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] font-mono text-neutral-500 uppercase font-extrabold tracking-wider block">
                          {t.verificationCode}
                        </span>
                        <p className="text-xs text-neutral-400 leading-tight mt-1">
                          {lang === "ca" ? "Verifiqueu el viatge amb en Marcos." : "Confirm your ride with Marcos."}
                        </p>
                      </div>
                      <p className="font-mono text-base font-extrabold tracking-widest text-emerald-400 leading-none mt-2">
                        5821
                      </p>
                    </div>
                  </div>

                  {/* Live Telemetry Display */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Distance Card */}
                    <div className="bg-neutral-950/85 p-3 rounded-xl border border-neutral-850/80 flex flex-col justify-center">
                      <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        {t.distance}
                      </span>
                      <span className="font-mono text-lg font-black text-amber-500 leading-none">
                        {formatDistance(realTimeDistance)}
                      </span>
                    </div>

                    {/* ETA Card */}
                    <div className="bg-neutral-950/85 p-3 rounded-xl border border-neutral-850/80 flex flex-col justify-center">
                      <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        {t.eta}
                      </span>
                      <span className="font-mono text-lg font-black text-emerald-500 leading-none">
                        {formatEta(etaMinutes, etaSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Transit Radio Updates */}
                  <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-850/50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-300 mb-1.5 uppercase font-mono tracking-wider">
                      <Compass className="w-3.5 h-3.5 text-amber-500 animate-[spin_10s_linear_infinite]" />
                      <span>{t.transitStatus}</span>
                    </div>
                    <p className="text-[10.5px] text-neutral-300 italic pl-4 border-l-2 border-amber-500/50 leading-relaxed font-sans">
                      "{currentStage.label}"
                    </p>
                  </div>

                  {/* Premium Location Mode Selector */}
                  <div className="bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-850/50 space-y-3">
                    <div className="text-left">
                      <p className="text-[10.5px] text-neutral-200 font-extrabold font-sans uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{lang === "ca" ? "Sincronització de Posició" : "Live Location Sync Mode"}</span>
                      </p>
                      <p className="text-[9.5px] text-neutral-400 leading-normal mt-1">
                        {lang === "ca"
                          ? "Trieu com es mapegen les coordenades GPS en temps real."
                          : "Configure how real-time GPS coordinates are captured and mapped."}
                      </p>
                      {geoError && <p className="text-[9.5px] text-rose-500 font-mono font-bold mt-1 bg-rose-950/20 p-1 px-2 rounded border border-rose-900/30">{geoError}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Passenger Mode */}
                      <button
                        type="button"
                        onClick={toggleDeviceTracking}
                        className={`text-left p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isWatchingDevice
                            ? "bg-amber-500/10 border-amber-500 text-white"
                            : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                        }`}
                      >
                        <p className="font-bold text-[10.5px]">Passenger POV</p>
                        <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">
                          {isWatchingDevice ? "📡 Live Blue Dot Active" : "Sync My Phone GPS"}
                        </p>
                      </button>

                      {/* Chauffeur Mode */}
                      <button
                        type="button"
                        onClick={toggleDeviceAsDriver}
                        className={`text-left p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          useDeviceAsDriver
                            ? "bg-emerald-500/10 border-emerald-500 text-white"
                            : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                        }`}
                      >
                        <p className="font-bold text-[10.5px]">Chauffeur POV</p>
                        <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">
                          {useDeviceAsDriver ? "🚗 Driving using My GPS" : "Act as Live Chauffeur"}
                        </p>
                      </button>
                    </div>

                    {useDeviceAsDriver && (
                      <div className="text-[9.5px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-lg leading-normal animate-pulse">
                        💡 <b>Chauffeur Mode Active:</b> Your actual device coordinates are now driving the S-Class in real time. Walk or drive around to see the car and route update!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: CHAUFFEUR LOUNGE CHAT */}
              {trackingTab === "chat" && (
                <div className="space-y-4 flex flex-col h-[380px] md:h-[430px]">
                  {/* Chat messages viewport */}
                  <div className="flex-1 overflow-y-auto bg-neutral-950/50 rounded-xl p-3 border border-neutral-850/60 space-y-3 min-h-0">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                      >
                        <div 
                          className={`p-2.5 rounded-2xl text-[11px] leading-relaxed font-sans ${
                            msg.sender === "user" 
                              ? "bg-amber-500 text-neutral-950 rounded-tr-sm font-semibold" 
                              : "bg-neutral-800 text-neutral-100 rounded-tl-sm border border-neutral-750"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[8px] font-mono text-neutral-500 mt-1 px-1">{msg.time}</span>
                      </div>
                    ))}
                    
                    {/* Typing indicator */}
                    {isChauffeurTyping && (
                      <div className="flex flex-col mr-auto items-start max-w-[85%]">
                        <div className="p-2.5 rounded-2xl rounded-tl-sm bg-neutral-800 border border-neutral-750 text-[11px] text-neutral-300 italic flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span>{t.typing}</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Suggested Messages quick buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-mono text-neutral-500 uppercase font-extrabold tracking-wider block">
                      {t.suggestedReplies}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {suggestedQuickReplies.map((replyText, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(replyText)}
                          className="text-[9.5px] bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-850 py-1 px-2.5 rounded-full text-neutral-300 hover:text-white transition-all cursor-pointer text-left"
                        >
                          {replyText}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(typedMessage);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      placeholder={t.sendPlaceholder}
                      className="flex-1 bg-neutral-950 border border-neutral-800 focus:outline-none focus:border-amber-500 rounded-lg py-1.5 px-3 text-xs text-white placeholder-neutral-550 font-sans transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!typedMessage.trim()}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-neutral-950 p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Actions and Progress bar */}
            <div className="space-y-4 pt-4 border-t border-neutral-800 mt-4 shrink-0">
              {/* Progress Track Line */}
              <div className="space-y-2">
                <div className="relative w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${displayProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-neutral-500 font-mono tracking-wider uppercase font-bold">
                  <span className={displayProgress >= 0 ? "text-amber-500" : ""}>{lang === "ca" ? "Sortida" : "Dispatch"}</span>
                  <span className={displayProgress >= 40 ? "text-amber-500" : ""}>{lang === "ca" ? "En Trànsit" : "Transit"}</span>
                  <span className={isArrived ? "text-emerald-500 font-extrabold" : ""}>{lang === "ca" ? "Arribat" : "Arrived"}</span>
                </div>
              </div>

              {/* Play / Pause / Warp controls */}
              <div className="flex items-center justify-between gap-2">
                {!isArrived ? (
                  <>
                    <button
                      type="button"
                      disabled={useDeviceAsDriver}
                      onClick={() => setActive(!active)}
                      className="flex-1 py-2 px-3 text-[10px] font-bold uppercase tracking-wider bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-200 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {useDeviceAsDriver ? (
                        <>
                          <Compass className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                          GPS Tracking Active
                        </>
                      ) : active ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-500" />
                          {t.pauseDriver}
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-amber-500" />
                          {t.trackDriver}
                        </>
                      )}
                    </button>
                    
                    {!useDeviceAsDriver && (
                      <button
                        type="button"
                        onClick={() => setProgress(p => Math.min(100, p + 25))}
                        className="px-2.5 py-2 text-[9.5px] font-mono font-bold text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-850 rounded hover:border-neutral-750 cursor-pointer transition-all shrink-0"
                      >
                        {t.warp}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full space-y-2.5">
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl flex gap-2 items-start">
                      <Sparkles className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <p className="text-[11px] font-bold text-emerald-300">{t.arrivedTitle}</p>
                        <p className="text-[9.5px] text-emerald-400/80 leading-normal mt-0.5">{t.arrivedDesc}</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        onCompleteTrip(booking.id);
                        onClose();
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase tracking-widest text-[11px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 border-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t.concludeVoyage}
                    </button>
                  </div>
                )}
              </div>

              {/* Reset simulator (visible if tracking or simulation modified) */}
              {!isArrived && !useDeviceAsDriver && progress > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full text-center text-[9px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer block mt-1 py-1"
                >
                  {t.resetGps}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
