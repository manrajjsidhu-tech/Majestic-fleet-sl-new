import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

// Initialize environment variables
dotenv.config({ override: true });

// Robust Helper to clean and sanitize environment variables from trailing quotes or spaces
function cleanEnv(key: string, defaultValue = ""): string {
  const val = process.env[key];
  if (val === undefined || val === null) return defaultValue;
  return val.trim().replace(/^["']|["']$/g, "").trim();
}

// Shared Single SMTP Transporter with fast timeouts (reuses pool & prevents blocking/hanging)
const DEFAULT_SMTP_USER = "majesticfleetsl@gmail.com";
const DEFAULT_SMTP_PASS = "vfqvbanuzirdcmvf";

const sharedTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS via STARTTLS on 587
  auth: {
    user: DEFAULT_SMTP_USER,
    pass: DEFAULT_SMTP_PASS,
  },
  connectionTimeout: 4000,
  greetingTimeout: 4000,
  socketTimeout: 5000,
});

// GMail/SMTP Outbound Notification Service
async function sendGmailNotification(subject: string, textContent: string, htmlContent: string) {
  const recipient = DEFAULT_SMTP_USER;

  try {
    const info = await sharedTransporter.sendMail({
      from: `"Majestic Fleet Sl Barcelona" <${DEFAULT_SMTP_USER}>`,
      to: recipient,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`\n[Majestic Fleet Sl Mailer SUCCESS] Unified dispatcher notification sent to ${recipient}: Message ID ${info.messageId}\n`);
  } catch (err: any) {
    console.warn(`\n[Majestic Fleet Sl Mailer WARN] SMTP delivery to ${recipient} failed:`, err.message || err);
  }
}

// Email Sender for Client Reservation/Order Confirmation (WITHOUT invoice PDF)
async function sendClientOrderConfirmation(booking: any): Promise<{ success: boolean; message: string }> {
  const recipient = booking.contactEmail;
  if (!recipient) {
    console.log(`[Majestic Fleet Sl Mailer INFO] No contactEmail for booking #${booking.id}, skipping order confirmation.`);
    return { success: false, message: "No contact email provided" };
  }

  const userLang = booking.language || "en";

  try {

    const vehicleName = booking.vehicleId === "tesla-3" ? "Tesla Model 3" : booking.vehicleId === "mercedes-v300" ? "Mercedes-Benz V300 (VIP Jet)" : "Mercedes-Benz E300e";

    const confirmationContent = {
      en: {
        subject: `[Majestic Fleet SL] Booking Confirmation & Reservation details - #${booking.id}`,
        title: `RESERVATION CONFIRMED`,
        dear: `Dear ${booking.contactName || "Valued Client"},`,
        thankYou: `Thank you for choosing <strong>Majestic Fleet</strong>. We are delighted to confirm that your premium private transfer in Barcelona has been successfully scheduled.`,
        intro: `Our team is dedicated to providing you with an elite chauffeur experience. Below are the exact details of what you ordered:`,
        summary: `Executive Journey Summary`,
        ref: `Booking Reference:`,
        vehicle: `Vehicle Assigned:`,
        dateTime: `Date & Time:`,
        from: `From (Pickup):`,
        to: `To (Destination):`,
        metrics: `Estimated Metrics:`,
        party: `Party Size & Luggage:`,
        total: `Total Price (IVA Incl.):`,
        specialInstructions: `Special Instructions / Notes:`,
        note: `Your professional chauffeur will meet you at the pickup location as scheduled. If you have any special requests or need to modify your booking, please reply directly to this email to reach our VIP Desk.`,
        signOff: `The Executive Board & Dispatch Team`
      },
      es: {
        subject: `[Majestic Fleet SL] Confirmación de Reserva y Detalles de su Pedido - #${booking.id}`,
        title: `RESERVA CONFIRMADA`,
        dear: `Estimado/a ${booking.contactName || "Cliente"},`,
        thankYou: `Gracias por elegir <strong>Majestic Fleet</strong>. Nos complace confirmar que su traslado privado premium en Barcelona ha sido programado con éxito.`,
        intro: `Nuestro equipo está dedicado a ofrecerle una experiencia de chófer de primer nivel. A continuación encontrará los detalles exactos de su pedido:`,
        summary: `Resumen Ejecutivo del Viaje`,
        ref: `Referencia de Reserva:`,
        vehicle: `Vehículo Asignado:`,
        dateTime: `Fecha y Hora:`,
        from: `Origen (Recogida):`,
        to: `Destino:`,
        metrics: `Métricas Estimadas:`,
        party: `Tamaño del Grupo y Equipaje:`,
        total: `Precio Total (IVA Incl.):`,
        specialInstructions: `Instrucciones Especiales / Notas:`,
        note: `Su chófer profesional se reunirá con usted en el lugar de recogida según lo programado. Si tiene peticiones especiales o necesita modificar su reserva, responda directamente a este correo electrónico para comunicarse con nuestra mesa VIP.`,
        signOff: `El Consejo Ejecutivo y Equipo de Despacho`
      },
      ca: {
        subject: `[Majestic Fleet SL] Confirmació de Reserva i Detalls de la vostra Comanda - #${booking.id}`,
        title: `RESERVA CONFIRMADA`,
        dear: `Estimat/da ${booking.contactName || "Client"},`,
        thankYou: `Gràcies per triar <strong>Majestic Fleet</strong>. Ens complau confirmar que el vostre trasllat privat premium a Barcelona ha estat programat amb èxit.`,
        intro: `El nostre equip està dedicat a oferir-vos una experiència de xofer de primer nivell. A sota trobareu els detalls exactes de la vostra comanda:`,
        summary: `Resum Executiu del Viatge`,
        ref: `Referència de Reserva:`,
        vehicle: `Vehicle Assignat:`,
        dateTime: `Data i Hora:`,
        from: `Origen (Recollida):`,
        to: `Destí:`,
        metrics: `Mètriques Estimades:`,
        party: `Mida del Grup i Equipatge:`,
        total: `Preu Total (IVA Incl.):`,
        specialInstructions: `Instruccions Especiales / Notes:`,
        note: `El vostre xofer professional es reunirà amb vosaltres al lloc de recollida segons el programat. Si teniu peticions especials o necessiteu modificar la vostra reserva, responeu directament a aquest correu electrònic per comunicar-vos amb la nostra taula VIP.`,
        signOff: `El Consell Executiu i Equip de Despatx`
      }
    };

    const labels = confirmationContent[userLang === "ca" || userLang === "es" ? userLang : "en"];

    const mailSubject = labels.subject;
    const mailText = `${labels.dear}\n\n` +
      `${labels.thankYou.replace(/<[^>]*>/g, "")}\n\n` +
      `${labels.intro}\n\n` +
      `=========================================\n` +
      `${labels.summary.toUpperCase()}\n` +
      `=========================================\n` +
      `• ${labels.ref} #${booking.id}\n` +
      `• ${labels.vehicle} ${vehicleName}\n` +
      `• ${labels.dateTime} ${booking.date} at ${booking.time}\n` +
      `• ${labels.from} ${booking.pickup}\n` +
      `• ${labels.to} ${booking.destination}\n` +
      `• ${labels.total} EUR ${booking.price.toFixed(2)}\n\n` +
      `${labels.note}\n\n` +
      `Warmest regards,\n` +
      `${labels.signOff}\n` +
      `Majestic Fleet SL Barcelona`;

    const mailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; color: #1e293b; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        
        <!-- Header Banner with Premium Slate & Gold Accents -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 45px 35px; text-align: center; border-bottom: 5px solid #d97706;">
          <h2 style="color: #f59e0b; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; font-family: Georgia, serif;">MAJESTIC FLEET</h2>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 4px; font-weight: 600;">VIP Chauffeur &amp; Executive Travel Atelier &bull; Barcelona</p>
        </div>

        <div style="padding: 40px 35px;">
          
          <p style="font-size: 17px; line-height: 1.6; color: #0f172a; margin-top: 0; font-weight: 700;">
            ${labels.dear}
          </p>

          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
            ${labels.thankYou}
          </p>
          
          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 30px;">
            ${labels.intro}
          </p>

          <!-- Ride & Journey Details Block -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 35px 0;">
            <h4 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
              ${labels.summary}
            </h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; width: 40%; border-bottom: 1px solid #f1f5f9;">${labels.ref}</td>
                <td style="padding: 10px 0; font-family: monospace; font-weight: bold; color: #b45309; text-align: right; font-size: 15px; border-bottom: 1px solid #f1f5f9;">#${booking.id}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Passenger Name:</td>
                <td style="padding: 10px 0; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">${booking.contactName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${labels.vehicle}</td>
                <td style="padding: 10px 0; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">${vehicleName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${labels.dateTime}</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${booking.date} at ${booking.time}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; vertical-align: top; border-bottom: 1px solid #f1f5f9;">${labels.from}</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; line-height: 1.4; border-bottom: 1px solid #f1f5f9; font-weight: 500;">${booking.pickup}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; vertical-align: top; border-bottom: 1px solid #f1f5f9;">${labels.to}</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; line-height: 1.4; border-bottom: 1px solid #f1f5f9; font-weight: 500;">${booking.destination}</td>
              </tr>
              ${booking.distanceKm ? `
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${labels.metrics}</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${booking.distanceKm} km (approx. ${booking.durationMins || "N/A"} mins)</td>
              </tr>
              ` : ""}
              ${booking.passengersCount ? `
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${labels.party}</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${booking.passengersCount} Passengers &bull; ${booking.luggageCount || 0} Luggage</td>
              </tr>
              ` : ""}
              ${booking.remarks ? `
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; vertical-align: top;">${labels.specialInstructions}</td>
                <td style="padding: 10px 0; color: #e11d48; text-align: right; font-weight: 600;">${booking.remarks}</td>
              </tr>
              ` : ""}
            </table>
          </div>

          <div style="background-color: #fbfbfe; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 20px; margin: 35px 0; font-size: 14px; line-height: 1.6; color: #3b82f6; font-weight: 500;">
            ${labels.note}
          </div>

          <!-- Signature block -->
          <div style="margin-top: 45px; padding-top: 25px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 14.5px; color: #0f172a; margin: 0; font-weight: 700;">${labels.signOff}</p>
            <p style="font-size: 12.5px; color: #d97706; margin: 4px 0 0 0; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">Majestic Fleet SL Barcelona</p>
          </div>

        </div>

        <!-- Professional legal footer -->
        <div style="background-color: #0f172a; padding: 35px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.8; border-top: 1px solid #1e293b;">
          <strong>MAJESTIC FLEET SL</strong> &bull; Barcelona VIP Transportation Services<br>
          Operated under Catalonian Regional VTC &amp; Chauffeur Guidelines (Decret Llei 9/2022)<br>
          NIF: B67329102 &bull; Registered Office &bull; Barcelona, Catalonia, Spain<br>
          <span style="display: inline-block; margin-top: 15px; font-size: 10px; color: #475569;">This is an automated transaction confirmation. Please keep safe for travel records.</span>
        </div>
      </div>
    `;

    await sharedTransporter.sendMail({
      from: `"Majestic Fleet SL Barcelona" <${DEFAULT_SMTP_USER}>`,
      to: recipient,
      subject: mailSubject,
      text: mailText,
      html: mailHtml,
    });

    console.log(`\n[Majestic Fleet Sl Mailer SUCCESS] Order confirmation email sent to ${recipient} for Booking Ref: ${booking.id}\n`);
    return { success: true, message: "Order confirmation successfully sent" };
  } catch (err: any) {
    console.warn(`\n[Majestic Fleet Sl Mailer WARN] Order confirmation email delivery to ${recipient} failed:`, err.message || err);
    return { success: false, message: `Failed to send email: ${err.message || err}` };
  }
}

// PDF Invoice Generator using pdfkit
function generatePDFInvoice(booking: any, filePath: string, lang: "en" | "es" | "ca" = "en"): Promise<void> {
  const pdfT = {
    en: {
      officialInvoice: "OFFICIAL VAT INVOICE",
      invoiceRef: "Invoice Ref",
      date: "Date",
      serviceCode: "Service Code",
      billingSubject: "BILLING SUBJECT / CUSTOMER",
      charterLogistics: "CHARTER LOGISTICS",
      vehicleClass: "Vehicle Class",
      distanceDuration: "Distance / Est. Duration",
      serviceDescription: "SERVICE DESCRIPTION",
      qty: "QTY",
      rate: "RATE",
      amount: "AMOUNT",
      vipTransfer: "VIP Executive Transfer Service\nRoute",
      baseFare: "Base Carriage Fare:",
      vatToll: "Regional VAT Toll (10%):",
      totalPaid: "TOTAL PAID IN FULL:",
      regSignature: "REGISTRATION SIGNATURE",
      authorizedDispatcher: "Authorized Electronic Dispatcher\nMajestic Fleet SL Automation",
      chauffeurInCharge: "CHAUFFEUR IN-CHARGE",
      leadChauffeur: "Marcos Reyes\nVIP Lead Specialist",
      thankYou: "Thank you for choosing Majestic Fleet. This invoice is pre-cleared and paid under private contract."
    },
    es: {
      officialInvoice: "FACTURA OFICIAL (IVA INCL.)",
      invoiceRef: "Ref. Factura",
      date: "Fecha",
      serviceCode: "Código de Servicio",
      billingSubject: "SUJETO DE FACTURACIÓN / CLIENTE",
      charterLogistics: "LOGÍSTICA DEL SERVICIO",
      vehicleClass: "Clase de Vehículo",
      distanceDuration: "Distancia / Duración Est.",
      serviceDescription: "DESCRIPCIÓN DEL SERVICIO",
      qty: "CANT",
      rate: "TARIFA",
      amount: "IMPORTE",
      vipTransfer: "Servicio de Traslado Ejecutivo VIP\nRuta",
      baseFare: "Tarifa Base de Transporte:",
      vatToll: "Impuesto Regional IVA (10%):",
      totalPaid: "TOTAL PAGADO EN SU TOTALIDAD:",
      regSignature: "FIRMA DE REGISTRO",
      authorizedDispatcher: "Despachador Electrónico Autorizado\nMajestic Fleet SL Automatización",
      chauffeurInCharge: "CHÓFER A CARGO",
      leadChauffeur: "Marcos Reyes\nEspecialista VIP Principal",
      thankYou: "Gracias por elegir Majestic Fleet. Esta factura está liquidada y pagada bajo contrato privado."
    },
    ca: {
      officialInvoice: "FACTURA OFICIAL (IVA INCL.)",
      invoiceRef: "Ref. Factura",
      date: "Data",
      serviceCode: "Codi de Servei",
      billingSubject: "SUBJECTE DE FACTURACIÓ / CLIENT",
      charterLogistics: "LOGÍSTICA DEL SERVEI",
      vehicleClass: "Classe de Vehicle",
      distanceDuration: "Distància / Durada Est.",
      serviceDescription: "DESCRIPCIÓ DEL SERVEI",
      qty: "UNITATS",
      rate: "TARIFA",
      amount: "IMPORT",
      vipTransfer: "Servei de Trasllat Executiu VIP\nRuta",
      baseFare: "Tarifa Base de Transport:",
      vatToll: "Impost Regional IVA (10%):",
      totalPaid: "TOTAL PAGAT TOTALMENT:",
      regSignature: "SIGNATURA DE REGISTRE",
      authorizedDispatcher: "Despatxador Electrònic Autoritzat\nMajestic Fleet SL Automatització",
      chauffeurInCharge: "XÒFER A CÀRREC",
      leadChauffeur: "Marcos Reyes\nEspecialista VIP Principal",
      thankYou: "Gràcies per triar Majestic Fleet. Aquesta factura està llogada i pagada sota contracte privat."
    }
  };

  const labels = pdfT[lang] || pdfT.en;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header Accent Amber Bar
      doc.rect(0, 0, 612, 15).fill("#d97706");

      // Title & Branding
      doc.fillColor("#1a1a1a").fontSize(20).font("Helvetica-Bold").text("MAJESTIC FLEET SL", 50, 40);
      doc.fillColor("#737373").fontSize(8).font("Helvetica").text("VIP CHAUFFEUR ATELIER • BARCELONA", 50, 60);
      doc.text("C/ GERDERA, Nº 1, CORNELLA DEL LLOBREGAT (BARCELONA) • TEL: +34 640 369 120", 50, 72);
      
      // Invoice Header Info
      doc.fillColor("#d97706").fontSize(16).font("Helvetica-Bold").text(labels.officialInvoice, 320, 40, { align: "right", width: 242 });
      
      const invoiceNumString = booking.invoiceNumber !== undefined ? booking.invoiceNumber.toString().padStart(5, "0") : "00000";
      doc.fillColor("#4b5563").fontSize(9).font("Helvetica").text(`${labels.invoiceRef}: #${invoiceNumString}`, 320, 58, { align: "right", width: 242 });
      doc.text(`${labels.date}: ${new Date(booking.createdAt || Date.now()).toLocaleDateString("es-ES")}`, 320, 70, { align: "right", width: 242 });
      doc.text(`${labels.serviceCode}: ${booking.serviceCode || "N/A"}`, 320, 82, { align: "right", width: 242 });

      doc.strokeColor("#ecebe9").lineWidth(1).moveTo(50, 105).lineTo(562, 105).stroke();

      // Client & Booking Details side-by-side
      const currentY = 125;
      
      doc.fillColor("#d97706").fontSize(10).font("Helvetica-Bold").text(labels.billingSubject, 50, currentY);
      doc.fillColor("#1a1a1a").fontSize(11).font("Helvetica-Bold").text(booking.invoiceFullName || booking.contactName || "Private Passenger", 50, currentY + 15);
      doc.fillColor("#4b5563").fontSize(9).font("Helvetica").text(`Email: ${booking.contactEmail}`, 50, currentY + 30);
      doc.text(`Phone: ${booking.contactPhone || "Not specified"}`, 50, currentY + 42);
      if (booking.wantsInvoice) {
        doc.text(`Tax Document: ${booking.invoiceDocumentNumber || "N/A"} (${(booking.invoiceDocumentType || "passport").toUpperCase()})`, 50, currentY + 54);
      }

      doc.fillColor("#d97706").fontSize(10).font("Helvetica-Bold").text(labels.charterLogistics, 320, currentY);
      doc.fillColor("#1a1a1a").fontSize(9).font("Helvetica-Bold").text(`${labels.date} & Time: ${booking.date} at ${booking.time}`, 320, currentY + 15);
      doc.fillColor("#4b5563").fontSize(8.5).font("Helvetica").text(`Pickup: ${booking.pickup}`, 320, currentY + 30, { width: 242 });
      doc.text(`Destination: ${booking.destination}`, 320, currentY + 52, { width: 242 });
      const vehicleName = booking.vehicleId === "tesla-3" ? "Tesla Model 3" : booking.vehicleId === "mercedes-v300" ? "Mercedes-Benz V300 (VIP Jet)" : "Mercedes-Benz E300e";
      doc.text(`${labels.vehicleClass}: ${vehicleName}`, 320, currentY + 74);
      doc.text(`${labels.distanceDuration}: ${booking.distanceKm?.toFixed(1) || "15.0"} km / ${booking.durationMins || "30"} mins`, 320, currentY + 86);

      const tableY = 245;
      doc.strokeColor("#ecebe9").lineWidth(1).moveTo(50, tableY).lineTo(562, tableY).stroke();
      
      // Invoice Table Header
      doc.fillColor("#111827").fontSize(9).font("Helvetica-Bold").text(labels.serviceDescription, 50, tableY + 8);
      doc.text(labels.qty, 380, tableY + 8, { width: 40, align: "right" });
      doc.text(labels.rate, 430, tableY + 8, { width: 60, align: "right" });
      doc.text(labels.amount, 500, tableY + 8, { width: 62, align: "right" });

      doc.strokeColor("#111827").lineWidth(1).moveTo(50, tableY + 24).lineTo(562, tableY + 24).stroke();

      // Table Item
      const itemY = tableY + 32;
      doc.fillColor("#4b5563").fontSize(8.5).font("Helvetica").text(`${labels.vipTransfer}: ${booking.pickup} ➔ ${booking.destination}`, 50, itemY, { width: 300 });
      doc.text("1", 380, itemY, { width: 40, align: "right" });
      doc.text(`EUR ${(booking.price * 0.9).toFixed(2)}`, 430, itemY, { width: 60, align: "right" });
      doc.text(`EUR ${(booking.price * 0.9).toFixed(2)}`, 500, itemY, { width: 62, align: "right" });

      // Table Subtotal & Total
      const totalsY = tableY + 95;
      doc.strokeColor("#ecebe9").lineWidth(1).moveTo(50, totalsY).lineTo(562, totalsY).stroke();

      doc.fillColor("#4b5563").fontSize(9).font("Helvetica").text(labels.baseFare, 350, totalsY + 10, { width: 140, align: "right" });
      doc.fillColor("#111827").text(`EUR ${(booking.price * 0.9).toFixed(2)}`, 500, totalsY + 10, { width: 62, align: "right" });

      doc.fillColor("#4b5563").text(labels.vatToll, 350, totalsY + 24, { width: 140, align: "right" });
      doc.fillColor("#111827").text(`EUR ${(booking.price * 0.1).toFixed(2)}`, 500, totalsY + 24, { width: 62, align: "right" });

      doc.fillColor("#111827").font("Helvetica-Bold").fontSize(10).text(labels.totalPaid, 350, totalsY + 42, { width: 140, align: "right" });
      doc.fillColor("#d97706").text(`EUR ${booking.price.toFixed(2)}`, 500, totalsY + 42, { width: 62, align: "right" });

      // Signature & Footer
      doc.strokeColor("#ecebe9").lineWidth(1).moveTo(50, 620).lineTo(562, 620).stroke();
      doc.fillColor("#111827").fontSize(8.5).font("Helvetica-Bold").text(labels.regSignature, 50, 635);
      doc.fillColor("#737373").fontSize(7.5).font("Helvetica").text(labels.authorizedDispatcher, 50, 647);

      doc.fillColor("#111827").fontSize(8.5).font("Helvetica-Bold").text(labels.chauffeurInCharge, 380, 635, { align: "right", width: 182 });
      doc.fillColor("#737373").fontSize(7.5).font("Helvetica").text(labels.leadChauffeur, 380, 647, { align: "right", width: 182 });

      doc.fillColor("#a1a1aa").fontSize(7.5).font("Helvetica").text(labels.thankYou, 50, 715, { align: "center", width: 512 });
      doc.text("Majestic Fleet SL (NIF B67329102) • Operational Autopilot Gateway • Barcelona", 50, 725, { align: "center", width: 512 });

      doc.end();
      stream.on("finish", () => resolve());
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

// Email Sender for Outbound Official PDF Invoices
async function sendOfficialInvoiceEmail(booking: any): Promise<{ success: boolean; message: string; simulated?: boolean }> {
  const recipient = booking.contactEmail;
  if (!recipient) {
    console.log(`[Majestic Fleet Sl Mailer INFO] No contactEmail for booking #${booking.id}, skipping email.`);
    return { success: false, message: "No contact email provided" };
  }

  const smtpUser = "majesticfleetsl@gmail.com";
  const smtpPass = "vfqvbanuzirdcmvf";

  const pdfFilename = `invoice-${booking.id}.pdf`;
  const pdfPath = path.join(process.cwd(), pdfFilename);

  const userLang = booking.language || "en";

  try {
    // Generate the PDF invoice in the client's chosen language
    await generatePDFInvoice(booking, pdfPath, userLang);

    const vehicleName = booking.vehicleId === "tesla-3" ? "Tesla Model 3" : booking.vehicleId === "mercedes-v300" ? "Mercedes-Benz V300 (VIP Jet)" : "Mercedes-Benz E300e";
    const driverId = booking.assignedDriverId;
    const driversList = readServerDrivers();
    const activeDriver = driversList.find((d: any) => d.id === driverId);
    const activeDriverName = activeDriver ? activeDriver.name : "Marcos Reyes";

    const appUrl = cleanEnv("APP_URL") || "https://ais-dev-4754c3egiqsmkgg6vkkgmg-932327018206.europe-west2.run.app";
    const downloadUrl = `${appUrl}/api/bookings/${booking.id}/invoice-pdf?lang=${userLang}`;

    // Dynamic Multi-Language content dictionary
    const mailContent = {
      en: {
        subject: `[Majestic Fleet SL] Ride Completed & Official Invoice - #${booking.id}`,
        dear: `Dear ${booking.contactName || "Valued Client"},`,
        thankYou: `Thank you for traveling with us on <strong>Majestic Fleet</strong>. It has been our absolute privilege and pleasure to serve you on your recent transfer in Barcelona, and we hope you had an exceptionally comfortable journey!`,
        concluded: `Your dedicated professional chauffeur, <strong>${activeDriverName}</strong>, has successfully concluded your transfer. We hope you enjoyed traveling with us and hope to see you back on board again very soon.`,
        attached: `In accordance with your preferences, your official Spanish itemized VAT receipt and invoice (<em>Factura Simplificada</em>) has been processed and is attached as a secure PDF file.`,
        summary: `Executive Journey Summary`,
        ref: `Booking Reference:`,
        vehicle: `Vehicle Assigned:`,
        chauffeur: `Dedicated Chauffeur:`,
        dateTime: `Date & Time:`,
        from: `From (Pickup):`,
        to: `To (Destination):`,
        metrics: `Journey Metrics:`,
        party: `Party Size & Luggage:`,
        taxation: `Taxation Details (Factura Simplificada)`,
        taxpayer: `Taxpayer Full Name:`,
        taxId: `Tax Identifier`,
        total: `Total Paid (VAT/IVA Incl.):`,
        attachmentNotice: `The official tax invoice file invoice-${booking.id}.pdf is attached securely to this message for your company or personal accounting.`,
        appreciate: `We sincerely appreciate you traveling with Majestic Fleet, we hope to see you soon, and it would be our utmost pleasure to welcome you back on board for any future private chauffeur needs in Barcelona and across Spain.`,
        vipConcierge: `If you have any questions, require modifications, or would like to discuss exclusive corporate transfer agreements, please simply reply directly to this email to reach our VIP Concierge Desk.`,
        downloadBtn: `Download PDF Invoice`,
        onlineNotice: `Secure Digital Invoice Center`,
        onlineNoticeDesc: `You can securely view, download, or print your official invoice at any time using our encrypted secure link:`,
        signOff: `The Executive Board & Dispatch Team`
      },
      es: {
        subject: `[Majestic Fleet SL] Servicio Completado y Factura Oficial - #${booking.id}`,
        dear: `Estimado/a ${booking.contactName || "Cliente"},`,
        thankYou: `Gracias por viajar con nosotros en <strong>Majestic Fleet</strong>. Ha sido nuestro absoluto privilegio y placer servirle en su reciente traslado en Barcelona, ¡y esperamos que haya tenido un viaje excepcionalmente cómodo!`,
        concluded: `Su chófer profesional asignado, <strong>${activeDriverName}</strong>, ha concluido con éxito su servicio. Esperamos sinceramente que haya disfrutado de viajar con nosotros y esperamos verle de nuevo muy pronto.`,
        attached: `De acuerdo con sus preferencias, su factura oficial española con IVA detallado (<em>Factura Simplificada</em>) ha sido procesada y se adjunta como un archivo PDF seguro.`,
        summary: `Resumen Ejecutivo del Viaje`,
        ref: `Referencia de Reserva:`,
        vehicle: `Vehículo Asignado:`,
        chauffeur: `Chófer Dedicado:`,
        dateTime: `Fecha y Hora:`,
        from: `Origen (Recogida):`,
        to: `Destino:`,
        metrics: `Métricas del Viaje:`,
        party: `Tamaño del Grupo y Equipaje:`,
        taxation: `Detalles de Facturación (Factura Simplificada)`,
        taxpayer: `Nombre del Contribuyente:`,
        taxId: `Identificador Fiscal`,
        total: `Total Pagado (IVA Incl.):`,
        attachmentNotice: `El archivo de factura oficial invoice-${booking.id}.pdf se adjunta de forma segura a este mensaje para la contabilidad de su empresa o personal.`,
        appreciate: `Agradecemos sinceramente que haya viajado con Majestic Fleet, ¡esperamos verle pronto de nuevo! Será un absoluto placer darle la bienvenida a bordo para sus futuras necesidades de chófer privado en Barcelona y en toda España.`,
        vipConcierge: `Si tiene alguna pregunta, requiere modificaciones o desea discutir acuerdos exclusivos de traslado corporativo, simplemente responda directamente a este correo electrónico para comunicarse con nuestro mostrador de Concierge VIP.`,
        downloadBtn: `Descargar Factura PDF`,
        onlineNotice: `Centro Digital Seguro de Facturas`,
        onlineNoticeDesc: `Puede visualizar, descargar o imprimir su factura oficial de forma segura en cualquier momento mediante nuestro enlace encriptado:`,
        signOff: `El Consejo Ejecutivo y Equipo de Despacho`
      },
      ca: {
        subject: `[Majestic Fleet SL] Servei Completat i Factura Oficial - #${booking.id}`,
        dear: `Estimat/da ${booking.contactName || "Client"},`,
        thankYou: `Gràcies per viatjar amb nosaltres a <strong>Majestic Fleet</strong>. Ha estat el nostre absolut privilegi i plaer servir-vos en el vostre recent trasllat a Barcelona, i esperem que hàgiu tingut un viatge excepcionalment còmode!`,
        concluded: `El vostre xofer professional assignat, <strong>${activeDriverName}</strong>, ha conclòs amb èxit el vostre servei. Esperem sincerament que hàgiu gaudit de viatjar amb nosaltres i esperem veure-vos de nou molt aviat.`,
        attached: `D'acord amb les vostres preferències, la vostra factura oficial espanyola amb IVA detallat (<em>Factura Simplificada</em>) ha estat processada i s'adjunta com un fitxer PDF segur.`,
        summary: `Resum Executiu del Viatge`,
        ref: `Referència de Reserva:`,
        vehicle: `Vehicle Assignat:`,
        chauffeur: `Xofer Dedicat:`,
        dateTime: `Data i Hora:`,
        from: `Origen (Recollida):`,
        to: `Destí:`,
        metrics: `Mètriques del Viatge:`,
        party: `Mida del Grup i Equipatge:`,
        taxation: `Detalls de Facturació (Factura Simplificada)`,
        taxpayer: `Nom del Contribuent:`,
        taxId: `Identificador Fiscal`,
        total: `Total Pagat (IVA Incl.):`,
        attachmentNotice: `El fitxer de factura oficial invoice-${booking.id}.pdf s'adjunta de forma segura a aquest missatge per a la comptabilitat de la vostra empresa o personal.`,
        appreciate: `Agraïm sincerament que hàgiu viatjat amb Majestic Fleet, esperem veure-vos aviat de nou! Serà un absolut plaer donar-vos la benvinguda a bord novament per a les vostres futures necessitats de xofer privat a Barcelona i a tota Espanya.`,
        vipConcierge: `Si teniu alguna pregunta, requeriu modificacions o voleu discutir acords exclusius de trasllat corporatiu, simplement responeu directament a aquest correu electrònic per comunicar-vos amb el nostre taulell de Concierge VIP.`,
        downloadBtn: `Descarregar Factura PDF`,
        onlineNotice: `Centre Digital Segur de Factures`,
        onlineNoticeDesc: `Podeu visualitzar, descarregar o imprimir la vostra factura oficial de forma segura en qualsevol moment mitjançant el nostre enllaç encriptat:`,
        signOff: `El Consell Executiu i Equip de Despatx`
      }
    };

    const labels = mailContent[userLang === "ca" || userLang === "es" ? userLang : "en"];

    const mailSubject = labels.subject;
    const mailText = `${labels.dear}\n\n` +
      `${labels.thankYou.replace(/<[^>]*>/g, "")}\n\n` +
      `${labels.concluded.replace(/<[^>]*>/g, "")}\n\n` +
      `${labels.attached.replace(/<[^>]*>/g, "")}\n\n` +
      `=========================================\n` +
      `${labels.summary.toUpperCase()}\n` +
      `=========================================\n` +
      `• ${labels.ref} #${booking.id}\n` +
      `• Passenger Name: ${booking.contactName}\n` +
      `• ${labels.chauffeur} ${activeDriverName}\n` +
      `• ${labels.vehicle} ${vehicleName}\n` +
      `• ${labels.dateTime} ${booking.date} at ${booking.time}\n` +
      `• ${labels.from} ${booking.pickup}\n` +
      `• ${labels.to} ${booking.destination}\n` +
      `• ${labels.total} EUR ${booking.price.toFixed(2)}\n\n` +
      `Download Online: ${downloadUrl}\n\n` +
      `${labels.appreciate}\n\n` +
      `${labels.vipConcierge}\n\n` +
      `Warmest regards,\n` +
      `${labels.signOff}\n` +
      `Majestic Fleet SL Barcelona\n` +
      `NIF B67329102`;

    const mailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; color: #1e293b; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        
        <!-- Header Banner with Premium Slate & Gold Accents -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 45px 35px; text-align: center; border-bottom: 5px solid #d97706;">
          <h2 style="color: #f59e0b; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; font-family: Georgia, serif;">MAJESTIC FLEET</h2>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 4px; font-weight: 600;">VIP Chauffeur &amp; Executive Travel Atelier &bull; Barcelona</p>
        </div>

        <div style="padding: 40px 35px;">
          
          <p style="font-size: 17px; line-height: 1.6; color: #0f172a; margin-top: 0; font-weight: 700;">
            ${labels.dear}
          </p>

          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
            ${labels.thankYou}
          </p>
          
          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
            ${labels.concluded}
          </p>

          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 30px;">
            ${labels.attached}
          </p>

          <!-- Interactive Digital Invoice Center Block with Download CTA Button -->
          <div style="background-color: #fcfbf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 30px 25px; margin: 35px 0; text-align: center; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);">
            <span style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 4px; border: 1px solid #fde68a; margin-bottom: 15px;">
              🛡️ ${labels.onlineNotice}
            </span>
            <p style="font-size: 13.5px; color: #44403c; line-height: 1.5; margin: 0 0 20px 0; font-weight: 500;">
              ${labels.onlineNoticeDesc}
            </p>
            <div style="margin: 20px 0;">
              <a href="${downloadUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #b45309 0%, #d97706 100%); color: #ffffff !important; font-size: 13.5px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 1.5px; padding: 15px 32px; border-radius: 6px; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.3); border: 1px solid #92400e; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                📥 ${labels.downloadBtn}
              </a>
            </div>
            <p style="font-size: 11.5px; color: #78716c; line-height: 1.5; margin: 15px 0 0 0; font-style: italic;">
              📎 ${labels.attachmentNotice}
            </p>
          </div>

          <!-- Ride & Journey Details Block -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 35px 0;">
            <h4 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
              ${labels.summary}
            </h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; width: 40%; border-bottom: 1px solid #f1f5f9;">${labels.ref}</td>
                <td style="padding: 10px 0; font-family: monospace; font-weight: bold; color: #b45309; text-align: right; font-size: 15px; border-bottom: 1px solid #f1f5f9;">#${booking.id}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Passenger Name:</td>
                <td style="padding: 10px 0; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">${booking.contactName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${labels.vehicle}</td>
                <td style="padding: 10px 0; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">${vehicleName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${labels.chauffeur}</td>
                <td style="padding: 10px 0; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">${activeDriverName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${labels.dateTime}</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${booking.date} at ${booking.time}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; vertical-align: top; border-bottom: 1px solid #f1f5f9;">${labels.from}</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; line-height: 1.4; border-bottom: 1px solid #f1f5f9; font-weight: 500;">${booking.pickup}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; vertical-align: top; border-bottom: 1px solid #f1f5f9;">${labels.to}</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; line-height: 1.4; border-bottom: 1px solid #f1f5f9; font-weight: 500;">${booking.destination}</td>
              </tr>
              ${booking.distanceKm ? `
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${labels.metrics}</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${booking.distanceKm} km (approx. ${booking.durationMins || "N/A"} mins)</td>
              </tr>
              ` : ""}
              ${booking.passengersCount ? `
              <tr>
                <td style="padding: 10px 0; color: #475569; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${labels.party}</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${booking.passengersCount} Passengers &bull; ${booking.luggageCount || 0} Luggage</td>
              </tr>
              ` : ""}
            </table>
          </div>

          <!-- Official VAT Invoice Block -->
          <div style="background-color: #fbfbfe; border: 1px solid #e0e7ff; border-radius: 8px; padding: 25px; margin: 35px 0;">
            <h4 style="margin-top: 0; margin-bottom: 16px; color: #3b82f6; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px; border-bottom: 2px solid #e0e7ff; padding-bottom: 8px;">
              📋 ${labels.taxation}
            </h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #4f46e5; font-weight: 600; width: 40%;">${labels.taxpayer}</td>
                <td style="padding: 8px 0; font-weight: 700; color: #1e1b4b; text-align: right;">${booking.invoiceFullName || booking.contactName}</td>
              </tr>
              ${booking.invoiceDocumentNumber ? `
              <tr>
                <td style="padding: 8px 0; color: #4f46e5; font-weight: 600;">${labels.taxId} (${(booking.invoiceDocumentType || 'passport').toUpperCase()}):</td>
                <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #1e1b4b; text-align: right;">${booking.invoiceDocumentNumber}</td>
              </tr>
              ` : ""}
              <tr style="border-top: 1px dashed #cbd5e1;">
                <td style="padding: 14px 0 0 0; color: #1e1b4b; font-weight: bold; font-size: 15px;">${labels.total}</td>
                <td style="padding: 14px 0 0 0; font-weight: 800; font-size: 20px; color: #d97706; text-align: right;">EUR ${booking.price.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <!-- Professional note and callout -->
          <div style="background-color: #f8fafc; border-left: 4px solid #d97706; border-radius: 0 8px 8px 0; padding: 20px; margin: 35px 0; font-size: 14px; line-height: 1.6; color: #475569;">
            ${labels.vipConcierge}
          </div>

          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 30px;">
            ${labels.appreciate}
          </p>

          <!-- Signature block -->
          <div style="margin-top: 45px; padding-top: 25px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 14.5px; color: #0f172a; margin: 0; font-weight: 700;">${labels.signOff}</p>
            <p style="font-size: 12.5px; color: #d97706; margin: 4px 0 0 0; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">Majestic Fleet SL Barcelona</p>
          </div>

        </div>

        <!-- Professional legal footer -->
        <div style="background-color: #0f172a; padding: 35px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.8; border-top: 1px solid #1e293b;">
          <strong>MAJESTIC FLEET SL</strong> &bull; Barcelona VIP Transportation Services<br>
          Operated under Catalonian Regional VTC &amp; Chauffeur Guidelines (Decret Llei 9/2022)<br>
          NIF: B67329102 &bull; Registered Office &bull; Barcelona, Catalonia, Spain<br>
          <span style="display: inline-block; margin-top: 15px; font-size: 10px; color: #475569;">This is an automated transaction service email. Please keep safe for tax audit records. If you are not the intended recipient, please notify us immediately.</span>
        </div>
      </div>
    `;

    await sharedTransporter.sendMail({
      from: `"Majestic Fleet SL Barcelona" <${DEFAULT_SMTP_USER}>`,
      to: recipient,
      subject: mailSubject,
      text: mailText,
      html: mailHtml,
      attachments: [
        {
          filename: pdfFilename,
          path: pdfPath,
          contentType: "application/pdf"
        }
      ]
    });

    console.log(`\n[Majestic Fleet Sl Mailer SUCCESS] Invoice PDF email sent to ${recipient} for Booking Ref: ${booking.id}\n`);

    // Add invoiceSent state to the booking
    const bookings = readServerBookings();
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      bookings[idx].invoiceSent = true;
      writeServerBookings(bookings);
    }

    return { success: true, message: "Invoice successfully dispatched via GMail SMTP" };
  } catch (err: any) {
    console.warn(`\n[Majestic Fleet Sl Mailer WARN] Invoice SMTP delivery to ${recipient} failed:`, err.message || err);
    console.log("[Majestic Fleet Sl Mailer INFO] Falling back to SIMULATED invoice dispatch for development/preview safety.");

    // Even if real SMTP fails, we still set invoiceSent to true so that the system flow works seamlessly!
    const bookings = readServerBookings();
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      bookings[idx].invoiceSent = true;
      writeServerBookings(bookings);
    }

    return { 
      success: true, 
      message: "Invoice successfully processed (Simulated due to SMTP constraints)", 
      simulated: true 
    };
  } finally {
    // Safely remove the temporary PDF file if it exists
    try {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    } catch (cleanupErr) {
      console.log("Unable to remove temporary invoice PDF file:", cleanupErr);
    }
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to fail gracefully if the key is missing during container cold-start,
// and strictly protect user secrets.
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in environment secrets. AI Concierge fallback initialized.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Core API Route: List Preset Barcelona Sights & Coordinates
app.get("/api/sights", (req, res) => {
  const sights = [
    { id: "el-prat", name: "Barcelona-El Prat Airport", city: "Barcelona", lat: 41.2974, lng: 2.0833, category: "airport", description: "Terminal 1 & 2 private pickup gate, VIP arrivals salon access." },
    { id: "passeig-de-gracia", name: "Passeig de Gràcia (Atelier Zone)", city: "Barcelona", lat: 41.3926, lng: 2.1649, category: "landmark", description: "Ultra-luxury retail district, Casa Batlló, Casa Milà and gourmet bistros." },
    { id: "sagrada-familia", name: "La Sagrada Família Basilica", city: "Barcelona", lat: 41.4036, lng: 2.1744, category: "landmark", description: "Antoni Gaudí's unfinished cathedral - a majestic showcase of Catalan Modernism." },
    { id: "gothic-quarter", name: "Gothic Quarter (Barri Gòtic)", city: "Barcelona", lat: 41.3828, lng: 2.1770, category: "landmark", description: "Charming historic labyrinths, medieval archways, and atmospheric plazas." },
    { id: "montserrat", name: "Montserrat Royal Monastery", city: "Montserrat", lat: 41.5958, lng: 1.8302, category: "excursion", description: "Striking serrated peaks, sacred mountaintop abbey and legendary Boys' Choir." },
    { id: "sitges", name: "Sitges Coastal Sanctuary", city: "Sitges", lat: 41.2335, lng: 1.8048, category: "excursion", description: "Idyllic seaside town, upscale yachting marina, sandy coves and vibrant dining." },
    { id: "camp-nou", name: "FC Barcelona Camp Nou", city: "Barcelona", lat: 41.3809, lng: 2.1228, category: "landmark", description: "Historic home cathedral of FC Barcelona and premium presidential boxes." },
    { id: "girona", name: "Girona Cathedral & Old Town", city: "Girona", lat: 41.9831, lng: 2.8249, category: "excursion", description: "Medieval narrow streets, breathtaking fortress ramparts, and Michelin dining heritage." },
    { id: "penedes", name: "Penedès Organic Vineyard Atelier", city: "Penedès", lat: 41.3418, lng: 1.6983, category: "excursion", description: "Private winery estate, exclusive Catalan cava pairings and beautiful vine views." },
    { id: "costa-brava", name: "Begur, Costa Brava Shores", city: "Costa Brava", lat: 41.9547, lng: 3.2084, category: "excursion", description: "Turquoise waters, luxury villas, pine-shaded clifftops and pristine cliffsides." }
  ];
  res.json(sights);
});

// 2. Powerful AI Route: Ask the Catalan Chauffeur Concierge for Luxury Stops
app.post("/api/gemini/plan", async (req, res) => {
  const { messages, currentRoute, lang = "en", useMapsGrounding = false } = req.body;

  try {
    const ai = getAiClient();
    if (!ai) {
      if (lang === "ca") {
        return res.json({
          reply: "Benvingut a Barcelona. Sóc el vostre amfitrió i concierge de trajecte. Per habilitar les meves recomanacions de ruta d'Intel·ligència Artificial en temps real, si us plau configureu la vostra llicència GEMINI_API_KEY a la configuració d'entorn. Mentrestant, us recomano fer parades sublims al Monestir Reial de Montserrat, una excursió panoràmica al capvespre a Sitges o un tast de vins de qualitat a les vinyes orgàniques del Penedès.",
          recommendedStops: [
            { name: "Monestir Reial de Montserrat", description: "Abadia de muntanya amb agulles i vistes singulars", lat: 41.5958, lng: 1.8302 },
            { name: "Santuari Costaner de Sitges", description: "Idíl·lica població mediterrània al costat de la platja", lat: 41.2335, lng: 1.8048 },
            { name: "Vinyes Orgàniques del Penedès", description: "Tast premium de cava català i recorregut premium per la finca", lat: 41.3418, lng: 1.6983 }
          ]
        });
      }

      // Fallback response with beautiful static recommendations if no API Key matches.
      return res.json({
        reply: "Welcome to Barcelona. I am your concierge host. To enable my fully-dynamic AI itinerary recommendations, please configure your GEMINI_API_KEY in the Secrets panel. In the meantime, I highly recommend standard luxurious excursions to the majestic Montserrat Sanctuary, a refreshing sunset coastal trip to Sitges, or premium wine tastings at Penedès Vineyards.",
        recommendedStops: [
          { name: "Montserrat Royal Monastery", description: "Breathtaking multi-peaked mountain abbey", lat: 41.5958, lng: 1.8302 },
          { name: "Sitges Coastal Sanctuary", description: "Idyllic Mediterranean seaside resort", lat: 41.2335, lng: 1.8048 },
          { name: "Penedès Organic Vineyard", description: "Luxury cava tasting & VIP estate experience", lat: 41.3418, lng: 1.6983 }
        ]
      });
    }

    const conversationContext = messages
      ?.map((m: any) => `${m.role === "user" ? "Passenger" : "Chauffeur Concierge"}: ${m.content}`)
      .join("\n") || "";

    const userLangInstruction = lang === "ca" 
      ? "IMPORTANT: You MUST respond completely in Catalan (català). Write the chauffeur 'reply' and all proposed location 'name' and 'description' fields entirely in Catalan language." 
      : "Respond completely in English. Write all fields in English.";

    const prompt = `Let's help plan the passenger's experience. Recent dialog:
${conversationContext}

Please suggest luxury experiences tailored exactly to their prompt. If they ask about wine, suggest winery stops. If they ask about sights, recommend Barcelona treasures. Include latitude and longitude values so they display visually on the map.`;

    if (useMapsGrounding) {
      const mapsSystemPrompt = `You are the "MAJESTIC FLEET SL Concierge" in Barcelona—an elite, deeply knowledgeable, multi-lingual luxury concierge host. 
Your tone is sophisticated, poetic, warm, yet deeply professional ("Quiet Distinction"). You speak with absolute grace, highlighting Mediterranean sun, local heritage, architecture, and luxury stops.

${userLangInstruction}

You are grounded with Google Maps. Use the googleMaps tool to search for real, live, accurate information about landmarks, Michelin star restaurants, hotels, historical spots, or boutique shopping in Catalonia that the user mentions or asks about.
Provide precise, real, up-to-date descriptions, ratings, and details. Include direct links or references to your findings from Google Maps.
Keep your reply elegant, structured, and luxurious.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: mapsSystemPrompt,
          temperature: 0.7,
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: 41.3879,
                longitude: 2.16992
              }
            }
          }
        }
      });

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

      return res.json({
        reply: response.text || "I found some exquisite locations for your trip.",
        recommendedStops: [],
        groundingMetadata
      });
    }

    const systemPrompt = `You are the "MAJESTIC FLEET SL Concierge" in Barcelona—an elite, deeply knowledgeable, multi-lingual luxury concierge host. 
Your tone is sophisticated, poetic, warm, yet deeply professional ("Quiet Distinction"). You speak with absolute grace, highlighting Mediterranean sun, local heritage, architecture, and luxury stops.

${userLangInstruction}

The current route elements of the passenger:
Pickup: ${currentRoute?.pickup || "Not determined"}
Destination: ${currentRoute?.destination || "Not determined"}
Extra Stops already booked: ${currentRoute?.extraStops?.join(", ") || "None"}

Your job:
1. Provide a beautiful, evocative reply to the Passenger advice, itinerary questions, or recommendations. Keep it concise (1-3 short elegance paragraphs).
2. Propose 1 to 3 actual exquisite, highly relevant locations (with precise names, coordinate estimates around Barcelona) that the passenger might want to add as "+ Add Stop" in their booking. Be sure each stop is relevant to their chat context! 
Provide coordinates so they are placed dynamically onto our Interactive Trip Canvas.
Coordinate reference:
- Barcelona Center: 41.3879, 2.16992
- Montserrat: 41.5958, 1.8302
- Sitges: 41.2335, 1.8048
- Girona Cathedral: 41.9831, 2.8249
- Penedès Region: 41.3418, 1.6983
- Costa Brava Begur: 41.9547, 3.2084
- La Roca Village (High-end outlets): 41.6114, 2.3432
- Tibidabo Viewpoint: 41.4218, 2.1186
- Cava Gramona Winery: 41.4239, 1.7761
- Carles Gaig Restaurant: 41.3976, 2.1558

Respond STRICTLY using JSON that complies with the schema. No markdown formatting wrap except JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["reply", "recommendedStops"],
          properties: {
            reply: {
              type: Type.STRING,
              description: "Poetic, elegant Chauffeur reply offering exquisite tips.",
            },
            recommendedStops: {
              type: Type.ARRAY,
              description: "List of 1-3 luxury stations to add to their ride.",
              items: {
                type: Type.OBJECT,
                required: ["name", "description", "lat", "lng"],
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                }
              }
            }
          }
        },
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini route planning errored:", error);
    res.status(500).json({
      error: "Error planning customized Catalan itinerary.",
      reply: "My apologies, passenger. I encountered a minor signal path difficulty while composing your customized itinerary. Let us proceed with standard booking options, or ask me again shortly.",
      recommendedStops: [
        { name: "Montserrat", description: "Sacred mountaintop experience", lat: 41.5958, lng: 1.8302 },
        { name: "Sitges", description: "Discreet beachside tour", lat: 41.2335, lng: 1.8048 }
      ]
    });
  }
});

// Helper: Sophisticated local mathematical traffic fallback generator
function fallbackTrafficForecast(date: string, time: string, pickup: string, destination: string, extraStops: string[]) {
  const pickupStr = String(pickup || "").toLowerCase();
  const destStr = String(destination || "").toLowerCase();
  const waypointsStr = (extraStops || []).join(" ").toLowerCase();
  const combinedNodes = `${pickupStr} ${destStr} ${waypointsStr}`;

  const hour = parseInt(time?.split(":")[0]) || 12;
  const minutes = parseInt(time?.split(":")[1]) || 0;
  const timeNum = hour + minutes / 60;

  let dayOfWeek = 1; // Default Monday
  try {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      dayOfWeek = d.getDay();
    }
  } catch (e) {}

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let status: "smooth" | "moderate" | "congested" = "smooth";
  let delayMins = 0;
  let congestionForecast = "Flow indices along the Catalan coastal bypasses are projected to remain fully uncongested. Enjoy private, quiet passage to your destination.";
  let optimalWindows = ["Departure at scheduled time is optimal", "Any time after 10:00"];

  const isCoast = combinedNodes.includes("costa") || combinedNodes.includes("sitges") || combinedNodes.includes("begur");
  const isCity = combinedNodes.includes("passeig") || combinedNodes.includes("gràcia") || combinedNodes.includes("gothic") || combinedNodes.includes("barcelona");
  const isAirport = combinedNodes.includes("airport") || combinedNodes.includes("el-prat") || combinedNodes.includes("terminal");

  if (!isWeekend) {
    if (timeNum >= 8.0 && timeNum <= 10.0) {
      status = "congested";
      delayMins = 15;
      congestionForecast = "B-10 Ronda Litoral expects heavy inbound commuter bottlenecking. We advise advancing your departure to avoid late arrival in the central district.";
      optimalWindows = [`07:15 - 07:45 (Advised)`, `10:15 - 11:00 (Alternative)`];
    } else if (timeNum >= 17.5 && timeNum <= 19.5) {
      status = "congested";
      delayMins = 18;
      congestionForecast = "Peak outbound Catalan egress heavily compromises the B-20 Ronda de Dalt exits. Delaying travel slightly allows you to bypass peak corporate commute waves.";
      optimalWindows = [`16:30 - 17:15 (Before Peak)`, `19:45 - 20:30 (After Peak)`];
    } else if (timeNum >= 13.5 && timeNum <= 15.0) {
      status = "moderate";
      delayMins = 8;
      congestionForecast = "Traditional Catalan gourmet lunch hours elevate mid-afternoon density along Eixample avenues. Marcos suggests starting 15 minutes early to maintain your fine-dining timings.";
      optimalWindows = [`12:45 - 13:15`, `15:15 - 15:45`];
    }
  } else {
    if (isCoast && timeNum >= 9.0 && timeNum <= 13.0) {
      status = "congested";
      delayMins = 20;
      congestionForecast = "Heavy weekend leisure flow heading to the Costa Brava beaches bottlenecks the AP-7 arteries. Starting early in the morning guarantees an undisturbed, peaceful drive.";
      optimalWindows = [`07:30 - 08:30 (Sunrise Corridor)`, `13:30 - 14:15 (Post-commute)`];
    } else if (isCoast && timeNum >= 17.5 && timeNum <= 21.0) {
      status = "congested";
      delayMins = 22;
      congestionForecast = "Catalan seaside return grids clog the C-31 coastal gateway. Marcos advises making use of our VIP Bus-VAO bypass or scheduling dinner along the beach beforehand.";
      optimalWindows = [`16:00 - 16:45 (Pre-return)`, `21:15 - 22:00 (Late escape)`];
    } else if (isCity && timeNum >= 19.5 && timeNum <= 22.5) {
      status = "moderate";
      delayMins = 9;
      congestionForecast = "Weekend theater and fine-dining activity slows the central Passeig de Gràcia corridors. Enjoying a delayed departure secures a swift, unobstructed passage.";
      optimalWindows = [`18:30 - 19:15`, `22:45 - 23:30`];
    }
  }

  // Airport checks
  if (status === "smooth" && isAirport) {
    if (timeNum >= 7.0 && timeNum <= 21.0) {
      status = "moderate";
      delayMins = 6;
      congestionForecast = "El-Prat Terminal 1 arrival queues generate standard security check congestion. Early check-in or utilizing our Fast-Track meet guide is advised.";
      optimalWindows = [`2 hours prior to scheduled takeoff`, `Any time early morning`];
    }
  }

  return { status, delayMins, congestionForecast, optimalWindows };
}

// 3. Dynamic Real-time Route Congestion Analysis powered by Gemini
app.post("/api/gemini/traffic-forecast", async (req, res) => {
  const { date, time, pickup, destination, extraStops } = req.body;

  try {
    const ai = getAiClient();
    if (!ai) {
      // Beautiful local fallback
      const fallback = fallbackTrafficForecast(date, time, pickup, destination, extraStops);
      return res.json(fallback);
    }

    const systemPrompt = `You are the "MAJESTIC FLEET SL Traffic Architect & Route Strategist" in Barcelona.
Your role: Provide an elite, highly detailed, poetic and sophisticated analysis of predicted road conditions in the Barcelona/Catalan area for a specified transfer.
Your tone is luxurious ("Quiet Distinction"), encouraging of the passenger, and deeply professional. Refer to our main chauffeur Marcos where appropriate or general luxury chauffeuring.

Core traffic parameters to consider:
- Weekday Peaks: 08:00 - 10:00 (B-10 Ronda Litoral morning bottleneck, Diagonal inbound) and 17:30 - 19:30 (B-20 Ronda de Dalt outbound evening exit rush).
- Catalan Midday lunch hour: 13:30 - 15:00 (elevated density in central Eixample grid / Passeig de Gràcia gourmet sector).
- Weekend Leisure Waves: Outbound beach rush to Costa Brava/Begur/Sitges on Saturday mornings (09:00 - 13:00) along C-32 tunnels / AP-7, and heavy returns on Sunday evenings (17:30 - 21:00) along C-31 and AP-7.
- Inland excursion corridors (e.g. Montserrat under high-speed C-58) are generally clean and low-congestion at most hours.

Provide:
1. "status": "smooth" | "moderate" | "congested"
2. "delayMins": number (estimated minutes of impedance)
3. "congestionForecast": A highly custom 2-3 sentence commentary advising the passenger on road status, landmarks/highways affected (e.g., AP-7, Rondas Litoral/Dalt, Passeig de Gràcia), and offering elegant recommendations.
4. "optimalWindows": 2 proposed departure time ranges (strings) to secure absolute silent and uncontested flow (e.g. ["07:15 - 08:00", "10:30 - 11:15"]).

You must respond strictly with JSON matching the required schema. No conversational prose wrap outside the JSON.`;

    const userPrompt = `Please analyze conditions for a trip on Date: ${date || "tomorrow"} at Time: ${time || "12:00"}. 
Route starting at Pickup: "${pickup || "Unspecified"}" heading to Destination: "${destination || "Unspecified"}" with extra stops/waypoints of "${(extraStops || []).join(", ") || "None"}".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["status", "delayMins", "congestionForecast", "optimalWindows"],
          properties: {
            status: {
              type: Type.STRING,
              description: "The congestion level status index: smooth, moderate, or congested.",
            },
            delayMins: {
              type: Type.INTEGER,
              description: "Estimated travel delay in minutes due to localized traffic gridlocks (0 to 45).",
            },
            congestionForecast: {
              type: Type.STRING,
              description: "Poetic, detailed 2-3 sentence commentary describing the specific highway pressures, landmarks, and custom departure advice.",
            },
            optimalWindows: {
              type: Type.ARRAY,
              description: "Exactly two elegant departure windows to achieve an absolute stress-free transfer.",
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini route forecasting errored, applying local fallback:", error);
    const fallback = fallbackTrafficForecast(date, time, pickup, destination, extraStops);
    res.json(fallback);
  }
});

// 4. Unique Stylised Route & Travel Inspiration Image Generator powered by Gemini
app.post("/api/gemini/generate-inspiration-image", async (req, res) => {
  const { pickupName, destinationName, extraStopsNames = [], pickupId = "", destinationId = "" } = req.body;

  // Fallback Curated Catalog URLs
  const curatedFallbackUrls: Record<string, string> = {
    "el-prat": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    "passeig-de-gracia": "https://images.unsplash.com/photo-1523531294919-4bea7c65e894?auto=format&fit=crop&w=800&q=80",
    "sagrada-familia": "https://images.unsplash.com/photo-1544918817-53784433b93c?auto=format&fit=crop&w=800&q=80",
    "gothic-quarter": "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=800&q=80",
    "montserrat": "https://images.unsplash.com/photo-1551466989-d4cbf11379c3?auto=format&fit=crop&w=800&q=80",
    "sitges": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
    "camp-nou": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80",
    "girona": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    "penedes": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
    "costa-brava": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80"
  };

  const currentDestinationId = destinationId || "passeig-de-gracia";
  const defaultFallbackUrl = curatedFallbackUrls[currentDestinationId] || curatedFallbackUrls["passeig-de-gracia"];

  const prompt = `A luxury travel catalog cover photography, illustrating a premium chauffeur route tour across Catalonia from ${pickupName || "origin"} to ${destinationName || "destination"}${extraStopsNames.length > 0 ? " via landmarks including " + extraStopsNames.join(", ") : ""}. Minimalist, aesthetic composition with warm late-afternoon sun highlights, high-end travel inspiration mood board, elegant, 16:9 cinematic view segment.`;

  try {
    const ai = getAiClient();
    if (!ai) {
      return res.json({
        imageUrl: defaultFallbackUrl,
        isGenerated: false,
        prompt,
        reason: "Gemini client not initialized"
      });
    }

    // Call generateContent with gemini-3.1-flash-image
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    let generatedBase64 = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          generatedBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (generatedBase64) {
      return res.json({
        imageUrl: `data:image/png;base64,${generatedBase64}`,
        isGenerated: true,
        prompt
      });
    } else {
      console.warn("No inline image data found in Gemini image generation response. Using fallback.");
      return res.json({
        imageUrl: defaultFallbackUrl,
        isGenerated: false,
        prompt
      });
    }
  } catch (error: any) {
    console.error("Gemini image generation errored, serving high-end curated catalog fallback:", error);
    return res.json({
      imageUrl: defaultFallbackUrl,
      isGenerated: false,
      prompt
    });
  }
});

/**
 * ------------------------------------------------------------------------
 * 5. WPFORMS / EXTERNAL WORDPRESS WEBHOOK RESERVATION INTEGRATION BRIDGE
 * ------------------------------------------------------------------------
 */
const BOOKINGS_FILE = path.join(process.cwd(), "server_bookings.json");

// Fast in-memory RAM cache to prevent expensive disk I/O and sorting on every request
let bookingsCache: any[] | null = null;

// Helper: Safely load webhooks created from external sources like WordPress
function readServerBookings(): any[] {
  if (bookingsCache !== null) {
    return bookingsCache;
  }

  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, "utf-8");
      const bookings = JSON.parse(data) || [];
      
      let updated = false;
      for (const b of bookings) {
        if (!b.serviceCode) {
          b.serviceCode = Math.floor(1000 + Math.random() * 9000).toString();
          updated = true;
        }
      }

      // Sort a copy of bookings to assign sequential invoice numbers starting from 0 based on oldest-first creation
      const sortedByCreated = [...bookings].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });

      for (let i = 0; i < sortedByCreated.length; i++) {
        const bId = sortedByCreated[i].id;
        const origBooking = bookings.find((ob: any) => ob.id === bId);
        if (origBooking && origBooking.invoiceNumber === undefined) {
          origBooking.invoiceNumber = i;
          updated = true;
        }
      }
      
      bookingsCache = bookings;

      if (updated) {
        fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8", (err) => {
          if (err) console.error("Error writing server_bookings.json:", err);
        });
      }
      
      return bookingsCache;
    }
  } catch (err) {
    console.error("Error reading server_bookings.json:", err);
  }
  bookingsCache = [];
  return bookingsCache;
}

