const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// In-memory data structures (replace with your DB calls if using MongoDB/PostgreSQL)
let bookingsStore = [
  {
    id: "RES-1001",
    customerName: "John Doe",
    pickupLocation: "BCN Airport Terminal 1",
    dropoffLocation: "City Center",
    vehicleType: "Executive Van",
    status: "Confirmed",
    createdAt: "2026-08-08T10:00:00.000Z"
  }
];

let fleetStore = [
  { id: "V-1", name: "Executive Sedan", capacity: "Max 4 Passengers", category: "Sedan", available: true },
  { id: "V-2", name: "Executive Electric", capacity: "Max 4 Passengers", category: "Electric", available: true },
  { id: "V-3", name: "Luxury Van", capacity: "7-8 Passengers", category: "Van", available: true }
];

// 1. GET /api/reserve (Fetch Bookings)
app.get('/api/reserve', (req, res) => {
  res.status(200).json(bookingsStore);
});

// 2. POST /api/bookings (Create / Save Booking)
app.post('/api/bookings', (req, res) => {
  const newBooking = { id: `RES-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
  bookingsStore.push(newBooking);
  res.status(201).json({ success: true, booking: newBooking });
});

// 3. PATCH /api/reserve/:id/assign (Assign Driver)
app.patch('/api/reserve/:id/assign', (req, res) => {
  const { id } = req.params;
  const booking = bookingsStore.find((b) => b.id === id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  Object.assign(booking, req.body);
  res.status(200).json({ success: true, booking });
});

// 4. PATCH /api/reserve/:id/flight-status
app.patch('/api/reserve/:id/flight-status', (req, res) => {
  const { id } = req.params;
  const { flightStatus } = req.body;
  const booking = bookingsStore.find((b) => b.id === id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  booking.flightStatus = flightStatus;
  res.status(200).json({ success: true, booking });
});

// 5. GET /api/fleet (Fetch Vehicles)
app.get('/api/fleet', (req, res) => {
  res.status(200).json(fleetStore);
});

// 6. GET /api/notifications (Fetch Notifications)
app.get('/api/notifications', (req, res) => {
  const { recipient } = req.query;
  const filePath = path.join(__dirname, 'server_notifications.json');

  let notifications = [];
  if (fs.existsSync(filePath)) {
    try {
      notifications = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error("Error parsing server_notifications.json:", e);
    }
  }

  if (recipient) {
    notifications = notifications.filter(
      (n) => n.recipient === recipient || n.recipient === 'all'
    );
  }

  res.status(200).json(notifications);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
