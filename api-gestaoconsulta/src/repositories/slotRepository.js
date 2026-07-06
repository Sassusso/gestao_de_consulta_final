import prisma from "../config/prisma.js";

class SlotRepository {
  create(data) {
    return prisma.slot.create({ data });
  }

  findAvailableByDoctor(doctorId, fromDate, toDate) {
    return prisma.slot.findMany({
      where: {
        doctorId,
        isBooked: false,
        startTime: { gte: fromDate, lt: toDate },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  findAvailableBySpecialty(specialtyId, fromDate, toDate) {
    return prisma.slot.findMany({
      where: {
        doctor: { specialtyId },
        isBooked: false,
        startTime: { gte: fromDate, lt: toDate },
      },
      include: { doctor: { include: { user: true, specialty: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  findById(id) {
    return prisma.slot.findUnique({ where: { id } });
  }

  update(id, data) {
    return prisma.slot.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.slot.delete({ where: { id } });
  }

  // Para admin: listar todos os slots com filtros
  findAll(filters = {}) {
    return prisma.slot.findMany({
      where: filters,
      include: { doctor: { include: { user: true, specialty: true } } },
      orderBy: { startTime: 'asc' },
    });
  }
}

export default new SlotRepository();