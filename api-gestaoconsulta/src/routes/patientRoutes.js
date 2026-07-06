import { Router } from "express";
import patientController from "../controllers/patientController.js";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Gestão de pacientes (requer autenticação)
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Lista todos os pacientes (ADMIN ou DOCTOR)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
//router.get("/", authenticateToken, authorizeRoles("ADMIN", "DOCTOR"), patientController.findAll);
router.get("/", authenticateToken, patientController.findAll);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Obtém um paciente pelo ID
 *     tags: [Patients]
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
 *         description: Paciente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Paciente não encontrado
 *       401:
 *         description: Não autenticado
 */
router.get("/:id", authenticateToken, patientController.findById);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Atualiza dados do paciente (apenas ADMIN ou DOCTOR)
 *     tags: [Patients]
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
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               sex:
 *                 type: string
 *               address:
 *                 type: string
 *               emergencyPhone:
 *                 type: string
 *               bloodGroup:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paciente atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Paciente não encontrado
 */
router.put("/:id", authenticateToken, authorizeRoles("ADMIN", "DOCTOR"), patientController.update);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Remove um paciente (apenas ADMIN)
 *     tags: [Patients]
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
 *         description: Paciente removido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN"), patientController.delete);

export default router;