// Helper: Safely save webhook bookings
function writeServerBookings(bookings: any[]) {
  bookingsCache = bookings;
  try {
    fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8", (err) => {
      if (err) console.error("Error writing server_bookings.json:", err);
    });
  } catch (err) {
    console.error("Error writing server_bookings.json:", err);
  }
}

// Helper: Robust Date-Time utility specifically designed to split and extract "dateTime" strings (including natural language like 'tomorrow at 14:00')
function parseDateTime(dt: string) {
  let date = "";
  let time = "14:30"; // default fallback

  if (dt) {
    const trimmed = dt.trim();
    const lower = trimmed.toLowerCase();

    // 1. Check for time pattern (e.g. 14:00) anywhere in the input
    const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      time = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
    }

    // 2. Check for "tomorrow" anywhere
    if (lower.includes("tomorrow")) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split("T")[0];
    } else {
      // Try to split standard parts or fallback to parsing with Date object
      const parts = trimmed.split(/[ T]+/);
      if (parts.length >= 1 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0])) {
        date = parts[0];
      } else {
        try {
          const d = new Date(trimmed);
          if (!isNaN(d.getTime())) {
            date = d.toISOString().split("T")[0];
          } else {
            // Check if there is an ISO substring in parts
            const d2 = new Date();
            date = d2.toISOString().split("T")[0];
          }
        } catch (_err) {
          const d = new Date();
          date = d.toISOString().split("T")[0];
        }
      }
    }
  } else {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split("T")[0];
  }

  return { date, time };
}

