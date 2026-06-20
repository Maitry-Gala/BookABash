import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectToMongoDB, Event, Seat } from "./config/db.js";

const events = [
  {
    name: "India's got latent s2",
    dateTime: new Date("2026-06-25T10:00:00"),
    venue: "Jio World Convention Centre",
    totalSeats: 100,
  },
];

async function seed() {
  try {
    await connectToMongoDB();
    console.log("Connected!");

    await Event.deleteMany({});
    await Seat.deleteMany({});

    for (const e of events) {
      const event = await Event.create(e);
      const seats = Array.from({ length: e.totalSeats }, (_, i) => ({
        eventId: event._id,
        seatNumber: i + 1,
        status: "available",
      }));
      await Seat.insertMany(seats);
      console.log(`Seeded: ${e.name} with ${e.totalSeats} seats`);
    }

    await mongoose.disconnect();
    console.log("Seeding complete");
  } catch (e) {
    console.log(e);
  }
}

seed();
