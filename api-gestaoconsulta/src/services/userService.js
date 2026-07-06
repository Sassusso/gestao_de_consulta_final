import userRepository from "../repositories/userRepository.js";
import patientRepository from "../repositories/patientRepository.js";
import doctorRepository from "../repositories/doctorRepository.js";
import patientService from "./patientService.js";
import bcrypt from "bcrypt"

class UserService {

    async create(data) {
        const { role, dateOfBirth, sex, address, emergencyPhone, specialtyId, medicalLicense, ...userData } = data;
        
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error("E-mail já cadastrado");
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // criar user
        const user = await userRepository.create({
        ...userData,
        password: hashedPassword,
        role: role || "PATIENT",
        status: "ACTIVE"
        });

        // criar baseado na role
        try {
            if (user.role === "PATIENT") {
                const existingPatient = await patientRepository.findByUserId(user.id);
                if (existingPatient) {
                    throw new Error("Existe paciente para este ususário");
                }
                await patientService.create({
                    userId: user.id,
                    dateOfBirth,
                    sex,
                    address,
                    emergencyPhone
                });
                } else if (user.role === "DOCTOR") {
                
                const existingDoctor = await doctorRepository.findByUserId(user.id);
                if (existingDoctor) {
                    throw new Error("Doctor já existe!");
                }
                await doctorRepository.create({
                    userId: user.id,
                    specialtyId: data.specialtyId,   // receber o ID da especialidade
                    medicalLicense: data.medicalLicense,
                });
            }
        } catch (error) {
        // Rollback: deleta o usuário recém-criado para manter consistência
        await userRepository.delete(user.id);
        throw new Error(`Falha ao criar perfil: ${error.message}`);
        }
        return user;
    }

    async findAll(filters = {}) {
        return userRepository.findAll(filters);
    }

    async findById(id) {
        const user = await userRepository.findById(id);
        if (!user) throw new Error("Usuário não encontrado");
        return user;
    }

    async update(id, data) {
        // Se alterar o email, verificar duplicidade
        if (data.email) {
            const existing = await userRepository.findByEmail(data.email);
            if (existing && existing.id !== id) {
                throw new Error("E-mail já está em uso por outro usuário");
            }
        }
        return userRepository.update(id, data);
    }

    async delete(id) {
        const user = await userRepository.findById(id);
        if (!user) throw new Error("Usuário não encontrado");
        // O Prisma vai remover Patient/Doctor automaticamente
        return userRepository.delete(id);
    }

}

export default new UserService();