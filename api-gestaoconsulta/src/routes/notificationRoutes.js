import { Router } from "express";
import notificationController from "../controllers/notificationController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gerenciamento de notificações do usuário autenticado
 */

/**
 * @swagger
 * /notifications/me:
 *   get:
 *     summary: Lista todas as notificações do usuário autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CONSULTA_CRIADA, CONSULTA_CANCELADA, CONSULTA_REMARCADA, LEMBRETE_CONSULTA, PAGAMENTO_CONFIRMADO]
 *         description: Filtra por tipo de notificação
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SENT, FAILED]
 *         description: Filtra por status da notificação
 *     responses:
 *       200:
 *         description: Lista de notificações retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", authenticateToken, notificationController.getMyNotifications);

/**
 * @swagger
 * /notifications/{id}/resend:
 *   post:
 *     summary: Reenvia uma notificação (útil para notificações com status FAILED)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação reenviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Notificação já foi enviada anteriormente
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário não tem permissão para reenviar esta notificação
 *       404:
 *         description: Notificação não encontrada
 */
router.post("/:id/resend", authenticateToken, notificationController.resendNotification);

/**
 * @swagger
 * /notifications/count:
 *   get:
 *     summary: Retorna o total de notificações do usuário autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 */
router.get('/count', authenticateToken, notificationController.getNotificationCount);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Retorna o número de notificações não lidas do usuário autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contagem de não lidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unread:
 *                   type: integer
 */
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Marca todas as notificações do utilizador como lidas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificações marcadas como lidas
 */
router.put('/read-all', authenticateToken, notificationController.markAllAsRead);

export default router;