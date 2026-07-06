import prisma from "../config/prisma.js";

class SpecialtyRepository {
  create(data) {
    return prisma.specialty.create({ data });
  }

  findAll() {
    return prisma.specialty.findMany({ orderBy: { name: "asc" } });
  }

  findById(id) {
    return prisma.specialty.findUnique({ where: { id } });
  }

  update(id, data) {
    return prisma.specialty.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.specialty.delete({ where: { id } });
  }

  async count(filters = {}) {
    return prisma.specialty.count({ where: filters });
  }
}

export default new SpecialtyRepository();