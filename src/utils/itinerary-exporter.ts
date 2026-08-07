import { Booking, Vehicle } from "../types";

/**
 * Cleanly format field names for presentation
 */
const getVehicleName = (booking: Booking, vehicles: Vehicle[]): string => {
  const v = vehicles.find((vehicle) => vehicle.id === booking.vehicleId);
  return v ? v.name : "Velasco Luxury Carriage";
};

/**
 * Generates a clean, exquisitely formatted plaint-text summary (Dossier)
 */
export const generatePlaintextItinerary = (
  booking: Booking,
  vehicles: Vehicle[],
): string => {
  const vehicleName = getVehicleName(booking, vehicles);
  const extraStopsText =
    booking.extraStops.length > 0
      ? booking.extraStops
          .map((stop, i) => `  [Stop ${i + 1}] ${stop}`)
          .join("\n")
      : "  No additional detours ordered.";

  const preferencesText = [
    `- Cabin Temperature target: ${booking.preferences.targetTemp.toFixed(1)}°C`,
    `- Custom Requests/Remarks: ${booking.remarks || "No supplementary physical parameters designated."}`,
  ].join("\n  ");

  const invoiceText = booking.wantsInvoice
    ? `
------------------------------------------------------------------------
3.5 OFFICIAL REGISTERED INVOICE DETAILS
------------------------------------------------------------------------
  Request Status: Enabled (Tax Deductible)
  Document Type:  ${booking.invoiceDocumentType === "passport" ? "Passport" : booking.invoiceDocumentType === "national_id" ? "National ID DNI/NIE" : "Company CIF/VAT"}
  Document ID:    ${booking.invoiceDocumentNumber}
  Billing Entity:  ${booking.invoiceFullName}
`
    : "";

  return `========================================================================
     VELASCO & RIBERA CATALAN ATELIER - VIP JOURNEY MANIFEST & RESERVATION
     C/ GERDERA, Nº 1, CORNELLA DEL LLOBREGAT (BARCELONA) • TEL: +34640369120
========================================================================

  RESERVATION IDENTIFIER:  ${booking.id}
  CURRENT STATUS:          ${booking.status.toUpperCase()}
  SYSTEM SIGNATURE:        ${booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "AUTHENTIC VIP REGISTER"}

------------------------------------------------------------------------
1. CONVOY VEHICLE ASSIGNED
------------------------------------------------------------------------
  Car Type:     ${vehicleName}
  Chauffeur:    Marcos Reyes (Class A VIP, Multi-lingual Specialist)
  Permit:       CAT-VIP-9923 (Catalonian Carriage Authorization)

------------------------------------------------------------------------
2. TRANSIT LOGISTICS & TIMELINE
------------------------------------------------------------------------
  Departure Date:   ${booking.date}
  Pickup Time:      ${booking.time}
  Route Provenance: ${booking.pickup}
  Destination:      ${booking.destination}
  
  Route Distance:   ${booking.distanceKm.toFixed(1)} km
  Est. Duration:    ${booking.durationMins} minutes

  Passengers:       ${booking.passengersCount || 2}
  Checked Bags:     ${booking.luggageCount !== undefined ? booking.luggageCount : 2}
  Cabin Luggage:    ${booking.cabinLuggageCount !== undefined ? booking.cabinLuggageCount : 0}

  DETOURS & WAYPOINTS:
${extraStopsText}

------------------------------------------------------------------------
3. CUSTOM CABIN CONFIGURATIONS & PREFERENCES
------------------------------------------------------------------------
  ${preferencesText}
${invoiceText}
------------------------------------------------------------------------
4. FARE BREAKDOWN & FINANCE DIRECTORY
------------------------------------------------------------------------
  Class Rate Charge:  EUR ${booking.price.toFixed(2)}
  Regional Toll Taxes: Included (VIP Port & Carrier VAT fully pre-cleared)
  Total Premium Paid: EUR ${booking.price.toFixed(2)}

========================================================================
     PREPARED BY VELASCO ATELIER DIRECTORY. STANDING BY IN BARCELONA.
========================================================================`;
};

/**
 * Generates a gorgeous, self-contained offline HTML file that looks like a VIP voucher certificate.
 */
