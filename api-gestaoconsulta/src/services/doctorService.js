import doctorRepository from "../repositories/doctorRepository.js";
import userRepository from "../repositories/userRepository.js";
import appointmentRepository from "../repositories/appointmentRepository.js";
import patientRepository from "../repositories/patientRepository.js";
class DoctorService {
  async findAll() {
    return doctorRepository.findAll();
  }

  async getByUserId(userId) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new Error('Médico não encontrado');
    return doctor;
  }

  async findById(id) {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) throw new Error("Doctor não encontrado");
    return doctor;
  }

  async update(id, data) {
    
    const doctor = await doctorRepository.findById(id);
    if (!doctor) throw new Error("Doctor não encontrado");

    if (data.userId && data.userId !== doctor.userId) {
      const user = await userRepository.findById(data.userId);
      if (!user) throw new Error("Novo usuario não existe");
      if (user.role !== "DOCTOR") throw new Error("User não é doctor");
    }

    return doctorRepository.update(id, data);
  }

  async delete(id) {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) throw new Error("Doctor não encontrado");
    return doctorRepository.delete(id);
  }

  async getPatientsByDoctorId(userId) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new Error("Médico não encontrado");

    // Buscar todas as consultas do médico
    const appointments = await appointmentRepository.findAll({
      doctorId: doctor.id,
      status: { not: "CANCELLED" }
    });

    // Extrair IDs de pacientes únicos
    const patientIds = [...new Set(appointments.map(a => a.patientId))];
    if (patientIds.length === 0) return [];

    // Buscar dados dos pacientes
    const patients = await patientRepository.findAll({
      where: { id: { in: patientIds } },
      include: { user: true }
    });

    return patients;
  }
}

export default new DoctorService();