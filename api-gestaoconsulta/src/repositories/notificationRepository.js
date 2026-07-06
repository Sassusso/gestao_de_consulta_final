import prisma from "../config/prisma.js";

class NotificationRepository {
  create(data) {
    return prisma.notification.create({ data });
  }

  findById(id) {
    return prisma.notification.findUnique({ where: { id } });
  }

  findByUser(userId, filters = {}) {
    return prisma.notification.findMany({
      where: { userId, ...filters },
      orderBy: { createdAt: "desc" },
    });
  }

  findByAppointment(appointmentId) {
    return prisma.notification.findMany({
      where: { appointmentId },
      orderBy: { createdAt: "desc" },
    });
  }

  update(id, data) {
    return prisma.notification.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.notification.delete({ where: { id } });
  }

  countByUser(userId) {
    return prisma.notification.count({
      where: { userId }
    });
  }

  countUnreadByUser(userId) {
    return prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
  }
  markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true
      }
    });
  }
}

export default new NotificationRepository();