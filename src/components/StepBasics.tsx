import React from "react";
import {
  MapPin,
  Clock,
  ArrowRight,
  Users,
  Briefcase,
  Luggage,
  Plane,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  Minus,
  ShieldCheck,
  Compass
} from "lucide-react";
import { Language } from "../lib/translations";

interface StepBasicsProps {
  lang: Language;
  bookingType: "distance" | "hourly";
  setBookingType: (type: "distance" | "hourly") => void;
  hourlyDuration: number;
  setHourlyDuration: (hours: number) => void;
  date: string;
  setDate: (date: string) => void;
  time: string;
  setTime: (time: string) => void;
  flightNumber: string;
  setFlightNumber: (val: string) => void;
  passengersCount: number;
  setPassengersCount: (count: number) => void;
  luggageCount: number;
  setLuggageCount: (count: number) => void;
  cabinLuggageCount: number;
  setCabinLuggageCount: (count: number) => void;
  onNext: () => void;
}

export default function StepBasics({
  lang,
  bookingType,
  setBookingType,
  hourlyDuration,
  setHourlyDuration,
  date,
  setDate,
  time,
  setTime,
  flightNumber,
  setFlightNumber,
  passengersCount,
  setPassengersCount,
  luggageCount,
  setLuggageCount,
  cabinLuggageCount,
  setCabinLuggageCount,
  onNext
}: StepBasicsProps) {
  const isCa = lang === "ca";
  const isEs = lang === "es";

  // Helper date presets generator
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const in2Days = new Date();
  in2Days.setDate(in2Days.getDate() + 2);
  const in2DaysStr = in2Days.toISOString().split("T")[0];

  // Translations dictionary
  const t = {
    title: isCa
      ? "Pas 1: Modalitat del Servei"
      : isEs
      ? "Paso 1: Modalidad del Servicio"
      : "Step 1: Service Mode & Schedule",
    
    // Distance / Point to Point
    p2pTitle: isCa ? "Trasllat Origen a Destí" : isEs ? "Traslado Punto a Punto" : "Point-to-Point Transfer",
    p2pTag: isCa ? "PREU TANCAT" : isEs ? "TARIFA FIJA" : "FIXED FARE",
    
    // Hourly Disposal
    hourlyTitle: isCa ? "Xòfer per Hores" : isEs ? "Chófer por Horas" : "Hourly Disposal Chauffeur",
    hourlyTag: isCa ? "A DISPOSICIÓ" : isEs ? "A DISPOSICIÓN" : "HOURLY DISPOSAL",

    // Date & Time
    serviceDate: isCa ? "Data" : isEs ? "Fecha" : "Date",
    today: isCa ? "Avui" : isEs ? "Hoy" : "Today",
    tomorrow: isCa ? "Demà" : isEs ? "Mañana" : "Tomorrow",
    in2Days: isCa ? "+2d" : isEs ? "+2d" : "+2d",
    
    pickupTime: isCa ? "Hora" : isEs ? "Hora" : "Pickup Time",
    flightCodeLabel: isCa ? "Vol / Tren" : isEs ? "Vuelo / Tren" : "Flight / Train Code",
    flightCodePlaceholder: "e.g., LH1810",

    // Hourly slider
    hireDuration: isCa ? "Durada" : isEs ? "Duración" : "Hire Duration",
    hoursUnit: isCa ? "h" : isEs ? "h" : "hrs",

    // Party & Luggage
    passengersLabel: isCa ? "Passatgers" : isEs ? "Pasajeros" : "Passengers",
    checkedLuggageLabel: isCa ? "Equipatge Gran" : isEs ? "Equipaje Grande" : "Large Bags",
    cabinLuggageLabel: isCa ? "Equipatge Cabina" : isEs ? "Equipaje Cabina" : "Cabin Bags",

    continueBtn: isCa ? "Continuar a Ruta" : isEs ? "Continuar a Ruta" : "Set Travel Route",
  };

  const currentHour = time ? time.split(":")[0] : "14";
  const currentMin = time ? time.split(":")[1] : "30";

  return (
    <div className="bg-white rounded-xl border border-neutral-250 shadow-lg p-4 sm:p-5 space-y-4 text-xs font-sans">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-150 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-mono font-extrabold uppercase bg-amber-500/15 text-amber-800 px-2 py-0.5 rounded border border-amber-300 shrink-0">
            {isCa ? "PAS 1/5" : isEs ? "PASO 1/5" : "STEP 1/5"}
          </span>
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight flex items-center gap-1.5">
            {t.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
          <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="text-neutral-800">
            {bookingType === "distance" ? t.p2pTitle : `${t.hourlyTitle} (${hourlyDuration}h)`}
          </span>
        </div>
      </div>

      {/* Service Type Selection Cards - Compact Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Point-to-Point */}
        <button
          type="button"
          onClick={() => setBookingType("distance")}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
            bookingType === "distance"
              ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40 shadow-2xs"
              : "border-neutral-200 hover:border-neutral-300 bg-white"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-md shrink-0 ${
                bookingType === "distance"
                  ? "bg-amber-500 text-neutral-950 font-bold"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              <MapPin className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-neutral-900 truncate">
                  {t.p2pTitle}
                </span>
                {bookingType === "distance" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-neutral-500 truncate">
                {isCa ? "Ruta directa de punt a punt" : isEs ? "Ruta directa punto a punto" : "Direct point-to-point transfer"}
              </p>
            </div>
          </div>
          <span
            className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase border shrink-0 ${
              bookingType === "distance"
                ? "bg-amber-500/20 text-amber-900 border-amber-300"
                : "bg-neutral-100 text-neutral-500 border-neutral-200"
            }`}
          >
            {t.p2pTag}
          </span>
        </button>

        {/* Hourly Hire */}
        <button
          type="button"
          onClick={() => setBookingType("hourly")}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
            bookingType === "hourly"
              ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40 shadow-2xs"
              : "border-neutral-200 hover:border-neutral-300 bg-white"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-md shrink-0 ${
                bookingType === "hourly"
                  ? "bg-amber-500 text-neutral-950 font-bold"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-neutral-900 truncate">
                  {t.hourlyTitle}
                </span>
                {bookingType === "hourly" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-neutral-500 truncate">
                {isCa ? "Xòfer dedicat amb parades lliures" : isEs ? "Chófer dedicado con paradas libres" : "Dedicated chauffeur with open stops"}
              </p>
            </div>
          </div>
          <span
            className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase border shrink-0 ${
              bookingType === "hourly"
                ? "bg-amber-500/20 text-amber-900 border-amber-300"
                : "bg-neutral-100 text-neutral-500 border-neutral-200"
            }`}
          >
            {t.hourlyTag}
          </span>
        </button>
      </div>

      {/* Date, Time, Flight/Duration - Compact Grid */}
      <div className="bg-neutral-50/90 rounded-lg p-3 border border-neutral-200 grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Date + Quick Presets */}
        <div className="sm:col-span-5 space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-600" />
              {t.serviceDate}
            </label>

            {/* Quick Date Presets */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded border transition-colors cursor-pointer ${
                  date === todayStr
                    ? "bg-neutral-900 text-amber-400 border-neutral-900"
                    : "bg-white text-neutral-600 border-neutral-250 hover:bg-neutral-100"
                }`}
              >
                {t.today}
              </button>
              <button
                type="button"
                onClick={() => setDate(tomorrowStr)}
                className={`px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded border transition-colors cursor-pointer ${
                  date === tomorrowStr
                    ? "bg-neutral-900 text-amber-400 border-neutral-900"
                    : "bg-white text-neutral-600 border-neutral-250 hover:bg-neutral-100"
                }`}
              >
                {t.tomorrow}
              </button>
              <button
                type="button"
                onClick={() => setDate(in2DaysStr)}
                className={`px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded border transition-colors cursor-pointer ${
                  date === in2DaysStr
                    ? "bg-neutral-900 text-amber-400 border-neutral-900"
                    : "bg-white text-neutral-600 border-neutral-250 hover:bg-neutral-100"
                }`}
              >
                {t.in2Days}
              </button>
            </div>
          </div>

          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white border border-neutral-300 py-1.5 px-2.5 text-xs font-bold font-mono text-neutral-900 focus:outline-none focus:border-amber-500 rounded-md shadow-2xs"
          />
        </div>

        {/* Pickup Time */}
        <div className="sm:col-span-4 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            {t.pickupTime}
          </label>

          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={currentHour}
              onChange={(e) => setTime(`${e.target.value}:${currentMin}`)}
              className="bg-white border border-neutral-300 py-1.5 px-2 text-xs font-bold font-mono text-neutral-900 focus:outline-none focus:border-amber-500 rounded-md shadow-2xs cursor-pointer"
            >
              {Array.from({ length: 24 }, (_, i) => {
                const hStr = String(i).padStart(2, "0");
                return (
                  <option key={i} value={hStr}>
                    {hStr}:00
                  </option>
                );
              })}
            </select>

            <select
              value={currentMin}
              onChange={(e) => setTime(`${currentHour}:${e.target.value}`)}
              className="bg-white border border-neutral-300 py-1.5 px-2 text-xs font-bold font-mono text-neutral-900 focus:outline-none focus:border-amber-500 rounded-md shadow-2xs cursor-pointer"
            >
              {["00", "15", "30", "45"].map((mStr) => (
                <option key={mStr} value={mStr}>
                  :{mStr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flight Number OR Hourly Stepper */}
        <div className="sm:col-span-3 space-y-1">
          {bookingType === "hourly" ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                  {t.hireDuration}
                </label>
                <span className="text-[10px] font-mono font-extrabold text-amber-800 bg-amber-500/20 px-1.5 py-0.2 rounded">
                  {hourlyDuration}h
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white border border-neutral-300 p-1 rounded-md shadow-2xs">
                <button
                  type="button"
                  onClick={() => setHourlyDuration(Math.max(2, hourlyDuration - 1))}
                  disabled={hourlyDuration <= 2}
                  className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono text-xs font-bold text-center flex-1">
                  {hourlyDuration} {t.hoursUnit}
                </span>
                <button
                  type="button"
                  onClick={() => setHourlyDuration(Math.min(24, hourlyDuration + 1))}
                  disabled={hourlyDuration >= 24}
                  className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1 mb-1">
                <Plane className="w-3 h-3 text-amber-600" />
                {t.flightCodeLabel}
              </label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder={t.flightCodePlaceholder}
                className="w-full bg-white border border-neutral-300 py-1.5 px-2 text-xs font-bold font-mono text-neutral-900 uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:border-amber-500 rounded-md shadow-2xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Party Size & Luggage Requirements - Compact Pill Counters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            {isCa ? "Passatgers i Equipatge" : isEs ? "Pasajeros y Equipaje" : "Party Size & Luggage"}
          </span>
          <span className="text-[10px] font-mono text-neutral-500 font-bold">
            {passengersCount} Pax • {luggageCount + cabinLuggageCount} Bags
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Passengers */}
          <div className="bg-neutral-50 p-2 rounded-md border border-neutral-200 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-neutral-800 block">
                {t.passengersLabel}
              </span>
              <span className="text-[9px] text-neutral-500 font-mono">
                {passengersCount <= 3 ? "Sedan (1-3)" : "VIP Van (4-8)"}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white border border-neutral-300 p-0.5 rounded shadow-2xs">
              <button
                type="button"
                onClick={() => setPassengersCount(Math.max(1, passengersCount - 1))}
                className="p-1 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center font-mono font-bold text-xs text-amber-700">
                {passengersCount}
              </span>
              <button
                type="button"
                onClick={() => setPassengersCount(Math.min(8, passengersCount + 1))}
                className="p-1 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Checked Luggage */}
          <div className="bg-neutral-50 p-2 rounded-md border border-neutral-200 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-neutral-800 block">
                {t.checkedLuggageLabel}
              </span>
              <span className="text-[9px] text-neutral-500 font-mono">Large (23kg)</span>
            </div>
            <div className="flex items-center gap-1 bg-white border border-neutral-300 p-0.5 rounded shadow-2xs">
              <button
                type="button"
                onClick={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                className="p-1 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center font-mono font-bold text-xs text-neutral-900">
                {luggageCount}
              </span>
              <button
                type="button"
                onClick={() => setLuggageCount(Math.min(8, luggageCount + 1))}
                className="p-1 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Cabin Luggage */}
          <div className="bg-neutral-50 p-2 rounded-md border border-neutral-200 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-neutral-800 block">
                {t.cabinLuggageLabel}
              </span>
              <span className="text-[9px] text-neutral-500 font-mono">Hand Bag (10kg)</span>
            </div>
            <div className="flex items-center gap-1 bg-white border border-neutral-300 p-0.5 rounded shadow-2xs">
              <button
                type="button"
                onClick={() => setCabinLuggageCount(Math.max(0, cabinLuggageCount - 1))}
                className="p-1 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center font-mono font-bold text-xs text-neutral-900">
                {cabinLuggageCount}
              </span>
              <button
                type="button"
                onClick={() => setCabinLuggageCount(Math.min(8, cabinLuggageCount + 1))}
                className="p-1 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Action Footer */}
      <div className="pt-2 border-t border-neutral-200 flex items-center justify-between gap-3">
        <div className="text-[10.5px] text-neutral-500 flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">
            {isCa
              ? "Pas 2: Adreces exactes d'origen i destí."
              : isEs
              ? "Paso 2: Direcciones exactas de origen y destino."
              : "Next: Specify origin and destination locations."}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!date) {
              alert(
                isCa
                  ? "Si us plau, seleccioneu una data."
                  : isEs
                  ? "Por favor, seleccione una fecha."
                  : "Please select a valid date."
              );
              return;
            }
            onNext();
          }}
          className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-850 text-amber-400 hover:text-amber-300 font-extrabold rounded-md uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 shrink-0"
        >
          <span>{t.continueBtn}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
