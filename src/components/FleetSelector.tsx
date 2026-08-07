import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Briefcase, Zap, Check, Crown } from "lucide-react";
import { Vehicle, VehicleCategory } from "../types";
import { Language, UI_TRANSLATIONS } from "../lib/translations";

export const getVehicleTierInfo = (v: Vehicle) => {
  if (v.displayCategory) {
    return {
      en: v.displayCategory.toUpperCase(),
      ca: v.displayCategory.toUpperCase()
    };
  }
  if (v.id === "mercedes-e300e") {
    return {
      en: "BUSINESS CLASS",
      ca: "CLASSE BUSINESS"
    };
  }
  if (v.id === "tesla-model-3" || v.id === "tesla-3") {
    return {
      en: "GREEN EXECUTIVE",
      ca: "GREEN EXECUTIVE"
    };
  }
  if (v.id === "mercedes-v-class" || v.id === "mercedes-v300") {
    return {
      en: "VIP JET CLASS",
      ca: "CLASSE VIP JET"
    };
  }
  return {
    en: "STANDARD",
    ca: "ESTÀNDARD"
  };
};

export const getButtonText = (v: Vehicle, isSelected: boolean, lang: Language) => {
  const isCa = lang === "ca";
  if (isSelected) {
    return isCa ? "SELECCIÓ ACTUAL" : "CURRENT SELECTION";
  }
  
  if (v.id === "mercedes-e300e") {
    return isCa ? "SELECCIONAR BUSINESS CLASS" : "SELECT BUSINESS CLASS";
  }
  if (v.id === "tesla-model-3" || v.id === "tesla-3") {
    return isCa ? "SELECCIONAR GREEN EXECUTIVE" : "SELECT GREEN EXECUTIVE";
  }
  if (v.id === "mercedes-v-class" || v.id === "mercedes-v300") {
    return isCa ? "SELECCIONAR VIP JET CLASS" : "SELECT VIP JET CLASS";
  }
  if (v.id === "taxi-1-4-pax") {
    return isCa ? "SELECCIONAR TAXI 1-4 PAX" : "SELECT TAXI 1-4 PAX";
  }
  if (v.id === "taxi-vans-4-8-pax") {
    return isCa ? "SELECCIONAR TAXI VANS 4-8 PAX" : "SELECT TAXI VANS 4-8 PAX";
  }
  
  const tier = getVehicleTierInfo(v);
  const tierLabel = isCa ? tier.ca : tier.en;
  return isCa ? `SELECCIONAR ${tierLabel}` : `SELECT ${tierLabel}`;
};

const ExpandableDescription = ({ text, lang }: { text: string; lang: Language }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const limit = 85;
  const isLong = text.length > limit;

  if (!isLong) {
    return (
      <p className="text-[10.5px] sm:text-xs text-neutral-700 leading-normal mb-2 sm:mb-3 font-medium">
        {text}
      </p>
    );
  }

  const displayText = isExpanded ? text : `${text.slice(0, limit)}`;

  return (
    <p className="text-[10.5px] sm:text-xs text-neutral-700 leading-normal mb-2 sm:mb-3 font-medium">
      {displayText}
      {!isExpanded && "..."}{" "}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Avoid triggering vehicle card selection
          setIsExpanded(!isExpanded);
        }}
        className="text-amber-700 hover:text-amber-900 font-bold ml-1 inline-block text-[9.5px] sm:text-[10.5px] tracking-wide hover:underline cursor-pointer focus:outline-none"
      >
        {isExpanded 
          ? (lang === "ca" ? "Llegir menys ▲" : "Read Less ▲") 
          : (lang === "ca" ? "Llegir més ▼" : "Read More ▼")}
      </button>
    </p>
  );
};

interface FleetSelectorProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  distanceKm?: number;
  extraStopsCount?: number;
  lang?: Language;
  bookingType?: "distance" | "hourly";
  hourlyDuration?: number;
  passengersCount?: number;
  luggageCount?: number;
  showPrices?: boolean;
}

