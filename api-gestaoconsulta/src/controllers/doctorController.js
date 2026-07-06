import doctorService from "../services/doctorService.js";

class DoctorController {
  async findAll(req, res, next) {
    try {
      const doctors = await doctorService.findAll();
      return res.status(200).json(doctors);
    } catch (err) {
      next(err);
    }
  }

  async getMyProfile(req, res, next) {
    try {
      const doctor = await doctorService.getByUserId(req.user.id);
      res.json(doctor);
    } catch (err) { next(err); }
  }

  async findById(req, res, next) {
    try {
      const doctor = await doctorService.findById(req.params.id);
      return res.status(200).json(doctor);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const doctor = await doctorService.update(req.params.id, req.body);
      return res.status(200).json(doctor);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await doctorService.delete(req.params.id);
      return res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  async getMyPatients(req, res, next) {
    try {
      const patients = await doctorService.getPatientsByDoctorId(req.user.id);
      res.json(patients);
    } catch (err) {
      next(err);
    }
  }
}

export default new DoctorController();