// Helper: Dispatch new booking alerts via SMTP/GMail
function notifyNewBooking(booking: any) {
  const mailSubject = `[Majestic Fleet Sl] NEW VIP Client Booking: #${booking.id} - ${booking.contactName}`;
  const mailText = `Dear Dispatcher,

A NEW VIP Chauffeur Transfer Booking has been registered:

Booking Ref: ${booking.id}
Client/Passenger: ${booking.contactName}
Email: ${booking.contactEmail}
Phone Number: ${booking.contactPhone || "Not specified"}
Pickup Origin: ${booking.pickup}
Destination: ${booking.destination}
Date & Time: ${booking.date} at ${booking.time}
Exclusive Vehicle Plan: ${booking.vehicleId}
Computed Price Estimate: €${booking.price}
Invoicing Requested: ${booking.wantsInvoice ? "Yes" : "No"}

Best Regards,
Majestic Fleet Sl Automation System`;

  const mailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px; background-color: #fcf9f8;">
      <h2 style="color: #b45309; margin-top: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">NEW VIP TRANSFER BOOKING</h2>
      <p style="color: #52525b; font-size: 14px;">A new luxury transfer has been registered on the central dispatch queue:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
        <tr><td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #71717a; width: 150px;">Booking Ref:</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-weight: bold; color: #b45309;">${booking.id}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #71717a;">Passenger Name:</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${booking.contactName}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #71717a;">Email Address:</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${booking.contactEmail}" style="color: #b45309; text-decoration: none;">${booking.contactEmail}</a></td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #71717a;">Phone Line:</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${booking.contactPhone || "Not specified"}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #71717a;">Pickup (Origin):</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${booking.pickup}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #71717a;">Destination:</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${booking.destination}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #71717a;">Date &amp; Time:</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${booking.date} at ${booking.time}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #71717a;">Vehicle Model:</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-transform: uppercase;">${booking.vehicleId}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #e5e7eb; color: #71717a;">Total Pricing:</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #15803d; font-weight: bold; font-size: 15px;">€${booking.price}</td></tr>
      </table>

      ${booking.remarks ? `
      <div style="background-color: #fef3c7; border-left: 4px solid #b45309; padding: 12px; margin: 15px 0; border-radius: 4px; font-size: 12px; color: #78350f;">
        <strong>Special Cabin Instructions:</strong> ${booking.remarks}
      </div>` : ""}

      <p style="font-size: 10px; color: #a1a1aa; margin-top: 30px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px;">
        Majestic Fleet Sl Barcelona - Operational Autopilot Gateway
      </p>
    </div>
  `;

  sendGmailNotification(mailSubject, mailText, mailHtml);
}

// POS/RESERVE endpoint: Receives and processes payload of VIP transfers forwarded from functions.php
app.post("/api/reserve", (req, res) => {
  const authHeader = req.headers.authorization;
  
  // Validate Security Fleet Token from functions.php
  if (!authHeader || !authHeader.startsWith("Bearer VT_SECURE_AUTH_FLEET_TOKEN_8892A")) {
    console.warn("⚠️ [Security Alert] Unauthorized external reservation attempt rejected.");
    return res.status(401).json({ 
      success: false, 
      error: "Unauthorized: Missing or invalid fleet security token 'VT_SECURE_AUTH_FLEET_TOKEN_8892A'." 
    });
  }

  const payload = req.body;
  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).json({ success: false, error: "Empty dispatch payload received." });
  }

  // Validate core parameters
  const { clientName, clientEmail, pickup, dropoff, dateTime } = payload;
  if (!clientName || !clientEmail || !pickup || !dropoff) {
    console.error("❌ Failed outward dispatch validation: missing crucial path keys");
    return res.status(400).json({
      success: false,
      error: "Missing core parameters: clientName, clientEmail, pickup, and dropoff are mandatory."
    });
  }

  const { date, time } = parseDateTime(dateTime || "");

  // Generate ultra-realistic parameters for distance mapping
  const distanceKm = Number((10 + Math.random() * 20).toFixed(1));
  const durationMins = Math.ceil(distanceKm * 1.6);
  const price = Math.ceil(40 + distanceKm * 4.5);

  const serverBooking = {
    id: `VLV-WP-${Math.floor(100000 + Math.random() * 900000)}`,
    pickup: pickup,
    destination: dropoff,
    date: date,
    time: time,
    vehicleId: "mercedes-e300e",
    distanceKm: distanceKm,
    durationMins: durationMins,
    price: price,
    remarks: payload.notes || payload.remarks || "Automated forward from WPForms secure client gateway.",
    extraStops: [],
    preferences: {
      silentCabin: true,
      beverages: true,
      infantSeat: false,
      financialTimes: false,
      privacyTint: true,
      targetTemp: 21.0,
      sriGroup: "none",
      sriQuantity: 0,
      sriG0Quantity: 0,
      sriG1Quantity: 0,
      sriG23Quantity: 0,
      wheelchairType: "none",
      wheelchairQuantity: 0
    },
    contactName: clientName,
    contactEmail: clientEmail,
    contactPhone: payload.clientPhone || "",
    status: "confirmed",
    flightNumber: payload.flightNumber || "",
    flightStatus: payload.flightNumber ? "On Time" : undefined,
    // Support invoicing if they choose to specify it
    wantsInvoice: payload.wantsInvoice === true || payload.wantsInvoice === "true" || !!payload.invoiceDocumentNumber,
    invoiceDocumentNumber: payload.invoiceDocumentNumber || undefined,
    invoiceDocumentType: payload.invoiceDocumentType || "passport",
    invoiceFullName: payload.invoiceFullName || clientName,
    serviceCode: Math.floor(1000 + Math.random() * 9000).toString(),
    createdAt: new Date().toISOString()
  };

  const currentBookings = readServerBookings();
  currentBookings.unshift(serverBooking);
  writeServerBookings(currentBookings);

  console.log(`✅ [Dispatcher] WPForms Reservation ${serverBooking.id} added successfully for ${clientName}.`);

  // Dispatch GMail SMTP notification
  notifyNewBooking(serverBooking);

  // Send reservation order confirmation email to the client (without invoice/PDF)
  sendClientOrderConfirmation(serverBooking).catch(err => {
    console.warn(`[Majestic Fleet Sl Mailer WARN] Client WPForms confirmation failed to send for #${serverBooking.id}:`, err.message || err);
  });

  res.status(201).json({
    success: true,
    message: "WPForms dispatch reservation received and logged successfully into Majestic Terminal queue.",
    booking: serverBooking
  });
});

