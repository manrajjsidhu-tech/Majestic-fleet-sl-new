import React from "react";
import { Shield, ArrowRight } from "lucide-react";
import { Language, UI_TRANSLATIONS } from "../lib/translations";
import { SpecialPreference } from "../types";
import { motion } from "motion/react";

interface StepComfortCheckoutProps {
  lang: Language;
  bookingType: "distance" | "hourly";
  hourlyDuration: number;
  preferences: SpecialPreference;
  onUpdatePreferences: (prefs: SpecialPreference) => void;
  contactName: string;
  setContactName: (val: string) => void;
  contactEmail: string;
  setContactEmail: (val: string) => void;
  phoneCountryCode: string;
  setPhoneCountryCode: (val: string) => void;
  contactPhone: string;
  setContactPhone: (val: string) => void;
  wantsInvoice: boolean;
  setWantsInvoice: (val: boolean) => void;
  invoiceDocumentType: string;
  setInvoiceDocumentType: (val: string) => void;
  invoiceDocumentNumber: string;
  setInvoiceDocumentNumber: (val: string) => void;
  invoiceFullName: string;
  setInvoiceFullName: (val: string) => void;
  specialRemarks: string;
  setSpecialRemarks: (val: string) => void;
  computedMetrics: {
    distanceKm: number;
    durationMins: number;
    price: number;
    sriCharge: number;
    premiumAddonsCharge: number;
    airportMeetGreetCharge: number;
  };
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function StepComfortCheckout({
  lang,
  bookingType,
  hourlyDuration,
  preferences,
  onUpdatePreferences,
  contactName,
  setContactName,
  contactEmail,
  setContactEmail,
  phoneCountryCode,
  setPhoneCountryCode,
  contactPhone,
  setContactPhone,
  wantsInvoice,
  setWantsInvoice,
  invoiceDocumentType,
  setInvoiceDocumentType,
  invoiceDocumentNumber,
  setInvoiceDocumentNumber,
  invoiceFullName,
  setInvoiceFullName,
  specialRemarks,
  setSpecialRemarks,
  computedMetrics,
  onBack,
  onSubmit
}: StepComfortCheckoutProps) {
  const t = UI_TRANSLATIONS[lang];
  const isCa = lang === "ca";

  return (
    <div className="space-y-6">
      {/* Checkout Contact Details Form */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-neutral-200 shadow-xl">
        <div className="border-b border-neutral-150 pb-3 mb-5">
          <h4 className="font-display-lg text-base text-neutral-900 font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600 animate-pulse" />
            {isCa ? "Autorització de la Reserva de Luxe" : "Secure Chauffeur Reservation Authorization"}
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isCa
              ? "Completeu les dades del passatger i rebeu el document de viatge immediatament."
              : "Provide passenger contact details to secure class A dispatch and lock pricing."}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              {isCa ? "Nom del Passatger:" : "Passenger Full Name:"} <span className="text-red-500">*</span>
            </label>
            <input
              id="passenger-full-name-input"
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full bg-neutral-50 border border-neutral-200 py-2 px-3 text-xs text-neutral-850 focus:outline-none focus:border-amber-500 rounded-md"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              {isCa ? "Correu Electrònic:" : "Electronic Mail Address:"} <span className="text-red-500">*</span>
            </label>
            <input
              id="passenger-email-input"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="passenger@example.com"
              className="w-full bg-neutral-50 border border-neutral-200 py-2 px-3 text-xs text-neutral-850 focus:outline-none focus:border-amber-500 rounded-md"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              {isCa ? "Telèfon de Contacte:" : "Contact Phone Number:"} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1.5">
              <div className="relative w-20 shrink-0">
                <select
                  value={phoneCountryCode}
                  onChange={(e) => setPhoneCountryCode(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 py-2 px-2 text-xs font-semibold text-neutral-850 focus:outline-none focus:border-amber-500 rounded-md cursor-pointer appearance-none text-center font-mono"
                >
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+376">🇦🇩 +376</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+39">🇮🇹 +39</option>
                </select>
              </div>
              <input
                id="passenger-phone-input"
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/[^0-9\- ]/g, ""))}
                placeholder="600 000 000"
                className="flex-1 bg-neutral-50 border border-neutral-200 py-2 px-3 text-xs text-neutral-850 focus:outline-none focus:border-amber-500 rounded-md font-mono font-bold"
              />
            </div>
          </div>

          {/* Exclusive Daytime Invoicing Panel */}
          <div id="booking-invoice-selection-panel" className="md:col-span-3 border-t border-neutral-100 pt-4 mt-2">
            <div className="flex items-center gap-2.5">
              <input
                id="wants-invoice-checkbox"
                type="checkbox"
                checked={wantsInvoice}
                onChange={(e) => {
                  setWantsInvoice(e.target.checked);
                  if (e.target.checked && !invoiceFullName && contactName) {
                    setInvoiceFullName(contactName);
                  }
                }}
                className="w-4 h-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
              />
              <label
                htmlFor="wants-invoice-checkbox"
                className="text-xs font-bold uppercase tracking-wider text-neutral-800 cursor-pointer select-none flex items-center gap-1.5"
              >
                <span>{t.requestInvoiceLabel}</span>
                <span className="text-[8.5px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-500/10 font-bold uppercase">
                  Tax Deductible
                </span>
              </label>
            </div>

            {wantsInvoice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 p-4 bg-neutral-50 border border-neutral-200 rounded-md overflow-hidden shadow-inner"
              >
                <div className="space-y-1">
                  <label className="text-[9.5px] font-extrabold uppercase tracking-wider text-neutral-700 block">
                    {t.invoiceDocTypeLabel}:
                  </label>
                  <select
                    value={invoiceDocumentType}
                    onChange={(e) => setInvoiceDocumentType(e.target.value)}
                    className="w-full bg-white border border-neutral-200 py-2 px-3 text-xs text-neutral-850 focus:outline-none focus:border-amber-500 rounded-md cursor-pointer"
                  >
                    <option value="passport">{isCa ? "Passaport" : "Passport"}</option>
                    <option value="national_id">{isCa ? "Document d'Identitat (DNI/NIE)" : "National ID (DNI/NIE)"}</option>
                    <option value="tax_id">{isCa ? "CIF / NIF d'Empresa" : "Company CIF / VAT Code"}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-extrabold uppercase tracking-wider text-neutral-700 block">
                    {t.invoiceDocNumberLabel} <span className="text-rose-600 font-bold">*</span>:
                  </label>
                  <input
                    id="invoice-document-number-input"
                    type="text"
                    required={wantsInvoice}
                    value={invoiceDocumentNumber}
                    onChange={(e) => setInvoiceDocumentNumber(e.target.value)}
                    placeholder={invoiceDocumentType === "passport" ? "e.g., GP881122" : "e.g., 47123456Z, B65432109"}
                    className="w-full bg-white border border-neutral-200 py-2 px-3 text-xs text-neutral-850 focus:outline-none focus:border-amber-500 rounded-md font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-extrabold uppercase tracking-wider text-neutral-700 block">
                    {t.invoiceNameLabel} <span className="text-rose-600 font-bold">*</span>:
                  </label>
                  <input
                    id="invoice-full-name-input"
                    type="text"
                    required={wantsInvoice}
                    value={invoiceFullName}
                    onChange={(e) => setInvoiceFullName(e.target.value)}
                    placeholder="e.g., John Doe"
                    className="w-full bg-white border border-neutral-200 py-2 px-3 text-xs text-neutral-850 focus:outline-none focus:border-amber-500 rounded-md"
                  />
                </div>
              </motion.div>
            )}
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-550 block">
              {isCa ? "Indicacions Especials o Remarks de Vol:" : "Special Concierge Remarks & Instructions:"}
            </label>
            <textarea
              rows={2}
              value={specialRemarks}
              onChange={(e) => setSpecialRemarks(e.target.value)}
              placeholder="e.g., child ages, water temperature preference, meet & greet details..."
              className="w-full bg-neutral-50 border border-neutral-200 py-2 px-3 text-xs text-neutral-850 focus:outline-none focus:border-amber-500 rounded-md resize-none"
            />
          </div>

