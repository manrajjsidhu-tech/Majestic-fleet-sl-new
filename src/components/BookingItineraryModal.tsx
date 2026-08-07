import { useEffect } from "react";
import { motion } from "motion/react";
import { X, Download, Printer, FileText, Calendar, Clock, Car, MapPin, Shield, CheckCircle2, Ticket } from "lucide-react";
import { Booking, Vehicle } from "../types";
import { generatePlaintextItinerary, generateHTMLVoucher, downloadFile } from "../utils/itinerary-exporter";
import { Language, UI_TRANSLATIONS } from "../lib/translations";

interface BookingItineraryModalProps {
  booking: Booking;
  vehicles: Vehicle[];
  onClose: () => void;
  lang?: Language;
}

export default function BookingItineraryModal({ booking, vehicles, onClose, lang = "en" }: BookingItineraryModalProps) {
  const t = UI_TRANSLATIONS[lang];

  useEffect(() => {
    // Lock body scrolling when the itinerary modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const vehicle = vehicles.find((v) => v.id === booking.vehicleId);
  const vehicleName = vehicle ? vehicle.name : "Premium Chauffeur";

  const handleExportTxt = () => {
    const text = generatePlaintextItinerary(booking, vehicles);
    downloadFile(text, `velasco-itinerary-${booking.id}.txt`, "text/plain");
  };

  const handleExportHtml = () => {
    const htmlContent = generateHTMLVoucher(booking, vehicles);
    downloadFile(htmlContent, `velasco-voucher-${booking.id}.html`, "text/html");
  };

  const handleTriggerPrint = () => {
    // Elegant, sandbox-safe print routine bypassing cross-origin frame limitations
    try {
      // Find or establish print mount element
      let printEl = document.getElementById("print-mount-point");
      if (!printEl) {
        printEl = document.createElement("div");
        printEl.id = "print-mount-point";
        document.body.appendChild(printEl);
      }

      const htmlContent = generateHTMLVoucher(booking, vehicles);

      // Extract raw inner container of the voucher to retain styling layout structure
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      const ticketContainer = tempDiv.querySelector(".ticket-container");

      if (ticketContainer) {
        printEl.innerHTML = ticketContainer.outerHTML;
      } else {
        printEl.innerHTML = htmlContent;
      }

      // Ensure style overlay overrides other layout nodes on window.print()
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

      // Hand off safely to system printing
      window.focus();
      window.print();

      // Keep it pristine by cleaning content shortly afterwards
      setTimeout(() => {
        if (printEl) printEl.innerHTML = "";
      }, 500);

    } catch (err) {
      console.warn("Direct window printing was obstructed. Downloading HTML voucher fallback instead:", err);
      // Fallback: download physical index voucher directly
      handleExportHtml();
    }
  };

  const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white border border-neutral-250 w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Top Header Bar */}
        <div className="bg-neutral-950 text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-amber-500" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-500 font-bold">TRAVEL DOSSIER PLATFORM</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Brand Header */}
          <div className="border-b border-neutral-100 pb-5 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
            <div>
              <h2 className="font-display-lg text-xl font-bold text-neutral-900 tracking-tight">Velasco & Ribera</h2>
              <span className="font-mono text-[9px] text-amber-600 font-bold uppercase tracking-widest block">VIP Chauffeur Atelier • Catalunya</span>
              <span className="font-mono text-[8px] text-neutral-500 uppercase tracking-wider block mt-1">C/ GERDERA, Nº 1, CORNELLA DEL LLOBREGAT (BARCELONA) • TEL: +34640369120</span>
            </div>
            <div className="text-left sm:text-right font-mono text-[10px] text-neutral-500">
              <p>{lang === "ca" ? "MANIFEST ID:" : "MANIFEST ID:"} <strong className="text-neutral-900 font-bold">{booking.id}</strong></p>
              <p className="mt-0.5">{lang === "ca" ? "ESTAT DE LA RESERVA:" : "STATUS CODE:"} <span className="text-emerald-600 font-extrabold">{booking.status.toUpperCase()}</span></p>
            </div>
          </div>

          {/* Visual Route Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-md space-y-3">
              <span className="font-mono text-[9px] text-neutral-400 font-bold uppercase tracking-widest block border-b border-neutral-200 pb-1">{lang === "ca" ? "Vehicle i Xofer" : "Vessel & Chauffeur"}</span>
              <div className="flex gap-3">
                <Car className="w-8 h-8 text-neutral-400 bg-white border border-neutral-200 p-1.5 rounded" />
                <div>
                  <h4 className="font-sans text-xs font-bold text-neutral-800">{vehicleName}</h4>
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">Chauffeur: Marcos Reyes (Class A VIP)</p>
                  <p className="text-[10px] text-neutral-400 font-mono italic mt-0.5">Lic: CAT-VIP-9923</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-md space-y-3">
              <span className="font-mono text-[9px] text-neutral-400 font-bold uppercase tracking-widest block border-b border-neutral-200 pb-1">{lang === "ca" ? "Línia Temporal de Viatge" : "Charter Vector Timeline"}</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{lang === "ca" ? "Data de Sortida:" : "Departure Date:"}</span>
                  <span className="font-semibold text-neutral-800">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{lang === "ca" ? "Hora de Recollida:" : "Pickup Time:"}</span>
                  <span className="font-mono font-bold text-neutral-900">{booking.time}</span>
                </div>
                {booking.flightNumber && (
                  <div className="flex justify-between border-t border-neutral-100 pt-1.5 mt-1">
                    <span className="text-neutral-500">{lang === "ca" ? "Número de Vol:" : "Flight Number:"}</span>
                    <span className="font-mono font-bold text-amber-600 uppercase">{booking.flightNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">{lang === "ca" ? "Distància / Durada:" : "Expected Velocity:"}</span>
                  <span className="font-semibold text-neutral-800">{booking.distanceKm.toFixed(1)} km / {booking.durationMins} mins</span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-1.5 mt-1">
                  <span className="text-neutral-500">{lang === "ca" ? "Passatgers:" : "Passengers:"}</span>
                  <span className="font-semibold text-neutral-800">{booking.passengersCount || 2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{lang === "ca" ? "Maletes check-in:" : "Checked Bags:"}</span>
                  <span className="font-semibold text-neutral-800">{booking.luggageCount !== undefined ? booking.luggageCount : 2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{lang === "ca" ? "Equipatge de mà:" : "Cabin Bags:"}</span>
                  <span className="font-semibold text-neutral-800">{booking.cabinLuggageCount !== undefined ? booking.cabinLuggageCount : 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passage Vector Address Summary */}
          <div className="border border-neutral-200 rounded-md overflow-hidden bg-neutral-950 text-neutral-200 p-4 relative">
            <div className="absolute top-4 right-4 text-emerald-500 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 fill-emerald-500/10" />
              <span className="font-mono text-[8px] tracking-wider uppercase">{lang === "ca" ? "RUTA SEGURA COMPLETA" : "SAFE ROUTE DEPLOYED"}</span>
            </div>

            <div className="space-y-4">
              <div className="relative pl-5 border-l-2 border-amber-500">
                <span className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-neutral-950 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-neutral-950" />
                </span>
                <span className="font-mono text-[8px] text-amber-500 font-bold uppercase tracking-wider block">ORIGIN ROUTE PORTAL</span>
                <p className="text-xs font-semibold text-neutral-100 mt-0.5">{booking.pickup}</p>
              </div>

              {booking.extraStops.length > 0 && (
                <div className="py-1">
                  <span className="font-mono text-[8.5px] text-neutral-500 uppercase tracking-widest block mb-2">INTEGRATED SENSORY STOPS</span>
                  <div className="flex flex-col gap-1.5 pl-5">
                    {booking.extraStops.map((stop, i) => (
                      <div key={i} className="text-[11px] text-neutral-300 flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-500 text-[10px] bg-neutral-900 border border-neutral-800 px-1 py-0.2 rounded">{i+1}</span>
                        <span>{stop}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative pl-5 border-l-2 border-neutral-800">
                <span className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-neutral-950" />
                </span>
                <span className="font-mono text-[8px] text-emerald-400 font-bold uppercase tracking-wider block">GOAL DESTINATION PORTAL</span>
                <p className="text-xs font-semibold text-neutral-100 mt-0.5">{booking.destination}</p>
              </div>
            </div>
          </div>

          {/* Climate Environment & Cabin States */}
          <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-md space-y-3">
            <span className="font-mono text-[9px] text-neutral-400 font-bold uppercase tracking-widest block border-b border-neutral-200 pb-1">{lang === "ca" ? "Controls d'Atmosfera de la Cabina" : "Passenger Selected Atmosphere Controls"}</span>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-700 bg-white border border-neutral-200 px-2.5 py-1.5 rounded-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{lang === "ca" ? "Clima" : "Climate"}: {booking.preferences.targetTemp.toFixed(1)}°C</span>
              </div>

              {/* SRI Safety Seat Representation */}
              {(((booking.preferences.sriG0Quantity || 0) > 0) || 
                ((booking.preferences.sriG1Quantity || 0) > 0) || 
                ((booking.preferences.sriG23Quantity || 0) > 0)) && (
                <>
                  {(booking.preferences.sriG0Quantity || 0) > 0 && (
                    <div className="flex items-center gap-2 text-neutral-700 bg-blue-50/50 border border-blue-200 px-2.5 py-1.5 rounded-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="font-mono text-[10px] uppercase font-bold text-blue-800">
                        SRI G0/0+ ({booking.preferences.sriG0Quantity})
                      </span>
                    </div>
                  )}
                  {(booking.preferences.sriG1Quantity || 0) > 0 && (
                    <div className="flex items-center gap-2 text-neutral-700 bg-amber-50/50 border border-amber-200 px-2.5 py-1.5 rounded-sm">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="font-mono text-[10px] uppercase font-bold text-amber-800">
                        SRI G1 ({booking.preferences.sriG1Quantity})
                      </span>
                    </div>
                  )}
                  {(booking.preferences.sriG23Quantity || 0) > 0 && (
                    <div className="flex items-center gap-2 text-neutral-700 bg-emerald-50/50 border border-emerald-200 px-2.5 py-1.5 rounded-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-mono text-[10px] uppercase font-bold text-emerald-800">
                        SRI G2/G3 ({booking.preferences.sriG23Quantity})
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Wheelchair Mobility Representation */}
              {booking.preferences.wheelchairType && booking.preferences.wheelchairType !== "none" && (
                <div className="flex items-center gap-2 text-neutral-700 bg-rose-50/50 border border-rose-200 px-2.5 py-1.5 rounded-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="font-mono text-[10px] uppercase font-bold text-rose-800">
                    {lang === "ca" ? "Cadira de rodes" : "Wheelchair"}: {booking.preferences.wheelchairType === "folding" ? (lang === "ca" ? "Plegable" : "Folding") : (lang === "ca" ? "Motoritzada" : "Motorized")} ({booking.preferences.wheelchairQuantity})
                  </span>
                </div>
              )}

              {/* Airport Meet & Greet Representation */}
              {booking.preferences.airportMeetGreet && (
                <div className="flex items-center gap-2 text-neutral-700 bg-teal-50/30 border border-teal-200 px-2.5 py-1.5 rounded-sm">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  <span className="font-mono text-[10px] uppercase font-bold text-teal-850">
                    {lang === "ca" ? "Benvinguda Aeroport (Meet & Greet)" : "Airport Meet & Greet"} (+€20.00)
                  </span>
                </div>
              )}

              {/* Cold Mineral Water Setup Representation */}
              {booking.preferences.beverages && (
                <div className="flex items-center gap-2 text-neutral-700 bg-blue-50/30 border border-blue-200 px-2.5 py-1.5 rounded-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="font-mono text-[10px] uppercase font-bold text-blue-850">
                    {lang === "ca" ? "Aigua Mineral Freda" : "Cold Mineral Water Setup"} ({lang === "ca" ? "Cortesia" : "Complimentary"})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Remarks Supplementary Section */}
          {booking.remarks ? (
            <div className="text-xs text-neutral-600 bg-neutral-50 border-l-4 border-amber-500 p-3 rounded-r">
              <span className="font-mono text-[8px] uppercase font-bold text-amber-600 block mb-0.5">{lang === "ca" ? "Directrius Suplementàries:" : "Supplementary Directives:"}</span>
              <p className="italic">"{booking.remarks}"</p>
            </div>
          ) : null}

          {/* Invoice Information Section if checked */}
          {booking.wantsInvoice && (
            <div className="bg-amber-50/15 border border-amber-500/20 p-4 rounded-md space-y-2.5">
              <span className="font-mono text-[9px] text-amber-800 font-extrabold uppercase tracking-widest block border-b border-amber-500/10 pb-1">
                {lang === "ca" ? "DADES DE FACTURACIÓ OFICIALS" : "OFFICIAL BILLING & INVOICING MANIFEST"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase font-bold block mb-0.5">
                    {lang === "ca" ? "Tipus de Document:" : "Document Type:"}
                  </span>
                  <span className="font-semibold text-neutral-800 capitalize">
                    {booking.invoiceDocumentType === "passport" 
                      ? (lang === "ca" ? "Passaport" : "Passport") 
                      : booking.invoiceDocumentType === "national_id" 
                      ? (lang === "ca" ? "DNI / National ID" : "DNI / National ID")
                      : (lang === "ca" ? "CIF / NIF d'Empresa" : "CIF / Corporate VAT Number")}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase font-bold block mb-0.5">
                    {lang === "ca" ? "Número de Document:" : "Official Number:"}
                  </span>
                  <span className="font-mono font-bold text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
                    {booking.invoiceDocumentNumber}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase font-bold block mb-0.5">
                    {lang === "ca" ? "A Nom De (Factura):" : "Invoice Recipient Name:"}
                  </span>
                  <span className="font-bold text-neutral-850">
                    {booking.invoiceFullName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Audit Receipt breakdown */}
          <div className="border border-neutral-200 rounded-md overflow-hidden">
            <div className="bg-neutral-950 text-white px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-widest flex justify-between">
              <span>{lang === "ca" ? "Desglòs d'Auditoria de la Tarifa" : "Class Rate Auditor Directory"}</span>
              <span className="text-amber-500">{lang === "ca" ? "Impostos inclosos • preacreditat" : "Taxes Included • precredited"}</span>
            </div>
            {(() => {
              const airportMeetGreetCost = booking.preferences.airportMeetGreet ? 20.00 : 0;
              const premiumAddonsCost = airportMeetGreetCost;

              const totalSriSeats = (booking.preferences.sriG0Quantity || 0) + (booking.preferences.sriG1Quantity || 0) + (booking.preferences.sriG23Quantity || 0);
              const sriCost = totalSriSeats * 6;

              const baseFare = booking.price - premiumAddonsCost - sriCost;
              return (
                <div className="p-4 space-y-2 text-xs text-neutral-600 bg-neutral-50/50">
                  <div className="flex justify-between">
                    <span>{lang === "ca" ? "Tarifa Base del Trajecte VIP:" : "VIP Carriage Base Flight Rate:"}</span>
                    <span className="font-mono">EUR {baseFare.toFixed(2)}</span>
                  </div>
                  
                  {premiumAddonsCost > 0 && (
                    <div className="flex justify-between text-amber-800">
                      <span>{lang === "ca" ? "Complements de Cabina Premium:" : "Premium Cabin Upgrades:"}</span>
                      <span className="font-mono">+EUR {premiumAddonsCost.toFixed(2)}</span>
                    </div>
                  )}

                  {sriCost > 0 && (
                    <div className="flex justify-between text-blue-800">
                      <span>{lang === "ca" ? "Cadires de Seguretat Infantil (SRI):" : "Child Safety Seats (SRI):"}</span>
                      <span className="font-mono">+EUR {sriCost.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span>{lang === "ca" ? "Impostos i Taxa Regional d'IVA:" : "VAT Excise & Regional Taxes (Included):"}</span>
                    <span className="font-mono">EUR {(booking.price * 0.1).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-900 font-bold text-sm pt-1">
                    <span className="font-display-lg uppercase tracking-wider text-xs">{lang === "ca" ? "Preu Total del Trajecte:" : "Total Passenger Fare:"}</span>
                    <span className="font-mono text-amber-700 font-bold">EUR {booking.price.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Modal Action Controls Bar */}
        <div className="bg-neutral-50 px-6 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-neutral-200">
          <span className="text-[10px] text-neutral-400 font-mono italic">
            {lang === "ca" ? "Preparat pels nodes de sistema de Velasco & Ribera" : "Prepared by Velasco & Ribera system nodes"}
          </span>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportTxt}
              className="flex-1 sm:flex-initial text-xs text-neutral-700 hover:text-neutral-950 border border-neutral-300 hover:border-neutral-400 px-3 py-2 rounded font-semibold bg-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Dossier (.txt)</span>
            </button>
            <button
              onClick={handleExportHtml}
              className="flex-1 sm:flex-initial text-xs text-neutral-700 hover:text-neutral-950 border border-neutral-300 hover:border-neutral-400 px-3 py-2 rounded font-semibold bg-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Voucher (.html)</span>
            </button>
            <button
              onClick={handleTriggerPrint}
              className="flex-1 sm:flex-initial text-xs bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === "ca" ? "Imprimir" : "Print Itinerary"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
