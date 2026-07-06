import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestão de Consultas Médicas',
      version: '1.0.0',
      description: 'API para gestão de consultas, pacientes, médicos, prontuários, pagamentos e notificações',
      contact: {
        name: 'Equipa de Desenvolvimento',
        email: 'dev@gestaoconsulta.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // Schemas de resposta comuns
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['PATIENT', 'DOCTOR', 'ADMIN'] },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date-time', nullable: true },
            sex: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            emergencyPhone: { type: 'string', nullable: true },
            bloodGroup: { type: 'string', nullable: true },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Doctor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            specialty: { type: 'string' },
            medicalLicense: { type: 'string' },
            availability: { type: 'object', nullable: true },
            consultationFee: { type: 'number', nullable: true },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            patientId: { type: 'string' },
            doctorId: { type: 'string' },
            dateTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['SCHEDULED', 'CANCELLED', 'COMPLETED'] },
            reason: { type: 'string' },
            notes: { type: 'string', nullable: true },
            type: { type: 'string', enum: ['ONLINE', 'IN_PERSON'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            patient: { $ref: '#/components/schemas/Patient' },
            doctor: { $ref: '#/components/schemas/Doctor' }
          }
        },
        MedicalRecord: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            appointmentId: { type: 'string' },
            diagnosis: { type: 'string' },
            prescription: { type: 'string', nullable: true },
            requestedExams: { type: 'string', nullable: true },
            medicalNotes: { type: 'string', nullable: true },
            recordedAt: { type: 'string', format: 'date-time' },
            appointment: { $ref: '#/components/schemas/Appointment' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            appointmentId: { type: 'string' },
            amount: { type: 'number' },
            method: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'PAID', 'CANCELLED'] },
            transactionRef: { type: 'string', nullable: true },
            paidAt: { type: 'string', format: 'date-time', nullable: true },
            appointment: { $ref: '#/components/schemas/Appointment' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            appointmentId: { type: 'string' },
            type: { type: 'string', enum: ['CONSULTA_CRIADA', 'CONSULTA_CANCELADA', 'CONSULTA_REMARCADA', 'LEMBRETE_CONSULTA', 'PAGAMENTO_CONFIRMADO'] },
            title: { type: 'string' },
            message: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'SENT', 'FAILED'] },
            sentAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        NotificationType: {
          type: 'string',
          enum: ['CONSULTA_CRIADA', 'CONSULTA_CANCELADA', 'CONSULTA_REMARCADA', 'LEMBRETE_CONSULTA', 'PAGAMENTO_CONFIRMADO']
        },
        NotificationStatus: {
          type: 'string',
          enum: ['PENDING', 'SENT', 'FAILED']
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

export default swaggerJsdoc(options);