import React, { useState } from "react";
import { Compass, Trash2, ChevronUp, ChevronDown, X, ArrowUpDown, ArrowRight, MapPin, Navigation, MessageSquare, Sparkles, RotateCcw, Send, Globe, Brain } from "lucide-react";
import { Language, UI_TRANSLATIONS } from "../lib/translations";
import { WayPoint } from "../types";
import AddressInput from "./AddressInput";
import InteractiveMap from "./InteractiveMap";
import { motion, AnimatePresence } from "motion/react";

interface StepRouteProps {
  lang: Language;
  bookingType: "distance" | "hourly";
  pickup: string;
  setPickup: (val: string) => void;
  pickupCoords: { lat: number; lng: number } | null;
  setPickupCoords: (coords: { lat: number; lng: number } | null) => void;
  destination: string;
  setDestination: (val: string) => void;
  destinationCoords: { lat: number; lng: number } | null;
  setDestinationCoords: (coords: { lat: number; lng: number } | null) => void;
  extraStops: { address: string; coords: { lat: number; lng: number } }[];
  onAddStop: (address: string, coords: { lat: number; lng: number }) => void;
  onRemoveStop: (idx: number) => void;
  onMoveStop: (idx: number, dir: "up" | "down") => void;
  onClearStops: () => void;
  onSwapRoute: () => void;
  localizedSights: any[];
  selectedPresetSight: any;
  setSelectedPresetSight: (sight: any) => void;
  selectedTerminal: "T1" | "T2";
  setSelectedTerminal: (term: "T1" | "T2") => void;
  trafficStatus: "smooth" | "moderate" | "congested" | null;
  onBack: () => void;
  onNext: () => void;
  
  // AI Concierge
  chatMessages?: { role: "user" | "model"; content: string; groundingMetadata?: any }[];
  chatInput?: string;
  setChatInput?: (val: string) => void;
  isSendingChat?: boolean;
  onSendChatMessage?: (e?: React.FormEvent) => void;
  aiRecommendedStops?: { name: string; description: string; lat: number; lng: number }[];
  onResetChat?: () => void;
  useMapsGrounding?: boolean;
  setUseMapsGrounding?: (val: boolean) => void;
}

