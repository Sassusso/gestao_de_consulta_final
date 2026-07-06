import { Router } from "express";
import specialtyController from "../controllers/specialtyController.js";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { z } from "zod";

const router = Router();

const createSpecialtySchema = z.object({
  name: z.string().min(3),
  pricePrivate: z.number().positive(),
  pricePlan: z.number().positive(),
});

const updateSpecialtySchema = z.object({
  name: z.string().min(3).optional(),
  pricePrivate: z.number().positive().optional(),
  pricePlan: z.number().positive().optional(),
});

/**
 * @swagger
 * tags:
 *   name: Specialties
 *   description: Gestão de especialidades médicas
 */

router.post("/", authenticateToken, authorizeRoles("ADMIN"), validate(createSpecialtySchema), specialtyController.create);
router.get("/", authenticateToken, specialtyController.findAll);
router.get("/:id", authenticateToken, specialtyController.findById);
router.put("/:id", authenticateToken, authorizeRoles("ADMIN"), validate(updateSpecialtySchema), specialtyController.update);
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN"), specialtyController.delete);

export default router;