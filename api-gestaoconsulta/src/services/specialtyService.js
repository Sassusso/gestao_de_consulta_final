import specialtyRepository from "../repositories/specialtyRepository.js";

class SpecialtyService {
  async create(data) {
    return specialtyRepository.create(data);
  }

  async findAll() {
    return specialtyRepository.findAll();
  }

  async findById(id) {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) throw new Error("Especialidade não encontrada");
    return specialty;
  }

  async update(id, data) {
    await this.findById(id);
    return specialtyRepository.update(id, data);
  }

  async delete(id) {
    await this.findById(id);
    return specialtyRepository.delete(id);
  }
}

export default new SpecialtyService();