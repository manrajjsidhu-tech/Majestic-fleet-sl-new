import React, { useState } from "react";
import { Star, Check, Sparkles, Award, ClipboardCheck, MessageSquare, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { Booking } from "../types";
import { Language } from "../lib/translations";

interface PostTripFeedbackProps {
  booking: Booking;
  onSubmitFeedback: (bookingId: string, feedback: {
    chauffeurRating: number;
    serviceRating: number;
    cabinComfortRating: number;
    comments: string;
    selectedPraise: string[];
    submittedAt: string;
  }) => void;
  lang?: Language;
}

const LOCAL_PRAISE_OPTIONS = {
  en: [
    "Absolute Silent Cabin",
    "Pristine Vehicle State",
    "Expert Route Navigation",
    "Perfect Cabin Climate",
    "Impeccable Refreshments",
    "Elite Discretion & Safety"
  ],
  ca: [
    "Cabina de silenci absolut",
    "Estat del vehicle impecable",
    "Navegació experta de ruta",
    "Clima de cabina perfecte",
    "Begudes i refrigeris excel·lents",
    "Discreció i seguretat d'elit"
  ],
  es: [
    "Cabina de silencio absoluto",
    "Estado del vehículo impecable",
    "Navegación experta de ruta",
    "Clima de cabina perfecto",
    "Bebidas y refrigerios excelentes",
    "Discreción y seguridad de élite"
  ]
};

export default function PostTripFeedback({ booking, onSubmitFeedback, lang = "en" }: PostTripFeedbackProps) {
  const praiseOptions = LOCAL_PRAISE_OPTIONS[lang] || LOCAL_PRAISE_OPTIONS.en;
  const [chauffeurRating, setChauffeurRating] = useState<number>(5);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [cabinComfortRating, setCabinComfortRating] = useState<number>(5);
  const [comments, setComments] = useState<string>("");
  const [selectedPraise, setSelectedPraise] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(!!booking.feedback);

  const handleTogglePraise = (tag: string) => {
    setSelectedPraise((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedbackData = {
      chauffeurRating,
      serviceRating,
      cabinComfortRating,
      comments,
      selectedPraise,
      submittedAt: new Date().toISOString()
    };
    onSubmitFeedback(booking.id, feedbackData);
    setIsSuccess(true);
  };

  // If already submitted in the booking model, read from it
  const feedback = booking.feedback;

  if (isSuccess || feedback) {
    const activeFeedback = feedback || {
      chauffeurRating,
      serviceRating,
      cabinComfortRating,
      comments,
      selectedPraise,
      submittedAt: new Date().toISOString()
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6 p-5 sm:p-6 rounded-lg bg-neutral-950 text-neutral-100 border border-amber-900/30 shadow-xl space-y-4 relative overflow-hidden"
      >
        {/* Elegant top gold sash */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
              <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-display-lg text-sm font-semibold text-neutral-100 tracking-tight">
              {lang === "ca" ? "Opinió del Viatge Registrada" : "Atelier Voyage Review Filed"}
            </h5>
            <p className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold">
              {lang === "ca" ? "Comentaris Sincronitzats de Manera Segura" : "Feedback Synchronized Securely"}
            </p>
          </div>
        </div>

        <p className="text-[11.5px] text-neutral-450 leading-relaxed italic font-sans border-l-2 border-amber-500/30 pl-3">
          {lang === "ca" 
            ? "Agraïm sincerament la vostra valoració del transport VIP. Les puntuacions s'han transmès directament a la nostra oficina d'operacions a l'Eixample per tal d'assegurar una perfecció operativa absolut." 
            : "We offer our highest appreciation for rating your recent Majestic Fleet Sl transfers. Your scores have been direct-transmitted to our private Eixample Operations suite to ensure absolute operational perfection."}
        </p>

        {/* Rating detail readouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-neutral-900/40 p-3 rounded border border-neutral-850">
            <p className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">
              {lang === "ca" ? "Conducta del Xofer" : "Chauffeur Conduct"}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= activeFeedback.chauffeurRating ? "text-amber-500 fill-amber-500" : "text-neutral-700"
                  }`}
                />
              ))}
              <span className="font-mono text-xs font-bold text-amber-400 ml-1">{activeFeedback.chauffeurRating}/5</span>
            </div>
          </div>

          <div className="bg-neutral-900/40 p-3 rounded border border-neutral-850">
            <p className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">
              {lang === "ca" ? "Qualitat del Servei" : "Service Quality"}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= activeFeedback.serviceRating ? "text-amber-500 fill-amber-500" : "text-neutral-700"
                  }`}
                />
              ))}
              <span className="font-mono text-xs font-bold text-amber-400 ml-1">{activeFeedback.serviceRating}/5</span>
            </div>
          </div>

          <div className="bg-neutral-900/40 p-3 rounded border border-neutral-850">
            <p className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">
              {lang === "ca" ? "Confort de Cabina" : "Cabin Comfort"}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= activeFeedback.cabinComfortRating ? "text-amber-500 fill-amber-500" : "text-neutral-700"
                  }`}
                />
              ))}
              <span className="font-mono text-xs font-bold text-amber-400 ml-1">{activeFeedback.cabinComfortRating}/5</span>
            </div>
          </div>
        </div>

        {activeFeedback.selectedPraise.length > 0 && (
          <div className="space-y-1 pt-1">
            <p className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">
              {lang === "ca" ? "Mèrits Verificats:" : "Verified Merits:"}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeFeedback.selectedPraise.map((tag) => (
                <span key={tag} className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded font-medium">
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeFeedback.comments && (
          <div className="bg-neutral-900/50 p-3 rounded border border-neutral-850 text-[11px] text-neutral-300">
            <p className="text-[9px] uppercase font-mono text-neutral-500 mb-1">
              {lang === "ca" ? "Comentaris Addicionals Millorats:" : "Your Written Remarks:"}
            </p>
            <span className="italic">"{activeFeedback.comments}"</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 pt-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{lang === "ca" ? "Comprovant de verificació:" : "Atelier verification receipt:"} {activeFeedback.submittedAt.slice(0, 16).replace("T", " ")}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 p-5 sm:p-6 rounded-lg bg-neutral-950 text-neutral-100 border border-neutral-800 shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="space-y-0.5">
          <span className="font-mono text-[9px] font-bold text-amber-500 tracking-wider block">
            {lang === "ca" ? "ENQUESTA ATELIER POST-VIATGE" : "POST-TRIP ATELIER SURVEY"}
          </span>
          <h4 className="font-display-lg text-sm font-semibold tracking-tight text-neutral-100">
            {lang === "ca" ? "Valoreu el vostre trajecte i comoditat de cabina" : "Rate Your Voyage & Cabin Experience"}
          </h4>
        </div>
        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Star rating matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Driver Rating */}
          <div className="bg-neutral-900 p-3 rounded border border-neutral-850 space-y-2">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400 block font-sans">
              {lang === "ca" ? "Professionalitat del Xofer" : "Chauffeur Professionalism"}
            </label>
            <p className="text-[10px] text-neutral-500">
              {lang === "ca" ? "Seguretat a la carretera de Marcos, etiqueta i privacitat" : "Marcos' road safety, etiquette & privacy"}
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setChauffeurRating(s)}
                  className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      s <= chauffeurRating
                        ? "text-amber-500 fill-amber-500"
                        : "text-neutral-700 hover:text-amber-500/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Service Quality */}
          <div className="bg-neutral-900 p-3 rounded border border-neutral-850 space-y-2">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400 block font-sans">
              {lang === "ca" ? "Qualitat del Servei i Tracte" : "Service Quality & Demeanor"}
            </label>
            <p className="text-[10px] text-neutral-500">
              {lang === "ca" ? "Compromís amb política de silenci i puntualitat" : "Silent policy commitment & punctuality"}
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setServiceRating(s)}
                  className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      s <= serviceRating
                        ? "text-amber-500 fill-amber-500"
                        : "text-neutral-700 hover:text-amber-500/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Cabin Comfort */}
          <div className="bg-neutral-900 p-3 rounded border border-neutral-850 space-y-2">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400 block font-sans">
              {lang === "ca" ? "Aïllament i Confort de la Cabina" : "Cabin Isolation Comfort"}
            </label>
            <p className="text-[10px] text-neutral-500">
              {lang === "ca" ? "Sincronització de temperatura, hidratació i diaris" : "Climate target sync, hydration & press setup"}
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setCabinComfortRating(s)}
                  className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      s <= cabinComfortRating
                        ? "text-amber-500 fill-amber-500"
                        : "text-neutral-700 hover:text-amber-500/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Custom Praise Badges */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block font-sans flex items-center gap-1">
            <ClipboardCheck className="w-3.5 h-3.5 text-amber-500" /> 
            {lang === "ca" ? "Seleccioneu Mèrits Destacats" : "Select Outstanding Merits"}
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {praiseOptions.map((tag) => {
              const isSelected = selectedPraise.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleTogglePraise(tag)}
                  className={`text-[10.5px] px-3 py-1 rounded transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-amber-500 text-neutral-950 border-amber-400 font-semibold"
                      : "bg-neutral-900 text-neutral-300 border-neutral-850 hover:border-neutral-700"
                  }`}
                >
                  {tag} {isSelected && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Written comments */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block font-sans flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" /> 
            {lang === "ca" ? "Comentaris Addicionals" : "Additional Comments"}
          </label>
          <textarea
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={lang === "ca" ? "Introduïu suggeriments o especificacions sobre la conducció d'en Marcos o la benvinguda..." : "Introduce custom feedback or specify highlights regarding Marcos' handling or premium onboarding..."}
            className="w-full bg-neutral-900 border border-neutral-850 p-3 text-xs text-neutral-200 rounded focus:outline-none focus:border-amber-500 placeholder-neutral-600 resize-none font-sans"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-neutral-900">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 text-neutral-950 hover:bg-amber-400 font-bold text-xs uppercase tracking-widest rounded transition-all shadow-md cursor-pointer text-center"
          >
            {lang === "ca" ? "Enviar Valoració Professional" : "Submit Professional Rating"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
