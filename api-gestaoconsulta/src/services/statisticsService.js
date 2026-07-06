import userRepository from '../repositories/userRepository.js';
import doctorRepository from '../repositories/doctorRepository.js';
import appointmentRepository from '../repositories/appointmentRepository.js';
import specialtyRepository from '../repositories/specialtyRepository.js';

class StatisticsService {
  async getAdminStats() {
    
    const totalUsers = await userRepository.count();
    const totalDoctors = await doctorRepository.count();
    const totalSpecialties = await specialtyRepository.count();
    const todayAppointments = await appointmentRepository.countScheduledForToday();

    return {
      totalUsers,
      totalDoctors,
      totalSpecialties,
      todayAppointments
    };
  }

  async getDoctorStats(userId) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new Error('Médico não encontrado para este usuário');

    const todayAppointments = await appointmentRepository.countScheduledForToday(doctor.id);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCompleted = await appointmentRepository.count({
      doctorId: doctor.id,
      dateTime: { gte: today, lt: tomorrow },
      status: 'COMPLETED'
    });

    const now = new Date();
    const upcoming = await appointmentRepository.count({
      doctorId: doctor.id,
      dateTime: { gt: now },
      status: { not: 'CANCELLED' }
    });

    return {
      todayAppointments,
      todayCompleted,
      upcomingAppointments: upcoming
    };
  }
}

export default new StatisticsService();