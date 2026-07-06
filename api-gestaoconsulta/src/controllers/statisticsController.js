import statisticsService from '../services/statisticsService.js';

class StatisticsController {
  async getAdminStats(req, res, next) {
    try {
      const stats = await statisticsService.getAdminStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  async getDoctorStats(req, res, next) {
    try {
      const stats = await statisticsService.getDoctorStats(req.user.id);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  async getNotificationCount(req, res, next) {
    try {
      const count = await notificationRepository.countUnreadByUser(req.user.id);
      return res.json({ total: count });
    } catch (err) {
      next(err);
    }
  }
}

export default new StatisticsController();