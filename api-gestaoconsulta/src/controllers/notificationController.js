import notificationService from "../services/notificationService.js";

class NotificationController {
  async getMyNotifications(req, res, next) {
    try {
      const filters = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.status) filters.status = req.query.status;
      const notifications = await notificationService.getUserNotifications(req.user.id, filters);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  async resendNotification(req, res, next) {
    try {
      const notification = await notificationService.resend(req.params.id);
      res.json(notification);
    } catch (err) {
      next(err);
    }
  }

  async getNotificationCount(req, res, next) {
    try {
      const count = await notificationService.getUserNotificationCount(req.user.id);
      res.json({ total: count });
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      res.json({ unread: count });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.json({ message: 'Todas as notificações marcadas como lidas', count: result.count });
    } catch (err) {
      next(err);
    }
  }
}

export default new NotificationController();