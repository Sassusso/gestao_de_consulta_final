import appointmentService from "../services/appointmentService.js";
import doctorRepository from "../repositories/doctorRepository.js";

class AppointmentController {
  async create(req, res, next) {
    try {
      const appointment = await appointmentService.create(req.body);
      return res.status(201).json(appointment);
    } catch (err) {
      next(err);
    }
  }
 
  async findAll(req, res, next) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.patientId) filters.patientId = req.query.patientId;
      if (req.query.doctorId) filters.doctorId = req.query.doctorId;
      if (req.query.dateFrom || req.query.dateTo) {
        filters.dateTime = {};
        if (req.query.dateFrom) filters.dateTime.gte = new Date(req.query.dateFrom);
        if (req.query.dateTo) filters.dateTime.lte = new Date(req.query.dateTo);
      }
      const appointments = await appointmentService.findAll(filters);
      return res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  }

  async findById(req, res, next) {
    try {
      const appointment = await appointmentService.findById(req.params.id);
      return res.status(200).json(appointment);
    } catch (err) {
      next(err);
    }
  }

  async findByPatient(req, res, next) {
    try {
      const appointments = await appointmentService.findByPatient(req.params.patientId);
      if (req.user.role === 'DOCTOR') {
        const doctor = await doctorRepository.findByUserId(req.user.id);
        const filtered = appointments.filter(a => a.doctorId === doctor.id);
        return res.status(200).json(filtered);
      }
      return res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  }

  async findByDoctor(req, res, next) {
    try {
      const appointments = await appointmentService.findByDoctor(req.params.doctorId);
      return res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const appointment = await appointmentService.update(req.params.id, req.body);
      return res.status(200).json(appointment);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await appointmentService.delete(req.params.id);
      return res.status(200).json({ message: "Consulta cancelada com sucesso" });
    } catch (err) {
      next(err);
    }
  }
}

export default new AppointmentController();