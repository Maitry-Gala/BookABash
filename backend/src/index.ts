import "dotenv/config";
import express from "express";
import { connectToMongoDB } from "./config/db.js";
import cors from 'cors';
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import reservationRoutes from "./routes/reservation.js";
import  bookingRoutes from "./routes/bookings.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { Reservation, Seat } from "./config/db.js";
const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reserve", reservationRoutes);
app.use("/api/bookings", bookingRoutes);

// health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// error handler — must be last
app.use(errorHandler);


async function main() {
  await connectToMongoDB();

  // one-time recovery on server start for any reservations that expired while server was down
  const expired = await Reservation.find({ expiresAt: { $lt: new Date() } });
  for (const res of expired) {
    await Seat.updateMany(
      { eventId: res.eventId, seatNumber: { $in: res.seatNumbers } },
      { $set: { status: "available" } }
    );
    await Reservation.deleteOne({ _id: res._id });
  }
  console.log(`Recovered ${expired.length} expired reservations on startup`);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main();