export default function FleetSelector({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  distanceKm,
  extraStopsCount,
  lang = "en",
  bookingType = "distance",
  hourlyDuration = 2,
  passengersCount = 2,
  luggageCount = 2,
  showPrices = true,
}: FleetSelectorProps) {
  const t = UI_TRANSLATIONS[lang];

  // Resolve default active category based on currently selected vehicle
  const currentSelected = vehicles.find((v) => v.id === selectedVehicleId);
  const defaultCategory = currentSelected ? currentSelected.category : VehicleCategory.STANDARD;

  const [activeCategory, setActiveCategory] = useState<VehicleCategory>(defaultCategory);

  // Sync state if selectedVehicleId changes from external source
  useEffect(() => {
    const selected = vehicles.find((v) => v.id === selectedVehicleId);
    if (selected) {
      setActiveCategory(selected.category);
    }
  }, [selectedVehicleId, vehicles]);

  const filteredVehicles = vehicles.filter((v) => v.category === activeCategory);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold">{t.theCollection}</span>
          <h3 className="font-display-lg text-xl md:text-2xl text-neutral-950 font-medium">{t.fleetSubTitle}</h3>
        </div>
        <p className="text-xs text-neutral-700 max-w-sm font-medium">
          {t.fleetDescription}
        </p>
      </div>

      {/* 3-Part Collection Selection Tabs */}
      <div className="flex border-b border-neutral-200 bg-neutral-100/50 p-1 rounded-lg gap-1">
        <button
          type="button"
          onClick={() => setActiveCategory(VehicleCategory.STANDARD)}
          className={`flex-1 py-2 md:py-3 text-center text-xs font-bold uppercase tracking-wider relative transition-all duration-300 rounded-md cursor-pointer ${
            activeCategory === VehicleCategory.STANDARD
              ? "text-amber-950 font-black"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <span className="relative z-10">{t.standardCategory || "Standard"}</span>
          {activeCategory === VehicleCategory.STANDARD && (
            <motion.div
              layoutId="activeFleetTab"
              className="absolute inset-0 bg-amber-500/10 rounded-md border-b-2 border-amber-500 shadow-sm"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory(VehicleCategory.VAN)}
          className={`flex-1 py-2 md:py-3 text-center text-xs font-bold uppercase tracking-wider relative transition-all duration-300 rounded-md cursor-pointer ${
            activeCategory === VehicleCategory.VAN
              ? "text-amber-950 font-black"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <span className="relative z-10">{t.vansCategory || "Vans"}</span>
          {activeCategory === VehicleCategory.VAN && (
            <motion.div
              layoutId="activeFleetTab"
              className="absolute inset-0 bg-amber-500/10 rounded-md border-b-2 border-amber-500 shadow-sm"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory(VehicleCategory.TAXI)}
          className={`flex-1 py-2 md:py-3 text-center text-xs font-bold uppercase tracking-wider relative transition-all duration-300 rounded-md cursor-pointer ${
            activeCategory === VehicleCategory.TAXI
              ? "text-amber-950 font-black"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-1">
            <span>🚕</span> {t.taxiCategory || "Taxi"}
          </span>
          {activeCategory === VehicleCategory.TAXI && (
            <motion.div
              layoutId="activeFleetTab"
              className="absolute inset-0 bg-amber-500/10 rounded-md border-b-2 border-amber-500 shadow-sm"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filteredVehicles.map((v, idx) => {
            const isSelected = v.id === selectedVehicleId;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                key={v.id}
                onClick={() => onSelectVehicle(v.id)}
                className={`flex flex-col rounded-lg overflow-hidden transition-all duration-300 transform cursor-pointer border hover:-translate-y-1 ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20 shadow-xl"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg"
                }`}
              >
                {/* Image banner */}
                <div className="relative aspect-[2.2/1] sm:aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src={v.image}
                    alt={v.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  
                  {/* Top-right absolute tier badge */}
                  <span className={`absolute top-2 right-2 font-mono text-[8px] sm:text-[9.5px] uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 font-bold shadow-md backdrop-blur-md border ${
                    v.premium 
                      ? "bg-neutral-950/95 text-amber-400 border-amber-400/30" 
                      : v.category === VehicleCategory.TAXI || v.taxi
                      ? "bg-amber-400 text-neutral-950 border-amber-500/40 font-extrabold"
                      : "bg-yellow-400 text-neutral-950 border-yellow-500/30"
                  }`}>
                    {v.premium && <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current text-amber-400" />}
                    {(v.category === VehicleCategory.TAXI || v.taxi || !v.premium) && <span className="text-[9px] sm:text-[10px] leading-none">🚕</span>}
                    {lang === "ca" ? getVehicleTierInfo(v).ca : getVehicleTierInfo(v).en}
                  </span>

                  {isSelected && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-neutral-900 font-sans text-[8px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shadow">
                      {t.activeSelection}
                    </div>
                  )}
                </div>

                 {/* Content fields */}
                <div className="p-2.5 sm:p-4 md:p-5 flex-grow flex flex-col justify-between">
                  <div>
                    {(() => {
                      const fitsParty = v.passengers >= passengersCount && v.luggage >= luggageCount;
                      const isVansTabNeeded = passengersCount > 3 || luggageCount > 3;
                      const isRecommended = fitsParty && (
                        (v.category === VehicleCategory.VAN && isVansTabNeeded) ||
                        (v.category === VehicleCategory.STANDARD && !isVansTabNeeded) ||
                        (v.category === VehicleCategory.TAXI)
                      );
                      
                      if (isRecommended) {
                        return (
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded mb-2 inline-flex items-center gap-1 uppercase tracking-wider">
                            ⭐ {lang === "ca" ? "Recomanat per al vostre grup" : "Recommended for your party"}
                          </div>
                        );
                      }
                      
                      if (!fitsParty) {
                        return (
                          <div className="bg-rose-50 text-rose-800 border border-rose-200 text-[9px] font-bold px-2 py-0.5 rounded mb-2 inline-flex items-center gap-1 uppercase tracking-wider">
                            ⚠️ {lang === "ca" ? "Excedeix la capacitat de l'habitacle" : "Exceeds cabin capacity"}
                          </div>
                        );
                      }
                      
                      return null;
                    })()}

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-2 mb-1">
                      <div>
                        <h5 className="font-display-lg text-xs sm:text-sm md:text-base lg:text-lg text-neutral-950 font-semibold tracking-tight">{v.name}</h5>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-500/10 inline-block font-bold">
                            {v.category === VehicleCategory.STANDARD 
                              ? (lang === "ca" ? "Sedan" : "Sedan") 
                              : v.category === VehicleCategory.VAN 
                              ? (lang === "ca" ? "Monovolum / Van" : "Monovolum / Van") 
                              : (lang === "ca" ? "Taxi" : "Taxi")}
                          </span>
                        </div>
                      </div>
                      {showPrices && (
                        <div className="text-left sm:text-right">
                          <p className="font-mono text-[10px] sm:text-xs md:text-sm font-bold text-amber-700">
                            {bookingType === "hourly" ? (
                              <span>€{(hourlyDuration * (v.hourlyRate || 85)).toFixed(0)}</span>
                            ) : (
                              <span>€{Math.max(v.minPrice || 15, ((distanceKm || 0) * v.pricePerKm) + ((extraStopsCount || 0) * 35)).toFixed(0)}</span>
                            )}
                            <span className="text-[8px] font-normal block text-neutral-400">
                              {bookingType === "hourly" 
                                ? (lang === "ca" ? `per ${hourlyDuration} hores` : `for ${hourlyDuration} hours`) 
                                : (lang === "ca" ? "Tarifa Est." : "Est. Fare")}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <ExpandableDescription text={v.description} lang={lang} />

                    <div className="flex items-center gap-2 sm:gap-4 border-t border-b border-neutral-100 py-1.5 sm:py-2.5 mb-2 sm:mb-4">
                      <div className="flex items-center gap-1 text-neutral-800 text-[10px] sm:text-xs">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-mono font-bold">{v.passengers} {t.passengersLabel}</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-800 text-[10px] sm:text-xs">
                        <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-mono font-bold">{v.luggage} {t.luggageLabel}</span>
                      </div>
                    </div>


                  </div>

                  <button
                    type="button"
                    className={`w-full py-1.5 sm:py-2.5 text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider sm:tracking-widest rounded-sm border transition-all ${
                      isSelected
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "border-neutral-900 text-neutral-900 hover:bg-neutral-950 hover:text-white"
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5 text-amber-400/90" /> {getButtonText(v, isSelected, lang)}
                      </span>
                    ) : (
                      getButtonText(v, isSelected, lang)
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
