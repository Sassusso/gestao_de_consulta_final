import prisma from "../config/prisma.js";

class MedicalRecordRepository {
  create(data) {
    return prisma.medicalRecord.create({ data });
  }

  findAll() {
    return prisma.medicalRecord.findMany({
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } }
          }
        }
      }
    });
  }

  findById(id) {
    return prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } }
          }
        }
      }
    });
  }

  findByAppointmentId(appointmentId) {
    return prisma.medicalRecord.findUnique({
      where: { appointmentId }
    });
  }

  update(id, data) {
    return prisma.medicalRecord.update({
      where: { id },
      data
    });
  }

  delete(id) {
    return prisma.medicalRecord.delete({ where: { id } });
  }
}

export default new MedicalRecordRepository();