import { Router } from "express";
import { confirmBooking } from "../controllers/bookingController.js"; 
import { authenticate } from "../middleware/auth.js"; 

const router = Router();

router.post("/", authenticate, confirmBooking);

export default router;