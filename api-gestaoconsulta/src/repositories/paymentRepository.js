import prisma from "../config/prisma.js";

class PaymentRepository {
  create(data) {
    return prisma.payment.create({ data });
  }

  findById(id) {
    return prisma.payment.findUnique({ where: { id } });
  }

  findByAppointmentId(appointmentId) {
    return prisma.payment.findUnique({ where: { appointmentId } });
  }

  findByTransactionRef(transactionRef) {
    return prisma.payment.findFirst({ where: { transactionRef } });
  }

  findAll(filters = {}) {
    return prisma.payment.findMany({
      where: filters,
      orderBy: { createdAt: "desc" }
    });
  }

  update(id, data) {
    return prisma.payment.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.payment.delete({ where: { id } });
  }
}

export default new PaymentRepository();