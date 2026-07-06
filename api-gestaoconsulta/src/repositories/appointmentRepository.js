import prisma from "../config/prisma.js";

class AppointmentRepository {
  create(data) {
    return prisma.appointment.create({ data });
  }

  findAll(filters = {}) {
    return prisma.appointment.findMany({
      where: filters,
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        payment: true,
      },
      orderBy: { dateTime: 'asc' }
    });
  }

  findById(id) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, specialty: true } },
        payment: true,
      }
    });
  }

  findByPatient(patientId) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: { include: { user: true, specialty: true } },
        payment: true,
      },
      orderBy: { dateTime: 'asc' }
    });
  }

  findByDoctor(doctorId) {
    return prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, specialty: true } },
        medicalRecord: { select: { id: true }},
        payment: true,
      },
      orderBy: { dateTime: 'asc' }
    });
  }

  update(id, data) {
    return prisma.appointment.update({
      where: { id },
      data
    });
  }

  delete(id) {
    return prisma.appointment.delete({
      where: { id }
    });
  }

  countScheduledForToday(doctorId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = {
      dateTime: { gte: today, lt: tomorrow },
      status: 'SCHEDULED'
    };
    if (doctorId) {
      where.doctorId = doctorId;
    }
    return prisma.appointment.count({ where });
  }

  async count(filters = {}) {
    return prisma.appointment.count({ where: filters });
  }
}

export default new AppointmentRepository();