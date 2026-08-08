import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Google GenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Interfaces
interface BookingRequest {
  customerName: string;
  customerEmail: string;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: 'Sedan' | 'Electric' | 'Van';
  passengers: number;
  pickupTime: string;
}

interface ConciergeRequest {
  prompt: string;
  location?: string;
}

// Nodemailer Transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ==========================================
// API ROUTES
// ==========================================

// Health Check Endpoint (Cloud Run Container Probe)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// 1. Fleet Capabilities & Limits Route
app.get('/api/fleet/specs', (req: Request, res: Response) => {
  res.json({
    fleet: [
      { type: 'Luxury Sedan', maxPassengers: 4, luggageCapacity: 3 },
      { type: 'Executive Electric', maxPassengers: 4, luggageCapacity: 3 },
      { type: 'VIP Passenger Van', maxPassengers: 8, luggageCapacity: 8 },
    ],
  });
});

// 2. Reservation & Booking Confirmation
app.post('/api/bookings/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, customerEmail, pickupLocation, dropoffLocation, vehicleType, passengers, pickupTime }: BookingRequest = req.body;

    // Validate passenger thresholds
    if ((vehicleType === 'Sedan' || vehicleType === 'Electric') && passengers > 4) {
      res.status(400).json({ error: 'Sedan and Electric models accommodate a maximum of 4 passengers.' });
      return;
    }
    if (vehicleType === 'Van' && passengers > 8) {
      res.status(400).json({ error: 'Van models accommodate a maximum of 8 passengers.' });
      return;
    }

    const bookingId = `BK-${Date.now().toString().slice(-6)}`;

    // Dispatch Email Notification via SMTP if configured
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const mailOptions = {
        from: `"Velvet Chauffeurs" <${process.env.GMAIL_USER}>`,
        to: customerEmail,
        subject: `Booking Confirmation - ${bookingId}`,
        html: `
          <h2>Thank you for your reservation, ${customerName}.</h2>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Vehicle:</strong> ${vehicleType}</p>
          <p><strong>Passengers:</strong> ${passengers}</p>
          <p><strong>Pickup Location:</strong> ${pickupLocation}</p>
          <p><strong>Dropoff Location:</strong> ${dropoffLocation}</p>
          <p><strong>Date & Time:</strong> ${pickupTime}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(201).json({
      message: 'Booking successfully confirmed',
      bookingId,
      status: 'Confirmed',
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to process booking reservation.' });
  }
});

// 3. AI Concierge & Route Planning (Gemini SDK Integration)
app.post('/api/concierge/plan', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, location }: ConciergeRequest = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt query is required.' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an elite concierge for a high-end luxury chauffeur service in ${location || 'Europe'}. 
Provide a sophisticated, well-structured itinerary or recommendation based on this request: "${prompt}".`,
    });

    res.json({ recommendation: response.text });
  } catch (error) {
    console.error('AI Concierge error:', error);
    res.status(500).json({ error: 'Failed to generate concierge recommendations.' });
  }
});

// 4. Dynamic PDF Invoice Generation Endpoint
app.post('/api/invoices/generate', (req: Request, res: Response) => {
  try {
    const { bookingId, customerName, amount, serviceDetails } = req.body;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${bookingId || 'receipt'}.pdf`);

    doc.pipe(res);

    // Header Design
    doc.fontSize(20).text('VELVET CHAUFFEURS', { align: 'right' });
    doc.fontSize(10).text('Exclusive Luxury Transportation', { align: 'right' });
    doc.moveDown(2);

    doc.fontSize(14).text(`INVOICE: #${bookingId || '001'}`, { underline: true });
    doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Customer: ${customerName || 'Valued Client'}`);
    doc.moveDown();

    // Line Items
    doc.text('----------------------------------------------------');
    doc.text(`Service: ${serviceDetails || 'Private Transportation Services'}`);
    doc.text(`Total Amount: ${amount || '€0.00'}`);
    doc.text('----------------------------------------------------');
    doc.moveDown(2);

    doc.text('Thank you for traveling with Velvet Chauffeurs.', { align: 'center', italic: true });

    doc.end();
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ error: 'Failed to build invoice PDF.' });
  }
});

// Fallback Middleware for Undefined API Routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
