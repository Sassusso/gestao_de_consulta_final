import prisma from "../config/prisma.js";

class UserRepository {

    async create(data) {
        return prisma.user.create({ data });
    }

    async findAll(filters = {}) {
        return prisma.user.findMany({
            where: filters,
            select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true, updatedAt: true }
        });
    }

    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                patient: true, 
                doctor: {     
                    include: {
                        specialty: true
                    }
                }
            }   
        });
    }

    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    async update(id, data) {
        return prisma.user.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.user.delete({
            where: { id }
        });
    }

    async count(filters = {}) {
        return prisma.user.count({ where: filters });
    }
}

export default new UserRepository();