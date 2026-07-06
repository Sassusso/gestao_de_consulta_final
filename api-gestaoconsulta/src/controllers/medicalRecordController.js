import medicalRecordService from "../services/medicalRecordService.js";

class MedicalRecordController {
  async create(req, res, next) {
    try {
      const record = await medicalRecordService.create(req.body);
      return res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const records = await medicalRecordService.findAll();
      return res.status(200).json(records);
    } catch (err) {
      next(err);
    }
  }

  async findById(req, res, next) {
    try {
      const record = await medicalRecordService.findById(req.params.id);
      return res.status(200).json(record);
    } catch (err) {
      next(err);
    }
  }

  async findByAppointmentId(req, res, next) {
    try {
      const record = await medicalRecordService.findByAppointmentId(req.params.appointmentId);
      return res.status(200).json(record);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const record = await medicalRecordService.update(req.params.id, req.body);
      return res.status(200).json(record);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await medicalRecordService.delete(req.params.id);
      return res.status(200).json({ message: "Medical record removido com sucesso" });
    } catch (err) {
      next(err);
    }
  }
}

export default new MedicalRecordController();