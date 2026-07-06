import medicalRecordRepository from "../repositories/medicalRecordRepository.js";
import appointmentRepository from "../repositories/appointmentRepository.js";

class MedicalRecordService {
  async create(data) {

    const appointment = await appointmentRepository.findById(data.appointmentId);
    if (!appointment) throw new Error("consulta não encontrada");

    // Verificar se a consulta está concluída (só pode criar prontuário se consulta foi realizada)
    if (appointment.status !== "COMPLETED") {
      throw new Error("Prontuarios podem ser criadas só para consultas feitas!");
    }

    const existing = await medicalRecordRepository.findByAppointmentId(data.appointmentId);
    if (existing) throw new Error("Já existe prontuario para essa consulta");

    return medicalRecordRepository.create(data);
  }

  async findAll() {
    return medicalRecordRepository.findAll();
  }

  async findById(id) {
    const record = await medicalRecordRepository.findById(id);
    if (!record) throw new Error("Prontuario não encontrado");
    return record;
  }

  async findByAppointmentId(appointmentId) {
    const record = await medicalRecordRepository.findByAppointmentId(appointmentId);
    if (!record) throw new Error("Não foi encontrado rontuario para esta consulta");
    return record;
  }

  async update(id, data) {
    const record = await medicalRecordRepository.findById(id);
    if (!record) throw new Error("Prontuario não encontrado");
    // fazer : permitir atualização apenas se a consulta ainda não foi faturada
    return medicalRecordRepository.update(id, data);
  }

  async delete(id) {
    const record = await medicalRecordRepository.findById(id);
    if (!record) throw new Error("Prontuario não encontrado");
    return medicalRecordRepository.delete(id);
  }
}

export default new MedicalRecordService();