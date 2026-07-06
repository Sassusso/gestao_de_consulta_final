import slotService from "../services/slotService.js";

class SlotController {
  
  async create(req, res, next) {
    try {
      const slot = await slotService.create(req.body);
      res.status(201).json(slot);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const slots = await slotService.findAll(req.query);
      res.json(slots);
    } catch (err) {
      next(err);
    }
  }

  async findById(req, res, next) {
    try {
      const slot = await slotService.findById(req.params.id);
      res.json(slot);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const slot = await slotService.update(req.params.id, req.body);
      res.json(slot);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await slotService.delete(req.params.id);
      res.json({ message: "Slot removido" });
    } catch (err) {
      next(err);
    }
  }

  // obter slots disponíveis para uma especialidade num intervalo
  async getAvailableSlots(req, res, next) {
    try {
      const { specialtyId, from, to } = req.query;
      if (!specialtyId || !from || !to) {
        return res.status(400).json({ error: "specialtyId, from e to são obrigatórios" });
      }
      const slots = await slotService.getAvailableSlotsForSpecialty(
        specialtyId,
        new Date(from),
        new Date(to)
      );
      res.json(slots);
    } catch (err) {
      next(err);
    }
  }
}

export default new SlotController();