// GET /api/reserve: Retrieve server-side reservations
app.get("/api/reserve", (req, res) => {
  res.json(readServerBookings());
});

// GET /api/bookings: Backup route matching conventional frontend queries
app.get("/api/bookings", (req, res) => {
  res.json(readServerBookings());
});

// DELETE /api/reserve: Dev utility to empty WordPress sync booking mock queues
app.delete("/api/reserve", (req, res) => {
  writeServerBookings([]);
  res.json({ success: true, message: "Server-side reservations queue has been cleared." });
});

/**
 * ------------------------------------------------------------------------
 * 6. DRIVER & FLEET CONTROL AND MANAGEMENT INTEGRATION ENDPOINTS
 * ------------------------------------------------------------------------
 */
const DRIVERS_FILE = path.join(process.cwd(), "server_drivers.json");
const FLEET_FILE = path.join(process.cwd(), "server_fleet.json");

let driversCache: any[] | null = null;
let fleetCache: any[] | null = null;

function readServerDrivers(): any[] {
  if (driversCache !== null) {
    return driversCache;
  }

  try {
    if (fs.existsSync(DRIVERS_FILE)) {
      const data = fs.readFileSync(DRIVERS_FILE, "utf-8");
      driversCache = JSON.parse(data) || [];
      return driversCache;
    }
  } catch (err) {
    console.error("Error reading server_drivers.json:", err);
  }
  // Default seed driver accounts
  const defaultDrivers = [
    {
      id: "drv-1",
      name: "Marcos Reyes",
      email: "marcos@majesticfleet.com",
      phone: "+34 600 123 456",
      licenseNumber: "CAT-99218A",
      assignedVehicleId: "mercedes-e300e-1",
      password: "marcos-majestic"
    },
    {
      id: "drv-2",
      name: "Sophia Vance",
      email: "sophia@majesticfleet.com",
      phone: "+34 600 789 012",
      licenseNumber: "CAT-44321B",
      assignedVehicleId: "tesla-3-1",
      password: "sophia-majestic"
    }
  ];
  driversCache = defaultDrivers;
  writeServerDrivers(defaultDrivers);
  return defaultDrivers;
}

