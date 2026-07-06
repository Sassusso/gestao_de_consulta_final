import appointmentRepository from "../repositories/appointmentRepository.js";
import patientRepository from "../repositories/patientRepository.js";
import doctorRepository from "../repositories/doctorRepository.js";
import notificationService from "./notificationService.js";
import paymentService from "./paymentService.js";
import slotService from "./slotService.js";
class AppointmentService {
  async create(data) {
    const patient = await patientRepository.findById(data.patientId);
    if (!patient) throw new Error("Paciente não encontrado");

    const doctor = await doctorRepository.findById(data.doctorId);
    if (!doctor) throw new Error("Médico não encontrado");
    if (!doctor.specialty) throw new Error("Médico sem especialidade definida");

    // Verificar se já existe consulta no mesmo horário para o mesmo médico
    const existing = await appointmentRepository.findAll({
      doctorId: data.doctorId,
      dateTime: data.dateTime,
      status: { not: "CANCELLED" }
    });
    if (existing.length > 0) {
      throw new Error("Médico já possui consulta agendada neste horário");
    }

    let amount;
    if (data.type === "PRIVATE") {
      amount = doctor.specialty.pricePrivate;
    } else if (data.type === "PLAN") {
      amount = doctor.specialty.pricePlan;
    } else {
      throw new Error("Tipo de consulta inválido (use PRIVATE ou PLAN)");
    }/*
    if (data.slotId) {
       const slot = await slotService.findById(data.slotId);
      if (!slot) throw new Error("Slot não encontrado");
      if (slot.isBooked) throw new Error("Esta vaga já foi ocupada");
       // Verifica se o slot corresponde ao médico e data
      if (slot.doctorId !== data.doctorId) throw new Error("Slot não pertence a este médico");
      if (new Date(slot.startTime).getTime() !== new Date(data.dateTime).getTime()) {
        throw new Error("Data/hora do slot não coincide com a consulta");
      }
    }*/

    const appointment = await appointmentRepository.create({ ...data, amount });
    /*
    if (data.slotId) {
      await slotService.bookSlot(data.slotId, appointment.id);
    }*/
    if (data.type === "PRIVATE") {
      await paymentService.create({
        appointmentId: appointment.id,
        amount,
        method: "stripe",
        status: "PENDING",
      });
    }

    // Notificar o paciente e médico
    await this._notifyPatientAndDoctor(
      appointment,
      "CONSULTA_CRIADA",
      "Consulta Agendada",
      // Mensagem para o Paciente
      (patient, doctor, apt) => 
        `Olá ${patient?.user?.name}, sua consulta ${apt.type === "PRIVATE" ? "particular" : "de plano"} com Dr(a). ${doctor?.user?.name} foi agendada para ${new Date(apt.dateTime).toLocaleString()}. Valor: USD $ ${apt.amount}.`,
      // Mensagem para o Médico
      (patient, doctor, apt) => 
        `Olá Dr(a). ${doctor?.user?.name}, uma nova consulta ${apt.type === "PRIVATE" ? "particular" : "de plano"} foi agendada pelo(a) paciente ${patient?.user?.name} para o dia ${new Date(apt.dateTime).toLocaleString()}.`
    );

    return appointment;
  }

  findAll(filters = {}) {
    return appointmentRepository.findAll(filters);
  }

  findById(id) {
    return appointmentRepository.findById(id);
  }

  findByPatient(patientId) {
    return appointmentRepository.findByPatient(patientId);
  }

  findByDoctor(doctorId) {
    return appointmentRepository.findByDoctor(doctorId);
  }

  async update(id, data) {
    const oldAppointment = await appointmentRepository.findById(id);
    if (!oldAppointment) throw new Error("Consulta não encontrada");

    // Impedir alteração de consultas concluídas ou canceladas
    if (oldAppointment.status === "COMPLETED" || oldAppointment.status === "CANCELLED") {
      throw new Error("Consultas concluídas ou canceladas não podem ser alteradas");
    }

    const updated = await appointmentRepository.update(id, data);

    // Notificar cancelamento
    if (data.status === "CANCELLED") {
      await this._notifyPatientAndDoctor(
        updated,
        "CONSULTA_CANCELADA",
        "Consulta Cancelada",
        (patient, doctor, apt) => 
          `Olá ${patient?.user?.name || "Paciente"}, sua consulta com Dr(a). ${doctor?.user?.name} do dia ${new Date(apt.dateTime).toLocaleString()} foi cancelada.`,
        (patient, doctor, apt) => 
          `Olá Dr(a). ${doctor?.user?.name}, a consulta do(a) paciente ${patient?.user?.name || "Paciente"} do dia ${new Date(apt.dateTime).toLocaleString()} foi cancelada.`
      );
    }
    // Notificar remarcação
    else if (data.dateTime && new Date(data.dateTime).getTime() !== new Date(oldAppointment.dateTime).getTime()) {
      await this._notifyPatientAndDoctor(
        updated,
        "CONSULTA_REMARCADA",
        "Consulta Remarcada",
        (patient, doctor, apt) => 
          `Olá ${patient?.user?.name || "Paciente"}, sua consulta com Dr(a). ${doctor?.user?.name} foi remarcada para ${new Date(apt.dateTime).toLocaleString()}.`,
        (patient, doctor, apt) => 
          `Olá Dr(a). ${doctor?.user?.name}, a sua consulta com o(a) paciente ${patient?.user?.name || "Paciente"} foi remarcada para ${new Date(apt.dateTime).toLocaleString()}.`
      );
    }

    return updated;
  }

  async delete(id) {
    // Soft delete: cancela a consulta
    return this.update(id, { status: "CANCELLED" });
  }

  async _notifyPatientAndDoctor(appointment, type, title, patientMsgBuilder, doctorMsgBuilder) {
    const patient = await patientRepository.findById(appointment.patientId);
    const doctor = await doctorRepository.findById(appointment.doctorId);

    if (patient?.userId && patientMsgBuilder) {
      await notificationService.create({
        userId: patient.userId,
        appointmentId: appointment.id,
        type,
        title,
        message: patientMsgBuilder(patient, doctor, appointment),
      });
    }
    
    if (doctor?.userId && doctorMsgBuilder) {
      await notificationService.create({
        userId: doctor.userId,
        appointmentId: appointment.id,
        type,
        title,
        message: doctorMsgBuilder(patient, doctor, appointment),
      });
    }
  }
}

export default new AppointmentService();