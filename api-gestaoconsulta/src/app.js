import express from "express";
import cors from 'cors';  
import dotenv from 'dotenv';
import userRoutes from "./routes/userRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { authenticateToken } from "./middlewares/authMiddleware.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import specialtyRoutes from "./routes/specialtyRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();// variáveis do env

const app = express();

app.use(cors({
    origin: '*',  // permitir qualquer origem
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/*
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));*/
app.use((req, res, next) => {
  if (req.originalUrl === '/payments/webhook/stripe') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Rotas públicas
app.use("/auth", authRoutes);

// Rotas protegidas
app.use("/users", userRoutes);
app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/medical-records", medicalRecordRoutes);
app.use("/notifications", notificationRoutes);
app.use("/specialties", specialtyRoutes);
app.use("/payments", paymentRoutes);
import statisticsRoutes from './routes/statisticsRoutes.js';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
app.use('/api-swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/stats", statisticsRoutes);
// erro global
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";
  res.status(status).json({ error: message });
});


export default app;