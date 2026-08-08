import React, { useEffect, useRef, useState } from "react";
import { Map as MapIcon } from "lucide-react";
import L from "leaflet";

interface Coordinates {
  lat: number;
  lng: number;
  label?: string;
}

interface InteractiveMapProps {
  pickupVal: string;
  pickupCoords: Coordinates | null;
  destinationVal: string;
  destinationCoords: Coordinates | null;
  extraStopsList: { address: string; coords: Coordinates }[];
  onSelectCoordinates?: (role: "pickup" | "destination" | "stop", coords: Coordinates, address: string) => void;
  lang?: "en" | "ca" | "es";
  trafficStatus?: "smooth" | "moderate" | "congested" | null;
}

export interface CoordColor {
  bg: string;
  accent: string;
  glow: string;
}

export const getCoordinateColor = (lat: number, lng: number, type: "pickup" | "destination" | "waypoint"): CoordColor => {
  if (type === "pickup") {
    return {
      bg: "#ca8a04", // Luxurious Velvet Gold
      accent: "#854d0e",
      glow: "rgba(202, 138, 4, 0.4)",
    };
  }
  if (type === "destination") {
    return {
      bg: "#991b1b", // Elegant Royal Burgundy / Crimson
      accent: "#7f1d1d",
      glow: "rgba(153, 27, 27, 0.4)",
    };
  }

  // Deterministically allocate gorgeous custom palettes based on lat/lng coordinates
  const latFactor = Math.abs(lat * 10000) % 360;
  const lngFactor = Math.abs(lng * 10000) % 360;
  const factor = Math.floor((latFactor + lngFactor) * 13) % 6;

  const colors: CoordColor[] = [
    { bg: "#1e3a8a", accent: "#172554", glow: "rgba(30, 58, 138, 0.3)" }, // Royal Sapphire Blue
    { bg: "#b45309", accent: "#7c2d12", glow: "rgba(180, 83, 9, 0.3)" }, // Warm Amber Gold
    { bg: "#581c87", accent: "#3b0764", glow: "rgba(88, 28, 135, 0.3)" }, // Velvet Plum
    { bg: "#065f46", accent: "#022c22", glow: "rgba(6, 95, 70, 0.3)" }, // Emerald Forest
    { bg: "#0369a1", accent: "#0c4a6e", glow: "rgba(3, 105, 161, 0.3)" }, // Classic Ocean Blue
    { bg: "#c2410c", accent: "#7c2d12", glow: "rgba(194, 65, 12, 0.3)" }, // Spanish Terracotta
  ];

  return colors[factor];
};

