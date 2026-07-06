import request from 'supertest';
import express from 'express';
import doctorController from '../src/controllers/doctorController.js';
import doctorService from '../src/services/doctorService.js';

// 1. Configura um servidor Express temporário e isolado para testar o Controller
const app = express();
app.use(express.json());

// Definimos as rotas apontando diretamente para os métodos do seu DoctorController
app.get('/doctors', doctorController.findAll);
app.get('/doctors/:id', doctorController.findById);
app.put('/doctors/:id', doctorController.update);

// 2. Dizemos ao Jest para mocar/simular o arquivo de serviços dos médicos
jest.mock('../src/services/doctorService.js');

describe('Suite de Testes Automatizados - DoctorController', () => {
  
  // Limpa as simulações antes de cada teste para evitar interferências
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve listar todos os médicos com sucesso (Status 200)', async () => {
    // Simulamos o resultado que o seu doctorService.findAll() devolveria
    const medicosSimulados = [
      { id: '1', medicalLicense: '1231', userId: 'user_01' },
      { id: '2', medicalLicense: '5555', userId: 'user_02' }
    ];
    
    // Forçamos o serviço a devolver os dados falsos sem tocar no MongoDB
    doctorService.findAll.mockResolvedValue(medicosSimulados);

    // Fazemos o disparo HTTP simulado para a rota
    const resposta = await request(app).get('/doctors');

    // Validações (Asserções do Jest)
    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(2);
    expect(resposta.body[0].medicalLicense).toBe('1231');
  });

  it('Deve atualizar os dados de um médico com sucesso', async () => {
    const medicoAtualizado = { id: '1', medicalLicense: '1231-ATUALIZADA' };
    
    doctorService.update.mockResolvedValue(medicoAtualizado);

    const resposta = await request(app)
      .put('/doctors/1')
      .send({ medicalLicense: '1231-ATUALIZADA' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.medicalLicense).toBe('1231-ATUALIZADA');
  });
});