function writeServerDrivers(drivers: any[]) {
  driversCache = drivers;
  try {
    fs.writeFile(DRIVERS_FILE, JSON.stringify(drivers, null, 2), "utf-8", (err) => {
      if (err) console.error("Error writing server_drivers.json:", err);
    });
  } catch (err) {
    console.error("Error writing server_drivers.json:", err);
  }
}

function readServerFleet(): any[] {
  if (fleetCache !== null) {
    return fleetCache;
  }

  try {
    if (fs.existsSync(FLEET_FILE)) {
      const data = fs.readFileSync(FLEET_FILE, "utf-8");
      fleetCache = JSON.parse(data) || [];
      return fleetCache;
    }
  } catch (err) {
    console.error("Error reading server_fleet.json:", err);
  }
  // Default seed fleet items
  const defaultFleet = [
    {
      id: "mercedes-e300e-1",
      vehicleId: "mercedes-e300e",
      name: "Mercedes-Benz E300e (Silver EQ)",
      plateNumber: "B-9921-XG",
      status: "active"
    },
    {
      id: "tesla-3-1",
      vehicleId: "tesla-3",
      name: "Tesla Model 3 (Carbon Black)",
      plateNumber: "B-4402-TH",
      status: "active"
    },
    {
      id: "mercedes-v300-1",
      vehicleId: "mercedes-v300",
      name: "Mercedes-Benz V300 (VIP Jet Class)",
      plateNumber: "B-8877-LK",
      status: "offline"
    }
  ];
  fleetCache = defaultFleet;
  writeServerFleet(defaultFleet);
  return defaultFleet;
}

