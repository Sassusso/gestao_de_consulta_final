import { Router } from "express";
import medicalRecordController from "../controllers/medicalRecordController.js";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createMedicalRecordSchema, updateMedicalRecordSchema } from "../schemas/medicalRecordSchemas.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MedicalRecords
 *   description: Prontuários médicos (requer autenticação)
 */

/**
 * @swagger
 * /medical-records:
 *   post:
 *     summary: Cria um prontuário para uma consulta concluída (apenas DOCTOR ou ADMIN)
 *     tags: [MedicalRecords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - diagnosis
 *             properties:
 *               appointmentId:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               prescription:
 *                 type: string
 *               requestedExams:
 *                 type: string
 *               medicalNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prontuário criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalRecord'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Já existe prontuário para esta consulta
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (apenas DOCTOR/ADMIN)
 */
router.post("/", authenticateToken, authorizeRoles("DOCTOR", "ADMIN"), validate(createMedicalRecordSchema), medicalRecordController.create);

/**
 * @swagger
 * /medical-records:
 *   get:
 *     summary: Lista todos os prontuários (ADMIN ou DOCTOR)
 *     tags: [MedicalRecords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de prontuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MedicalRecord'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
router.get("/", authenticateToken, authorizeRoles("ADMIN", "DOCTOR"), medicalRecordController.findAll);

/**
 * @swagger
 * /medical-records/appointment/{appointmentId}:
 *   get:
 *     summary: Obtém prontuário por ID da consulta
 *     tags: [MedicalRecords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prontuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalRecord'
 *       404:
 *         description: Prontuário não encontrado
 */
router.get("/appointment/:appointmentId", authenticateToken, medicalRecordController.findByAppointmentId);

/**
 * @swagger
 * /medical-records/{id}:
 *   get:
 *     summary: Obtém prontuário pelo ID
 *     tags: [MedicalRecords]
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
 *         description: Prontuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalRecord'
 *       404:
 *         description: Prontuário não encontrado
 */
router.get("/:id", authenticateToken, medicalRecordController.findById);

/**
 * @swagger
 * /medical-records/{id}:
 *   put:
 *     summary: Atualiza um prontuário (apenas DOCTOR ou ADMIN)
 *     tags: [MedicalRecords]
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
 *               diagnosis:
 *                 type: string
 *               prescription:
 *                 type: string
 *               requestedExams:
 *                 type: string
 *               medicalNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prontuário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalRecord'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
router.put("/:id", authenticateToken, authorizeRoles("DOCTOR", "ADMIN"), validate(updateMedicalRecordSchema), medicalRecordController.update);

/**
 * @swagger
 * /medical-records/{id}:
 *   delete:
 *     summary: Remove um prontuário (apenas ADMIN)
 *     tags: [MedicalRecords]
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
 *         description: Prontuário removido
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
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN"), medicalRecordController.delete);

export default router;