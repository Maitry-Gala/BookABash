import mongoose from "mongoose";
import { Schema } from "mongoose";
const Dburl = process.env.MONGODB_URL;

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
});

const EventSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    dateTime: { type: Date, required: true },
    venue: { type: String, required: true },
    totalSeats: {
      type: Number,
      required: true,
      min: [1, "Must have at least 1 seat"],
    },
  },
  { timestamps: true },
);

const SeatSchema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    seatNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "reserved", "booked"],
      default: "available",
      required: true,
    },
  },
  { timestamps: true },
);
SeatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });

const ReservationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    seatNumbers: { type: [Number], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

ReservationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
ReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BookingSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    seatNumbers: { type: [Number], required: true },
    bookedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserSchema);
export const Event = mongoose.model("Event", EventSchema);
export const Seat = mongoose.model("Seat", SeatSchema);
export const Reservation = mongoose.model("Reservation", ReservationSchema);
export const Booking = mongoose.model("Booking", BookingSchema);

export async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
    console.log("connected to database");
  } catch (e) {
    console.log("Error occurred", e);
  }
}
