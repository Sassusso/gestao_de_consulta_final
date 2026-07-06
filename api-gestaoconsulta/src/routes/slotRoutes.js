import { Router } from "express";
import slotController from "../controllers/slotController.js";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authenticateToken, authorizeRoles("ADMIN"), slotController.create);
router.get("/", authenticateToken, authorizeRoles("ADMIN"), slotController.findAll);
router.get("/:id", authenticateToken, authorizeRoles("ADMIN"), slotController.findById);
router.put("/:id", authenticateToken, authorizeRoles("ADMIN"), slotController.update);
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN"), slotController.delete);

router.get("/available", authenticateToken, slotController.getAvailableSlots);

export default router;