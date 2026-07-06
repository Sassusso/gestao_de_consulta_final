import patientRepository from "../repositories/patientRepository.js";
import prisma from "../config/prisma.js";

class PatientService {

   
    async create(data) {

        // ver se user existe
        const user = await prisma.user.findUnique({
            where: { id: data.userId }
        });

        if (!user) {
            throw new Error("User não encontrado");
        }

        const existingPatient =
            await patientRepository.findByUserId(data.userId);

        if (existingPatient) {
            throw new Error("Este user já é um patient");
        }

        // 3. criar patient
        return patientRepository.create(data);
    }

    findAll() {
        return patientRepository.findAll();
    }

    findById(id) {
        return patientRepository.findById(id);
    }

    async findByUserId(userId) {
        return patientRepository.findByUserId(userId);
    }

    update(id, data) {
        return patientRepository.update(id, data);
    }

    delete(id) {
        return patientRepository.delete(id);
    }
}

export default new PatientService();