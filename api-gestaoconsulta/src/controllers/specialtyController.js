import specialtyService from "../services/specialtyService.js";

class SpecialtyController {
  async create(req, res, next) {
    try {
      const specialty = await specialtyService.create(req.body);
      res.status(201).json(specialty);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const specialties = await specialtyService.findAll();
      res.json(specialties);
    } catch (err) {
      next(err);
    }
  }

  async findById(req, res, next) {
    try {
      const specialty = await specialtyService.findById(req.params.id);
      res.json(specialty);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const specialty = await specialtyService.update(req.params.id, req.body);
      res.json(specialty);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await specialtyService.delete(req.params.id);
      res.json({ message: "Especialidade removida" });
    } catch (err) {
      next(err);
    }
  }
}

export default new SpecialtyController();