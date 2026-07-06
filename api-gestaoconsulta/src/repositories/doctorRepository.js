import prisma from "../config/prisma.js";

class DoctorRepository {
  create(data) {
    return prisma.doctor.create({ data });
  }

  findAll() {
    return prisma.doctor.findMany({
      include: { user: true, specialty: true }
    });
  }

  findById(id) {
    return prisma.doctor.findUnique({
      where: { id },
      include: { user: true, specialty: true }
    });
  }

  findByUserId(userId) {
    return prisma.doctor.findUnique({ where: { userId } });
  }

  update(id, data) {
    return prisma.doctor.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.doctor.delete({ where: { id } });
  }
  
  async count(filters = {}) {
    return prisma.doctor.count({ where: filters });
  }
}

export default new DoctorRepository();