export default function InteractiveMap({
  pickupVal,
  pickupCoords,
  destinationVal,
  destinationCoords,
  extraStopsList,
  lang = "en",
  trafficStatus = "smooth",
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // Cleanup Leaflet map on unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {
          console.warn("Leaflet map cleanup failed:", e);
        }
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Leaflet map initialization and updates
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already done
    if (!leafletMapRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
      try {
        leafletMapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: false, // Prevent accidental scrolling while browsing the page
          touchZoom: "center", // Smoother touch zoom centered
        }).setView([41.3879, 2.1699], 12);

        // CartoDB Voyager - beautiful, warm, sleek minimalist map tiles
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 20,
          }
        ).addTo(leafletMapRef.current);
      } catch (e) {
        console.warn("[MAJESTIC] Leaflet map initialization caught exception:", e);
      }
    }

    const mapInstance = leafletMapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Clear old route line
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const pointsToFit: L.LatLngTuple[] = [];

    // Generate Custom SVG Markers to match the Velvet theme beautifully
    const createCustomIcon = (colorData: CoordColor, numCode: string, label: string) => {
      return L.divIcon({
        html: `
          <div class="relative flex flex-col items-center justify-center -translate-y-4">
            <div class="absolute w-2.5 h-2.5 rounded-full animate-ping opacity-75" style="background-color: ${colorData.bg}"></div>
            <div class="absolute w-2 h-2 rounded-full" style="background-color: ${colorData.bg}; box-shadow: 0 0 10px 4px ${colorData.glow}"></div>
            <div class="relative w-8 h-10 flex flex-col items-center justify-center bg-white rounded-t-full rounded-b-2xl shadow-xl border-2 transition-transform duration-300 hover:scale-110" style="border-color: ${colorData.bg}">
              <div class="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white" style="background-color: ${colorData.bg}">
                ${numCode}
              </div>
              <div class="absolute bottom-[-5px] w-2 h-2 rotate-45 bg-white border-r-2 border-b-2" style="border-color: ${colorData.bg}"></div>
            </div>
            <div class="absolute bottom-[-24px] whitespace-nowrap bg-white text-neutral-850 text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-md border border-neutral-200/80 flex items-center gap-1.5 animate-fade-in">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${colorData.bg}"></span>
              <span style="color: ${colorData.bg}">${label.slice(0, 16)}${label.length > 16 ? "..." : ""}</span>
            </div>
          </div>
        `,
        className: "",
        iconSize: [32, 48],
        iconAnchor: [16, 40],
      });
    };

    // 1. Add Pickup Marker
    if (pickupCoords) {
      const pLatLng: L.LatLngTuple = [pickupCoords.lat, pickupCoords.lng];
      pointsToFit.push(pLatLng);
      const colorData = getCoordinateColor(pickupCoords.lat, pickupCoords.lng, "pickup");
      const m = L.marker(pLatLng, {
        icon: createCustomIcon(colorData, "A", pickupVal || (lang === "ca" ? "Origen" : "Pickup")),
      })
        .addTo(mapInstance)
        .bindPopup(`<b>${lang === "ca" ? "Origen" : "Pickup"}:</b><br/>${pickupVal || "Custom Address"}`);
      markersRef.current.push(m);
    }

    // 2. Add Stop Waypoints Markers
    extraStopsList.forEach((stop, idx) => {
      if (stop.coords) {
        const sLatLng: L.LatLngTuple = [stop.coords.lat, stop.coords.lng];
        pointsToFit.push(sLatLng);
        const colorData = getCoordinateColor(stop.coords.lat, stop.coords.lng, "waypoint");
        const m = L.marker(sLatLng, {
          icon: createCustomIcon(colorData, `${idx + 1}`, stop.address || `Stop ${idx + 2}`),
        })
          .addTo(mapInstance)
          .bindPopup(`<b>${lang === "ca" ? "Parada" : "Stop"} #${idx + 1}:</b><br/>${stop.address}`);
        markersRef.current.push(m);
      }
    });

    // 3. Add Destination Marker
    if (destinationCoords) {
      const dLatLng: L.LatLngTuple = [destinationCoords.lat, destinationCoords.lng];
      pointsToFit.push(dLatLng);
      const colorData = getCoordinateColor(destinationCoords.lat, destinationCoords.lng, "destination");
      const m = L.marker(dLatLng, {
        icon: createCustomIcon(colorData, "Z", destinationVal || (lang === "ca" ? "Destinació" : "Destination")),
      })
        .addTo(mapInstance)
        .bindPopup(`<b>${lang === "ca" ? "Destinació" : "Destination"}:</b><br/>${destinationVal || "Custom Address"}`);
      markersRef.current.push(m);
    }

    // Fit bounds seamlessly containing all coordinates
    if (pointsToFit.length > 0) {
      mapInstance.invalidateSize();
      if (pointsToFit.length === 1) {
        mapInstance.setView(pointsToFit[0], 14);
      } else {
        mapInstance.fitBounds(pointsToFit, { padding: [50, 50] });
      }

      // Fetch dynamic OSRM street route driving line
      const fetchRoutePolyline = async () => {
        const allPoints = [
          pickupCoords,
          ...extraStopsList.map((s) => s.coords),
          destinationCoords,
        ].filter(Boolean) as Coordinates[];

        if (allPoints.length < 2) return;

        const urlString = allPoints.map((p) => `${p.lng},${p.lat}`).join(";");
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${urlString}?overview=full&geometries=geojson`);
          if (res.ok) {
            const data = await res.json();
            if (data.routes && data.routes[0]) {
              const polyCoords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);

              // Get dynamic traffic color
              const routeLineColor =
                trafficStatus === "smooth"
                  ? "#10b981"
                  : trafficStatus === "moderate"
                  ? "#ca8a04"
                  : trafficStatus === "congested"
                  ? "#dc2626"
                  : "#d97706";

              // Draw gorgeous solid gold or traffic-coded route line
              polylineRef.current = L.polyline(polyCoords, {
                color: routeLineColor,
                weight: 5,
                opacity: 0.85,
                lineJoin: "round",
              }).addTo(mapInstance);
              return;
            }
          }
        } catch (err) {
          console.warn("OSRM street route retrieval failed, falling back to straight path line");
        }

        const fallbackLineColor =
          trafficStatus === "smooth"
            ? "#10b981"
            : trafficStatus === "moderate"
            ? "#ca8a04"
            : trafficStatus === "congested"
            ? "#dc2626"
            : "#d97706";

        // Draw direct straight lines if OSRM fails
        polylineRef.current = L.polyline(
          allPoints.map((p) => [p.lat, p.lng]),
          {
            color: fallbackLineColor,
            weight: 3,
            dashArray: "6, 8",
            opacity: 0.75,
            lineJoin: "round",
          }
        ).addTo(mapInstance);
      };

      fetchRoutePolyline();
    }
  }, [pickupCoords, destinationCoords, extraStopsList, pickupVal, destinationVal, lang, trafficStatus]);

  return (
    <div className="relative w-full h-[260px] xs:h-[300px] sm:h-[360px] md:h-[420px] lg:h-full lg:min-h-[500px] border border-neutral-200 shadow-xl rounded-xl overflow-hidden bg-white flex flex-col">
      {/* Map Control Headers */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 max-w-[90%]">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/95 text-amber-400 text-[10px] font-mono rounded-full font-bold shadow-md border border-neutral-800">
          <MapIcon className="w-3.5 h-3.5 animate-pulse" />
          Majestic Live Map
        </span>
      </div>

      <div className="flex-1 w-full relative">
        <div className="w-full h-full relative" id="leaflet-map-element">
          <div ref={mapContainerRef} className="w-full h-full" style={{ outline: "none" }} />
        </div>
      </div>

      {/* Map helper footer message overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] pointer-events-none">
        <span className="bg-neutral-900/90 backdrop-blur-md text-[9px] font-mono tracking-wider uppercase text-amber-400 px-3 py-2 rounded-lg shadow-lg border border-neutral-800 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {lang === "ca" ? "Ruta Activa • Mode Lector" : "Active Route • Reader Mode"}
        </span>
      </div>
    </div>
  );
}