export default function StepRoute({
  lang,
  bookingType,
  pickup,
  setPickup,
  pickupCoords,
  setPickupCoords,
  destination,
  setDestination,
  destinationCoords,
  setDestinationCoords,
  extraStops,
  onAddStop,
  onRemoveStop,
  onMoveStop,
  onClearStops,
  onSwapRoute,
  localizedSights,
  selectedPresetSight,
  setSelectedPresetSight,
  selectedTerminal,
  setSelectedTerminal,
  trafficStatus,
  onBack,
  onNext,
  
  chatMessages = [],
  chatInput = "",
  setChatInput = () => {},
  isSendingChat = false,
  onSendChatMessage = () => {},
  aiRecommendedStops = [],
  onResetChat = () => {},
  useMapsGrounding = false,
  setUseMapsGrounding = () => {}
}: StepRouteProps) {
  const t = UI_TRANSLATIONS[lang];
  const isCa = lang === "ca";
  const [activeRouteTab, setActiveRouteTab] = useState<"manual" | "ai">("manual");

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-xl overflow-hidden">
      {/* Step Banner */}
      <div className="bg-neutral-950 p-3.5 px-4 md:p-4 md:px-6 flex justify-between items-center border-b border-amber-500/30 shadow-sm">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-500 animate-spin-slow" />
          <div>
            <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-white">
              {isCa ? "Planificador d'Itinerari Interactiu" : "Interactive Itinerary Voyage Planner"}
            </h3>
            <p className="text-[9px] md:text-[10px] text-amber-400 font-mono tracking-wider font-semibold">
              {isCa
                ? "Mapeig en temps real de les adreces personalitzades del client"
                : "Real-time custom passenger address route visualizer"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Form Controller */}
        <div className="lg:col-span-5 p-4 sm:p-5 md:p-6 border-b lg:border-b-0 lg:border-r border-neutral-100 flex flex-col justify-between space-y-4 md:space-y-5">
          <div className="space-y-4">
            {/* Tab Switcher */}
            <div className="flex bg-neutral-100 p-1 rounded border border-neutral-200">
              <button
                type="button"
                onClick={() => setActiveRouteTab("manual")}
                className={`flex-1 py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider rounded transition-all cursor-pointer text-center ${
                  activeRouteTab === "manual"
                    ? "bg-white text-neutral-900 shadow-sm font-extrabold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                🗺️ {isCa ? "Planificador Manual" : "Manual Routing"}
              </button>
              <button
                type="button"
                onClick={() => setActiveRouteTab("ai")}
                className={`flex-1 py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider rounded transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  activeRouteTab === "ai"
                    ? "bg-neutral-900 text-amber-400 shadow-sm font-extrabold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                {isCa ? "Concierge IA" : "AI Concierge"}
              </button>
            </div>

            {activeRouteTab === "manual" ? (
              <>
                {/* Connected Timeline Timeline */}
                <div className="relative pl-6 border-l-2 border-dashed border-amber-500/20 space-y-5 ml-2.5">
                  {/* Point A: Origin */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow flex items-center justify-center text-[8.5px] font-bold text-neutral-900">
                      A
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <AddressInput
                          id="pickup-address-input"
                          label={isCa ? "Procedència / Punt d'Origen:" : "Provenance / Point of Origin:"}
                          icon={<MapPin className="w-4 h-4 text-amber-600" />}
                          placeholder={isCa ? "Escriviu l'adreça de recollida de clients..." : "Enter passenger pickup address..."}
                          value={pickup}
                          onChange={(val, coords) => {
                            setPickup(val);
                            if (coords) setPickupCoords(coords);
                          }}
                          lang={lang}
                        />
                      </div>
                    </div>
                  </div>

                  {bookingType !== "hourly" && (
                    <>
                      {/* Swap button */}
                      <div className="flex justify-start -my-2">
                        <button
                          type="button"
                          onClick={onSwapRoute}
                          title={t.swapRoute}
                          className="bg-neutral-900 hover:bg-amber-500 text-amber-400 hover:text-neutral-900 border border-neutral-800 p-1.5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center -ml-[33px] z-10 cursor-pointer"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono text-neutral-400 font-bold ml-1 self-center tracking-wider">
                          {t.swapRoute}
                        </span>
                      </div>

                      {/* Point B: Destination */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow flex items-center justify-center text-[8.5px] font-bold text-white">
                          B
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <AddressInput
                              id="destination-address-input"
                              label={isCa ? "Portal / Destinació Final:" : "Portal / Ending Destination:"}
                              icon={<Navigation className="w-4 h-4 text-emerald-600" />}
                              placeholder={isCa ? "Escriviu l'adreça de destinació..." : "Enter passenger destination address..."}
                              value={destination}
                              onChange={(val, coords) => {
                                setDestination(val);
                               if (coords) setDestinationCoords(coords);
                              }}
                              lang={lang}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Quick Presets */}
                <div className="pt-2 bg-transparent border-t border-neutral-100">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                    {isCa ? "Planificació ràpida (Dreceres de Llocs):" : "Voyage Node Suggestions (Quick Presets):"}
                  </span>
                  <div className="flex overflow-x-auto gap-1.5 pb-2 scrollbar-none md:flex-wrap md:pb-0 -mx-1 px-1">
                    {localizedSights.slice(0, 6).map((s) => {
                      const isSelected = selectedPresetSight?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPresetSight(null);
                            } else {
                              setSelectedPresetSight(s);
                            }
                          }}
                          className={`text-[9.5px] px-2.5 py-1 rounded cursor-pointer transition-all border font-semibold shrink-0 ${
                            isSelected
                              ? "bg-amber-500 text-neutral-900 border-amber-600 shadow"
                              : "bg-neutral-100 hover:bg-amber-50 hover:text-amber-800 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Preset Sight actions Panel */}
                  <AnimatePresence>
                    {selectedPresetSight && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2.5 bg-amber-50/70 border border-amber-500/20 p-3 rounded-lg overflow-hidden shadow-inner"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-900">
                            {isCa ? "Ubicació Seleccionada:" : "Configuring Location:"}
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedPresetSight(null)}
                            className="text-amber-800 hover:text-amber-950"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-[#111111] leading-tight mb-2 truncate">
                          {selectedPresetSight.id === "el-prat"
                            ? (selectedTerminal === "T1"
                              ? (isCa ? "Aeroport de Barcelona-El Prat (Terminal 1 - T1)" : "Barcelona-El Prat Airport (Terminal 1 - T1)")
                              : (isCa ? "Aeroport de Barcelona-El Prat (Terminal 2 - T2)" : "Barcelona-El Prat Airport (Terminal 2 - T2)"))
                            : selectedPresetSight.name}
                        </h4>

                        {selectedPresetSight.id === "el-prat" && (
                          <div className="mb-3 p-2 bg-white/80 border border-amber-500/15 rounded-md">
                            <span className="text-[10px] font-bold text-neutral-600 block mb-1">
                              {isCa ? "Seleccioneu Terminal de l'Aeroport:" : "Select Airport Terminal:"}
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedTerminal("T1")}
                                className={`flex-1 py-1 px-2 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                  selectedTerminal === "T1"
                                    ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-amber-50 hover:text-amber-800"
                                }`}
                              >
                                Terminal 1 (T1)
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedTerminal("T2")}
                                className={`flex-1 py-1 px-2 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                  selectedTerminal === "T2"
                                    ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-amber-50 hover:text-amber-800"
                                }`}
                              >
                                Terminal 2 (T2)
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              let finalName = selectedPresetSight.name;
                              let finalCoords = { lat: selectedPresetSight.lat, lng: selectedPresetSight.lng };
                              if (selectedPresetSight.id === "el-prat") {
                                if (selectedTerminal === "T1") {
                                  finalName = "Barcelona-El Prat Airport Terminal 1 (T1)";
                                  finalCoords = { lat: 41.2878, lng: 2.0733 };
                                } else {
                                  finalName = "Barcelona-El Prat Airport Terminal 2 (T2)";
                                  finalCoords = { lat: 41.3032, lng: 2.0784 };
                                }
                              }
                              setPickup(finalName);
                              setPickupCoords(finalCoords);
                              setSelectedPresetSight(null);
                            }}
                            className="text-[9.5px] font-bold bg-amber-600 text-white hover:bg-amber-700 py-1 px-1.5 rounded transition shadow-sm cursor-pointer"
                          >
                            📍 {t.setOrigin}
                          </button>
                          <button
                            type="button"
                            disabled={bookingType === "hourly"}
                            onClick={() => {
                              let finalName = selectedPresetSight.name;
                              let finalCoords = { lat: selectedPresetSight.lat, lng: selectedPresetSight.lng };
                              if (selectedPresetSight.id === "el-prat") {
                                if (selectedTerminal === "T1") {
                                  finalName = "Barcelona-El Prat Airport Terminal 1 (T1)";
                                  finalCoords = { lat: 41.2878, lng: 2.0733 };
                                } else {
                                  finalName = "Barcelona-El Prat Airport Terminal 2 (T2)";
                                  finalCoords = { lat: 41.3032, lng: 2.0784 };
                                }
                              }
                              onAddStop(finalName, finalCoords);
                              setSelectedPresetSight(null);
                            }}
                            className="text-[9.5px] font-bold bg-neutral-900 text-amber-400 hover:bg-neutral-800 py-1 px-1.5 rounded transition shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            ⏱️ {t.addAsStop}
                          </button>
                          <button
                            type="button"
                            disabled={bookingType === "hourly"}
                            onClick={() => {
                              let finalName = selectedPresetSight.name;
                              let finalCoords = { lat: selectedPresetSight.lat, lng: selectedPresetSight.lng };
                              if (selectedPresetSight.id === "el-prat") {
                                if (selectedTerminal === "T1") {
                                  finalName = "Barcelona-El Prat Airport Terminal 1 (T1)";
                                  finalCoords = { lat: 41.2878, lng: 2.0733 };
                                } else {
                                  finalName = "Barcelona-El Prat Airport Terminal 2 (T2)";
                                  finalCoords = { lat: 41.3032, lng: 2.0784 };
                                }
                              }
                              setDestination(finalName);
                              setDestinationCoords(finalCoords);
                              setSelectedPresetSight(null);
                            }}
                            className="text-[9.5px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 py-1 px-1.5 rounded transition shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            🏁 {t.setDestination}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Extra stops Waypoints list */}
                {bookingType !== "hourly" && (
                  <div className="space-y-1.5 pt-2.5 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        {isCa ? "Parades Entres del Camí:" : "Waypoints / Extra Address Stops:"}
                      </label>
                      {extraStops.length > 0 && (
                        <button
                          type="button"
                          onClick={onClearStops}
                          className="text-[9px] font-extrabold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer focus:outline-none"
                        >
                          <Trash2 className="w-3 h-3" />
                          {isCa ? "Netejar Parades" : "Clear All Stops"}
                        </button>
                      )}
                    </div>

                    {extraStops.length > 0 && (
                      <div className="space-y-1.5 mb-2.5 max-h-[150px] overflow-y-auto pr-1">
                        {extraStops.map((stop, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-neutral-50 p-2.5 rounded border border-neutral-200 shadow-sm transition-all"
                          >
                            <span className="text-xs text-neutral-700 font-semibold truncate pr-2 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-neutral-900 text-amber-400 flex items-center justify-center text-[8px] font-bold shrink-0">
                                {idx + 1}
                              </span>
                              <span className="truncate">{stop.address}</span>
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => onMoveStop(idx, "up")}
                                className="text-neutral-400 hover:text-amber-600 disabled:opacity-35 transition-colors p-1"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === extraStops.length - 1}
                                onClick={() => onMoveStop(idx, "down")}
                                className="text-neutral-400 hover:text-amber-600 disabled:opacity-35 transition-colors p-1"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onRemoveStop(idx)}
                                className="text-neutral-400 hover:text-red-500 transition-colors p-1 ml-0.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Waypoint inline field */}
                    <div className="bg-neutral-50/50 p-2 rounded-lg border border-neutral-200 shadow-inner">
                      <AddressInput
                        label={isCa ? "+ Afegir Parada de Camí:" : "+ Add Waypoint Stop Address:"}
                        icon={<Compass className="w-4 h-4 text-neutral-500" />}
                        placeholder={isCa ? "Escriviu l'adreça de la parada..." : "Type custom stop address..."}
                        value=""
                        onChange={(val, coords) => {
                          if (val && coords) onAddStop(val, coords);
                        }}
                        lang={lang}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col space-y-3">
                {/* Status Bar */}
                <div className="bg-neutral-900 text-white rounded p-3 flex items-center justify-between border border-neutral-800 shadow-md">
                  <div className="flex items-center gap-2">
                    {useMapsGrounding ? (
                      <Globe className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                    ) : (
                      <Brain className="w-4 h-4 text-amber-500" />
                    )}
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                        {isCa ? "MÈTODE DE CERCA" : "SEARCH MODE"}
                      </p>
                      <p className="text-[10px] font-bold text-white leading-none mt-0.5">
                        {useMapsGrounding 
                          ? (isCa ? "Google Maps en temps real" : "Google Maps Live Data") 
                          : (isCa ? "Pensament profund (gemini-3.1-pro)" : "Deep Thinking (gemini-3.1-pro)")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8.5px] font-mono text-neutral-400 uppercase tracking-wider">{isCa ? "Dades en viu" : "Live data"}</span>
                    <button
                      type="button"
                      onClick={() => setUseMapsGrounding(!useMapsGrounding)}
                      className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        useMapsGrounding ? "bg-emerald-500" : "bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          useMapsGrounding ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Chat window stream */}
                <div className="border border-neutral-200 rounded-md bg-neutral-50 h-[220px] overflow-y-auto p-3 space-y-3 flex flex-col">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === "user" ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded text-[11px] leading-relaxed shadow-xs ${
                          msg.role === "user"
                            ? "bg-amber-500 text-neutral-950 font-semibold rounded-br-none"
                            : "bg-white text-neutral-800 border border-neutral-200 rounded-bl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* Grounding links if any */}
                        {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-neutral-100 space-y-1">
                            <p className="text-[8.5px] font-mono text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Globe className="w-3 h-3 text-emerald-500" />
                              {isCa ? "Surts de dades (Google Maps):" : "Verified Sources (Google Maps):"}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {msg.groundingMetadata.groundingChunks.map((chunk: any, cidx: number) => {
                                const uri = chunk.web?.uri || chunk.maps?.uri;
                                const title = chunk.web?.title || chunk.maps?.title || "Maps Source";
                                if (!uri) return null;
                                return (
                                  <a
                                    key={cidx}
                                    href={uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-700 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 rounded px-1.5 py-0.5 text-[8px] font-mono transition"
                                  >
                                    📍 {title}
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isSendingChat && (
                    <div className="self-start flex items-center gap-1.5 bg-white border border-neutral-200 rounded p-2 text-[10px] text-neutral-400 font-mono shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-150" />
                      <span>{isCa ? "El xòfer de Majestic responent..." : "Majestic Concierge composing..."}</span>
                    </div>
                  )}
                </div>

                {/* Recommendations stop suggestions */}
                {aiRecommendedStops.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9.5px] font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {isCa ? "Parades Recomanades per la IA:" : "AI Recommended Luxury Stops:"}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {aiRecommendedStops.map((stop, idx) => (
                        <div
                          key={idx}
                          className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded p-2 flex justify-between items-center transition"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-[10.5px] font-bold text-neutral-900 truncate">{stop.name}</p>
                            <p className="text-[9.5px] text-neutral-500 leading-tight line-clamp-1 mt-0.5">{stop.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onAddStop(stop.name, { lat: stop.lat, lng: stop.lng });
                            }}
                            className="text-[9px] font-bold bg-neutral-900 hover:bg-neutral-850 text-amber-400 py-1 px-2 rounded-sm cursor-pointer whitespace-nowrap transition"
                          >
                            + {isCa ? "Afegir" : "Add Stop"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input row */}
                <form onSubmit={onSendChatMessage} className="flex gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={
                        isCa 
                          ? "Pregunteu al concierge (vins, monuments, Michelin...)" 
                          : "Ask the concierge (wineries, sights, dining...)"
                      }
                      className="w-full bg-white border border-neutral-250 focus:border-amber-500/50 rounded p-2 pr-8 text-[11px] placeholder-neutral-400 focus:outline-none transition-all shadow-xs"
                      disabled={isSendingChat}
                    />
                    <button
                      type="button"
                      onClick={onResetChat}
                      title={isCa ? "Reiniciar Conversa" : "Reset Conversation"}
                      className="absolute right-2 top-2.5 text-neutral-400 hover:text-red-500 cursor-pointer transition-colors focus:outline-none"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingChat || !chatInput.trim()}
                    className="bg-neutral-900 hover:bg-neutral-850 disabled:bg-neutral-200 text-amber-400 disabled:text-neutral-400 px-3.5 rounded flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-neutral-100 flex justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-bold rounded text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              ⬅ {isCa ? "Enrere" : "Back"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!pickup) {
                  alert(isCa ? "Si us plau, especifiqueu el punt d'origen." : "Please specify point of origin.");
                  return;
                }
                if (bookingType !== "hourly" && !destination) {
                  alert(isCa ? "Si us plau, especifiqueu la destinació final." : "Please specify ending destination.");
                  return;
                }
                onNext();
              }}
              className="px-5 py-2.5 bg-neutral-900 border border-neutral-900 text-amber-400 hover:text-white font-bold rounded uppercase tracking-wider text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isCa ? "Generar Itinerari" : "Generate Itinerary"} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Live Map Canvas */}
        <div className="lg:col-span-7 bg-[#fcfbf9] p-2 flex flex-col relative">
          <div className="min-h-[300px] md:min-h-[440px] relative rounded-b-lg lg:rounded-b-none lg:rounded-r-lg overflow-hidden border-t lg:border-t-0 border-neutral-100">
            <InteractiveMap
              pickupVal={pickup}
              pickupCoords={pickupCoords}
              destinationVal={destination}
              destinationCoords={destinationCoords}
              extraStopsList={extraStops}
              onSelectCoordinates={(role, coords, address) => {
                onAddStop(address, coords);
              }}
              lang={lang}
              trafficStatus={trafficStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
