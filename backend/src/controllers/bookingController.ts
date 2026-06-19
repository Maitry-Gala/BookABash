import { Response } from "express";
import mongoose from "mongoose";
import { Seat, Reservation, Booking } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.js";
import { z } from "zod";

const bookingSchema = z.object({
  reservationId: z.string().min(1),
});

export const confirmBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed" });
    return;
  }

  const { reservationId } = parsed.data;
  const userId = req.userId!;

  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    res.status(400).json({ success: false, message: "Invalid reservation ID" });
    return;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // find reservation within transaction — locks the doc
    const reservation = await Reservation.findOne({
      _id: reservationId,
      userId, // ensure user owns this reservation
    }).session(session);

    // reservation not found or doesn't belong to user
    if (!reservation) {
      await session.abortTransaction();
      res.status(404).json({ success: false, message: "Reservation not found" });
      return;
    }

    // check expiry explicitly — TTL index deletes async so doc may still exist briefly
    if (reservation.expiresAt < new Date()) {
      await session.abortTransaction();
      res.status(410).json({ success: false, message: "Reservation has expired" });
      return;
    }

    const { eventId, seatNumbers } = reservation;

    // flip seats from reserved → booked atomically
    const updateResult = await Seat.updateMany(
      {
        eventId,
        seatNumber: { $in: seatNumbers },
        status: "reserved", // only reserved seats can be booked
      },
      { $set: { status: "booked" } },
      { session }
    );

    // if updated count doesn't match, seats were tampered with
    if (updateResult.modifiedCount !== seatNumbers.length) {
      await session.abortTransaction();
      res.status(409).json({
        success: false,
        message: "Some seats could not be confirmed — please re-reserve",
      });
      return;
    }

    const [booking] = await Booking.create([{ userId, eventId, seatNumbers}],{session});
    // delete reservation doc — seats are now permanently booked
    await Reservation.deleteOne({ _id: reservationId }).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Booking confirmed",
      bookingId: booking?._id.toString(),
      data: {
        eventId,
        seatNumbers,
        bookedAt: booking?.createdAt,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});