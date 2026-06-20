import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.js";
import { Response } from "express";
import mongoose from "mongoose";
import { Reservation, Seat } from "../config/db.js";

const reserveSchema = z.object({
  eventId: z.string().min(1),
  seatNumbers: z.array(z.number().int().positive()).min(1).max(10),
});
export const scheduleReservationCleanup = (reservationId: string, expiresAt: Date, eventId: string, seatNumbers: number[]) => {
  const delay = expiresAt.getTime() - Date.now();
  
  setTimeout(async () => {
    const reservation = await Reservation.findById(reservationId);
    
    // only clean if reservation still exists (not already booked)
    if (reservation) {
      await Seat.updateMany(
        { eventId: new mongoose.Types.ObjectId(eventId), seatNumber: { $in: seatNumbers } },
        { $set: { status: "available" } }
      );
      await Reservation.deleteOne({ _id: reservationId });
      console.log("cleaned expired reservation:", reservationId);
    }
  }, delay);
};

export const reserveSeats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const parsed = reserveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: "Validation failed" });
    }

    const { eventId, seatNumbers } = parsed.data;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event ID" });
    }

    // check if user already has an active reservation for this event
    const existingReservation = await Reservation.findOne({
      userId,
      eventId,
      expiresAt: { $gt: new Date() }, // not expired yet
    });

    if (existingReservation) {
      return res.status(409).json({
        success: false,
        message: "You already have an active reservation for this event",
      });
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      // find all requested seats that are currently available
      const availableSeats = await Seat.find({
        eventId,
        seatNumber: { $in: seatNumbers },
        status: "available",
      }).session(session);

      // if count doesn't match, some seats are taken
      if (availableSeats.length !== seatNumbers.length) {
        const availableNumbers = availableSeats.map((s) => s.seatNumber);
        const unavailable = seatNumbers.filter(
          (n) => !availableNumbers.includes(n),
        );

        await session.abortTransaction();
        return res.status(409).json({
          success: false,
          message: "Some seats are no longer available",
          unavailableSeats: unavailable,
        });
      }

      // atomically flip all seats to reserved
      await Seat.updateMany(
        {
          eventId,
          seatNumber: { $in: seatNumbers },
          status: "available", // double check inside transaction
        },
        { $set: { status: "reserved" } },
        { session },
      );

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      const [reservation] = await Reservation.create(
        [{ userId, eventId, seatNumbers, expiresAt }],
        { session },
      );

      await session.commitTransaction();
      scheduleReservationCleanup(
        reservation!._id.toString(),
        expiresAt,
        eventId,
        seatNumbers,
      );

      res.status(201).json({
        success: true,
        message: "Seats reserved successfully",
        data: {
          reservationId: reservation?._id,
          seatNumbers,
          expiresAt,
        },
      });
    } catch (err) {
      await session.abortTransaction();
      throw err; // asyncHandler catches this → errorHandler
    } finally {
      session.endSession();
    }
  },
);
