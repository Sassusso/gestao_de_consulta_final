import notificationRepository from "../repositories/notificationRepository.js";
import emailSender from "../utils/emailSender.js";
import userRepository from "../repositories/userRepository.js";
import prisma from "../config/prisma.js";

class NotificationService {
  async create({ userId, appointmentId, type, title, message }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("Usuário não encontrado");

    const notification = await notificationRepository.create({
      userId,
      appointmentId,
      type,
      title,
      message,
      status: "PENDING",
    });

    // Envia em background
    this._sendEmail(notification).catch(console.error);

    return notification;
  }

  async _sendEmail(notification) {
    const user = await userRepository.findById(notification.userId);
    if (!user?.email) {
      await notificationRepository.update(notification.id, { status: "FAILED" });
      return;
    }

    const success = await emailSender.send(
      user.email,
      notification.title,
      `<p>${notification.message}</p>`
    );

    const status = success ? "SENT" : "FAILED";
    await notificationRepository.update(notification.id, {
      status,
      sentAt: success ? new Date() : null,
    });
  }

  async resend(id) {
    const notification = await notificationRepository.findById(id);
    if (!notification) throw new Error("Notificação não encontrada");
    if (notification.status === "SENT") throw new Error("Notificação já enviada");

    await notificationRepository.update(id, { status: "PENDING", sentAt: null });
    await this._sendEmail(notification);
    return notificationRepository.findById(id);
  }

  async getUserNotifications(userId, filters = {}) {
    return notificationRepository.findByUser(userId, filters);
  }

  async notifyParticipants(appointment, type, title, messageBuilder) {
    const { patientId, doctorId, id: appointmentId, dateTime } = appointment;
    const patient = await prisma.patient.findUnique({ where: { id: patientId }, include: { user: true } });
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, include: { user: true } });

    if (patient?.userId) {
      await this.create({
        userId: patient.userId,
        appointmentId,
        type,
        title,
        message: messageBuilder(patient.user.name, doctor?.user?.name, dateTime),
      });
    }
    if (doctor?.userId) {
      await this.create({
        userId: doctor.userId,
        appointmentId,
        type,
        title,
        message: messageBuilder(patient?.user?.name, doctor.user.name, dateTime),
      });
    }
  }
  async getUserNotificationCount(userId) {
    return notificationRepository.countByUser(userId);
  }

  async getUnreadCount(userId) {
    return notificationRepository.countUnreadByUser(userId);
  }

  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }
  
}

export default new NotificationService();