import slotRepository from "../repositories/slotRepository.js";
import doctorRepository from "../repositories/doctorRepository.js";

class SlotService {
  async create(data) {
    // Verifica se o médico existe
    const doctor = await doctorRepository.findById(data.doctorId);
    if (!doctor) throw new Error("Médico não encontrado");
    // Verifica se o slot já não existe (sobreposição)
    const existing = await slotRepository.findAvailableByDoctor(
      data.doctorId,
      data.startTime,
      data.endTime
    );
    if (existing.length > 0) {
      throw new Error("Já existe uma vaga para este período");
    }
    return slotRepository.create(data);
  }

  // obter slots disponíveis para uma especialidade num período
  async getAvailableSlotsForSpecialty(specialtyId, fromDate, toDate) {
    return slotRepository.findAvailableBySpecialty(specialtyId, fromDate, toDate);
  }

  // obter slots disponíveis para um médico num período
  async getAvailableSlotsForDoctor(doctorId, fromDate, toDate) {
    return slotRepository.findAvailableByDoctor(doctorId, fromDate, toDate);
  }

  // Admin: listar todos os slots
  async findAll(filters = {}) {
    return slotRepository.findAll(filters);
  }

  async findById(id) {
    const slot = await slotRepository.findById(id);
    if (!slot) throw new Error("Slot não encontrado");
    return slot;
  }

  async update(id, data) {
    const slot = await this.findById(id);
    if (slot.isBooked) throw new Error("Não é possível alterar uma vaga já agendada");
    return slotRepository.update(id, data);
  }

  async delete(id) {
    const slot = await this.findById(id);
    if (slot.isBooked) throw new Error("Não é possível excluir uma vaga já agendada");
    return slotRepository.delete(id);
  }

  // Método para marcar slot como ocupado ao criar consulta
  async bookSlot(slotId, appointmentId) {
    return slotRepository.update(slotId, {
      isBooked: true,
      appointmentId,
    });
  }
}

export default new SlotService();