          {/* Transparent Live Pricing breakdown card */}
          <div className="md:col-span-3 pt-4 flex flex-col md:flex-row justify-between items-center bg-neutral-50 p-4 rounded-lg border border-neutral-200 gap-4 mt-2">
            <div className="text-left space-y-1.5 flex-1">
              <span className="text-[9px] text-neutral-400 uppercase font-mono tracking-widest font-black block">
                TRANSPARENT VALUE QUOTE:
              </span>
              <div className="text-sm font-bold text-neutral-800 font-mono">
                €{computedMetrics.price.toFixed(2)}{" "}
                <span className="text-xs font-normal text-neutral-500">
                  {bookingType === "hourly"
                    ? (isCa ? `(lloguer de ${hourlyDuration} hores inclòs)` : `(${hourlyDuration}-hour dedicated disposal hire)`)
                    : (isCa ? `(trajecte de ${computedMetrics.distanceKm.toFixed(1)} km inclòs)` : `(${computedMetrics.distanceKm.toFixed(1)} km custom route transfer)`)
                  }
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 text-[9.5px]">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded font-medium">
                  ✓ Class A Chauffeur Included
                </span>
                <span className="bg-neutral-150 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded font-mono font-bold">
                  10% VAT Incl.
                </span>
                {computedMetrics.sriCharge > 0 && (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                    ⭐ Child Safety Setup (+€{computedMetrics.sriCharge.toFixed(2)})
                  </span>
                )}
                {computedMetrics.premiumAddonsCharge > 0 && (
                  <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium">
                    💎 Meet & Greet (+€{computedMetrics.airportMeetGreetCharge.toFixed(2)})
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2.5 w-full md:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-bold rounded text-xs uppercase tracking-wider cursor-pointer"
              >
                ⬅ {isCa ? "Enrere" : "Back"}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-neutral-900 border border-neutral-900 text-amber-400 hover:text-white font-bold rounded uppercase tracking-[0.15em] shadow-md cursor-pointer transition-all active:scale-95 text-xs text-center flex items-center gap-1.5 justify-center"
              >
                {isCa ? "Confirmar Reserva" : "Confirm Secured Booking"} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
