import React from "react";
import { Sliders, ArrowRight } from "lucide-react";
import { Language, UI_TRANSLATIONS } from "../lib/translations";
import { Vehicle, SpecialPreference } from "../types";
import FleetSelector from "./FleetSelector";
import AmenitiesControl from "./AmenitiesControl";
import { motion } from "motion/react";

interface StepComfortProps {
  lang: Language;
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  bookingType: "distance" | "hourly";
  hourlyDuration: number;
  distanceKm: number;
  extraStopsCount: number;
  passengersCount: number;
  luggageCount: number;
  preferences: SpecialPreference;
  onUpdatePreferences: (prefs: Partial<SpecialPreference>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function StepComfort({
  lang,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  bookingType,
  hourlyDuration,
  distanceKm,
  extraStopsCount,
  passengersCount,
  luggageCount,
  preferences,
  onUpdatePreferences,
  onBack,
  onNext
}: StepComfortProps) {
  const t = UI_TRANSLATIONS[lang];
  const isCa = lang === "ca";

  return (
    <div className="space-y-8">
      {/* VEHICLE SELECTION PANEL */}
      <div className="bg-neutral-50/50 p-4 sm:p-6 rounded-lg border border-neutral-200 shadow-xs">
        <div className="border-b border-neutral-200 pb-3 mb-5">
          <h4 className="font-display-lg text-sm sm:text-base text-neutral-900 font-bold flex items-center gap-2">
            <span className="text-amber-600 font-black font-mono">1.</span>
            {isCa ? "Seleccioneu el vostre Vehicle d'Atelier" : "Select Your Bespoke Atelier Vehicle"}
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isCa
              ? "Trieu entre la nostra exclusiva flota d'executius d'alta gamma."
              : "Choose from our high-performance fleet. Tailored specifically for your party capacity."}
          </p>
        </div>

        <FleetSelector
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={onSelectVehicle}
          distanceKm={distanceKm}
          extraStopsCount={extraStopsCount}
          lang={lang}
          bookingType={bookingType}
          hourlyDuration={hourlyDuration}
          passengersCount={passengersCount}
          luggageCount={luggageCount}
          showPrices={true} // Prices are shown when ordering!
        />
      </div>

      {/* AMENITIES ENVIRONMENTAL CONTROLS */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-neutral-200 shadow-xs space-y-4">
        <div className="border-b border-neutral-150 pb-3">
          <h4 className="font-display-lg text-sm sm:text-base text-neutral-900 font-bold flex items-center gap-2">
            <span className="text-amber-600 font-black font-mono">2.</span>
            {isCa ? "Personalització de Confort de Cabina" : "Bespoke Cabin Comfort Personalization"}
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isCa
              ? "Estableix la teva atmosfera preferida, seguretat infantil i serveis de cabina."
              : "Pre-set your ideal cabin climate, child safety seats, and silent travel preferences."}
          </p>
        </div>

        <AmenitiesControl
          preferences={preferences}
          onChangePreferences={onUpdatePreferences}
          lang={lang}
        />
      </div>

      {/* STEP NAVIGATION BUTTONS */}
      <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-lg border border-neutral-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-bold rounded text-xs uppercase tracking-wider cursor-pointer"
        >
          ⬅ {isCa ? "Enrere" : "Back"}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 bg-neutral-900 border border-neutral-900 text-amber-400 hover:text-white font-bold rounded uppercase tracking-[0.15em] shadow-md cursor-pointer transition-all active:scale-95 text-xs text-center flex items-center gap-1.5 justify-center"
        >
          {isCa ? "Continuar al Pagament" : "Continue to Checkout"} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
