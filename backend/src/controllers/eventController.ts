import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Event } from "../config/db.js";
import mongoose from "mongoose";
import { Seat } from "../config/db.js";

export const getAllEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const events = await Event.find().sort({ dateTime: 1 });
    return res.status(200).json({ success: true, data: events });
  },
);

export const getEventById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }
    // fetch seat availability along with event
    const seats = await Seat.find({ eventId: id })
      .select("seatNumber status")
      .sort({ seatNumber: 1 });

    res.status(200).json({ success: true, data: { event, seats } });
  },
);

// called internally when an event is created — seeds all seat documents
export const seedSeatsForEvent = async (
  eventId: mongoose.Types.ObjectId,
  totalSeats: number,
) => {
  const seats = Array.from({ length: totalSeats }, (_, i) => ({
    eventId,
    seatNumber: i + 1,
    status: "available",
  }));
  await Seat.insertMany(seats);
};