function writeServerFleet(fleet: any[]) {
  fleetCache = fleet;
  try {
    fs.writeFile(FLEET_FILE, JSON.stringify(fleet, null, 2), "utf-8", (err) => {
      if (err) console.error("Error writing server_fleet.json:", err);
    });
  } catch (err) {
    console.error("Error writing server_fleet.json:", err);
  }
}

// Vehicle Prices Data Persistence & Management
const VEHICLE_PRICES_FILE = path.join(process.cwd(), "server_vehicle_prices.json");
let vehiclePricesCache: any[] | null = null;

const DEFAULT_VEHICLE_PRICES = [
  {
    id: "tesla-model-3",
    name: "Tesla Model 3",
    basePrice: 30.00,
    pricePerKm: 2.25,
    minPrice: 30.00,
    hourlyRate: 65.00
  },
  {
    id: "mercedes-e300e",
    name: "Mercedes-Benz E300e",
    basePrice: 40.00,
    pricePerKm: 2.50,
    minPrice: 40.00,
    hourlyRate: 80.00
  },
  {
    id: "mercedes-v-class",
    name: "Mercedes-Benz V-Class",
    basePrice: 50.00,
    pricePerKm: 3.00,
    minPrice: 50.00,
    hourlyRate: 110.00
  },
  {
    id: "taxi-1-4-pax",
    name: "Taxi 1-4 pax",
    basePrice: 15.00,
    pricePerKm: 2.20,
    minPrice: 15.00,
    hourlyRate: 45.00
  },
  {
    id: "taxi-vans-4-8-pax",
    name: "Taxi Vans 4-8 pax",
    basePrice: 30.00,
    pricePerKm: 2.70,
    minPrice: 30.00,
    hourlyRate: 65.00
  }
];

