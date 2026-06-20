import { Router } from "express";
import { reserveSeats } from "../controllers/reservationController.js"; 
import { authenticate } from "../middleware/auth.js"; 
import { getActiveReservation } from "../controllers/eventController.js";

const router = Router();
router.get("/:eventId", authenticate, getActiveReservation);
router.post("/", authenticate, reserveSeats);

export default router;