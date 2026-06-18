import { Router } from "express";
import { reserveSeats } from "../controllers/reservationController.js"; 
import { authenticate } from "../middleware/auth.js"; 

const router = Router();

router.post("/", authenticate, reserveSeats);

export default router;