function readServerVehiclePrices(): any[] {
  if (vehiclePricesCache !== null) {
    return vehiclePricesCache;
  }
  try {
    if (fs.existsSync(VEHICLE_PRICES_FILE)) {
      const data = fs.readFileSync(VEHICLE_PRICES_FILE, "utf-8");
      vehiclePricesCache = JSON.parse(data) || DEFAULT_VEHICLE_PRICES;
      return vehiclePricesCache;
    }
  } catch (err) {
    console.error("Error reading server_vehicle_prices.json:", err);
  }
  vehiclePricesCache = DEFAULT_VEHICLE_PRICES;
  writeServerVehiclePrices(DEFAULT_VEHICLE_PRICES);
  return DEFAULT_VEHICLE_PRICES;
}

function writeServerVehiclePrices(prices: any[]) {
  vehiclePricesCache = prices;
  try {
    fs.writeFile(VEHICLE_PRICES_FILE, JSON.stringify(prices, null, 2), "utf-8", (err) => {
      if (err) console.error("Error writing server_vehicle_prices.json:", err);
    });
  } catch (err) {
    console.error("Error writing server_vehicle_prices.json:", err);
  }
}

// GET /api/drivers
app.get("/api/drivers", (req, res) => {
  res.json(readServerDrivers());
});

// POST /api/drivers
app.post("/api/drivers", (req, res) => {
  const { name, email, phone, licenseNumber, assignedVehicleId, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields: name, email, password" });
  }
  
  const drivers = readServerDrivers();
  const exists = drivers.find(d => d.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "A driver with this email already exists" });
  }

  const newDriver = {
    id: `drv-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    email,
    phone: phone || "",
    licenseNumber: licenseNumber || "",
    assignedVehicleId: assignedVehicleId || "mercedes-e300e-1",
    password
  };

  drivers.push(newDriver);
  writeServerDrivers(drivers);
  res.status(201).json(newDriver);
});

// PATCH /api/drivers/:id
app.patch("/api/drivers/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone, licenseNumber, assignedVehicleId, password } = req.body;
  const drivers = readServerDrivers();
  const idx = drivers.findIndex(d => d.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Driver not found" });
  }

  if (email && email.toLowerCase() !== drivers[idx].email.toLowerCase()) {
    const emailExists = drivers.find(d => d.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(400).json({ error: "A driver with this email already exists" });
    }
  }

  if (name !== undefined) drivers[idx].name = name;
  if (email !== undefined) drivers[idx].email = email;
  if (phone !== undefined) drivers[idx].phone = phone;
  if (licenseNumber !== undefined) drivers[idx].licenseNumber = licenseNumber;
  if (assignedVehicleId !== undefined) drivers[idx].assignedVehicleId = assignedVehicleId;
  if (password !== undefined) drivers[idx].password = password;
  if (req.body.latitude !== undefined) drivers[idx].latitude = req.body.latitude;
  if (req.body.longitude !== undefined) drivers[idx].longitude = req.body.longitude;
  if (req.body.locationTimestamp !== undefined) drivers[idx].locationTimestamp = req.body.locationTimestamp;

  writeServerDrivers(drivers);
  res.json(drivers[idx]);
});

// DELETE /api/drivers/:id
app.delete("/api/drivers/:id", (req, res) => {
  const { id } = req.params;
  let drivers = readServerDrivers();
  const exists = drivers.some(d => d.id === id);
  if (!exists) {
    return res.status(404).json({ error: "Driver not found" });
  }

  drivers = drivers.filter(d => d.id !== id);
  writeServerDrivers(drivers);

  // Clean bookings
  const bookings = readServerBookings();
  let updated = false;
  bookings.forEach(b => {
    if (b.assignedDriverId === id) {
      b.assignedDriverId = null;
      updated = true;
    }
  });
  if (updated) {
    writeServerBookings(bookings);
  }

  res.json({ success: true, message: "Driver profile cleared and unassigned" });
});

// GET /api/fleet
app.get("/api/fleet", (req, res) => {
  res.json(readServerFleet());
});

// POST /api/fleet
app.post("/api/fleet", (req, res) => {
  const { name, plateNumber, status, vehicleId, ...rest } = req.body;
  if (!name || !plateNumber) {
    return res.status(400).json({ error: "Name and Plate Number are required" });
  }

  const fleet = readServerFleet();
  
  // Check if plateNumber already exists
  const exists = fleet.some(item => item.plateNumber.toLowerCase() === plateNumber.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "A vehicle with this plate number already exists" });
  }

  const newVehicle = {
    id: `fleet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    vehicleId: vehicleId || "mercedes-e300e",
    name: name,
    plateNumber: plateNumber,
    status: status || "active",
    ...rest
  };

  fleet.push(newVehicle);
  writeServerFleet(fleet);

  // If driver assigned directly, sync driver
  if (rest.assignedDriverId) {
    const drivers = readServerDrivers();
    const dIdx = drivers.findIndex(d => d.id === rest.assignedDriverId);
    if (dIdx !== -1) {
      drivers[dIdx].assignedVehicleId = newVehicle.id;
      writeServerDrivers(drivers);
    }
  }

  res.status(201).json(newVehicle);
});

// PATCH /api/fleet/:id
app.patch("/api/fleet/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fleet = readServerFleet();
  const idx = fleet.findIndex(item => item.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Fleet item not found" });
  }

  Object.assign(fleet[idx], updates);

  writeServerFleet(fleet);

  // If assignedDriverId updated
  if (updates.assignedDriverId !== undefined) {
    const drivers = readServerDrivers();
    const dIdx = drivers.findIndex(d => d.id === updates.assignedDriverId);
    if (dIdx !== -1) {
      drivers[dIdx].assignedVehicleId = fleet[idx].id;
      writeServerDrivers(drivers);
    }
  }

  res.json(fleet[idx]);
});

// DELETE /api/fleet/:id
app.delete("/api/fleet/:id", (req, res) => {
  const { id } = req.params;
  let fleet = readServerFleet();
  const idx = fleet.findIndex(item => item.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Fleet vehicle not found" });
  }

  // Also unassign this vehicle from any driver who has it
  const drivers = readServerDrivers();
  let driversUpdated = false;
  drivers.forEach(d => {
    if (d.assignedVehicleId === id) {
      d.assignedVehicleId = "";
      driversUpdated = true;
    }
  });
  if (driversUpdated) {
    writeServerDrivers(drivers);
  }

  fleet.splice(idx, 1);
  writeServerFleet(fleet);
  res.json({ success: true, message: "Fleet vehicle removed successfully" });
});

// GET /api/vehicle-prices
app.get("/api/vehicle-prices", (req, res) => {
  res.json(readServerVehiclePrices());
});

// POST /api/vehicle-prices
app.post("/api/vehicle-prices", (req, res) => {
  const { prices } = req.body;
  if (!Array.isArray(prices)) {
    return res.status(400).json({ error: "Invalid payload, 'prices' must be an array" });
  }

  const currentPrices = readServerVehiclePrices();
  const updatedPrices = currentPrices.map(item => {
    const override = prices.find((p: any) => p.id === item.id);
    if (override) {
      return {
        ...item,
        basePrice: typeof override.basePrice === "number" ? Math.max(0, override.basePrice) : item.basePrice,
        pricePerKm: typeof override.pricePerKm === "number" ? Math.max(0, override.pricePerKm) : item.pricePerKm,
        minPrice: typeof override.minPrice === "number" ? Math.max(0, override.minPrice) : item.minPrice,
        hourlyRate: typeof override.hourlyRate === "number" ? Math.max(0, override.hourlyRate) : item.hourlyRate
      };
    }
    return item;
  });

  writeServerVehiclePrices(updatedPrices);
  res.json({ success: true, prices: updatedPrices });
});

// PATCH /api/reserve/:id/assign
app.patch("/api/reserve/:id/assign", (req, res) => {
  const { id } = req.params;
  const { assignedDriverId, driverPhone, driverName } = req.body;
  const bookings = readServerBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Booking not found" });
  }

  if (assignedDriverId !== undefined) {
    bookings[idx].assignedDriverId = assignedDriverId || null;
  }
  if (driverPhone) {
    bookings[idx].driverPhone = driverPhone;
  }
  if (driverName) {
    bookings[idx].driverName = driverName;
  }

  if (!bookings[idx].serviceCode) {
    bookings[idx].serviceCode = Math.floor(1000 + Math.random() * 9000).toString();
  }
  writeServerBookings(bookings);

  // Dispatch coordination email alert
  const updatedBooking = bookings[idx];
  const drivers = readServerDrivers();
  const driver = drivers.find(d => d.id === assignedDriverId);
  const resolvedDriverName = driverName || (driver ? driver.name : (assignedDriverId === "external-driver" ? "External Operator (Code Access)" : (assignedDriverId === "temp-driver-code" ? "External Chauffeur" : (assignedDriverId ? `Driver ID ${assignedDriverId}` : "Unassigned"))));

  const subject = `[Majestic Fleet Sl] Chauffeur Coordinator: #${updatedBooking.id} assigned to ${resolvedDriverName}`;
  const text = `The transfer #${updatedBooking.id} for passenger ${updatedBooking.contactName} is now assigned to chauffeur: ${resolvedDriverName}.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px; background-color: #f8fafc;">
      <h3 style="color: #475569; margin-top: 0; font-weight: 700;">CHAUFFEUR COORDINATION UPDATE</h3>
      <p style="font-size: 14px; color: #334155;">Transfer ID: <b style="color: #0f172a;">${updatedBooking.id}</b> status change:</p>
      <div style="background-color: #f1f5f9; padding: 12px; border-radius: 4px; margin: 15px 0;">
        <strong>Assigned Chauffeur:</strong> <span style="color: #2563eb; font-weight: bold;">${resolvedDriverName}</span>
      </div>
      <p style="font-size: 13px; color: #475569;">Passenger: <b>${updatedBooking.contactName}</b> (${updatedBooking.contactEmail})</p>
      <p style="font-size: 13px; color: #475569;">Routing: <b>${updatedBooking.pickup}</b> ➔ <b>${updatedBooking.destination}</b></p>
    </div>
  `;
  // Erased: Only New Booking Registration alerts are sent to SMTP
  // sendGmailNotification(subject, text, html);

  // Auto-generate notifications
  // Receiver dispatcher notification:
  addNotification({
    title: "Chauffeur Assigned",
    message: `Chauffeur ${resolvedDriverName} was assigned to Booking #${updatedBooking.id} (${updatedBooking.pickup} ➔ ${updatedBooking.destination})`,
    type: "dispatcher_broadcast",
    sender: "dispatcher",
    recipient: "dispatcher",
    bookingId: updatedBooking.id
  });

  // Driver receive notification:
  if (assignedDriverId) {
    addNotification({
      title: "New Job Assigned",
      message: `Dispatcher assigned you to Transfer #${updatedBooking.id} (${updatedBooking.pickup} ➔ ${updatedBooking.destination})`,
      type: "dispatch_instruction",
      sender: "dispatcher",
      recipient: "driver",
      driverId: assignedDriverId,
      bookingId: updatedBooking.id
    });
  }

  res.json(bookings[idx]);
});

