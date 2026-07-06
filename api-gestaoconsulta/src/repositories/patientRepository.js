import prisma from "../config/prisma.js";

class PatientRepository {

    create(data) {
        return prisma.patient.create({ data });
    }

    findAll() {
        return prisma.patient.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        status: true
                
                    }
                }
            }
        });
    }

    findById(id) {
        return prisma.patient.findUnique({
            where: { id },
            include: {
                user: true
            }
        });
    }

    findByUserId(userId) {
        return prisma.patient.findUnique({
            where: { userId },
            include: { user: true }
        });
    }

    update(id, data) {
        return prisma.patient.update({
            where: { id },
            data
        });
    }

    delete(id) {
        return prisma.patient.delete({
            where: { id }
        });
    }
}

export default new PatientRepository();