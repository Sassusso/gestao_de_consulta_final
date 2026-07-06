import request from 'supertest';
import express from 'express';
import appointmentController from '../src/controllers/appointmentController.js';
import appointmentService from '../src/services/appointmentService.js';

// Configura o app Express temporário para as consultas
const app = express();
app.use(express.json());
app.post('/appointments', appointmentController.create);
app.get('/appointments/:id', appointmentController.findById);

// Simulamos o serviço de agendamentos
jest.mock('../src/services/appointmentService.js');

describe('Suite de Testes Automatizados - AppointmentController', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve simular o agendamento de uma consulta com sucesso (Status 201)', async () => {
    const consultaSimulada = {
      id: "65f21abcde1234567890f1a2",
      patientId: "paciente_xyz",
      doctorId: "medico_abc",
      dateTime: "2026-10-15T14:30:00.000Z",
      reason: "Check-up anual",
      type: "PRIVATE",
      status: "SCHEDULED"
    };

    appointmentService.create.mockResolvedValue(consultaSimulada);

    const resposta = await request(app)
      .post('/appointments')
      .send({
        patientId: "paciente_xyz",
        doctorId: "medico_abc",
        dateTime: "2026-10-15T14:30:00.000Z",
        reason: "Check-up anual",
        type: "PRIVATE"
      });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toHaveProperty('id');
    expect(resposta.body.status).toBe('SCHEDULED');
    expect(resposta.body.reason).toBe('Check-up anual');
  });

  it('Deve buscar uma consulta pelo ID com sucesso (Status 200)', async () => {
    const consultaSimulada = { id: "123", reason: "Dor de cabeça" };
    appointmentService.findById.mockResolvedValue(consultaSimulada);

    const resposta = await request(app).get('/appointments/123');

    expect(resposta.status).toBe(200);
    expect(resposta.body.reason).toBe('Dor de cabeça');
  });
});