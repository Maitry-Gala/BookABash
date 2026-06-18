import "dotenv/config";
import express from "express";
import { connectToMongoDB } from "./config/db.js";
import cors from 'cors';
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import reservationRoutes from "./routes/reservation.js";
import  bookingRoutes from "./routes/bookings.js";
import { errorHandler } from "./middleware/errorHandler.js";
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

connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server running on port:", PORT);
  });
});
