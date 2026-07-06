import { Router } from "express";
import doctorController from "../controllers/doctorController.js";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Gestão de médicos (requer autenticação)
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Lista todos os médicos
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de médicos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 */
router.get("/", authenticateToken, doctorController.findAll);

router.get("/me", authenticateToken, doctorController.getMyProfile);
/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Obtém um médico pelo ID
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Médico encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: Médico não encontrado
 */
router.get("/:id", authenticateToken, doctorController.findById);

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Atualiza dados de um médico (apenas ADMIN ou o próprio médico)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialty:
 *                 type: string
 *               medicalLicense:
 *                 type: string
 *               availability:
 *                 type: object
 *               consultationFee:
 *                 type: number
 *     responses:
 *       200:
 *         description: Médico atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
router.put("/:id", authenticateToken, authorizeRoles("ADMIN", "DOCTOR"), doctorController.update);

router.get("/me/patients", authenticateToken, authorizeRoles("ADMIN", "DOCTOR"), doctorController.getMyPatients);

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Remove um médico (apenas ADMIN)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Médico removido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Acesso negado
 */
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN"), doctorController.delete);

export default router;