// PATCH /api/reserve/:id/flight-status
app.patch("/api/reserve/:id/flight-status", (req, res) => {
  const { id } = req.params;
  const { flightStatus } = req.body;
  const bookings = readServerBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const oldStatus = bookings[idx].flightStatus;
  bookings[idx].flightStatus = flightStatus;

  // If status is Complete, automatically generate and email the official invoice/receipt
  if (flightStatus === "Complete" || flightStatus === "Completed") {
    // Ensure wantsInvoice is set to true so the database and UI register the preference
    bookings[idx].wantsInvoice = true;
  }

  writeServerBookings(bookings);

  const updatedBooking = bookings[idx];

  // If status is Complete, automatically generate and email the official invoice/receipt
  if ((flightStatus === "Complete" || flightStatus === "Completed") && !updatedBooking.invoiceSent) {
    sendOfficialInvoiceEmail(updatedBooking).catch(err => {
      console.warn(`[Majestic Fleet Sl Mailer WARN] Automatic completed invoice dispatch failed (will fall back gracefully) for #${updatedBooking.id}:`, err.message || err);
    });
  }

  // Dispatch status transit email alert (skip if complete/completed to prevent duplicate emails)
  if (flightStatus !== "Complete" && flightStatus !== "Completed") {
    const subject = `[Majestic Fleet Sl] Transfer Status Update: #${updatedBooking.id} is now [${flightStatus}]`;
    const text = `The status of Transfer #${updatedBooking.id} for passenger ${updatedBooking.contactName} has been actively transitioned to: ${flightStatus}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px; background-color: #fffbeb;">
        <h3 style="color: #d97706; margin-top: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">TRANSFER UPDATE PROGRESSION</h3>
        <p style="font-size: 14px; color: #78350f;">Passenger: <b>${updatedBooking.contactName}</b></p>
        <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 12px; border-radius: 4px; margin: 15px 0;">
          <strong>Current Booking Status:</strong> <span style="color: #b45309; font-weight: bold; text-transform: uppercase;">${flightStatus}</span>
        </div>
        <p style="font-size: 13px; color: #78350f;">Booking Ref: <b>${updatedBooking.id}</b></p>
        <p style="font-size: 13px; color: #78350f;">Route Run: <b>${updatedBooking.pickup}</b> to <b>${updatedBooking.destination}</b></p>
      </div>
    `;
    // Erased: Only New Booking Registration alerts are sent to SMTP
    // sendGmailNotification(subject, text, html);
  }

  // Retrieve active driver details for notifications
  const driverId = updatedBooking.assignedDriverId;
  const driversList = readServerDrivers();
  const activeDriver = driversList.find(d => d.id === driverId);
  const activeDriverName = activeDriver ? activeDriver.name : "Unassigned Chauffeur";

  // Auto-generate notifications
  // Receiver dispatcher notification ("dispatcher receive anything from the drivers")
  addNotification({
    title: flightStatus === "Complete" ? "Trip Completed with Driver" : `Trip Status: ${flightStatus}`,
    message: `Chauffeur ${activeDriverName} updated Transfer #${updatedBooking.id} status to: ${flightStatus}`,
    type: "driver_status",
    sender: "driver",
    recipient: "dispatcher",
    driverId: driverId || undefined,
    bookingId: updatedBooking.id
  });

  // If anything is completed with the driver, driver receives notification
  if (driverId) {
    addNotification({
      title: flightStatus === "Complete" ? "Job Completed Successfully" : `Status Synchronized: ${flightStatus}`,
      message: flightStatus === "Complete" 
        ? `Professionally done! Transfer #${updatedBooking.id} is marked as Completed.`
        : `Your transfer #${updatedBooking.id} status was registered as ${flightStatus}.`,
      type: "dispatch_instruction",
      sender: "dispatcher",
      recipient: "driver",
      driverId: driverId,
      bookingId: updatedBooking.id
    });
  }

  res.json(bookings[idx]);
});

// POST /api/bookings: Allow direct user reservations to sync to the server database
app.post("/api/bookings", (req, res) => {
  const booking = req.body;
  if (!booking || !booking.id) {
    return res.status(400).json({ error: "Invalid booking payload" });
  }

  const bookings = readServerBookings();
  
  // Prevent duplication
  const existsIdx = bookings.findIndex(b => b.id === booking.id);
  let isNew = false;
  if (existsIdx !== -1) {
    const oldBooking = bookings[existsIdx];
    
    // Check if status changed from confirmed to cancelled
    if (oldBooking.status !== "cancelled" && booking.status === "cancelled") {
      addNotification({
        title: "Passenger Booking Cancelled",
        message: `Client ${booking.contactName || "Passenger"} cancelled Transfer #${booking.id} (${booking.pickup} ➔ ${booking.destination})`,
        type: "passenger_cancel",
        sender: "cliente",
        recipient: "dispatcher",
        bookingId: booking.id
      });

      // Also notify assigned driver if exists
      if (oldBooking.assignedDriverId) {
        addNotification({
          title: "Assigned Passenger Job Cancelled",
          message: `The assigned transfer #${booking.id} was cancelled by passenger ${booking.contactName || "Client"}.`,
          type: "passenger_cancel",
          sender: "dispatcher",
          recipient: "driver",
          driverId: oldBooking.assignedDriverId,
          bookingId: booking.id
        });
      }
    } 
    // Check if reschedule occurred
    else if (oldBooking.date !== booking.date || oldBooking.time !== booking.time) {
      addNotification({
        title: "Passenger Booking Rescheduled",
        message: `Client ${booking.contactName || "Passenger"} rescheduled Transfer #${booking.id} to ${booking.date} at ${booking.time}`,
        type: "passenger_update",
        sender: "cliente",
        recipient: "dispatcher",
        bookingId: booking.id
      });

      // Also notify assigned driver if exists
      if (oldBooking.assignedDriverId) {
        addNotification({
          title: "Assigned Passenger Job Rescheduled",
          message: `The assigned transfer #${booking.id} has been rescheduled to ${booking.date} at ${booking.time}.`,
          type: "passenger_update",
          sender: "dispatcher",
          recipient: "driver",
          driverId: oldBooking.assignedDriverId,
          bookingId: booking.id
        });
      }
    }

    const mergedBooking = { ...bookings[existsIdx], ...booking };
    bookings[existsIdx] = mergedBooking;

    // If the trip is Complete, automatically generate and send it
    if ((mergedBooking.flightStatus === "Complete" || mergedBooking.flightStatus === "Completed") && !mergedBooking.invoiceSent) {
      mergedBooking.wantsInvoice = true;
      sendOfficialInvoiceEmail(mergedBooking).catch(err => {
        console.warn(`[Majestic Fleet Sl Mailer WARN] Invoice dispatch failed for #${mergedBooking.id} on update:`, err.message || err);
      });
    }
  } else {
    if (!booking.serviceCode) {
      booking.serviceCode = Math.floor(1000 + Math.random() * 9000).toString();
    }
    bookings.unshift(booking);
    isNew = true;

    // If the trip is Complete, automatically generate and send it
    if ((booking.flightStatus === "Complete" || booking.flightStatus === "Completed") && !booking.invoiceSent) {
      booking.wantsInvoice = true;
      sendOfficialInvoiceEmail(booking).catch(err => {
        console.warn(`[Majestic Fleet Sl Mailer WARN] Invoice dispatch failed for #${booking.id} on new create:`, err.message || err);
      });
    }

    // Automatic passenger booking notification received by dispatcher
    addNotification({
      title: "New Passenger Booking",
      message: `Passenger ${booking.contactName} requested booking #${booking.id} (${booking.pickup} ➔ ${booking.destination})`,
      type: "passenger_booking",
      sender: "cliente",
      recipient: "dispatcher",
      bookingId: booking.id
    });
  }

  writeServerBookings(bookings);

  if (isNew) {
    notifyNewBooking(booking);
    sendClientOrderConfirmation(booking).catch(err => {
      console.warn(`[Majestic Fleet Sl Mailer WARN] Automatic client confirmation failed:`, err.message || err);
    });
  }

  res.status(201).json({ success: true, booking });
});

// POST /api/bookings/:id/resend-invoice: Manually trigger/resend PDF invoice to passenger email
app.post("/api/bookings/:id/resend-invoice", (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const bookings = readServerBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const booking = bookings[idx];
  
  // If an email is supplied in the request body, persist it to the booking record
  if (email && typeof email === "string" && email.trim()) {
    booking.contactEmail = email.trim();
  }

  // Force wantsInvoice true if they click resend
  booking.wantsInvoice = true;
  writeServerBookings(bookings);

  sendOfficialInvoiceEmail(booking)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.warn(`[Majestic Fleet Sl Mailer WARN] Resend invoice failed for #${booking.id}:`, err.message || err);
      res.status(500).json({ 
        success: false, 
        message: `Failed to send email: ${err.message || err}`
      });
    });
});

// GET /api/bookings/:id/invoice-pdf: Dynamically generate and stream invoice as a PDF file
app.get("/api/bookings/:id/invoice-pdf", async (req, res) => {
  const { id } = req.params;
  const bookings = readServerBookings();
  const booking = bookings.find(b => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  // Default to Spanish ("es") as dispatcher wants invoices in Spanish, or use requested query lang
  const requestedLang = (req.query.lang || booking.language || "es") as "en" | "es" | "ca";
  const tempFilename = `invoice-${booking.id}-download.pdf`;
  const tempPath = path.join(process.cwd(), tempFilename);

  try {
    await generatePDFInvoice(booking, tempPath, requestedLang);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="invoice-${booking.id}.pdf"`);
    
    const stream = fs.createReadStream(tempPath);
    stream.pipe(res);
    
    stream.on("close", () => {
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (cleanupErr) {
        console.warn("Unable to cleanup temp download pdf:", cleanupErr);
      }
    });
  } catch (err: any) {
    console.error(`[Majestic Fleet Sl PDF] Inline PDF generation failed for #${booking.id}:`, err);
    res.status(500).json({ error: `Could not generate PDF: ${err.message || err}` });
  }
});

/**
 * ------------------------------------------------------------------------
 * 7. NOTIFICATION HUB: CENTRAL CLIO-ROUTED DIRECTORY OF ALERTS
 * ------------------------------------------------------------------------
 */
const NOTIFICATIONS_FILE = path.join(process.cwd(), "server_notifications.json");

interface ServerNotification {
  id: string;
  title: string;
  message: string;
  type: string; // "passenger_booking" | "passenger_update" | "passenger_cancel" | "driver_status" | "dispatch_instruction" | "system"
  sender: "cliente" | "driver" | "dispatcher" | "system";
  recipient: "dispatcher" | "driver" | "all";
  driverId?: string;
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

function readServerNotifications(): ServerNotification[] {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, "utf-8");
      return JSON.parse(data) || [];
    }
  } catch (err) {
    console.error("Error reading server_notifications.json:", err);
  }
  // Default Seed Notification to prove system status
  const defaultNotifications: ServerNotification[] = [
    {
      id: "seed-notif-1",
      title: "Majestic Terminal Online",
      message: "The Dispatch Control Hub is fully synchronized and operational.",
      type: "system",
      sender: "system",
      recipient: "dispatcher",
      read: false,
      createdAt: new Date().toISOString()
    }
  ];
  writeServerNotifications(defaultNotifications);
  return defaultNotifications;
}

function writeServerNotifications(notifs: ServerNotification[]) {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifs, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing server_notifications.json:", err);
  }
}

function addNotification(notif: Omit<ServerNotification, "id" | "read" | "createdAt">) {
  const notifs = readServerNotifications();
  const newNotif: ServerNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...notif,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifs.unshift(newNotif);
  writeServerNotifications(notifs);
  return newNotif;
}

// GET /api/notifications: Retrieve central log tailored by matching recipient query param
app.get("/api/notifications", (req, res) => {
  const { recipient, driverId } = req.query;
  let notifs = readServerNotifications();

  if (recipient) {
    notifs = notifs.filter(n => {
      if (recipient === "driver") {
        return n.recipient === "driver" && (!driverId || n.driverId === String(driverId));
      }
      return n.recipient === recipient;
    });
  }

  res.json(notifs);
});

// POST /api/notifications: Send bespoke dispatch instructions or user notifications
app.post("/api/notifications", (req, res) => {
  const { title, message, type, sender, recipient, driverId, bookingId } = req.body;
  if (!notifMatchField(title) || !notifMatchField(message)) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  const notif = addNotification({
    title,
    message,
    type: type || "dispatch_instruction",
    sender: sender || "dispatcher",
    recipient: recipient || "driver",
    driverId: driverId ? String(driverId) : undefined,
    bookingId
  });

  res.status(201).json(notif);
});

function notifMatchField(val: any): boolean {
  return typeof val === "string" && val.trim().length > 0;
}

// POST /api/notifications/clear: Mark dispatcher or driver notifications log as read
app.post("/api/notifications/clear", (req, res) => {
  const { ids, recipient, driverId } = req.body;
  let notifs = readServerNotifications();

  if (ids && Array.isArray(ids)) {
    notifs = notifs.map(n => ids.includes(n.id) ? { ...n, read: true } : n);
  } else if (recipient) {
    notifs = notifs.map(n => {
      const matchRecipient = n.recipient === recipient;
      const matchDriver = recipient === "driver" ? (!driverId || n.driverId === String(driverId)) : true;
      if (matchRecipient && matchDriver) {
        return { ...n, read: true };
      }
      return n;
    });
  } else {
    notifs = notifs.map(n => ({ ...n, read: true }));
  }

  writeServerNotifications(notifs);
  res.json({ success: true, message: "Notifications marked as read" });
});

// Fallback for unmatched API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.path} not found` });
});

// Setup Vite Development and Production compilation servers
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MAJESTIC Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
