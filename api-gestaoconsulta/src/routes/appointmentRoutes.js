import { Router } from "express";
import appointmentController from "../controllers/appointmentController.js";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createAppointmentSchema, updateAppointmentSchema } from "../schemas/appointmentSchema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Gestão de consultas (requer autenticação)
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Cria uma nova consulta (apenas PATIENT ou ADMIN)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *               - dateTime
 *               - reason
 *             properties:
 *               patientId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PRIVATE, PLAN]
 *                 default: IN_PERSON
 *     responses:
 *       201:
 *         description: Consulta criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Médico já tem consulta nesse horário
 *       401:
 *         description: Não autenticado
 */
router.post("/", authenticateToken, authorizeRoles("PATIENT", "ADMIN"), validate(createAppointmentSchema), appointmentController.create);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Lista consultas com filtros (ADMIN ou DOCTOR)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, CANCELLED, COMPLETED]
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de consultas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Permissão insuficiente
 */
router.get("/", authenticateToken, authorizeRoles("ADMIN", "DOCTOR"), appointmentController.findAll);

/**
 * @swagger
 * /appointments/patient/{patientId}:
 *   get:
 *     summary: Lista consultas de um paciente (próprio paciente, DOCTOR ou ADMIN)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de consultas do paciente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Não autenticado
 */
router.get("/patient/:patientId", authenticateToken, appointmentController.findByPatient);

/**
 * @swagger
 * /appointments/doctor/{doctorId}:
 *   get:
 *     summary: Lista consultas de um médico (próprio médico, ADMIN ou DOCTOR)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de consultas do médico
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get("/doctor/:doctorId", authenticateToken, appointmentController.findByDoctor);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Obtém detalhes de uma consulta
 *     tags: [Appointments]
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
 *         description: Consulta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Consulta não encontrada
 */
router.get("/:id", authenticateToken, appointmentController.findById);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Atualiza uma consulta (status, notas, etc.)
 *     tags: [Appointments]
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
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, CANCELLED, COMPLETED]
 *               notes:
 *                 type: string
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Consulta atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Consulta já concluída/cancelada
 */
router.put("/:id", authenticateToken, validate(updateAppointmentSchema), appointmentController.update);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Cancela uma consulta (soft delete - muda status para CANCELLED)
 *     tags: [Appointments]
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
 *         description: Consulta cancelada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Não autenticado
 */
router.delete("/:id", authenticateToken, appointmentController.delete);

export default router;