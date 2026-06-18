import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectToMongoDB, Event, Seat } from "./config/db.js";

const events = [
  {
    name: "Coldplay World Tour",
    dateTime: new Date("2025-12-15T19:00:00"),
    venue: "DY Patil Stadium, Mumbai",
    totalSeats: 20,
  },
  {
    name: "Comic Con Mumbai",
    dateTime: new Date("2025-11-20T10:00:00"),
    venue: "Jio World Convention Centre",
    totalSeats: 30,
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
