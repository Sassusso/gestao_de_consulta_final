import { Router } from 'express';
import statisticsController from '../controllers/statisticsController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Estatísticas do sistema (requer autenticação)
 */

/**
 * @swagger
 * /stats/admin:
 *   get:
 *     summary: Estatísticas para administradores
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados estatísticos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalDoctors:
 *                   type: integer
 *                 totalSpecialties:
 *                   type: integer
 *                 todayAppointments:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (apenas ADMIN)
 */
router.get('/admin', authenticateToken, authorizeRoles('ADMIN'), statisticsController.getAdminStats);

/**
 * @swagger
 * /stats/doctor:
 *   get:
 *     summary: Estatísticas para o médico autenticado
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados estatísticos do médico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todayAppointments:
 *                   type: integer
 *                 todayCompleted:
 *                   type: integer
 *                 upcomingAppointments:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (apenas DOCTOR)
 */
router.get('/doctor', authenticateToken, authorizeRoles('DOCTOR'), statisticsController.getDoctorStats);

router.get('/notifications/count', authenticateToken, statisticsController.getNotificationCount);

export default router;