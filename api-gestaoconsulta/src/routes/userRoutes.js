import { Router } from "express";
import userController from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import { createUserSchema, updateUserSchema } from "../schemas/userSchemas.js";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestão de utilizadores (requer autenticação)
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo utilizador (registo público)
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@email.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               phone:
 *                 type: string
 *                 example: "11999999999"
 *               role:
 *                 type: string
 *                 enum: [PATIENT, DOCTOR, ADMIN]
 *                 default: PATIENT
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-10"
 *               sex:
 *                 type: string
 *                 enum: [M, F]
 *               address:
 *                 type: string
 *               emergencyPhone:
 *                 type: string
 *               specialty:
 *                 type: string
 *               medicalLicense:
 *                 type: string
 *               consultationFee:
 *                 type: number
 *     responses:
 *       201:
 *         description: Utilizador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos ou validação falhou
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: E-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", validate(createUserSchema), userController.create);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os utilizadores (apenas ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [PATIENT, DOCTOR, ADMIN]
 *         description: Filtrar por papel
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de utilizadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Permissão insuficiente (apenas ADMIN)
 */
router.get("/", authenticateToken, authorizeRoles("ADMIN"), userController.findAll);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtém um utilizador pelo ID (apenas ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do utilizador
 *     responses:
 *       200:
 *         description: Utilizador encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilizador não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Permissão insuficiente
 */
router.get("/:id", authenticateToken, authorizeRoles("ADMIN"), userController.findById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza um utilizador (apenas ADMIN ou o próprio)
 *     tags: [Users]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Utilizador atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: E-mail já em uso
 *       401:
 *         description: Não autenticado
 */
router.put("/:id", authenticateToken, validate(updateUserSchema), userController.update);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remove um utilizador (apenas ADMIN)
 *     tags: [Users]
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
 *         description: Utilizador removido
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
 *         description: Permissão insuficiente
 *       404:
 *         description: Utilizador não encontrado
 */
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN"), userController.delete);

export default router;