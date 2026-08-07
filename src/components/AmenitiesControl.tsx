import { useState } from "react";
import { 
  Thermometer, 
  Accessibility, 
  Plus, 
  Minus, 
  ShieldAlert, 
  Info 
} from "lucide-react";
import { SpecialPreference } from "../types";

import { Language, UI_TRANSLATIONS } from "../lib/translations";

interface AmenitiesControlProps {
  preferences: SpecialPreference;
  onChangePreferences: (updated: Partial<SpecialPreference>) => void;
  lang?: Language;
}

export default function AmenitiesControl({
  preferences,
  onChangePreferences,
  lang = "en",
}: AmenitiesControlProps) {
  const [showSriExclusions, setShowSriExclusions] = useState(false);
  const t = UI_TRANSLATIONS[lang];

  // Color scale for cabin thermal meter
  const getTempColor = (temp: number) => {
    if (temp < 19) return "from-cyan-500 to-blue-600";
    if (temp < 22) return "from-emerald-500 to-teal-600 font-semibold";
    return "from-amber-500 to-orange-600";
  };

  // Safe Fallback defaults for our optional fields
  const sriG0 = preferences.sriG0Quantity || 0;
  const sriG1 = preferences.sriG1Quantity || 0;
  const sriG23 = preferences.sriG23Quantity || 0;
  const totalSri = sriG0 + sriG1 + sriG23;

  const currentWheelchairType = preferences.wheelchairType || "none";
  const currentWheelchairQuantity = preferences.wheelchairQuantity || 0;

  // Handle SRI G0 Quantity change
  const adjustG0Quantity = (amount: number) => {
    const nextVal = Math.max(0, sriG0 + amount);
    const nextTotal = nextVal + sriG1 + sriG23;
    onChangePreferences({
      sriG0Quantity: nextVal,
      sriQuantity: nextTotal,
      sriGroup: nextTotal > 0 ? (nextVal > 0 ? "g0" : sriG1 > 0 ? "g1" : "g2_3") : "none",
      // Backwards compatibility
      infantSeat: nextTotal > 0
    });
  };

  // Handle SRI G1 Quantity change
  const adjustG1Quantity = (amount: number) => {
    const nextVal = Math.max(0, sriG1 + amount);
    const nextTotal = sriG0 + nextVal + sriG23;
    onChangePreferences({
      sriG1Quantity: nextVal,
      sriQuantity: nextTotal,
      sriGroup: nextTotal > 0 ? (sriG0 > 0 ? "g0" : nextVal > 0 ? "g1" : "g2_3") : "none",
      // Backwards compatibility
      infantSeat: nextTotal > 0
    });
  };

  // Handle SRI G23 Quantity change
  const adjustG23Quantity = (amount: number) => {
    const nextVal = Math.max(0, sriG23 + amount);
    const nextTotal = sriG0 + sriG1 + nextVal;
    onChangePreferences({
      sriG23Quantity: nextVal,
      sriQuantity: nextTotal,
      sriGroup: nextTotal > 0 ? (sriG0 > 0 ? "g0" : sriG1 > 0 ? "g1" : "g2_3") : "none",
      // Backwards compatibility
      infantSeat: nextTotal > 0
    });
  };

  // Handle Wheelchair Type selection
  const selectWheelchairType = (type: "folding" | "motorized" | "none") => {
    onChangePreferences({
      wheelchairType: type,
      wheelchairQuantity: type === "none" ? 0 : Math.max(1, currentWheelchairQuantity)
    });
  };

  // Handle Wheelchair Quantity change
  const adjustWheelchairQuantity = (amount: number) => {
    const nextVal = Math.max(0, currentWheelchairQuantity + amount);
    onChangePreferences({
      wheelchairQuantity: nextVal,
      wheelchairType: nextVal === 0 ? "none" : currentWheelchairType === "none" ? "folding" : currentWheelchairType
    });
  };

  return (
    <div className="space-y-4">
      {/* PART 1: EXECUTIVE CLASS UPGRADE & PREMIUM CABIN ADD-ONS */}
      <div className="bg-white rounded-lg p-4 md:p-5 border border-amber-500/25 shadow-sm space-y-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-700 font-bold">
            {lang === "ca" ? "PART 1: COMPLEMENTS DE CABINA EXECUTIVE" : "PART 1: EXECUTIVE CLASS UPGRADE"}
          </span>
          <h4 className="font-display-lg text-sm md:text-base text-neutral-900 font-bold mt-0.5">
            {lang === "ca" ? "Suplements Premium de Cabina de Passatgers" : "Premium Passenger Cabin Add-ons"}
          </h4>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {lang === "ca" 
              ? "Personalitza el teu trasllat de luxe amb els nostres exclusius serveis de confort."
              : "Further elevate your executive transport with our premier comfort features."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Airport Meet & Greet */}
          <button
            type="button"
            onClick={() => onChangePreferences({ airportMeetGreet: !preferences.airportMeetGreet })}
            className={`p-3.5 rounded border text-left transition-all flex flex-col justify-between cursor-pointer ${
              preferences.airportMeetGreet
                ? "border-amber-600 bg-amber-50/20 text-neutral-900 shadow-sm"
                : "border-neutral-200 bg-neutral-50/30 hover:border-neutral-300 text-neutral-600"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold block text-neutral-850 leading-tight">
                  {lang === "ca" ? "Benvinguda a l'Aeroport" : "Airport Meet & Greet"}
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-700 shrink-0 ml-1">+€20.00</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-2 leading-normal">
                {lang === "ca"
                  ? "El xofer l'espera a la sortida del vol amb un cartell digital personalitzat i l'acompanya pel camí VIP ràpid."
                  : "Chauffeur stands by at terminal gate with digital sign, handles luggage assist, and guides you through fast-track airport exit."}
              </p>
            </div>
            <div className="mt-3.5 flex items-center justify-between border-t border-neutral-100 pt-2 w-full">
              <span className="text-[8.5px] font-mono text-neutral-400">
                {preferences.airportMeetGreet ? "✓ SELECTED" : "SELECT TO UPGRADE"}
              </span>
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                preferences.airportMeetGreet ? "border-amber-600 bg-amber-600 text-white" : "border-neutral-300"
              }`}>
                {preferences.airportMeetGreet && <span className="text-[8px] font-bold">✓</span>}
              </div>
            </div>
          </button>

          {/* Target Cabin Temperature (with slider, no prices) */}
          <div className="p-3.5 rounded border border-neutral-200 bg-neutral-50/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold block text-neutral-850 leading-tight flex items-center gap-1">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  {lang === "ca" ? "TEMPERATURA DE CABINA" : "TARGET CABIN TEMPERATURE"}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-mono rounded bg-gradient-to-r ${getTempColor(preferences.targetTemp)} text-white font-bold shadow-sm`}>
                  {preferences.targetTemp.toFixed(1)} °C
                </span>
              </div>

              <input
                type="range"
                min="16"
                max="26"
                step="0.5"
                value={preferences.targetTemp}
                onChange={(e) => onChangePreferences({ 
                  targetTemp: parseFloat(e.target.value),
                  tempPreset: "custom"
                })}
                className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="flex justify-between text-[8px] font-mono font-bold text-neutral-400 mt-2">
              <span>❄️ {lang === "ca" ? "FRESC" : "COOL"} (16°C)</span>
              <span>{lang === "ca" ? "MITJÀ" : "MID"} (21°C)</span>
              <span>🔥 {lang === "ca" ? "CALENT" : "WARM"} (26°C)</span>
            </div>
          </div>

          {/* Premium Chilled Water Bottles Setup (let them select, but NO PRICES!) */}
          <button
            type="button"
            onClick={() => onChangePreferences({ beverages: !preferences.beverages })}
            className={`p-3.5 rounded border text-left transition-all flex flex-col justify-between cursor-pointer ${
              preferences.beverages
                ? "border-amber-600 bg-amber-50/20 text-neutral-900 shadow-sm"
                : "border-neutral-200 bg-neutral-50/30 hover:border-neutral-300 text-neutral-600"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold block text-neutral-850 leading-tight">
                  {lang === "ca" ? "Aigua Freda Premium" : "Chilled Water Bottles"}
                </span>
                <span className="text-[9.5px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wide">
                  {lang === "ca" ? "Cortesia" : "Complimentary"}
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-2 leading-normal">
                {lang === "ca"
                  ? "Ampolles de vidre de disseny amb aigua mineral freda col·locades al consola central preparades per al viatge."
                  : "Chilled premium mineral glass flasks prepared inside console central travel container for ultimate refreshment."}
              </p>
            </div>
            <div className="mt-3.5 flex items-center justify-between border-t border-neutral-100 pt-2 w-full">
              <span className="text-[8.5px] font-mono text-neutral-400">
                {preferences.beverages ? "✓ INCLUDED" : "SELECT OPTION"}
              </span>
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                preferences.beverages ? "border-amber-600 bg-amber-600 text-white" : "border-neutral-300"
              }`}>
                {preferences.beverages && <span className="text-[8px] font-bold">✓</span>}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* PART 2: MOBILITY ACCESSIBILITY & SRI SAFETY SELECTION */}
      <div className="bg-neutral-50 rounded-lg p-4 md:p-5 border border-neutral-200 shadow-sm space-y-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
            {lang === "ca" ? "PART 2: SUPORT A LA MOBILITAT I SEGURETAT (SRI)" : "PART 2: MOBILITY ACCESSIBILITY & SRI SAFETY SELECTION"}
          </span>
          <h4 className="font-display-lg text-sm md:text-base text-neutral-900 font-bold mt-0.5">
            {lang === "ca" ? "Sistemes de Seguretat i Accessibilitat" : "Safety Systems & Accessibility Features"}
          </h4>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {lang === "ca" 
              ? "Configureu la seguretat dels nens de forma reglada i les estructures d'ajuda per a cadires de rodes."
              : "Configure mandatory baby safety restraint accessories and premium active wheelchair integration structures."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Wheelchair Mobility Access Controls */}
          <div className="p-4 rounded-lg border border-neutral-200 bg-white space-y-3.5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <Accessibility className="w-4 h-4 text-amber-600" />
                    {t.wheelchairTitle}
                  </span>
                  <p className="text-[9.5px] text-neutral-450 mt-0.5">{t.wheelchairDesc}</p>
                </div>
                {currentWheelchairType !== "none" && (
                  <span className="text-[8px] bg-amber-500 text-neutral-950 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    {lang === "ca" ? "Actiu" : "Active"}
                  </span>
                )}
              </div>

              {/* Selector with exactly 2 Wheelchair versions */}
              <div className="grid grid-cols-2 gap-2">
                {/* Version 1: Folding Wheelchair */}
                <button
                  type="button"
                  onClick={() => selectWheelchairType("folding")}
                  className={`p-2.5 rounded border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    currentWheelchairType === "folding"
                      ? "border-amber-600 bg-amber-50/20 text-neutral-900"
                      : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-600"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold block text-neutral-850 leading-tight">{t.wheelchairOptionFoldable}</span>
                    <p className="text-[9px] text-neutral-500 mt-0.5 leading-normal">{lang === "ca" ? "Es desa al maleter." : "Trunk storage."}</p>
                  </div>
                  <div className="text-[8px] font-bold text-amber-700 uppercase tracking-wider mt-2 bg-amber-50 px-1 py-0.5 rounded w-max">
                    {lang === "ca" ? "Maleter" : "In trunk"}
                  </div>
                </button>

                {/* Version 2: Heavy / Motorized Active Ramp Cabin */}
                <button
                  type="button"
                  onClick={() => selectWheelchairType("motorized")}
                  className={`p-2.5 rounded border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    currentWheelchairType === "motorized"
                      ? "border-amber-600 bg-amber-50/20 text-neutral-900"
                      : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-600"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold block text-neutral-850 leading-tight">{t.wheelchairOptionMotorized}</span>
                    <p className="text-[9px] text-neutral-500 mt-0.5 leading-normal">{lang === "ca" ? "Rampa cabina." : "Cabin tie-down."}</p>
                  </div>
                  <div className="text-[8px] font-bold text-rose-700 uppercase tracking-wider mt-2 bg-rose-50 px-1 py-0.5 rounded w-max">
                    {lang === "ca" ? "Cabina *" : "Cabin *"}
                  </div>
                </button>
              </div>
            </div>

            {/* Quantity Controller & Requirement alerts */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{t.wheelchairQuantityLabel}:</span>
                <div className="flex items-center gap-1.5 bg-neutral-100 p-0.5 rounded border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => adjustWheelchairQuantity(-1)}
                    disabled={currentWheelchairQuantity === 0}
                    className="p-1 rounded bg-white border border-neutral-200 hover:border-neutral-300 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-2.5 h-2.5 text-neutral-600" />
                  </button>
                  <span className="text-xs font-mono font-bold w-4 text-center">{currentWheelchairQuantity}</span>
                  <button
                    type="button"
                    onClick={() => adjustWheelchairQuantity(1)}
                    disabled={currentWheelchairQuantity >= 2}
                    className="p-1 rounded bg-white border border-neutral-200 hover:border-neutral-300 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5 text-neutral-600" />
                  </button>
                </div>
              </div>

              {currentWheelchairType === "motorized" && (
                <p className="text-[8.5px] font-bold text-rose-700 leading-none flex items-center gap-0.5 shrink-0">
                  ⚠️ {lang === "ca" ? "Classe V VIP." : "VIP Mercedes."}
                </p>
              )}
            </div>
          </div>

          {/* Child Seats: Sistemas de Retención Infantil (SRI) */}
          <div className="p-4 rounded-lg border border-neutral-200 bg-white space-y-3.5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-amber-500 rounded-sm"></span>
                    {t.sriSafetySytem}
                  </span>
                  <p className="text-[9.5px] text-neutral-400 mt-0.5">{t.sriDescription}</p>
                </div>
                {totalSri > 0 && (
                  <span className="text-[8px] bg-amber-500 text-neutral-950 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    {totalSri} {totalSri === 1 ? t.seatLabelSingular : t.seatLabelPlural} (+€{(totalSri * 6).toFixed(0)})
                  </span>
                )}
              </div>

              {/* Compact Row-based SRI Group Selector */}
              <div className="space-y-1.5">
                {/* Group 0/0+ */}
                <div
                  className={`p-2 rounded border flex items-center justify-between gap-3 transition-all ${
                    sriG0 > 0
                      ? "border-blue-500 bg-blue-50/10 text-blue-900"
                      : "border-neutral-200 bg-neutral-50/30 text-neutral-600"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold block text-neutral-850 leading-tight">
                        {lang === "ca" ? "GRUPO 0 / 0+" : "GROUP 0 / 0+"}
                      </span>
                      <span className="text-[8.5px] text-neutral-500 block leading-none mt-0.5">
                        {lang === "ca" ? "0-13 kg (fins 18 m)" : "0-13 kg (up to 18 mths)"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[8.5px] font-mono font-medium text-neutral-400">€6/cad</span>
                    <div className="flex items-center gap-1 bg-white rounded border border-neutral-200 p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => adjustG0Quantity(-1)}
                        disabled={sriG0 === 0}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5 text-neutral-600" />
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center">{sriG0}</span>
                      <button
                        type="button"
                        onClick={() => adjustG0Quantity(1)}
                        disabled={totalSri >= 4}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 text-neutral-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Group 1 */}
                <div
                  className={`p-2 rounded border flex items-center justify-between gap-3 transition-all ${
                    sriG1 > 0
                      ? "border-amber-600 bg-amber-50/10 text-amber-950"
                      : "border-neutral-200 bg-neutral-50/30 text-neutral-600"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold block text-neutral-850 leading-tight">
                        GRUPO 1
                      </span>
                      <span className="text-[8.5px] text-neutral-500 block leading-none mt-0.5">
                        {lang === "ca" ? "9-18 kg (1 a 4 anys)" : "9-18 kg (1 to 4 years)"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[8.5px] font-mono font-medium text-neutral-400">€6/cad</span>
                    <div className="flex items-center gap-1 bg-white rounded border border-neutral-200 p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => adjustG1Quantity(-1)}
                        disabled={sriG1 === 0}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5 text-neutral-600" />
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center">{sriG1}</span>
                      <button
                        type="button"
                        onClick={() => adjustG1Quantity(1)}
                        disabled={totalSri >= 4}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 text-neutral-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Group 2/3 */}
                <div
                  className={`p-2 rounded border flex items-center justify-between gap-3 transition-all ${
                    sriG23 > 0
                      ? "border-emerald-600 bg-emerald-50/10 text-emerald-950"
                      : "border-neutral-200 bg-neutral-50/30 text-neutral-600"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold block text-neutral-850 leading-tight">
                        {lang === "ca" ? "GRUPO 2 i 3" : "GROUP 2 & 3"}
                      </span>
                      <span className="text-[8.5px] text-neutral-500 block leading-none mt-0.5">
                        {lang === "ca" ? "15-36 kg (4 a 12 anys)" : "15-36 kg (4 to 12 years)"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[8.5px] font-mono font-medium text-neutral-400">€6/cad</span>
                    <div className="flex items-center gap-1 bg-white rounded border border-neutral-200 p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => adjustG23Quantity(-1)}
                        disabled={sriG23 === 0}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5 text-neutral-600" />
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center">{sriG23}</span>
                      <button
                        type="button"
                        onClick={() => adjustG23Quantity(1)}
                        disabled={totalSri >= 4}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 text-neutral-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exclusions Toggle */}
            <div className="flex justify-end pt-2 border-t border-neutral-100 mt-2">
              <button
                type="button"
                onClick={() => setShowSriExclusions(!showSriExclusions)}
                className="text-[9px] font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> {t.sriExclusionsTitle}
              </button>
            </div>

            {/* Conditionally reveal exclusions / information */}
            {showSriExclusions && (
              <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[9px] text-amber-900 leading-normal space-y-1 mt-1.5">
                <p className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-700" /> {t.sriExclusionsSubtitle}
                </p>
                <p>{t.sriExclusionsList1}</p>
                <p className="font-medium text-amber-950 border-t border-amber-200/40 pt-1">
                  {t.sriExclusionsWarning}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliments Atelier notice - placed cleanly beneath the columns */}
      <div className="p-2.5 rounded border border-neutral-200 bg-neutral-100 text-[10px] text-neutral-600 leading-normal flex gap-2">
        <span className="text-amber-600 font-bold">ℹ</span>
        <div>
          {t.otherNotesCompliments} 
          {totalSri > 0 && <span className="font-semibold text-neutral-800"> {t.sriRateNote}</span>}
        </div>
      </div>
    </div>
  );
}
