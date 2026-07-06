import cron from "node-cron";
import notificationService from "../services/notificationService.js";
import appointmentRepository from "../repositories/appointmentRepository.js";
import patientRepository from "../repositories/patientRepository.js";
import doctorRepository from "../repositories/doctorRepository.js";

async function sendDailyReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const appointments = await appointmentRepository.findAll({
    dateTime: { gte: tomorrow, lt: dayAfter },
    status: "SCHEDULED",
  });

  for (const apt of appointments) {
    const patient = await patientRepository.findById(apt.patientId);
    const doctor = await doctorRepository.findById(apt.doctorId);

    if (patient?.userId) {
      await notificationService.create({
        userId: patient.userId,
        appointmentId: apt.id,
        type: "LEMBRETE_CONSULTA",
        title: "Lembrete de Consulta",
        message: `Sua consulta com ${doctor?.user?.name} está agendada para amanhã, ${new Date(apt.dateTime).toLocaleString()}.`,
      });
    }
    if (doctor?.userId) {
      await notificationService.create({
        userId: doctor.userId,
        appointmentId: apt.id,
        type: "LEMBRETE_CONSULTA",
        title: "Lembrete de Consulta",
        message: `Você tem uma consulta com ${patient?.user?.name} amanhã, ${new Date(apt.dateTime).toLocaleString()}.`,
      });
    }
  }
}

// Agendar para todos os dias às 08:00
cron.schedule("0 8 * * *", () => {
  console.log("Executando job de lembretes...");
  sendDailyReminders().catch(console.error);
});

console.log("Job de lembretes agendado para as 08:00 diariamente.");