export const generateHTMLVoucher = (
  booking: Booking,
  vehicles: Vehicle[],
): string => {
  const vehicleName = getVehicleName(booking, vehicles);
  const stopsHTML =
    booking.extraStops.length > 0
      ? booking.extraStops
          .map(
            (stop, i) =>
              `<li><span class="stop-num">${i + 1}</span> ${stop}</li>`,
          )
          .join("")
      : `<li><span class="no-stops">Direct route - No excursions selected</span></li>`;

  const dateStr = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Velasco & Ribera Travel Manifest - ${booking.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background-color: #f7f6f4;
      font-family: 'Inter', sans-serif;
      color: #1a1a1a;
      line-height: 1.5;
      padding: 40px 20px;
    }
    
    .ticket-container {
      max-width: 800px;
      background: #ffffff;
      margin: 0 auto;
      border: 1px solid #e1deda;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.04);
    }
    
    .gold-header-banner {
      height: 6px;
      background: linear-gradient(90deg, #d97706, #f59e0b, #eab308);
    }
    
    header {
      background: #0a0a0a;
      color: #fff;
      padding: 40px;
      position: relative;
    }
    
    .brand-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #262626;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    
    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      letter-spacing: 0.05em;
      color: #fff;
    }
    
    .brand-subtitle {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #d97706;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      font-weight: bold;
      margin-top: 4px;
    }
    
    .manifest-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: rgba(217, 119, 6, 0.15);
      border: 1px solid rgba(217, 119, 6, 0.3);
      color: #f59e0b;
      padding: 6px 14px;
      border-radius: 3px;
      letter-spacing: 0.1em;
    }
    
    .trip-essentials {
      display: grid;
      grid-template-cols: 2fr 1fr;
      gap: 30px;
    }
    
    .essential-left h1 {
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      font-weight: 500;
      line-height: 1.2;
      color: #ffffff;
    }
    
    .essential-left p {
      font-size: 13px;
      color: #a3a3a3;
      margin-top: 8px;
    }
    
    .essential-right {
      text-align: right;
    }
    
    .ticket-id-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #737373;
      letter-spacing: 0.1em;
    }
    
    .ticket-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 22px;
      font-weight: 700;
      color: #f59e0b;
      margin-top: 4px;
    }
    
    .ticket-status {
      display: inline-block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-weight: 700;
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 3px 10px;
      border-radius: 3px;
      margin-top: 10px;
    }
    
    .content-body {
      padding: 40px;
    }
    
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 8px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      justify-content: space-between;
    }
    
    .grid-info {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .info-card {
      background: #fafaf9;
      border: 1px solid #ecebe9;
      border-radius: 6px;
      padding: 20px;
    }
    
    .info-card h4 {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8c857b;
      margin-bottom: 12px;
      font-weight: 700;
    }
    
    .logistic-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13.5px;
    }
    
    .logistic-row:last-child {
      margin-bottom: 0;
    }
    
    .logistic-label {
      color: #6b7280;
    }
    
    .logistic-val {
      font-weight: 500;
      color: #111827;
      text-align: right;
    }
    
    .route-details {
      margin-bottom: 40px;
    }
    
    .addresses-container {
      background: #fafaf9;
      border: 1px solid #ecebe9;
      border-radius: 6px;
      padding: 20px;
    }
    
    .address-block {
      margin-bottom: 20px;
    }
    
    .address-block:last-child {
      margin-bottom: 0;
    }
    
    .address-block small {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #d97706;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }
    
    .address-block p {
      font-size: 14px;
      color: #111827;
      font-weight: 600;
    }
    
    .address-block span {
      font-size: 12px;
      color: #6b7280;
    }
    
    .stops-box {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #e5e5e5;
    }
    
    .stops-box span.title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #374151;
      display: block;
      margin-bottom: 8px;
    }
    
    .stops-box ul {
      list-style-type: none;
    }
    
    .stops-box li {
      font-size: 12px;
      color: #4b5563;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
    }
    
    .stops-box .stop-num {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      background: #f59e0b;
      color: #fff;
      font-weight: 700;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
    }
    
    .no-stops {
      font-style: italic;
      color: #9ca3af;
    }
    
    .preferences-container {
      display: grid;
      grid-template-cols: repeat(2, 1fr);
      gap: 12px;
      background: #fafaf9;
      border: 1px solid #ecebe9;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 40px;
    }
    
    .preference-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12.5px;
      color: #4b5563;
    }
    
    .pref-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    
    .pref-dot.active {
      background: #10b981;
    }
    
    .pref-dot.inactive {
      background: #d1d5db;
    }
    
    .financials-section {
      background: #0a0a0a;
      color: #fff;
      padding: 30px;
      border-radius: 6px;
      margin-bottom: 30px;
    }
    
    .financials-row {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
      padding: 10px 0;
      border-bottom: 1px solid #1f1f1f;
    }
    
    .financials-row:last-child {
      border-bottom: none;
      font-size: 18px;
      padding-top: 15px;
      font-weight: 700;
      color: #f59e0b;
    }
    
    .financials-row .lbl {
      color: #9cca8a;
    }
    
    .financials-row.last .lbl {
      font-family: 'Playfair Display', serif;
      color: #ffffff;
    }
    
    .financials-row.last .val {
      font-family: 'JetBrains Mono', monospace;
    }
    
    footer {
      border-top: 1px solid #e1deda;
      padding-top: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #8c857b;
    }
    
    .signature-block {
      text-align: right;
    }
    
    .signature-title {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 16px;
      color: #111827;
      margin-top: 4px;
    }
    
    /* Print optimizations */
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .ticket-container {
        border: none;
        box-shadow: none;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
      header {
        background: #000000 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    .print-btn-section {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 30px;
    }
    
    .btn {
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-gold {
      background: #d97706;
      color: #fff;
      border: 1px solid #d97706;
    }
    
    .btn-gold:hover {
      background: #b45309;
    }
    
    .btn-dark {
      background: #171717;
      color: #fff;
      border: 1px solid #171717;
    }
    
    .btn-dark:hover {
      background: #0a0a0a;
    }
  </style>
</head>
<body>

  <div class="ticket-container">
    <div class="gold-header-banner"></div>
    
    <header>
      <div class="brand-section">
        <div>
          <div class="brand-title">Velasco & Ribera</div>
          <div class="brand-subtitle">VIP Chauffeur Atelier • Catalunya</div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #a3a3a3; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.1em;">
            C/ GERDERA, Nº 1, CORNELLA DEL LLOBREGAT (BARCELONA) • TEL: +34640369120
          </div>
        </div>
        <div class="manifest-badge">JOURNEY REGISTRY RECORD</div>
      </div>
      
      <div class="trip-essentials">
        <div class="essential-left">
          <p>CONFIRMED CHARTER FOR PASSENGER</p>
          <h1>${booking.contactName || "Private Passenger"}</h1>
          <p>${booking.contactEmail || ""} • ${booking.contactPhone || ""}</p>
        </div>
        <div class="essential-right">
          <div class="ticket-id-label">REGISTRATION VOUCHER</div>
          <div class="ticket-id">${booking.id}</div>
          <div class="ticket-status">${booking.status}</div>
        </div>
      </div>
    </header>
    
    <div class="content-body">
      
      <!-- Logistics info -->
      <div class="section-title">Logistical Matrix</div>
      <div class="grid-info">
        <div class="info-card">
          <h4>Vessel Assignment</h4>
          <div class="logistic-row">
            <span class="logistic-label">Vehicle Type</span>
            <span class="logistic-val">${vehicleName}</span>
          </div>
          <div class="logistic-row">
            <span class="logistic-label">Assigned Chauffeur</span>
            <span class="logistic-val">${booking.driverName || "Marcos Reyes"}</span>
          </div>
          <div class="logistic-row">
            <span class="logistic-label">Chauffeur Mobile</span>
            <span class="logistic-val">${booking.driverPhone || "+34 600 123 456"}</span>
          </div>
          <div class="logistic-row">
            <span class="logistic-label">Service License</span>
            <span class="logistic-val">CAT-VIP-9923</span>
          </div>
        </div>
        
        <div class="info-card">
          <h4>Charter Vector</h4>
          <div class="logistic-row">
            <span class="logistic-label">Departure Date</span>
            <span class="logistic-val">${dateStr}</span>
          </div>
          <div class="logistic-row">
            <span class="logistic-label">Departure Time</span>
            <span class="logistic-val">${booking.time}</span>
          </div>
          <div class="logistic-row">
            <span class="logistic-label">Duration Est.</span>
            <span class="logistic-val">${booking.durationMins} minutes</span>
          </div>
          <div style="border-top: 1px solid #ecebe9; margin-top: 10px; padding-top: 10px;" class="logistic-row">
            <span class="logistic-label">Passengers</span>
            <span class="logistic-val">${booking.passengersCount || 2}</span>
          </div>
          <div class="logistic-row">
            <span class="logistic-label">Checked Bags</span>
            <span class="logistic-val">${booking.luggageCount !== undefined ? booking.luggageCount : 2}</span>
          </div>
          <div class="logistic-row">
            <span class="logistic-label">Cabin Bags</span>
            <span class="logistic-val">${booking.cabinLuggageCount !== undefined ? booking.cabinLuggageCount : 0}</span>
          </div>
        </div>
      </div>
      
      <!-- Route Details -->
      <div class="section-title">Transit Vector Plan</div>
      <div class="route-details">
        <div class="addresses-container">
          <div class="address-block">
            <small>Provenance (Pick-up)</small>
            <p>${booking.pickup}</p>
          </div>
          <div class="address-block" style="margin-top: 15px;">
            <small>Portal (Destination)</small>
            <p>${booking.destination}</p>
          </div>
          
          <div class="stops-box">
            <span class="title">Boutique Waypoints Excursions</span>
            <ul>
              ${stopsHTML}
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Cabin Environment Preferences -->
      <div class="section-title">Cabin Specifications</div>
      <div class="preferences-container">
        <div class="preference-pill" style="grid-column: span 2;">
          <span class="pref-dot active" style="background:#f59e0b"></span>
          <span>Climate Target: ${booking.preferences.targetTemp.toFixed(1)}°C</span>
        </div>
      </div>
      
      <!-- Supplementary Remarks if present -->
      ${
        booking.remarks
          ? `
      <div class="section-title">Special Instructions</div>
      <div class="info-card" style="margin-bottom: 40px; font-style: italic; font-size: 13px; color:#4b5563;">
        "${booking.remarks}"
      </div>
      `
          : ""
      }

      <!-- Official Invoicing Registry if present -->
      ${
        booking.wantsInvoice
          ? `
      <div class="section-title">Official Invoicing Registry</div>
      <div class="grid-info" style="margin-bottom: 40px;">
        <div class="info-card" style="grid-column: span 2;">
          <h4 style="color: #d97706; margin-bottom: 8px;">Corporate / Individual Billing Credentials</h4>
          <div class="logistic-row">
            <span class="logistic-label">Tax Deduction status</span>
            <span class="logistic-val" style="color: #10b981; font-weight: 700;">REQUESTED & TAX DEDUCTIBLE</span>
          </div>
          <div class="logistic-row">
            <span class="logistic-label">Document Type</span>
            <span class="logistic-val">${booking.invoiceDocumentType === "passport" ? "Passport" : booking.invoiceDocumentType === "national_id" ? "National ID (DNI/NIE)" : "Company CIF/VAT Number"}</span>
          </div>
          <div class="logistic-row">
            <span class="logistic-label">Official Registration ID</span>
            <span class="logistic-val" style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #111827;">${booking.invoiceDocumentNumber}</span>
          </div>
          <div class="logistic-row">
            <span class="logistic-label">Billing Party / Recipient Name</span>
            <span class="logistic-val" style="font-weight: 700; color: #111827;">${booking.invoiceFullName}</span>
          </div>
        </div>
      </div>
      `
          : ""
      }
      
      <!-- Financial Audit -->
      <div class="section-title">Financial Breakdown</div>
      <div class="financials-section">
        <div class="financials-row">
          <span class="lbl" style="color:#a3a3a3">Class Base Carriage Rate</span>
          <span class="val">EUR ${(booking.price * 0.9).toFixed(2)}</span>
        </div>
        <div class="financials-row">
          <span class="lbl" style="color:#a3a3a3">regional airport/VIP gate VAT Toll</span>
          <span class="val">EUR ${(booking.price * 0.1).toFixed(2)}</span>
        </div>
        <div class="financials-row last">
          <span class="lbl">TOTAL PREMIUM CHARGE</span>
          <span class="val">EUR ${booking.price.toFixed(2)}</span>
        </div>
      </div>
      
      <footer>
        <div>
          <strong>REGISTRATION SIGNATURE SYSTEM</strong><br>
          Authorized by Velasco & Ribera Atelier
        </div>
        <div class="signature-block">
          <strong>CHAUFFEUR IN-CHARGE</strong>
          <div class="signature-title">Marcos Reyes</div>
        </div>
      </footer>
    </div>
  </div>
  
  <div class="print-btn-section no-print">
    <button class="btn btn-gold" onclick="window.print()">Print This Voucher</button>
  </div>

</body>
</html>
`;
};

/**
 * Executes a browser download of the exported asset
 */
export const downloadFile = (
  content: string,
  filename: string,
  contentType: string,
) => {
  try {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(
      "Secure browser file download is obstructed in sandbox environment:",
      err,
    );
  }
};
